import { describe, expect, it } from "vitest";
import type {
  ActorLaunchSpec,
  BackendSessionId,
  ContractErrorEnvelope,
  ExitedProcessFact,
  InvocationSpec,
} from "@ai-block/runtime-contracts";
import { FakeBackend } from "../../src/backend/fake-backend.js";
import {
  BackendSupervisor,
  type SupervisorStartResult,
} from "../../src/backend/supervisor.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const snapshotId = `actor_config_${UUID}`;
const runId = `run_${UUID}`;
const packageRef = {
  package_id: `package_${UUID}`,
  content_hash: `sha256:${"a".repeat(64)}`,
};
const launchError = {
  schema_version: "1.0.0",
  code: "backend.launch_failed",
  category: "backend",
  message: "Fake backend launch failed.",
  retryable: false,
} as ContractErrorEnvelope;

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

function startedResult(result: SupervisorStartResult) {
  expect(result.kind).toBe("started");
  if (result.kind !== "started") throw new Error("expected a started invocation");
  return result.invocation;
}

async function initialize(supervisor: BackendSupervisor) {
  await expect(supervisor.initialize(launchSpec)).resolves.toEqual({ kind: "initialized" });
}

describe("BackendSupervisor with FakeBackend", () => {
  it("initializes without starting a backend or creating a session", async () => {
    const fake = new FakeBackend([]);
    const supervisor = new BackendSupervisor(fake);

    await initialize(supervisor);

    expect(fake.initializeCalls).toBe(1);
    expect(fake.startCalls).toHaveLength(0);
    expect(fake.sessionBindings).toHaveLength(0);
    expect(supervisor.snapshot()).toEqual({ state: "ready" });
  });

  it("rejects start before initialization as a typed Host-local result", () => {
    const supervisor = new BackendSupervisor(new FakeBackend([]));

    expect(supervisor.start(invocation(`invocation_${UUID}`))).toMatchObject({
      kind: "rejected",
      error: { code: "not_initialized" },
    });
  });

  it("creates and exposes a session before final completion", async () => {
    const invocationId = `invocation_${UUID}`;
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-1" }]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const handle = startedResult(supervisor.start(invocation(invocationId)));
    expect(supervisor.snapshot()).toMatchObject({
      state: "running",
      activeInvocationId: invocationId,
    });
    await expect(handle.session).resolves.toBe("fake-session-1");
    expect(fake.startCalls[0]?.session).toEqual({ mode: "create" });

    fake.complete(invocationId, { status: "exited", exit_code: 0 });
    await expect(handle.result).resolves.toMatchObject({
      session_id: "fake-session-1",
      process: { status: "exited", exit_code: 0 },
    });
    expect(supervisor.snapshot()).toEqual({ state: "ready", sessionId: "fake-session-1" });
  });

  it("resumes the explicitly supplied session ID", async () => {
    const sessionId: BackendSessionId = "fake-session-1";
    const fake = new FakeBackend([
      { kind: "completed", sessionId, process: { status: "exited", exit_code: 0 } },
      { kind: "pending", sessionId },
    ]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const firstId = `invocation_${UUID}`;
    const first = startedResult(supervisor.start(invocation(firstId)));
    await first.session;
    await first.result;

    const resumedId = `invocation_${"11111111-1111-4111-8111-111111111111"}`;
    const second = startedResult(supervisor.start(invocation(resumedId, { mode: "resume", session_id: sessionId })));
    await expect(second.session).resolves.toBe(sessionId);
    expect(fake.startCalls[1]?.session).toEqual({ mode: "resume", session_id: sessionId });

    fake.complete(resumedId, { status: "exited", exit_code: 0 });
    await second.result;
  });

  it("rejects a concurrent start without disturbing the active invocation", async () => {
    const firstId = `invocation_${UUID}`;
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-1" }]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const first = startedResult(supervisor.start(invocation(firstId)));
    expect(supervisor.start(invocation(`invocation_${"22222222-2222-4222-8222-222222222222"}`))).toMatchObject({
      kind: "rejected",
      error: { code: "busy" },
    });
    expect(fake.stopCalls).toBe(0);
    expect(supervisor.snapshot()).toMatchObject({ state: "running", activeInvocationId: firstId });

    fake.complete(firstId, { status: "exited", exit_code: 0 });
    await first.result;
  });

  it("stops only the active invocation and reports a stopped fact", async () => {
    const invocationId = `invocation_${UUID}`;
    const fake = new FakeBackend([{ kind: "pending", sessionId: "fake-session-1" }]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const handle = startedResult(supervisor.start(invocation(invocationId)));
    expect(supervisor.stop(invocationId)).toEqual({ kind: "accepted", invocationId });
    expect(fake.stopCalls).toBe(1);
    await expect(handle.result).resolves.toMatchObject({ process: { status: "stopped" } });
    expect(supervisor.snapshot()).toEqual({ state: "ready", sessionId: "fake-session-1" });
  });

  it("distinguishes launch failure from a started backend non-success", async () => {
    const invocationId = `invocation_${UUID}`;
    const nonSuccess: ExitedProcessFact = { status: "exited", exit_code: 7 };
    const fake = new FakeBackend([
      { kind: "launch_failed", error: launchError },
      { kind: "completed", sessionId: "fake-session-2", process: nonSuccess },
    ]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const launchFailure = supervisor.start(invocation(invocationId));
    expect(launchFailure).toMatchObject({
      kind: "launch_failed",
      result: { process: { status: "launch_failed", error: launchError } },
    });
    expect(supervisor.snapshot()).toEqual({ state: "ready" });

    const backendFailure = startedResult(supervisor.start(invocation(`invocation_${"33333333-3333-4333-8333-333333333333"}`)));
    await expect(backendFailure.result).resolves.toMatchObject({
      process: nonSuccess,
      session_id: "fake-session-2",
    });
    expect(supervisor.snapshot()).toEqual({ state: "ready", sessionId: "fake-session-2" });
  });

  it("keeps initialization identity-scoped and returns typed lifecycle results", async () => {
    const fake = new FakeBackend([]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    await expect(supervisor.initialize(launchSpec)).resolves.toEqual({ kind: "already_initialized" });
    await expect(supervisor.initialize({ ...launchSpec, actor_id: `actor_${"44444444-4444-4444-8444-444444444444"}` })).resolves.toMatchObject({
      kind: "rejected",
      error: { code: "identity_mismatch" },
    });
    expect(supervisor.stop(`invocation_${UUID}`)).toMatchObject({
      kind: "rejected",
      error: { code: "no_active_invocation" },
    });
  });
});
