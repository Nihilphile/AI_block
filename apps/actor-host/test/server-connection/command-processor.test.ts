import { describe, expect, it } from "vitest";
import type {
  ActorLaunchSpec,
  ContractErrorEnvelope,
  HostMessageId,
  InvocationSpec,
  ServerToHostMessage,
  ServerToHostPayload,
} from "@ai-block/runtime-contracts";
import type { BackendAdapter, BackendAdapterStartResult } from "../../src/backend/adapter.js";
import { FakeBackend } from "../../src/backend/fake-backend.js";
import { BackendSupervisor } from "../../src/backend/supervisor.js";
import {
  ActorHostCommandProcessor,
  type HostOutboundIntent,
  type HostOutboundPayloadSink,
  type HostOutboundSendResult,
} from "../../src/server-connection/command-processor.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
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

function messageId(suffix: string): HostMessageId {
  return `message_${suffix}`;
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

function inbound(message: string, payload: ServerToHostPayload, sequence = 0): ServerToHostMessage {
  return {
    protocol_version: "1.0.0",
    message_id: messageId(message),
    sender_sequence: sequence,
    connection_generation: 1,
    sent_at: "2026-07-16T00:00:00.000Z",
    payload,
  };
}

function initializeMessage(message: string, sequence = 0): ServerToHostMessage {
  return inbound(message, { kind: "initialize_actor_host", launch_spec: launchSpec }, sequence);
}

function startMessage(message: string, invocationSpec: InvocationSpec, sequence = 0): ServerToHostMessage {
  return inbound(message, { kind: "start_invocation", invocation_spec: invocationSpec }, sequence);
}

function faultCode(intent: HostOutboundIntent): string | undefined {
  return intent.payload.kind === "host_fault" ? intent.payload.error.code : undefined;
}

function expectFault(intent: HostOutboundIntent, code: string, message: string): void {
  expect(intent.payload.kind).toBe("host_fault");
  if (intent.payload.kind !== "host_fault") throw new Error("expected HostFault");
  expect(intent.payload.error.code).toBe(code);
  expect(intent.payload.error.message).toBe(message);
}

class RecordingSink implements HostOutboundPayloadSink {
  public readonly intents: HostOutboundIntent[] = [];

  public send(intent: HostOutboundIntent): HostOutboundSendResult {
    this.intents.push(intent);
    return { kind: "sent" };
  }
}

async function flushMicrotasks(): Promise<void> {
  for (let turn = 0; turn < 8; turn += 1) await Promise.resolve();
}

class DeferredInitializeAdapter implements BackendAdapter {
  public readonly adapterId = "fake.backend" as const;
  public initializeCalls = 0;
  private readonly initializePromise: Promise<void>;
  private resolveInitialize!: () => void;
  private rejectInitialize!: (error: Error) => void;

  public constructor() {
    this.initializePromise = new Promise<void>((resolve, reject) => {
      this.resolveInitialize = resolve;
      this.rejectInitialize = reject;
    });
  }

  public initialize(): Promise<void> {
    this.initializeCalls += 1;
    return this.initializePromise;
  }

  public start(_invocation: InvocationSpec): BackendAdapterStartResult {
    throw new Error("DeferredInitializeAdapter does not start Invocations.");
  }

  public resolve(): void {
    this.resolveInitialize();
  }

  public reject(error = new Error(SECRET_MARKER)): void {
    this.rejectInitialize(error);
  }
}

function createProcessor(
  adapter: BackendAdapter,
  authenticatedIdentity = {
    projectId,
    actorId,
    hostInstanceId: `host_${UUID}`,
  },
) {
  const sink = new RecordingSink();
  const supervisor = new BackendSupervisor(adapter);
  const processor = new ActorHostCommandProcessor(supervisor, authenticatedIdentity, sink);
  return { processor, sink, supervisor };
}

function expectAck(intent: HostOutboundIntent, message: string): void {
  expect(intent).toEqual({
    payload: { kind: "ack", acknowledged_message_id: messageId(message) },
    causalMessageId: messageId(message),
  });
}

describe("ActorHost command processor", () => {
  it("acknowledges initialize before readiness and keeps initialization session-free", async () => {
    const fake = new FakeBackend([]);
    const { processor, sink } = createProcessor(fake);

    expect(processor.process(initializeMessage("initialize-1"))).toEqual({ kind: "handled" });
    expect(sink.intents).toHaveLength(1);
    expectAck(sink.intents[0]!, "initialize-1");

    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_ready"]);
    expect(sink.intents[1]).toEqual({
      payload: { kind: "host_ready", actor_id: actorId },
      causalMessageId: messageId("initialize-1"),
    });
    expect(fake.initializeCalls).toBe(1);
    expect(fake.startCalls).toHaveLength(0);
  });

  it("reports idempotent initialization and maps a rejected initialization", async () => {
    const fake = new FakeBackend([]);
    const { processor, sink } = createProcessor(fake);

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;

    processor.process(initializeMessage("initialize-2", 1));
    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_ready"]);

    sink.intents.length = 0;
    const mismatchedLaunch = {
      ...launchSpec,
      backend: { adapter_id: "other.backend", config: {} },
    } satisfies ActorLaunchSpec;
    processor.process(inbound("initialize-3", { kind: "initialize_actor_host", launch_spec: mismatchedLaunch }, 2));
    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(faultCode(sink.intents[1]!)).toBe("actor_host.adapter_mismatch");
    expect(sink.intents[1]!.causalMessageId).toBe(messageId("initialize-3"));
    if (sink.intents[1]!.payload.kind === "host_fault") {
      expect(sink.intents[1]!.payload.error.correlation_id).toBeUndefined();
    }
  });

  it("binds initialize and start to the authenticated identity before backend work", async () => {
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-identity" }]);
    const { processor, sink } = createProcessor(fake);
    const mismatchedLaunch = { ...launchSpec, actor_id: `actor_${"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"}` };

    processor.process(inbound("initialize-mismatch", {
      kind: "initialize_actor_host",
      launch_spec: mismatchedLaunch,
    }));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(faultCode(sink.intents[1]!)).toBe("actor_host.identity_mismatch");
    expect(fake.initializeCalls).toBe(0);

    sink.intents.length = 0;
    processor.process(initializeMessage("initialize-valid"));
    await flushMicrotasks();
    sink.intents.length = 0;

    processor.process(startMessage("start-mismatch", {
      ...invocation(`invocation_${"ffffffff-ffff-4fff-8fff-ffffffffffff"}`),
      project_id: `project_${"11111111-1111-4111-8111-111111111111"}`,
    }, 1));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(faultCode(sink.intents[1]!)).toBe("actor_host.identity_mismatch");
    expect(fake.startCalls).toHaveLength(0);
  });

  it("serializes concurrent initialization and preserves ACK-before-fact ordering", async () => {
    const adapter = new DeferredInitializeAdapter();
    const { processor, sink } = createProcessor(adapter);
    const conflictingLaunch = {
      ...launchSpec,
      actor_id: `actor_${"22222222-2222-4222-8222-222222222222"}`,
    };

    processor.process(initializeMessage("initialize-first"));
    processor.process(initializeMessage("initialize-second", 1));
    processor.process(inbound("initialize-conflict", {
      kind: "initialize_actor_host",
      launch_spec: conflictingLaunch,
    }, 2));

    expect(sink.intents.slice(0, 3).map(({ payload }) => payload.kind)).toEqual(["ack", "ack", "ack"]);
    expect(adapter.initializeCalls).toBe(1);

    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "ack", "ack", "host_fault"]);
    expect(faultCode(sink.intents[3]!)).toBe("actor_host.identity_mismatch");
    expect(sink.intents[3]!.causalMessageId).toBe(messageId("initialize-conflict"));

    adapter.resolve();
    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual([
      "ack",
      "ack",
      "ack",
      "host_fault",
      "host_ready",
      "host_ready",
    ]);
    expect(sink.intents[4]!.causalMessageId).toBe(messageId("initialize-first"));
    expect(sink.intents[5]!.causalMessageId).toBe(messageId("initialize-second"));
  });

  it("maps session rejection to one terminal HostFault and quarantines the supervisor", async () => {
    const invocationId = `invocation_${"12121212-1212-4121-8121-121212121212"}`;
    const fake = new FakeBackend([{ kind: "session_rejected", message: SECRET_MARKER }]);
    const { processor, sink, supervisor } = createProcessor(fake);

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;
    processor.process(startMessage("start-session-rejected", invocation(invocationId), 1));
    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expectFault(sink.intents[1]!, "actor_host.session_observation_failed", "Backend session observation failed.");
    expect(JSON.stringify(sink.intents)).not.toContain(SECRET_MARKER);
    expect(sink.intents[1]!.causalMessageId).toBe(messageId("start-session-rejected"));
    if (sink.intents[1]!.payload.kind === "host_fault") {
      expect(sink.intents[1]!.payload.invocation_id).toBe(invocationId);
    }
    expect(fake.startCalls).toHaveLength(1);
    expect(supervisor.snapshot()).toEqual({ state: "faulted" });
    sink.intents.length = 0;
    processor.process(startMessage("start-after-quarantine", invocation(`invocation_${"16161616-1616-4161-8161-161616161616"}`), 2));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expectFault(sink.intents[1]!, "actor_host.quarantined", "BackendSupervisor is quarantined after an Invocation failure.");
  });

  it("maps completion rejection without emitting an InvocationResult", async () => {
    const invocationId = `invocation_${"13131313-1313-4131-8131-131313131313"}`;
    const fake = new FakeBackend([{
      kind: "completion_rejected",
      sessionId: "fake-session-completion-rejected",
      message: SECRET_MARKER,
    }]);
    const { processor, sink } = createProcessor(fake);

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;
    processor.process(startMessage("start-completion-rejected", invocation(invocationId), 1));
    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report", "host_fault"]);
    expectFault(sink.intents[2]!, "actor_host.completion_observation_failed", "Backend completion observation failed.");
    expect(JSON.stringify(sink.intents)).not.toContain(SECRET_MARKER);
    expect(sink.intents.some(({ payload }) => payload.kind === "invocation_result")).toBe(false);
  });

  it("maps asynchronous stop rejection once and does not claim stopped", async () => {
    const invocationId = `invocation_${"14141414-1414-4141-8141-141414141414"}`;
    const fake = new FakeBackend([{
      kind: "stop_rejected",
      sessionId: "fake-session-stop-rejected",
      message: SECRET_MARKER,
    }]);
    const { processor, sink } = createProcessor(fake);

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;
    processor.process(startMessage("start-stop-rejected", invocation(invocationId), 1));
    await flushMicrotasks();
    sink.intents.length = 0;

    processor.process(inbound("stop-rejected", {
      kind: "stop_invocation",
      invocation_id: invocationId,
      reason: "test rejection",
    }, 2));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack"]);
    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expectFault(sink.intents[1]!, "actor_host.adapter_stop_failed", "Backend adapter stop failed.");
    expect(JSON.stringify(sink.intents)).not.toContain(SECRET_MARKER);
    expect(sink.intents.some(({ payload }) => payload.kind === "invocation_result")).toBe(false);
    expect(fake.stopCalls).toBe(1);
  });

  it("suppresses duplicate faults when session and completion reject together", async () => {
    const fake = new FakeBackend([{
      kind: "session_and_completion_rejected",
      message: SECRET_MARKER,
    }]);
    const { processor, sink } = createProcessor(fake);

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;
    processor.process(startMessage("start-both-rejected", invocation(`invocation_${"15151515-1515-4151-8151-151515151515"}`), 1));
    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expectFault(sink.intents[1]!, "actor_host.session_observation_failed", "Backend session observation failed.");
    expect(JSON.stringify(sink.intents)).not.toContain(SECRET_MARKER);
  });

  it("maps initialization rejection to a fixed HostFault message", async () => {
    const adapter = new DeferredInitializeAdapter();
    const { processor, sink } = createProcessor(adapter);

    processor.process(initializeMessage("initialize-rejected"));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack"]);

    adapter.reject();
    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expectFault(sink.intents[1]!, "actor_host.initialization_failed", "Backend adapter initialization failed.");
    expect(JSON.stringify(sink.intents)).not.toContain(SECRET_MARKER);
  });

  it("uses a generic fixed message for an unexpected future lifecycle code", async () => {
    const sink = new RecordingSink();
    const futureSupervisor = {
      initialize: async () => ({
        kind: "rejected",
        error: { code: "future_adapter_code", message: SECRET_MARKER },
      }),
      start: () => ({ kind: "rejected", error: { code: "future_adapter_code", message: SECRET_MARKER } }),
      stop: () => ({ kind: "rejected", error: { code: "future_adapter_code", message: SECRET_MARKER } }),
    } as unknown as BackendSupervisor;
    const processor = new ActorHostCommandProcessor(
      futureSupervisor,
      { projectId, actorId, hostInstanceId: `host_${UUID}` },
      sink,
    );

    processor.process(initializeMessage("initialize-future-code"));
    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expectFault(sink.intents[1]!, "actor_host.future_adapter_code", "ActorHost operation failed.");
    expect(JSON.stringify(sink.intents)).not.toContain(SECRET_MARKER);
  });

  it("forwards create and resume starts with session before final result", async () => {
    const firstInvocationId = `invocation_${"11111111-1111-4111-8111-111111111111"}`;
    const secondInvocationId = `invocation_${"22222222-2222-4222-8222-222222222222"}`;
    const fake = new FakeBackend([
      { kind: "pending", sessionId: "fake-session-1" },
      { kind: "pending", sessionId: "fake-session-1" },
    ]);
    const { processor, sink } = createProcessor(fake);

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;

    processor.process(startMessage("start-1", invocation(firstInvocationId), 1));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack"]);
    expectAck(sink.intents[0]!, "start-1");

    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report"]);
    expect(sink.intents[1]).toEqual({
      payload: { kind: "session_report", invocation_id: firstInvocationId, session_id: "fake-session-1" },
      causalMessageId: messageId("start-1"),
    });
    expect(fake.startCalls[0]?.session).toEqual({ mode: "create" });

    fake.complete(firstInvocationId, { status: "exited", exit_code: 0 });
    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report", "invocation_result"]);
    expect(sink.intents[2]!.causalMessageId).toBe(messageId("start-1"));
    if (sink.intents[2]!.payload.kind === "invocation_result") {
      expect(sink.intents[2]!.payload.result.process).toEqual({ status: "exited", exit_code: 0 });
    }

    sink.intents.length = 0;
    processor.process(startMessage("start-2", invocation(secondInvocationId, { mode: "resume", session_id: "fake-session-1" }), 2));
    await flushMicrotasks();
    expect(fake.startCalls[1]?.session).toEqual({ mode: "resume", session_id: "fake-session-1" });
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report"]);

    fake.complete(secondInvocationId, { status: "exited", exit_code: 0 });
    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report", "invocation_result"]);
  });

  it("emits launch failure as InvocationResult and preserves later completion facts", async () => {
    const launchFailure = {
      schema_version: "1.0.0",
      code: "backend.launch_failed",
      category: "backend",
      message: SECRET_MARKER,
      retryable: false,
      details: { diagnostic: SECRET_MARKER },
    } as unknown as ContractErrorEnvelope;
    const safeLaunchFailure = {
      schema_version: "1.0.0",
      code: "backend.launch_failed",
      category: "backend",
      message: "Backend process launch failed.",
      retryable: false,
    };
    const failedInvocationId = `invocation_${"33333333-3333-4333-8333-333333333333"}`;
    const completedInvocationId = `invocation_${"44444444-4444-4444-8444-444444444444"}`;
    const fake = new FakeBackend([
      { kind: "launch_failed", error: launchFailure },
      { kind: "completed", sessionId: "fake-session-2", process: { status: "exited", exit_code: 7 } },
    ]);
    const { processor, sink } = createProcessor(fake);

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;

    processor.process(startMessage("start-failed", invocation(failedInvocationId), 1));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "invocation_result"]);
    expect(sink.intents[1]!.causalMessageId).toBe(messageId("start-failed"));
    if (sink.intents[1]!.payload.kind === "invocation_result") {
      expect(sink.intents[1]!.payload.result.process).toEqual({ status: "launch_failed", error: safeLaunchFailure });
    }
    expect(JSON.stringify(sink.intents)).not.toContain(SECRET_MARKER);

    sink.intents.length = 0;
    processor.process(startMessage("start-completed", invocation(completedInvocationId), 2));
    await flushMicrotasks();
    fake.complete(completedInvocationId, { status: "exited", exit_code: 7 });
    await flushMicrotasks();

    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "session_report", "invocation_result"]);
    expect(sink.intents.some(({ payload }) => payload.kind === "host_fault")).toBe(false);
    if (sink.intents[2]!.payload.kind === "invocation_result") {
      expect(sink.intents[2]!.payload.result.process).toEqual({ status: "exited", exit_code: 7 });
    }
  });

  it("maps start and stop lifecycle rejections without starting or stopping the wrong invocation", async () => {
    const activeInvocationId = `invocation_${"55555555-5555-4555-8555-555555555555"}`;
    const otherInvocationId = `invocation_${"66666666-6666-4666-8666-666666666666"}`;
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-3" }]);
    const { processor, sink } = createProcessor(fake);

    processor.process(startMessage("start-before-init", invocation(activeInvocationId)));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(faultCode(sink.intents[1]!)).toBe("actor_host.not_initialized");
    expect(fake.startCalls).toHaveLength(0);

    sink.intents.length = 0;
    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;
    processor.process(startMessage("start-active", invocation(activeInvocationId), 1));
    await flushMicrotasks();
    sink.intents.length = 0;

    processor.process(startMessage("start-busy", invocation(otherInvocationId), 2));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(faultCode(sink.intents[1]!)).toBe("actor_host.busy");
    expect(fake.startCalls).toHaveLength(1);

    sink.intents.length = 0;
    processor.process(inbound("stop-mismatch", {
      kind: "stop_invocation",
      invocation_id: otherInvocationId,
      reason: "wrong target",
    }, 3));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "host_fault"]);
    expect(faultCode(sink.intents[1]!)).toBe("actor_host.invocation_mismatch");
    expect(fake.stopCalls).toBe(0);

    sink.intents.length = 0;
    processor.process(inbound("stop-active", {
      kind: "stop_invocation",
      invocation_id: activeInvocationId,
      reason: "cancel",
    }, 4));
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack"]);
    expect(fake.stopCalls).toBe(1);
    await flushMicrotasks();
    expect(sink.intents.map(({ payload }) => payload.kind)).toEqual(["ack", "invocation_result"]);
    if (sink.intents[1]!.payload.kind === "invocation_result") {
      expect(sink.intents[1]!.payload.result.process).toEqual({ status: "stopped" });
    }
  });

  it("does not ACK inbound ACKs and keeps shutdown receipt-only", async () => {
    const fake = new FakeBackend([]);
    const { processor, sink } = createProcessor(fake);

    expect(processor.process(inbound("ack-1", {
      kind: "ack",
      acknowledged_message_id: messageId("server-command"),
    }))).toEqual({ kind: "not_command" });
    expect(sink.intents).toHaveLength(0);

    expect(processor.process(inbound("shutdown-1", { kind: "shutdown_host", reason: "test shutdown" }, 1))).toEqual({ kind: "handled" });
    expect(sink.intents).toHaveLength(1);
    expectAck(sink.intents[0]!, "shutdown-1");
    await flushMicrotasks();
    expect(sink.intents).toHaveLength(1);
    expect(fake.initializeCalls).toBe(0);
    expect(fake.startCalls).toHaveLength(0);
  });

  it("keeps envelope-owned fields out of every emitted payload and intent", async () => {
    const fake = new FakeBackend([{ kind: "completed", sessionId: "fake-session-4", process: { status: "exited", exit_code: 0 } }]);
    const { processor, sink } = createProcessor(fake);
    const invocationId = `invocation_${"77777777-7777-4777-8777-777777777777"}`;

    processor.process(initializeMessage("initialize-1"));
    await flushMicrotasks();
    sink.intents.length = 0;
    processor.process(startMessage("start-1", invocation(invocationId), 1));
    await flushMicrotasks();

    for (const intent of sink.intents) {
      expect(Object.keys(intent).sort()).toEqual(["causalMessageId", "payload"]);
      expect(Object.keys(intent.payload)).not.toContain("protocol_version");
      expect(Object.keys(intent.payload)).not.toContain("message_id");
      expect(Object.keys(intent.payload)).not.toContain("correlation_id");
      expect(Object.keys(intent.payload)).not.toContain("sender_sequence");
      expect(Object.keys(intent.payload)).not.toContain("connection_generation");
      expect(Object.keys(intent.payload)).not.toContain("sent_at");
    }
  });
});
