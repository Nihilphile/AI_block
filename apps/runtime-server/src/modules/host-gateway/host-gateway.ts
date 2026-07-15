import {
  HOST_PROTOCOL_VERSION,
  decodeContract,
  HostToServerMessageSchema,
  ServerToHostMessageSchema,
} from "@ai-block/runtime-contracts";
import type {
  AckPayload,
  ContractErrorEnvelope,
  HostToServerMessage,
  HostToServerPayload,
  ServerToHostMessage,
} from "@ai-block/runtime-contracts";
import type {
  AuthenticatedHostContext,
  HostCommandPayload,
  HostConnectionState,
  HostFact,
  HostFactMessage,
  HostGatewayConnection,
  HostGatewayInboundResult,
  HostGatewayLocalError,
  HostGatewayOpenResult,
  HostGatewayOptions,
  HostGatewaySendResult,
  HostGatewayTransport,
} from "./ports.js";
import type { HostMessageId } from "@ai-block/runtime-contracts";

const HOST_CONNECTION_GENERATION = 1;

type ConnectionCallbacks = {
  readonly commitLive: (connection: GatewayConnection) => void;
  readonly remove: (connection: GatewayConnection) => void;
};

export class HostGateway {
  private readonly pendingByActor = new Map<string, GatewayConnection>();
  private readonly pendingByHost = new Map<string, GatewayConnection>();
  private readonly liveByActor = new Map<string, GatewayConnection>();
  private readonly liveByHost = new Map<string, GatewayConnection>();

  public constructor(private readonly options: HostGatewayOptions) {}

  public openConnection(
    identity: AuthenticatedHostContext,
    transport: HostGatewayTransport,
  ): HostGatewayOpenResult {
    if (
      this.pendingByActor.has(identity.actorId)
      || this.pendingByHost.has(identity.hostInstanceId)
      || this.liveByActor.has(identity.actorId)
      || this.liveByHost.has(identity.hostInstanceId)
    ) {
      return { kind: "rejected", reason: "connection_exists" };
    }

    let connection: GatewayConnection;
    connection = new GatewayConnection(identity, transport, this.options, {
      commitLive: (candidate) => this.commitLive(candidate),
      remove: (candidate) => this.remove(candidate),
    });
    this.pendingByActor.set(identity.actorId, connection);
    this.pendingByHost.set(identity.hostInstanceId, connection);

    try {
      connection.observeTransportFailures();
    } catch (error) {
      connection.failConnection();
      return {
        kind: "transport_failed",
        error: {
          code: "transport_failed",
          message: error instanceof Error ? error.message : "Host transport failure observer failed.",
        },
      };
    }

    if (connection.state() === "failed") {
      return {
        kind: "transport_failed",
        error: { code: "transport_failed", message: "Host transport failed while opening." },
      };
    }
    return { kind: "accepted", connection };
  }

  public sendCommand(
    actorId: AuthenticatedHostContext["actorId"],
    payload: HostCommandPayload,
    causalMessageId?: HostMessageId,
  ): HostGatewaySendResult {
    const connection = this.liveByActor.get(actorId);
    if (connection === undefined) return { kind: "rejected", reason: "not_live" };
    return connection.send(payload, causalMessageId);
  }

  public connectionForActor(actorId: AuthenticatedHostContext["actorId"]): HostGatewayConnection | undefined {
    return this.liveByActor.get(actorId);
  }

  private commitLive(connection: GatewayConnection): void {
    if (
      this.pendingByActor.get(connection.identity.actorId) !== connection
      || this.pendingByHost.get(connection.identity.hostInstanceId) !== connection
      || this.liveByActor.has(connection.identity.actorId)
      || this.liveByHost.has(connection.identity.hostInstanceId)
    ) {
      connection.failConnection();
      return;
    }

    this.pendingByActor.delete(connection.identity.actorId);
    this.pendingByHost.delete(connection.identity.hostInstanceId);
    this.liveByActor.set(connection.identity.actorId, connection);
    this.liveByHost.set(connection.identity.hostInstanceId, connection);
    connection.markLive();
  }

