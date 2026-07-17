import { describe, expect, it } from "vitest";
import type {
  ActorLaunchSpec,
  CanonicalTimestamp,
  ContractErrorEnvelope,
  HostInstanceId,
  HostMessageId,
  HostToServerMessage,
  InvocationSpec,
  ProjectId,
  ServerToHostPayload,
} from "@ai-block/runtime-contracts";
import type { BackendAdapter, BackendAdapterStartResult } from "../../src/backend/adapter.js";
import {
  decodeContract,
  HostToServerMessageSchema,
} from "@ai-block/runtime-contracts";
import { FakeBackend } from "../../src/backend/fake-backend.js";
import { BackendSupervisor } from "../../src/backend/supervisor.js";
import {
  ServerConnection,
  type HostIdentity,
  type HostMessageIdProvider,
  type HostTimestampProvider,
  type HostTransportPort,
} from "../../src/server-connection/server-connection.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const hostInstanceId = `host_${UUID}`;
const snapshotId = `actor_config_${UUID}`;
const runId = `run_${UUID}`;
const packageRef = {
  package_id: `package_${UUID}`,
  content_hash: `sha256:${"a".repeat(64)}`,
};
const SECRET_MARKER = "token=tok_secret credential=cred_secret workspace=C:\\secret-workspace command=claude --api-key secret stderr=provider denied";
const launchSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  actor_id: actorId,
  actor_config_snapshot_id: snapshotId,
  system_prompts: [],
  working_directory: "C:\\work",
  backend: { adapter_id: "fake.backend", config: {} },
  tool_providers: [],
} satisfies ActorLaunchSpec;
const identity = {
  projectId,
  hostInstanceId,
  actorId,
} satisfies HostIdentity;

const messageIds = [
  `message_${"11111111-1111-4111-8111-111111111111"}`,
  `message_${"22222222-2222-4222-8222-222222222222"}`,
  `message_${"33333333-3333-4333-8333-333333333333"}`,
  `message_${"44444444-4444-4444-8444-444444444444"}`,
  `message_${"55555555-5555-4555-8555-555555555555"}`,
  `message_${"66666666-6666-4666-8666-666666666666"}`,
  `message_${"77777777-7777-4777-8777-777777777777"}`,
  `message_${"88888888-8888-4888-8888-888888888888"}`,
] as const;
const timestamps = [
  "2026-07-16T01:00:00.000Z",
  "2026-07-16T01:00:00.001Z",
  "2026-07-16T01:00:00.002Z",
  "2026-07-16T01:00:00.003Z",
  "2026-07-16T01:00:00.004Z",
  "2026-07-16T01:00:00.005Z",
  "2026-07-16T01:00:00.006Z",
  "2026-07-16T01:00:00.007Z",
] as const;

class DeterministicIds implements HostMessageIdProvider {
  private index = 0;

  public nextMessageId(): HostMessageId {
    const value = messageIds[this.index++];
    if (value === undefined) throw new Error("test message ID provider exhausted");
    return value;
  }
}

class DeterministicTimestamps implements HostTimestampProvider {
  private index = 0;

  public now(): CanonicalTimestamp {
    const value = timestamps[this.index++];
    if (value === undefined) throw new Error("test timestamp provider exhausted");
    return value;
  }
}

class InMemoryTransport implements HostTransportPort {
  public readonly sent: HostToServerMessage[] = [];
  public failNext = false;
  private readonly failureListeners = new Set<Parameters<HostTransportPort["onFailure"]>[0]>();

  public onFailure(listener: Parameters<HostTransportPort["onFailure"]>[0]): () => void {
    this.failureListeners.add(listener);
    return () => this.failureListeners.delete(listener);
  }

  public send(message: HostToServerMessage): void {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("in-memory transport send failed");
    }
    this.sent.push(message);
  }
}

class RejectingInitializeAdapter implements BackendAdapter {
  public readonly adapterId = "fake.backend" as const;

  public initialize(): Promise<void> {
    return Promise.reject(new Error(SECRET_MARKER));
  }

