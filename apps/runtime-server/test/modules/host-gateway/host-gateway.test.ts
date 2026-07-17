import {
  HOST_PROTOCOL_VERSION,
  type ActorId,
  type ActorLaunchSpec,
  type CanonicalTimestamp,
  type HostHelloPayload,
  type HostInstanceId,
  type HostMessageId,
  type HostToServerMessage,
  type InvocationSpec,
  type ProjectId,
  type ServerToHostMessage,
} from "@ai-block/runtime-contracts";
import { describe, expect, it } from "vitest";
import {
  HostGateway,
  type HostGatewayConnection,
  type HostCommandPayload,
  type HostFactPayload,
  type HostGatewayTransport,
  type HostFact,
  type HostTransportFailure,
} from "../../../src/modules/host-gateway/host-gateway.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const OTHER_UUID = "11111111-1111-4111-8111-111111111111";
const projectId = `project_${UUID}` as ProjectId;
const otherProjectId = `project_${OTHER_UUID}` as ProjectId;
const actorId = `actor_${UUID}` as ActorId;
const otherActorId = `actor_${OTHER_UUID}` as ActorId;
const hostInstanceId = `host_${UUID}` as HostInstanceId;
const otherHostInstanceId = `host_${OTHER_UUID}` as HostInstanceId;
const invocationId = `invocation_${UUID}`;
const runId = `run_${UUID}`;
const configSnapshotId = `actor_config_${UUID}`;
const packageId = `package_${UUID}`;
const messageId = `message_${UUID}` as HostMessageId;
const causalMessageId = `message_${OTHER_UUID}` as HostMessageId;
const timestamp = "2026-07-16T12:34:56.789Z" as CanonicalTimestamp;

const identity = { projectId, actorId, hostInstanceId } as const;

const launchSpec: ActorLaunchSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  actor_id: actorId,
  actor_config_snapshot_id: configSnapshotId,
  system_prompts: [],
  working_directory: "C:\\work",
  backend: { adapter_id: "fake.backend", config: {} },
  tool_providers: [],
};

const invocationSpec: InvocationSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  run_id: runId,
  actor_id: actorId,
  invocation_id: invocationId,
  input_package_refs: [{ package_id: packageId, content_hash: `sha256:${"a".repeat(64)}` }],
  prompt: { kind: "text", text: "prompt" },
  session: { mode: "create" },
};

const invocationResult = {
  schema_version: "1.0.0" as const,
  project_id: projectId,
  run_id: runId,
  actor_id: actorId,
  invocation_id: invocationId,
  process: { status: "stopped" as const },
  emitted_package_refs: [],
  completion_requested: false,
};

class RecordingTransport implements HostGatewayTransport {
  public readonly sent: ServerToHostMessage[] = [];
  public readonly events: string[] = [];
  public readonly failures: HostTransportFailure[] = [];
  public failCalls = 0;
  public failNextSend = false;
  public throwOnFail = false;
  private readonly failureListeners = new Set<(failure: { code: "transport_failed"; message: string }) => void>();

  public send(message: ServerToHostMessage): void {
    this.events.push(`send:${message.payload.kind}`);
    if (this.failNextSend) {
      this.failNextSend = false;
      throw new Error("transport send failed");
    }
    this.sent.push(message);
  }

  public onFailure(listener: (failure: { code: "transport_failed"; message: string }) => void): () => void {
    this.failureListeners.add(listener);
    return () => this.failureListeners.delete(listener);
  }

  public fail(failure: HostTransportFailure): void {
    this.failCalls += 1;
    if (this.throwOnFail) throw new Error("transport termination failed");
    this.failures.push(failure);
    for (const listener of [...this.failureListeners]) listener(failure);
  }
}

class RecordingFactSink {
  public readonly facts: HostFact[] = [];
  public shouldThrow = false;

  public accept(fact: HostFact): void {
    if (this.shouldThrow) throw new Error("fact sink failed");
    this.facts.push(fact);
  }
}