  private remove(connection: GatewayConnection): void {
    if (this.pendingByActor.get(connection.identity.actorId) === connection) {
      this.pendingByActor.delete(connection.identity.actorId);
    }
    if (this.pendingByHost.get(connection.identity.hostInstanceId) === connection) {
      this.pendingByHost.delete(connection.identity.hostInstanceId);
    }
    if (this.liveByActor.get(connection.identity.actorId) === connection) {
      this.liveByActor.delete(connection.identity.actorId);
    }
    if (this.liveByHost.get(connection.identity.hostInstanceId) === connection) {
      this.liveByHost.delete(connection.identity.hostInstanceId);
    }
  }
}

class GatewayConnection implements HostGatewayConnection {
  private stateValue: HostConnectionState = "pending";
  private nextInboundSequence = 0;
  private nextOutboundSequence = 0;
  private readonly pendingCommands = new Map<HostMessageId, ServerToHostMessage>();
  private unsubscribeTransportFailure: (() => void) | undefined;

  public constructor(
    public readonly identity: AuthenticatedHostContext,
    private readonly transport: HostGatewayTransport,
    private readonly options: HostGatewayOptions,
    private readonly callbacks: ConnectionCallbacks,
  ) {}

  public state(): HostConnectionState {
    return this.stateValue;
  }

  public observeTransportFailures(): void {
    this.unsubscribeTransportFailure = this.transport.onFailure(() => {
      this.failConnection();
    });
  }

  public markLive(): void {
    if (this.stateValue === "pending") this.stateValue = "live";
  }

  public failConnection(): void {
    if (this.stateValue === "failed") return;
    this.stateValue = "failed";
    const unsubscribe = this.unsubscribeTransportFailure;
    this.unsubscribeTransportFailure = undefined;
    if (unsubscribe !== undefined) unsubscribe();
    this.pendingCommands.clear();
    this.callbacks.remove(this);
  }

  public receive(input: unknown): HostGatewayInboundResult {
    if (this.stateValue === "failed") return { kind: "rejected", reason: "failed" };
    if (this.stateValue !== "pending" && this.stateValue !== "live") {
      return { kind: "rejected", reason: "not_started" };
    }

    const decoded = decodeContract(HostToServerMessageSchema, input);
    if (!decoded.ok) {
      return this.reject("decode_failed", decoded.error);
    }
    const message = decoded.value as HostToServerMessage;

    const envelopeError = this.validateEnvelope(message);
    if (envelopeError !== undefined) return envelopeError;

    if (this.stateValue === "pending") return this.receiveHello(message);
    return this.receiveLive(message);
  }

  public send(payload: HostCommandPayload, causalMessageId?: HostMessageId): HostGatewaySendResult {
    if (this.stateValue === "failed") return { kind: "rejected", reason: "failed" };
    if (this.stateValue !== "live") return { kind: "rejected", reason: "not_live" };
    return this.write(payload, causalMessageId, true);
  }

  private receiveHello(message: HostToServerMessage): HostGatewayInboundResult {
    if (message.payload.kind !== "host_hello") return this.reject("wrong_first_payload");
    if (!this.matchesHelloIdentity(message.payload)) return this.reject("identity_mismatch");

    const acknowledgement = this.write(
      { kind: "ack", acknowledged_message_id: message.message_id },
      message.message_id,
      false,
    );
    if (acknowledgement.kind !== "sent") return this.receiptFailure(acknowledgement);

    this.callbacks.commitLive(this);
    if (this.stateValue === "failed") {
      return {
        kind: "transport_failed",
        error: { code: "transport_failed", message: "Host connection registration failed." },
      };
    }
    this.nextInboundSequence += 1;
    return { kind: "hello_registered", acknowledgement: acknowledgement.message };
  }

  private receiveLive(message: HostToServerMessage): HostGatewayInboundResult {
    if (message.payload.kind === "host_hello") return this.reject("duplicate_hello");
    if (!this.matchesPostHelloIdentity(message)) return this.reject("identity_mismatch");

    if (message.payload.kind === "ack") {
      this.nextInboundSequence += 1;
      const acknowledgedMessageId = message.payload.acknowledged_message_id;
      if (!this.pendingCommands.delete(acknowledgedMessageId)) {
        return { kind: "ack_ignored", acknowledgedMessageId };
      }
      return { kind: "acknowledged", acknowledgedMessageId };
    }

    const acknowledgement = this.write(
      { kind: "ack", acknowledged_message_id: message.message_id },
      message.message_id,
      false,
    );
    if (acknowledgement.kind !== "sent") return this.receiptFailure(acknowledgement);

    this.nextInboundSequence += 1;
    const fact: HostFact = {
      identity: this.identity,
      message: message as HostFactMessage,
    };
    try {
      this.options.factSink.accept(fact);
    } catch (error) {
      this.failConnection();
      return {
        kind: "fact_sink_failed",
        error: {
          code: "fact_sink_failed",
          message: error instanceof Error ? error.message : "Host fact sink failed.",
        },
      };
    }
    return { kind: "fact_delivered", fact };
  }

