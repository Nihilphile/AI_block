import { describe, expect, it } from "vitest";
import type {
  ActorLaunchSpec,
  BackendSessionId,
  ContractErrorEnvelope,
  ExitedProcessFact,
  InvocationSpec,
} from "@ai-block/runtime-contracts";
import type { BackendAdapter, BackendAdapterStartResult } from "../../src/backend/adapter.js";
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

class DeferredInitializeBackend implements BackendAdapter {
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
    throw new Error("DeferredInitializeBackend does not start Invocations.");
  }

  public resolve(): void {
    this.resolveInitialize();
  }

  public reject(error = new Error("deferred initialization failed")): void {
    this.rejectInitialize(error);
  }
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

  it("serializes same-config initialization and rejects a conflicting reservation", async () => {
    const fake = new DeferredInitializeBackend();
    const supervisor = new BackendSupervisor(fake);

    const first = supervisor.initialize(launchSpec);
    const second = supervisor.initialize(launchSpec);
    const conflicting = supervisor.initialize({
      ...launchSpec,
      actor_id: `actor_${"88888888-8888-4888-8888-888888888888"}`,
    });
    const conflictingConfiguration = supervisor.initialize({
      ...launchSpec,
      backend: { adapter_id: "fake.backend", config: { changed: true } },
    });

    await expect(conflicting).resolves.toMatchObject({
      kind: "rejected",
      error: { code: "identity_mismatch" },
    });
    await expect(conflictingConfiguration).resolves.toMatchObject({
      kind: "rejected",
      error: { code: "identity_mismatch" },
    });
    expect(fake.initializeCalls).toBe(1);

    fake.resolve();
    await expect(first).resolves.toEqual({ kind: "initialized" });
    await expect(second).resolves.toEqual({ kind: "initialized" });
    expect(supervisor.snapshot()).toEqual({ state: "ready" });
  });

  it("clears a failed shared initialization reservation for a later retry", async () => {
    const fake = new DeferredInitializeBackend();
    const supervisor = new BackendSupervisor(fake);

    const first = supervisor.initialize(launchSpec);
    const second = supervisor.initialize(launchSpec);
    fake.reject();

    await expect(first).resolves.toMatchObject({
      kind: "rejected",
      error: { code: "initialization_failed" },
    });
    await expect(second).resolves.toMatchObject({
      kind: "rejected",
      error: { code: "initialization_failed" },
    });
    expect(fake.initializeCalls).toBe(1);
    expect(supervisor.snapshot()).toEqual({ state: "uninitialized" });
  });

  it("quarantines a rejected session observation and blocks later starts", async () => {
    const invocationId = `invocation_${"99999999-9999-4999-8999-999999999999"}`;
    const fake = new FakeBackend([{ kind: "session_rejected", message: "session discovery failed" }]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const handle = startedResult(supervisor.start(invocation(invocationId)));
    await expect(handle.session).resolves.toBeUndefined();
    await expect(handle.failure).resolves.toMatchObject({ code: "session_observation_failed" });
    await expect(handle.result).resolves.toBeUndefined();
    expect(supervisor.snapshot()).toEqual({ state: "faulted" });
    expect(supervisor.start(invocation(`invocation_${"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}`))).toMatchObject({
      kind: "rejected",
      error: { code: "quarantined" },
    });
    expect(fake.startCalls).toHaveLength(1);
  });

  it("quarantines a rejected completion observation without an InvocationResult", async () => {
    const invocationId = `invocation_${"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}`;
    const fake = new FakeBackend([{
      kind: "completion_rejected",
      sessionId: "fake-session-rejected-completion",
      message: "completion observation failed",
    }]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const handle = startedResult(supervisor.start(invocation(invocationId)));
    await expect(handle.session).resolves.toBe("fake-session-rejected-completion");
    await expect(handle.failure).resolves.toMatchObject({ code: "completion_observation_failed" });
    await expect(handle.result).resolves.toBeUndefined();
    expect(supervisor.snapshot()).toEqual({ state: "faulted", sessionId: "fake-session-rejected-completion" });
  });

  it("quarantines an asynchronous stop rejection without claiming stopped", async () => {
    const invocationId = `invocation_${"cccccccc-cccc-4ccc-8ccc-cccccccccccc"}`;
    const fake = new FakeBackend([{
      kind: "stop_rejected",
      sessionId: "fake-session-stop-rejected",
      message: "stop rejected",
    }]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const handle = startedResult(supervisor.start(invocation(invocationId)));
    await expect(handle.session).resolves.toBe("fake-session-stop-rejected");
    expect(supervisor.stop(invocationId)).toEqual({ kind: "accepted", invocationId });
    await expect(handle.failure).resolves.toMatchObject({ code: "adapter_stop_failed" });
    expect(supervisor.snapshot()).toEqual({ state: "faulted", sessionId: "fake-session-stop-rejected" });
    expect(fake.stopCalls).toBe(1);
  });

  it("emits one terminal failure when session and completion reject together", async () => {
    const invocationId = `invocation_${"dddddddd-dddd-4ddd-8ddd-dddddddddddd"}`;
    const fake = new FakeBackend([{
      kind: "session_and_completion_rejected",
      message: "session and completion observation failed",
    }]);
    const supervisor = new BackendSupervisor(fake);
    await initialize(supervisor);

    const handle = startedResult(supervisor.start(invocation(invocationId)));
    await expect(handle.failure).resolves.toMatchObject({ code: "session_observation_failed" });
    await expect(handle.session).resolves.toBeUndefined();
    await expect(handle.result).resolves.toBeUndefined();
    expect(supervisor.snapshot()).toEqual({ state: "faulted" });
  });
});