function createGateway(
  sink = new RecordingFactSink(),
  options: {
    readonly nextMessageId?: () => HostMessageId;
    readonly now?: () => CanonicalTimestamp;
    readonly outboundEnvelopeValidator?: (message: ServerToHostMessage) => boolean;
  } = {},
) {
  let messageCounter = 0;
  let messageIdCalls = 0;
  let timestampCalls = 0;
  const transport = new RecordingTransport();
  const gateway = new HostGateway({
    factSink: sink,
    messageIds: {
      nextMessageId: () => {
        messageIdCalls += 1;
        if (options.nextMessageId !== undefined) return options.nextMessageId();
        messageCounter += 1;
        return `message_${String(messageCounter).padStart(8, "0")}-0000-4000-8000-000000000000` as HostMessageId;
      },
    },
    timestamps: {
      now: () => {
        timestampCalls += 1;
        return options.now === undefined ? timestamp : options.now();
      },
    },
    outboundEnvelopeValidator: options.outboundEnvelopeValidator,
  });
  return { gateway, sink, transport, messageIdCalls: () => messageIdCalls, timestampCalls: () => timestampCalls };
}

function open(gateway: HostGateway, transport: RecordingTransport, context = identity): HostGatewayConnection {
  const result = gateway.openConnection(context, transport);
  expect(result.kind).toBe("accepted");
  if (result.kind !== "accepted") throw new Error("expected connection to be accepted");
  return result.connection;
}

function hostMessage(
  payload: HostToServerMessage["payload"],
  senderSequence: number,
  id: HostMessageId = messageId,
  overrides: Partial<HostToServerMessage> = {},
): HostToServerMessage {
  return {
    protocol_version: HOST_PROTOCOL_VERSION,
    message_id: id,
    sender_sequence: senderSequence,
    connection_generation: 1,
    sent_at: timestamp,
    payload,
    ...overrides,
  };
}

function hello(overrides: Partial<HostHelloPayload> = {}): HostToServerMessage {
  return hostMessage({
    kind: "host_hello",
    project_id: projectId,
    host_instance_id: hostInstanceId,
    actor_id: actorId,
    ...overrides,
  }, 0);
}

function register(connection: HostGatewayConnection, transport: RecordingTransport): void {
  const result = connection.receive(hello());
  expect(result.kind).toBe("hello_registered");
  expect(transport.sent[0]).toMatchObject({
    sender_sequence: 0,
    connection_generation: 1,
    correlation_id: messageId,
    payload: { kind: "ack", acknowledged_message_id: messageId },
  });
}