  private validateEnvelope(message: HostToServerMessage): HostGatewayInboundResult | undefined {
    if (message.connection_generation !== HOST_CONNECTION_GENERATION) {
      return this.reject("generation_mismatch");
    }
    if (message.sender_sequence < this.nextInboundSequence) {
      return this.reject("sequence_stale");
    }
    if (message.sender_sequence > this.nextInboundSequence) {
      return this.reject("sequence_gap");
    }
    return undefined;
  }

  private matchesHelloIdentity(payload: Extract<HostToServerPayload, { kind: "host_hello" }>): boolean {
    return payload.project_id === this.identity.projectId
      && payload.actor_id === this.identity.actorId
      && payload.host_instance_id === this.identity.hostInstanceId;
  }

  private matchesPostHelloIdentity(message: HostToServerMessage): boolean {
    switch (message.payload.kind) {
      case "host_ready":
        return message.payload.actor_id === this.identity.actorId;
      case "invocation_result":
        return message.payload.result.project_id === this.identity.projectId
          && message.payload.result.actor_id === this.identity.actorId;
      default:
        return true;
    }
  }

  private reject(
    reason: Extract<HostGatewayInboundResult, { kind: "rejected" }>["reason"],
    error?: ContractErrorEnvelope,
  ): HostGatewayInboundResult {
    this.failConnection();
    return error === undefined ? { kind: "rejected", reason } : { kind: "rejected", reason, error };
  }

  private write(
    payload: HostCommandPayload | AckPayload,
    causalMessageId: HostMessageId | undefined,
    trackPending: boolean,
  ): HostGatewaySendResult {
    const senderSequence = this.nextOutboundSequence;
    this.nextOutboundSequence += 1;

    let messageId: HostMessageId;
    let sentAt: import("@ai-block/runtime-contracts").CanonicalTimestamp;
    try {
      messageId = this.options.messageIds.nextMessageId();
      sentAt = this.options.timestamps.now();
    } catch (error) {
      return this.transportFailure(error instanceof Error ? error.message : "Host envelope provider failed.");
    }

    const message: ServerToHostMessage = {
      protocol_version: HOST_PROTOCOL_VERSION,
      message_id: messageId,
      ...(causalMessageId === undefined ? {} : { correlation_id: causalMessageId }),
      sender_sequence: senderSequence,
      connection_generation: HOST_CONNECTION_GENERATION,
      sent_at: sentAt,
      payload,
    };
    const validation = decodeContract(ServerToHostMessageSchema, message);
    if (!validation.ok) return this.transportFailure("Generated Host envelope failed Runtime Contract validation.");

    try {
      this.transport.send(message);
    } catch (error) {
      return this.transportFailure(error instanceof Error ? error.message : "Host transport send failed.");
    }
    if (trackPending) this.pendingCommands.set(message.message_id, message);
    return { kind: "sent", message };
  }

  private transportFailure(message: string): { kind: "transport_failed"; error: HostGatewayLocalError } {
    this.failConnection();
    return { kind: "transport_failed", error: { code: "transport_failed", message } };
  }

  private receiptFailure(result: Exclude<HostGatewaySendResult, { kind: "sent" }>): HostGatewayInboundResult {
    if (result.kind === "transport_failed") return result;
    return { kind: "rejected", reason: result.reason === "failed" ? "failed" : "not_started" };
  }
}

export type {
  AuthenticatedHostContext,
  HostCommandPayload,
  HostConnectionState,
  HostFact,
  HostFactMessage,
  HostFactPayload,
  HostFactSink,
  HostGatewayConnection,
  HostGatewayInboundResult,
  HostGatewayLocalError,
  HostGatewayOpenResult,
  HostGatewayOptions,
  HostGatewaySendResult,
  HostGatewayTransport,
  HostMessageIdProvider,
  HostTimestampProvider,
  HostTransportFailure,
} from "./ports.js";