  public start(_invocation: InvocationSpec): BackendAdapterStartResult {
    throw new Error("RejectingInitializeAdapter does not start Invocations.");
  }
}

function invocation(
  invocationId: string,
  session: InvocationSpec["session"] = { mode: "create" },
): InvocationSpec {
  return {
    schema_version: "1.0.0",
    project_id: projectId,
    run_id: runId,
    actor_id: actorId,
    invocation_id: invocationId,
    input_package_refs: [packageRef],
    prompt: { kind: "text", text: "prompt" },
    session,
  };
}

function inbound(
  payload: ServerToHostPayload,
  senderSequence: number,
  overrides: Record<string, unknown> = {},
): unknown {
  return {
    protocol_version: "1.0.0",
    message_id: `message_${"99999999-9999-4999-8999-999999999999"}`,
    sender_sequence: senderSequence,
    connection_generation: 1,
    sent_at: "2026-07-16T02:00:00.000Z",
    payload,
    ...overrides,
  };
}

function initializeInput(senderSequence = 0): unknown {
  return inbound({ kind: "initialize_actor_host", launch_spec: launchSpec }, senderSequence);
}

function startInput(senderSequence: number, invocationId = `invocation_${"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}`): unknown {
  return inbound({ kind: "start_invocation", invocation_spec: invocation(invocationId) }, senderSequence);
}

function createConnection(adapter: BackendAdapter, transport = new InMemoryTransport()): { connection: ServerConnection; transport: InMemoryTransport; } {
  const connection = new ServerConnection({
    identity,
    connectionGeneration: 1,
    messageIds: new DeterministicIds(),
    timestamps: new DeterministicTimestamps(),
    transport,
    supervisor: new BackendSupervisor(adapter),
  });
  return { connection, transport };
}

async function flushMicrotasks(): Promise<void> {
  for (let turn = 0; turn < 8; turn += 1) await Promise.resolve();
}

