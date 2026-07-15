import * as AjvModule from "ajv";
import * as AjvFormatsModule from "ajv-formats";
import { describe, expect, it } from "vitest";
import {
  ActorLaunchSpecSchema,
  BackendAdapterIdSchema,
  BackendAdapterLaunchConfigSchema,
  BackendSessionIdSchema,
  CreateSessionDirectiveSchema,
  ExitedProcessFactSchema,
  InvocationProcessFactSchema,
  InvocationResultSchema,
  InvocationSpecSchema,
  LaunchFailedProcessFactSchema,
  ResumeSessionDirectiveSchema,
  SessionDirectiveSchema,
  SignaledProcessFactSchema,
  StoppedProcessFactSchema,
  ToolProviderIdSchema,
  ToolProviderLaunchConfigSchema,
  decodeContract,
} from "../../src/index.js";

type TestAjv = {
  compile(schema: unknown): (value: unknown) => boolean;
};

const Ajv = AjvModule.default as unknown as new (options: Record<string, unknown>) => TestAjv;
const addFormats = AjvFormatsModule.default as unknown as (ajv: TestAjv) => TestAjv;
const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const actorConfigSnapshotId = `actor_config_${UUID}`;
const runId = `run_${UUID}`;
const invocationId = `invocation_${UUID}`;
const packageRef = {
  package_id: `package_${UUID}`,
  content_hash: `sha256:${"a".repeat(64)}`,
};
const contractError = {
  schema_version: "1.0.0",
  code: "contract.backend_failed",
  category: "backend",
  message: "Backend failed.",
  retryable: false,
};
const launchSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  actor_id: actorId,
  actor_config_snapshot_id: actorConfigSnapshotId,
  system_prompts: [{ kind: "system_text", text: "system" }],
  working_directory: "C:\\work",
  backend: { adapter_id: "fake.backend", config: { model: "test" } },
  tool_providers: [{ provider_id: "tools.mock", config: { enabled: true } }],
};
const invocationSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  run_id: runId,
  actor_id: actorId,
  invocation_id: invocationId,
  input_package_refs: [packageRef],
  prompt: { kind: "text", text: "prompt" },
  session: { mode: "create" },
};
const invocationResult = {
  schema_version: "1.0.0",
  project_id: projectId,
  run_id: runId,
  actor_id: actorId,
  invocation_id: invocationId,
  session_id: "backend-session-1",
  process: { status: "exited", exit_code: 0 },
  emitted_package_refs: [],
  completion_requested: true,
};

describe("B.3 actor contracts", () => {
  it("compiles every public Actor schema with the Ajv main export", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv);
    for (const [name, schema, value] of [
      ["BackendAdapterId", BackendAdapterIdSchema, "fake.backend"],
      ["ToolProviderId", ToolProviderIdSchema, "tools.mock"],
      ["BackendSessionId", BackendSessionIdSchema, "backend-session-1"],
      ["BackendAdapterLaunchConfig", BackendAdapterLaunchConfigSchema, launchSpec.backend],
      ["ToolProviderLaunchConfig", ToolProviderLaunchConfigSchema, launchSpec.tool_providers[0]],
      ["ActorLaunchSpec", ActorLaunchSpecSchema, launchSpec],
      ["CreateSessionDirective", CreateSessionDirectiveSchema, { mode: "create" }],
      ["ResumeSessionDirective", ResumeSessionDirectiveSchema, { mode: "resume", session_id: "backend-session-1" }],
      ["SessionDirective", SessionDirectiveSchema, { mode: "create" }],
      ["ExitedProcessFact", ExitedProcessFactSchema, { status: "exited", exit_code: 0 }],
      ["SignaledProcessFact", SignaledProcessFactSchema, { status: "signaled", signal: "SIGTERM" }],
      ["StoppedProcessFact", StoppedProcessFactSchema, { status: "stopped" }],
      ["LaunchFailedProcessFact", LaunchFailedProcessFactSchema, { status: "launch_failed", error: contractError }],
      ["InvocationProcessFact", InvocationProcessFactSchema, { status: "stopped" }],
      ["InvocationSpec", InvocationSpecSchema, invocationSpec],
      ["InvocationResult", InvocationResultSchema, invocationResult],
    ] as const) {
      expect(() => ajv.compile(schema), name).not.toThrow();
      expect(ajv.compile(schema)(value), name).toBe(true);
    }
  });

  it("accepts exact launch, session, invocation, and process-result shapes", () => {
    expect(decodeContract(ActorLaunchSpecSchema, launchSpec)).toMatchObject({ ok: true });
    expect(decodeContract(SessionDirectiveSchema, { mode: "resume", session_id: "backend-session-1" })).toMatchObject({ ok: true });
    expect(decodeContract(InvocationSpecSchema, invocationSpec)).toMatchObject({ ok: true });
    expect(decodeContract(InvocationResultSchema, invocationResult)).toMatchObject({ ok: true });
    expect(decodeContract(InvocationResultSchema, {
      ...invocationResult,
      session_id: undefined,
      process: { status: "launch_failed", error: contractError },
    }).ok).toBe(false);
  });

  it("rejects private fields, invalid extension IDs, invalid session/process facts, and invocation mutation", () => {
    expect(decodeContract(ActorLaunchSpecSchema, { ...launchSpec, extra: true }).ok).toBe(false);
    expect(decodeContract(BackendAdapterLaunchConfigSchema, { ...launchSpec.backend, extra: true }).ok).toBe(false);
    expect(decodeContract(BackendAdapterIdSchema, "Fake.Backend").ok).toBe(false);
    expect(decodeContract(ToolProviderIdSchema, "tools..mock").ok).toBe(false);
    expect(decodeContract(SessionDirectiveSchema, { mode: "resume" }).ok).toBe(false);
    expect(decodeContract(SessionDirectiveSchema, { mode: "resume", session_id: "" }).ok).toBe(false);
    expect(decodeContract(InvocationProcessFactSchema, { status: "exited", exit_code: -1 }).ok).toBe(false);
    expect(decodeContract(InvocationProcessFactSchema, { status: "exited", exit_code: 0.5 }).ok).toBe(false);
    expect(decodeContract(InvocationProcessFactSchema, { status: "launch_failed", error: { ...contractError, extra: true } }).ok).toBe(false);
    expect(decodeContract(InvocationSpecSchema, { ...invocationSpec, input_package_refs: [] }).ok).toBe(false);
    expect(decodeContract(InvocationSpecSchema, { ...invocationSpec, prompt: { kind: "system_text", text: "private" } }).ok).toBe(false);
    expect(decodeContract(InvocationSpecSchema, { ...invocationSpec, backend: launchSpec.backend }).ok).toBe(false);
  });
});