describe("Runtime Server Host Gateway core", () => {
  it("registers only after a successful Hello receipt ACK and reserves both identities", () => {
    const first = createGateway();
    const firstConnection = open(first.gateway, first.transport);
    first.transport.failNextSend = true;

    expect(firstConnection.receive(hello()).kind).toBe("transport_failed");
    expect(firstConnection.state()).toBe("failed");

    const retry = first.gateway.openConnection(identity, first.transport);
    expect(retry.kind).toBe("accepted");

    const second = createGateway();
    const secondConnection = open(second.gateway, second.transport);
    register(secondConnection, second.transport);
    expect(second.gateway.openConnection(identity, second.transport)).toEqual({
      kind: "rejected",
      reason: "connection_exists",
    });
    expect(second.gateway.openConnection({ ...identity, hostInstanceId: otherHostInstanceId }, second.transport)).toEqual({
      kind: "rejected",
      reason: "connection_exists",
    });
  });

  it("emits the symmetric Hello ACK at server sequence zero and treats it as non-pending", () => {
    const { gateway, transport } = createGateway();
    const connection = open(gateway, transport);
    register(connection, transport);

    const ack = connection.receive(hostMessage({
      kind: "ack",
      acknowledged_message_id: transport.sent[0].message_id,
    }, 1, causalMessageId));
    expect(ack).toEqual({ kind: "ack_ignored", acknowledgedMessageId: transport.sent[0].message_id });
    expect(connection.state()).toBe("live");
    expect(transport.sent).toHaveLength(1);
  });

  it("wraps each server command exactly, tracks only successful non-ACK sends, and reconciles receipt ACKs", () => {
    const { gateway, transport } = createGateway();
    const connection = open(gateway, transport);
    register(connection, transport);

    const commands: HostCommandPayload[] = [
      { kind: "initialize_actor_host", launch_spec: launchSpec },
      { kind: "start_invocation", invocation_spec: invocationSpec },
      { kind: "stop_invocation", invocation_id: invocationId, reason: "cancelled" },
      { kind: "shutdown_host", reason: "maintenance" },
    ];
    let inboundSequence = 1;
    for (const [index, payload] of commands.entries()) {
      const result = gateway.sendCommand(actorId, payload, index === 0 ? causalMessageId : undefined);
      expect(result.kind).toBe("sent");
      if (result.kind !== "sent") throw new Error("expected command send");
      expect(result.message).toMatchObject({
        sender_sequence: index + 1,
        connection_generation: 1,
        payload,
        ...(index === 0 ? { correlation_id: causalMessageId } : {}),
      });
      expect(result.message.correlation_id).toBe(index === 0 ? causalMessageId : undefined);

      const acknowledged = connection.receive(hostMessage({
        kind: "ack",
        acknowledged_message_id: result.message.message_id,
      }, inboundSequence, `message_${String(index + 2).padStart(8, "0")}-0000-4000-8000-000000000000` as HostMessageId));
      expect(acknowledged).toEqual({ kind: "acknowledged", acknowledgedMessageId: result.message.message_id });
      inboundSequence += 1;
      expect(connection.receive(hostMessage({
        kind: "ack",
        acknowledged_message_id: result.message.message_id,
      }, inboundSequence, `message_${String(index + 6).padStart(8, "0")}-0000-4000-8000-000000000000` as HostMessageId))).toEqual({
        kind: "ack_ignored",
        acknowledgedMessageId: result.message.message_id,
      });
      inboundSequence += 1;
    }
    expect(transport.sent.map((message) => message.payload.kind)).toEqual([
      "ack",
      "initialize_actor_host",
      "start_invocation",
      "stop_invocation",
      "shutdown_host",
    ]);
  });

  it("rejects mismatched Initialize and Start commands before outbound allocation and keeps the connection live", () => {
    const { gateway, transport, messageIdCalls, timestampCalls } = createGateway();
    const connection = open(gateway, transport);
    register(connection, transport);
    const messageIdsBefore = messageIdCalls();
    const timestampsBefore = timestampCalls();
    const sentBefore = transport.sent.length;

    expect(gateway.sendCommand(actorId, {
      kind: "initialize_actor_host",
      launch_spec: { ...launchSpec, project_id: otherProjectId },
    })).toEqual({ kind: "rejected", reason: "identity_mismatch" });
    expect(gateway.sendCommand(actorId, {
      kind: "start_invocation",
      invocation_spec: { ...invocationSpec, actor_id: otherActorId },
    })).toEqual({ kind: "rejected", reason: "identity_mismatch" });

    expect(connection.state()).toBe("live");
    expect(messageIdCalls()).toBe(messageIdsBefore);
    expect(timestampCalls()).toBe(timestampsBefore);
    expect(transport.sent).toHaveLength(sentBefore);
    expect(transport.failCalls).toBe(0);

    const valid = gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "valid-after-mismatch" });
    expect(valid.kind).toBe("sent");
    if (valid.kind !== "sent") throw new Error("expected valid command send");
    expect(valid.message.sender_sequence).toBe(1);
    expect(connection.receive(hostMessage({
      kind: "ack",
      acknowledged_message_id: valid.message.message_id,
    }, 1, causalMessageId))).toEqual({ kind: "acknowledged", acknowledgedMessageId: valid.message.message_id });
  });

  it("terminally closes on message-ID provider failure and still cleans up when transport termination throws", () => {
    let failNext = false;
    let counter = 0;
    const result = createGateway(undefined, {
      nextMessageId: () => {
        if (failNext) {
          failNext = false;
          throw new Error("secret message provider failure");
        }
        counter += 1;
        return `message_${String(counter).padStart(8, "0")}-0000-4000-8000-000000000000` as HostMessageId;
      },
    });
    const connection = open(result.gateway, result.transport);
    register(connection, result.transport);
    failNext = true;
    result.transport.throwOnFail = true;

    expect(result.gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "provider-fails" })).toMatchObject({
      kind: "transport_failed",
    });
    expect(connection.state()).toBe("failed");
    expect(result.gateway.connectionForActor(actorId)).toBeUndefined();
    expect(result.transport.failCalls).toBe(1);
    expect(result.transport.sent).toHaveLength(1);

    const retryTransport = new RecordingTransport();
    const retry = result.gateway.openConnection(identity, retryTransport);
    expect(retry.kind).toBe("accepted");
    if (retry.kind !== "accepted") throw new Error("expected fresh connection");
    expect(retry.connection.receive(hello())).toMatchObject({ kind: "hello_registered" });
  });

  it("terminally closes on timestamp provider failure and permits fresh registration", () => {
    let failNext = false;
    const result = createGateway(undefined, {
      now: () => {
        if (failNext) {
          failNext = false;
          throw new Error("secret timestamp provider failure");
        }
        return timestamp;
      },
    });
    const connection = open(result.gateway, result.transport);
    register(connection, result.transport);
    failNext = true;

    expect(result.gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "timestamp-fails" })).toMatchObject({
      kind: "transport_failed",
    });
    expect(connection.state()).toBe("failed");
    expect(result.gateway.connectionForActor(actorId)).toBeUndefined();
    expect(result.transport.failCalls).toBe(1);
    expect(result.transport.sent).toHaveLength(1);

    const retryTransport = new RecordingTransport();
    const retry = result.gateway.openConnection(identity, retryTransport);
    expect(retry.kind).toBe("accepted");
    if (retry.kind !== "accepted") throw new Error("expected fresh connection");
    expect(retry.connection.receive(hello())).toMatchObject({ kind: "hello_registered" });
  });

  it("terminally closes on injected generated-envelope validation failure without a pending leak", () => {
    let validations = 0;
    const result = createGateway(undefined, {
      outboundEnvelopeValidator: () => {
        validations += 1;
        return validations === 1;
      },
    });
    const connection = open(result.gateway, result.transport);
    register(connection, result.transport);

    expect(result.gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "envelope-fails" })).toMatchObject({
      kind: "transport_failed",
    });
    expect(validations).toBe(2);
    expect(connection.state()).toBe("failed");
    expect(result.gateway.connectionForActor(actorId)).toBeUndefined();
    expect(result.transport.failCalls).toBe(1);
    expect(result.transport.sent).toHaveLength(1);

    const retryTransport = new RecordingTransport();
    const retry = result.gateway.openConnection(identity, retryTransport);
    expect(retry.kind).toBe("accepted");
  });

  it("ACKs every valid Host fact before consuming sequence and delivering the lossless typed fact", () => {
    const { gateway, transport, sink } = createGateway();
    const connection = open(gateway, transport);
    register(connection, transport);
    const facts: HostFactPayload[] = [
      { kind: "host_ready", actor_id: actorId },
      { kind: "heartbeat" },
      { kind: "session_report", invocation_id: invocationId, session_id: "session-1" },
      { kind: "invocation_result", result: invocationResult },
      {
        kind: "package_publish_request",
        invocation_id: invocationId,
        idempotency_key: "publish-1",
        package_type: "result",
        body: { kind: "text", text: "output" },
        parent_refs: [],
      },
      { kind: "completion_request", invocation_id: invocationId, result_package_refs: [{ package_id: packageId, content_hash: `sha256:${"a".repeat(64)}` }] },
      {
        kind: "host_fault",
        invocation_id: invocationId,
        error: {
          schema_version: "1.0.0",
          code: "contract.backend_failed",
          category: "backend",
          message: "failed",
          retryable: false,
        },
      } as unknown as HostFactPayload,
    ];

    for (const [index, payload] of facts.entries()) {
      const incomingId = `message_${String(index + 20).padStart(8, "0")}-0000-4000-8000-000000000000` as HostMessageId;
      const result = connection.receive(hostMessage(payload, index + 1, incomingId, { correlation_id: causalMessageId }));
      expect(result.kind).toBe("fact_delivered");
      expect(transport.sent[index + 1]).toMatchObject({
        payload: { kind: "ack", acknowledged_message_id: incomingId },
        correlation_id: incomingId,
      });
      expect(sink.facts[index]).toMatchObject({
        identity,
        message: { message_id: incomingId, correlation_id: causalMessageId, payload },
      });
    }
    expect(sink.facts.map((fact) => fact.message.payload.kind)).toEqual([
      "host_ready",
      "heartbeat",
      "session_report",
      "invocation_result",
      "package_publish_request",
      "completion_request",
      "host_fault",
    ]);
  });

  it("prevents fact delivery when receipt ACK fails and terminally unregisters on sink failure", () => {
    const first = createGateway();
    const firstConnection = open(first.gateway, first.transport);
    register(firstConnection, first.transport);
    first.transport.failNextSend = true;
    expect(firstConnection.receive(hostMessage({ kind: "heartbeat" }, 1)).kind).toBe("transport_failed");
    expect(first.sink.facts).toHaveLength(0);
    expect(firstConnection.state()).toBe("failed");

    const sink = new RecordingFactSink();
    const second = createGateway(sink);
    const secondConnection = open(second.gateway, second.transport);
    register(secondConnection, second.transport);
    sink.shouldThrow = true;
    expect(secondConnection.receive(hostMessage({ kind: "heartbeat" }, 1))).toMatchObject({ kind: "fact_sink_failed" });
    expect(secondConnection.state()).toBe("failed");
    expect(second.gateway.openConnection(identity, second.transport).kind).toBe("accepted");
  });

  it("fails closed for malformed, directional, generation, sequence, identity, and duplicate-Hello violations", () => {
    const cases: Array<{ name: string; input: unknown; reason: string }> = [
      { name: "malformed", input: { hello: true }, reason: "decode_failed" },
      { name: "opposite direction", input: hostMessage({ kind: "initialize_actor_host", launch_spec: launchSpec } as never, 0), reason: "decode_failed" },
      { name: "wrong generation", input: { ...hello(), connection_generation: 2 }, reason: "generation_mismatch" },
      { name: "wrong sequence", input: { ...hello(), sender_sequence: 1 }, reason: "sequence_gap" },
      { name: "wrong first payload", input: hostMessage({ kind: "heartbeat" }, 0), reason: "wrong_first_payload" },
      { name: "identity mismatch", input: hello({ actor_id: otherActorId }), reason: "identity_mismatch" },
    ];
    for (const testCase of cases) {
      const { gateway, transport } = createGateway();
      const connection = open(gateway, transport);
      const result = connection.receive(testCase.input);
      expect(result, testCase.name).toMatchObject({ kind: "rejected", reason: testCase.reason });
      expect(transport.sent, testCase.name).toHaveLength(0);
      expect(connection.state(), testCase.name).toBe("failed");
    }

    const duplicate = createGateway();
    const duplicateConnection = open(duplicate.gateway, duplicate.transport);
    register(duplicateConnection, duplicate.transport);
    expect(duplicateConnection.receive({ ...hello({ actor_id: actorId }), sender_sequence: 1 })).toMatchObject({
      kind: "rejected",
      reason: "duplicate_hello",
    });
    expect(duplicate.transport.sent).toHaveLength(1);
  });

  it("rejects post-Hello identity mismatches and terminal transport failure removes live state", () => {
    const ready = createGateway();
    const readyConnection = open(ready.gateway, ready.transport);
    register(readyConnection, ready.transport);
    expect(readyConnection.receive(hostMessage({ kind: "host_ready", actor_id: otherActorId }, 1))).toMatchObject({
      kind: "rejected",
      reason: "identity_mismatch",
    });
    expect(ready.transport.sent).toHaveLength(1);

    const result = createGateway();
    const resultConnection = open(result.gateway, result.transport);
    register(resultConnection, result.transport);
    expect(resultConnection.receive(hostMessage({
      kind: "invocation_result",
      result: { ...invocationResult, project_id: `project_${OTHER_UUID}` as ProjectId },
    }, 1))).toMatchObject({ kind: "rejected", reason: "identity_mismatch" });
    expect(result.transport.sent).toHaveLength(1);

    const transportFailure = createGateway();
    const transportConnection = open(transportFailure.gateway, transportFailure.transport);
    register(transportConnection, transportFailure.transport);
    expect(transportFailure.gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "test" }).kind).toBe("sent");
    transportFailure.transport.fail({ code: "transport_failed", message: "transport failed" });
    expect(transportConnection.state()).toBe("failed");
    expect(transportFailure.gateway.openConnection(identity, transportFailure.transport).kind).toBe("accepted");
  });

  it("does not retain a failed command send as pending and rejects commands on non-live connections", () => {
    const { gateway, transport } = createGateway();
    const connection = open(gateway, transport);
    expect(gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "not-live" })).toEqual({
      kind: "rejected",
      reason: "not_live",
    });
    register(connection, transport);
    transport.failNextSend = true;
    const failed = gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "send-fails" });
    expect(failed).toMatchObject({ kind: "transport_failed" });
    expect(connection.state()).toBe("failed");
    expect(gateway.openConnection(identity, transport).kind).toBe("accepted");
  });
});