describe("ActorHost ServerConnection", () => {
  it("sends one exact trusted HostHello envelope at generation one and sequence zero", () => {
    const { connection, transport } = createConnection(new FakeBackend([]));

    expect(connection.start()).toEqual({ kind: "sent" });
    expect(transport.sent).toHaveLength(1);
    expect(transport.sent[0]).toEqual({
      protocol_version: "1.0.0",
      message_id: messageIds[0],
      sender_sequence: 0,
      connection_generation: 1,
      sent_at: timestamps[0],
      payload: { kind: "host_hello", project_id: projectId, host_instance_id: hostInstanceId, actor_id: actorId },
    });
    expect(decodeContract(HostToServerMessageSchema, transport.sent[0]).ok).toBe(true);
    expect(connection.start()).toEqual({
      kind: "rejected",
      reason: "already_started",
    });
  });

  it("rejects inbound and ordinary outbound work before Hello succeeds", () => {
    const fake = new FakeBackend([]);
    const { connection } = createConnection(fake);

    expect(connection.receive(initializeInput())).toEqual({
      kind: "rejected",
      reason: "not_started",
    });
    expect(connection.send({
      payload: { kind: "heartbeat" },
    })).toEqual({
      kind: "rejected",
      reason: "not_started",
    });
    expect(fake.initializeCalls).toBe(0);
  });

  it("decodes a valid command once and wraps ACK/readiness with causal correlation", async () => {
    const fake = new FakeBackend([]);
    const { connection, transport } = createConnection(fake);
    connection.start();

    const result = connection.receive(initializeInput(0));
    expect(result).toEqual({ kind: "accepted", disposition: { kind: "handled" } });
    await flushMicrotasks();

    expect(fake.initializeCalls).toBe(1);
    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["host_hello", "ack", "host_ready"]);
    expect(transport.sent[1]).toMatchObject({
      sender_sequence: 1,
      connection_generation: 1,
      correlation_id: `message_${"99999999-9999-4999-8999-999999999999"}`,
      payload: { kind: "ack", acknowledged_message_id: `message_${"99999999-9999-4999-8999-999999999999"}` },
    });
    expect(transport.sent[2]).toMatchObject({
      sender_sequence: 2,
      connection_generation: 1,
      correlation_id: `message_${"99999999-9999-4999-8999-999999999999"}`,
      payload: { kind: "host_ready", actor_id: actorId },
    });
  });

  it("enforces authenticated identity before initialization and start backend calls", async () => {
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-identity-boundary" }]);
    const { connection, transport } = createConnection(fake);
    connection.start();

    const mismatchedLaunch = { ...launchSpec, project_id: `project_${"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}` };
    expect(connection.receive(inbound({ kind: "initialize_actor_host", launch_spec: mismatchedLaunch }, 0))).toMatchObject({
      kind: "accepted",
      disposition: { kind: "handled" },
    });
    await flushMicrotasks();
    expect(fake.initializeCalls).toBe(0);
    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["host_hello", "ack", "host_fault"]);
    expect(transport.sent[2]?.payload).toMatchObject({
      kind: "host_fault",
      error: { code: "actor_host.identity_mismatch" },
    });

    transport.sent.length = 0;
    expect(connection.receive(initializeInput(1))).toMatchObject({
      kind: "accepted",
      disposition: { kind: "handled" },
    });
    await flushMicrotasks();
    expect(fake.initializeCalls).toBe(1);
    transport.sent.length = 0;

    const mismatchedInvocation = {
      ...invocation(`invocation_${"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}`),
      actor_id: `actor_${"cccccccc-cccc-4ccc-8ccc-cccccccccccc"}`,
    };
    expect(connection.receive(inbound({ kind: "start_invocation", invocation_spec: mismatchedInvocation }, 2))).toMatchObject({
      kind: "accepted",
      disposition: { kind: "handled" },
    });
    await flushMicrotasks();
    expect(fake.startCalls).toHaveLength(0);
    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(transport.sent[1]?.payload).toMatchObject({
      kind: "host_fault",
      invocation_id: mismatchedInvocation.invocation_id,
      error: { code: "actor_host.identity_mismatch" },
    });
  });

  it("redacts initialization diagnostics from the serialized HostFault envelope", async () => {
    const { connection, transport } = createConnection(new RejectingInitializeAdapter());
    connection.start();
    transport.sent.length = 0;

    expect(connection.receive(initializeInput(0))).toMatchObject({
      kind: "accepted",
      disposition: { kind: "handled" },
    });
    await flushMicrotasks();

    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(transport.sent[1]?.payload).toMatchObject({
      kind: "host_fault",
      error: {
        code: "actor_host.initialization_failed",
        message: "Backend adapter initialization failed.",
      },
    });
    expect(JSON.stringify(transport.sent)).not.toContain(SECRET_MARKER);
  });

  it("redacts session rejection diagnostics from the serialized HostFault envelope", async () => {
    const fake = new FakeBackend([{ kind: "session_rejected", message: SECRET_MARKER }]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    connection.receive(initializeInput(0));
    await flushMicrotasks();
    transport.sent.length = 0;

    connection.receive(startInput(1));
    await flushMicrotasks();

    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(transport.sent[1]?.payload).toMatchObject({
      kind: "host_fault",
      error: {
        code: "actor_host.session_observation_failed",
        message: "Backend session observation failed.",
      },
    });
    expect(JSON.stringify(transport.sent)).not.toContain(SECRET_MARKER);
  });

  it("redacts completion rejection diagnostics from the serialized HostFault envelope", async () => {
    const fake = new FakeBackend([{
      kind: "completion_rejected",
      sessionId: "fake-session-completion-redaction",
      message: SECRET_MARKER,
    }]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    connection.receive(initializeInput(0));
    await flushMicrotasks();
    transport.sent.length = 0;

    connection.receive(startInput(1));
    await flushMicrotasks();

    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report", "host_fault"]);
    expect(transport.sent[2]?.payload).toMatchObject({
      kind: "host_fault",
      error: {
        code: "actor_host.completion_observation_failed",
        message: "Backend completion observation failed.",
      },
    });
    expect(JSON.stringify(transport.sent)).not.toContain(SECRET_MARKER);
    expect(transport.sent.some(({ payload }) => payload.kind === "invocation_result")).toBe(false);
  });

  it("redacts stop rejection diagnostics from the serialized HostFault envelope", async () => {
    const invocationId = `invocation_${"dddddddd-dddd-4ddd-8ddd-dddddddddddd"}`;
    const fake = new FakeBackend([{
      kind: "stop_rejected",
      sessionId: "fake-session-stop-redaction",
      message: SECRET_MARKER,
    }]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    connection.receive(initializeInput(0));
    await flushMicrotasks();
    transport.sent.length = 0;

    connection.receive(inbound({
      kind: "start_invocation",
      invocation_spec: invocation(invocationId),
    }, 1));
    await flushMicrotasks();
    transport.sent.length = 0;

    connection.receive(inbound({
      kind: "stop_invocation",
      invocation_id: invocationId,
      reason: "redaction test",
    }, 2));
    await flushMicrotasks();

    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(transport.sent[1]?.payload).toMatchObject({
      kind: "host_fault",
      error: {
        code: "actor_host.adapter_stop_failed",
        message: "Backend adapter stop failed.",
      },
    });
    expect(JSON.stringify(transport.sent)).not.toContain(SECRET_MARKER);
    expect(transport.sent.some(({ payload }) => payload.kind === "invocation_result")).toBe(false);
  });

  it("redacts launch failure diagnostics without changing its process error code", async () => {
    const launchFailure = {
      schema_version: "1.0.0",
      code: "backend.launch_failed",
      category: "backend",
      message: SECRET_MARKER,
      retryable: false,
      details: { diagnostic: SECRET_MARKER },
    } as unknown as ContractErrorEnvelope;
    const fake = new FakeBackend([{ kind: "launch_failed", error: launchFailure }]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    connection.receive(initializeInput(0));
    await flushMicrotasks();
    transport.sent.length = 0;

    connection.receive(startInput(1));

    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "invocation_result"]);
    expect(transport.sent[1]?.payload).toMatchObject({
      kind: "invocation_result",
      result: {
        process: {
          status: "launch_failed",
          error: {
            code: "backend.launch_failed",
            message: "Backend process launch failed.",
          },
        },
      },
    });
    if (transport.sent[1]?.payload.kind === "invocation_result") {
      expect(transport.sent[1].payload.result.process).toEqual({
        status: "launch_failed",
        error: {
          schema_version: "1.0.0",
          code: "backend.launch_failed",
          category: "backend",
          message: "Backend process launch failed.",
          retryable: false,
        },
      });
    }
    expect(JSON.stringify(transport.sent)).not.toContain(SECRET_MARKER);
  });

  it("preserves command session/result ordering and causal correlation without payload envelope fields", async () => {
    const invocationId = `invocation_${"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}`;
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-1" }]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    connection.receive(initializeInput(0));
    await flushMicrotasks();
    transport.sent.length = 0;

    connection.receive(startInput(1, invocationId));
    await flushMicrotasks();
    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report"]);
    expect(transport.sent[0]).toMatchObject({ sender_sequence: 3, correlation_id: expect.any(String) });
    expect(transport.sent[1]).toMatchObject({
      sender_sequence: 4,
      correlation_id: transport.sent[0]!.correlation_id,
      payload: { kind: "session_report", invocation_id: invocationId, session_id: "fake-session-1" },
    });
    expect(Object.keys(transport.sent[1]!.payload)).toEqual(["kind", "invocation_id", "session_id"]);

    fake.complete(invocationId, { status: "exited", exit_code: 0 });
    await flushMicrotasks();
    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report", "invocation_result"]);
    expect(transport.sent[2]).toMatchObject({
      sender_sequence: 5,
      correlation_id: transport.sent[0]!.correlation_id,
      payload: { kind: "invocation_result", result: { invocation_id: invocationId } },
    });
  });

  it("fails closed for malformed, wrong-direction, wrong-version, and unknown-field input", () => {
    const invalidInputs: unknown[] = [
      null,
      inbound({ kind: "host_ready", actor_id: actorId } as never, 0),
      inbound({ kind: "initialize_actor_host", launch_spec: launchSpec }, 0, { protocol_version: "2.0.0" }),
      inbound({ kind: "initialize_actor_host", launch_spec: launchSpec }, 0, { extra: true }),
    ];

    for (const invalidInput of invalidInputs) {
      const fake = new FakeBackend([]);
      const { connection, transport } = createConnection(fake);
      connection.start();
      expect(connection.receive(invalidInput)).toMatchObject({ kind: "rejected", reason: "decode_failed" });
      expect(fake.initializeCalls).toBe(0);
      expect(transport.sent).toHaveLength(1);
    }
  });

  it("rejects wrong generation, stale sequence, and sequence gaps without ACK or dispatch", async () => {
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-2" }]);
    const { connection, transport } = createConnection(fake);
    connection.start();

    expect(connection.receive(inbound({ kind: "initialize_actor_host", launch_spec: launchSpec }, 0, { connection_generation: 2 }))).toEqual({
      kind: "rejected",
      reason: "generation_mismatch",
    });
    expect(connection.receive(initializeInput(0))).toMatchObject({ kind: "accepted" });
    await flushMicrotasks();
    const sentAfterInitialize = transport.sent.length;

    expect(connection.receive(startInput(0))).toEqual({
      kind: "rejected",
      reason: "sequence_stale",
    });
    expect(connection.receive(startInput(2))).toEqual({
      kind: "rejected",
      reason: "sequence_gap",
    });
    expect(fake.startCalls).toHaveLength(0);
    expect(transport.sent).toHaveLength(sentAfterInitialize);

    expect(connection.receive(startInput(1))).toMatchObject({ kind: "accepted" });
    await flushMicrotasks();
    expect(fake.startCalls).toHaveLength(1);
  });

  it("does not ACK an inbound Server ACK", async () => {
    const fake = new FakeBackend([]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    connection.receive(initializeInput(0));
    await flushMicrotasks();
    transport.sent.length = 0;

    expect(connection.receive(inbound({
      kind: "ack",
      acknowledged_message_id: messageIds[0],
    }, 1))).toEqual({ kind: "accepted", disposition: { kind: "not_command" } });
    expect(transport.sent).toHaveLength(0);
    expect(fake.startCalls).toHaveLength(0);
  });

  it("returns transport failure for a receipt ACK failure and never dispatches the backend command", () => {
    const fake = new FakeBackend([]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    transport.failNext = true;

    expect(connection.receive(initializeInput(0))).toMatchObject({
      kind: "accepted",
      disposition: { kind: "transport_failed", error: { code: "transport_failed" } },
    });
    expect(fake.initializeCalls).toBe(0);
    expect(connection.receive(initializeInput(1))).toEqual({
      kind: "rejected",
      reason: "failed",
    });
  });

  it("makes an asynchronous output send failure terminal without an unhandled rejection", async () => {
    const invocationId = `invocation_${"cccccccc-cccc-4ccc-8ccc-cccccccccccc"}`;
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-3" }]);
    const { connection, transport } = createConnection(fake);
    connection.start();
    connection.receive(initializeInput(0));
    await flushMicrotasks();

    expect(connection.receive(startInput(1, invocationId))).toMatchObject({ kind: "accepted" });
    transport.failNext = true;
    await flushMicrotasks();
    expect(transport.sent.map(({ payload }) => payload.kind)).toEqual(["host_hello", "ack", "host_ready", "ack"]);
    expect(connection.send({ payload: { kind: "heartbeat" } })).toEqual({
      kind: "rejected",
      reason: "failed",
    });
    fake.complete(invocationId, { status: "exited", exit_code: 0 });
    await flushMicrotasks();
  });
});
