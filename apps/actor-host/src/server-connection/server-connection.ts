import {
  HOST_PROTOCOL_VERSION,
  decodeContract,
  HostToServerMessageSchema,
  ServerToHostMessageSchema,
} from "@ai-block/runtime-contracts";
import type {
  ActorId,
  CanonicalTimestamp,
  ContractErrorEnvelope,
  HostInstanceId,
  HostMessageId,
  HostToServerMessage,
  HostToServerPayload,
  ProjectId,
  ServerToHostMessage,
} from "@ai-block/runtime-contracts";
import {
  ActorHostCommandProcessor,
  type CommandDisposition,
  type HostOutboundIntent,
  type HostOutboundPayloadSink,
  type HostOutboundSendError,
  type HostOutboundSendResult,
} from "./command-processor.js";
import type { BackendSupervisor } from "../backend/supervisor.js";

export interface HostIdentity {
  readonly projectId: ProjectId;
  readonly hostInstanceId: HostInstanceId;
  readonly actorId: ActorId;
}

export interface HostMessageIdProvider {
  nextMessageId(): HostMessageId;
}

export interface HostTimestampProvider {
  now(): CanonicalTimestamp;
}

export interface HostTransportPort {
  send(message: HostToServerMessage): void;
}

export type ServerConnectionState = "not_started" | "live" | "failed";

export type ServerConnectionSendResult = HostOutboundSendResult;

export type ServerConnectionInboundResult =
  | { readonly kind: "accepted"; readonly disposition: CommandDisposition }
    | {
    readonly kind: "rejected";
    readonly reason:
      | "not_started"
      | "failed"
      | "decode_failed"
      | "generation_mismatch"
      | "sequence_stale"
      | "sequence_gap";
    readonly error?: ContractErrorEnvelope;
  };

export interface ServerConnectionOptions {
  readonly identity: HostIdentity;
  readonly connectionGeneration: number;
  readonly messageIds: HostMessageIdProvider;
  readonly timestamps: HostTimestampProvider;
  readonly transport: HostTransportPort;
  readonly supervisor: BackendSupervisor;
}

export class ServerConnection implements HostOutboundPayloadSink {
  private stateValue: ServerConnectionState = "not_started";
  private nextOutboundSequence = 0;
  private nextInboundSequence = 0;
  private readonly processor: ActorHostCommandProcessor;

  public constructor(private readonly options: ServerConnectionOptions) {
    if (!Number.isSafeInteger(options.connectionGeneration) || options.connectionGeneration < 1) {
      throw new Error("ServerConnection requires a positive safe connection generation.");
    }
    this.processor = new ActorHostCommandProcessor(options.supervisor, this);
  }

  public state(): ServerConnectionState {
    return this.stateValue;
  }

  public start(): ServerConnectionSendResult {
    if (this.stateValue === "live") return { kind: "rejected", reason: "already_started" };
    if (this.stateValue === "failed") return { kind: "rejected", reason: "failed" };

    const result = this.write({
      kind: "host_hello",
      project_id: this.options.identity.projectId,
      host_instance_id: this.options.identity.hostInstanceId,
      actor_id: this.options.identity.actorId,
    });
    if (result.kind === "sent") this.stateValue = "live";
    return result;
  }

  public receive(input: unknown): ServerConnectionInboundResult {
    if (this.stateValue === "not_started") return { kind: "rejected", reason: "not_started" };
    if (this.stateValue === "failed") return { kind: "rejected", reason: "failed" };

    const decoded = decodeContract(ServerToHostMessageSchema, input);
    if (!decoded.ok) {
      return {
        kind: "rejected",
        reason: "decode_failed",
        error: decoded.error,
      };
    }

    const message = decoded.value as ServerToHostMessage;
    if (message.connection_generation !== this.options.connectionGeneration) {
      return { kind: "rejected", reason: "generation_mismatch" };
    }
    if (message.sender_sequence < this.nextInboundSequence) {
      return { kind: "rejected", reason: "sequence_stale" };
    }
    if (message.sender_sequence > this.nextInboundSequence) {
      return { kind: "rejected", reason: "sequence_gap" };
    }

    this.nextInboundSequence += 1;
    return { kind: "accepted", disposition: this.processor.process(message) };
  }

  public send(intent: HostOutboundIntent): ServerConnectionSendResult {
    if (this.stateValue === "not_started") return { kind: "rejected", reason: "not_started" };
    if (this.stateValue === "failed") return { kind: "rejected", reason: "failed" };
    return this.write(intent.payload, intent.causalMessageId);
  }

  private write(payload: HostToServerPayload, causalMessageId?: HostMessageId): HostOutboundSendResult {
    const senderSequence = this.nextOutboundSequence;
    this.nextOutboundSequence += 1;

    let messageId: HostMessageId;
    let sentAt: CanonicalTimestamp;
    try {
      messageId = this.options.messageIds.nextMessageId();
      sentAt = this.options.timestamps.now();
    } catch (error) {
      return this.fail(error instanceof Error ? error.message : "Deterministic envelope provider failed.");
    }

    const envelope: HostToServerMessage = {
      protocol_version: HOST_PROTOCOL_VERSION,
      message_id: messageId,
      ...(causalMessageId === undefined ? {} : { correlation_id: causalMessageId }),
      sender_sequence: senderSequence,
      connection_generation: this.options.connectionGeneration,
      sent_at: sentAt,
      payload,
    };
    const validation = decodeContract(HostToServerMessageSchema, envelope);
    if (!validation.ok) return this.fail("Generated Host envelope failed Runtime Contract validation.");

    try {
      this.options.transport.send(envelope);
      return { kind: "sent" };
    } catch (error) {
      return this.fail(error instanceof Error ? error.message : "Host transport send failed.");
    }
  }

  private fail(message: string): { kind: "transport_failed"; error: HostOutboundSendError } {
    this.stateValue = "failed";
    return {
      kind: "transport_failed",
      error: { code: "transport_failed", message },
    };
  }
}
