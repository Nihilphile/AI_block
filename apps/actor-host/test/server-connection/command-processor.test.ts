import { describe, expect, it } from "vitest";
import type {
  ActorLaunchSpec,
  ContractErrorEnvelope,
  HostMessageId,
  InvocationSpec,
  ServerToHostMessage,
  ServerToHostPayload,
} from "@ai-block/runtime-contracts";
import { FakeBackend } from "../../src/backend/fake-backend.js";
import { BackendSupervisor } from "../../src/backend/supervisor.js";
import {
  ActorHostCommandProcessor,
  type HostOutboundIntent,
  type HostOutboundPayloadSink,
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

class RecordingSink implements HostOutboundPayloadSink {
  public readonly intents: HostOutboundIntent[] = [];

  public send(intent: HostOutboundIntent): void {
    this.intents.push(intent);
  }
}

async function flushMicrotasks(): Promise<void> {
  for (let turn = 0; turn < 8; turn += 1) await Promise.resolve();
}

function createProcessor(fake: FakeBackend) {
  const sink = new RecordingSink();
  const processor = new ActorHostCommandProcessor(new BackendSupervisor(fake), sink);
  return { processor, sink };
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
      message: "Fake backend launch failed.",
      retryable: false,
    } as ContractErrorEnvelope;
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
      expect(sink.intents[1]!.payload.result.process).toEqual({ status: "launch_failed", error: launchFailure });
    }

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
