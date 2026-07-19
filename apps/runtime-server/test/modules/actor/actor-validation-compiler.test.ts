import { describe, expect, it, vi } from "vitest";
import type {
  ActorTemplateSpec,
  BackendBrickBody,
  DefinitionBrickRevision,
  ExactBrickRef,
  ProjectId,
  ToolProviderBrickConfig,
  ValidateActorTemplateCandidate,
} from "@ai-block/runtime-contracts";
import {
  compileActorTemplate,
  createActorTemplateValidationError,
  computeConfigurationDigest,
  computeDefinitionBrickDigest,
  computeTemplateRevisionDigest,
  resolveAndValidateActorTemplateCandidate,
  validateActorTemplateCandidate,
  type ActorCompilerInput,
  type ActorTemplateValidationPorts,
} from "../../../src/modules/actor/index.js";
import type { WorkspaceResolution } from "../../../src/modules/actor/index.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}` as ProjectId;
const templateUid = `actor_template_${UUID}`;

const refs = {
  sys: { id: "system", revision: 1 } as ExactBrickRef,
  initial: { id: "initial", revision: 1 } as ExactBrickRef,
  backend: { id: "backend", revision: 1 } as ExactBrickRef,
  toolset: { id: "tools", revision: 1 } as ExactBrickRef,
  runtime: { id: "runtime", revision: 1 } as ExactBrickRef,
};

function revision(
  ref: ExactBrickRef,
  kind: DefinitionBrickRevision["kind"],
  body: DefinitionBrickRevision["body"],
  overrides: Partial<DefinitionBrickRevision> = {},
): DefinitionBrickRevision {
  return {
    revision_uid: `brickrev_${UUID}`,
    brick_id: ref.id,
    project_id: projectId,
    kind,
    revision: ref.revision,
    body,
    digest: overrides.digest ?? computeDefinitionBrickDigest(kind, body),
    created_at: "2026-07-19T01:02:03.000Z",
    ...overrides,
  };
}

const backendBody: BackendBrickBody = {
  adapter_id: "claude-code",
  model_id: "model-a",
  config: { temperature: 0 },
};
const providers: ToolProviderBrickConfig[] = [
  { provider_id: "runtime-control", config: { enabled: true } },
];

const candidateSpec = {
  schema_version: "1.0.0",
  kind: "actor_template_spec",
  metadata: { display_name: "Coder", description: "Worker", labels: { role: "coder" } },
  spec: {
    system_prompt: { bricks: [{ ref: refs.sys }] },
    initial_prompt: { bricks: [{ ref: refs.initial }] },
    backend: { ref: refs.backend },
    toolset: { ref: refs.toolset },
    runtime_config: { ref: refs.runtime },
  },
} satisfies ActorTemplateSpec;

function candidate(spec: unknown = candidateSpec): ValidateActorTemplateCandidate {
  return {
    project_id: projectId,
    requested_template_id: "coder",
    operation: "create",
    spec: spec as ActorTemplateSpec,
  };
}

function ports(
  revisions: readonly DefinitionBrickRevision[],
  overrides: Partial<ActorTemplateValidationPorts> = {},
): ActorTemplateValidationPorts {
  const byRef = new Map(revisions.map((item) => [`${item.brick_id}:${item.revision}`, item]));
  return {
    definitionBricks: {
      resolveExact: vi.fn(async (_project: ProjectId, ref: ExactBrickRef) => byRef.get(`${ref.id}:${ref.revision}`)),
    },
    backendValidators: {
      find: vi.fn(() => ({ validate: () => [] })),
    },
    toolProviderValidators: {
      find: vi.fn(() => ({ validate: () => [] })),
    },
    compatibility: { validate: () => [] },
    workspace: {
      resolveWorkingDirectory: vi.fn(async (): Promise<WorkspaceResolution> => ({
        kind: "resolved",
        root_id: "workspace",
        relative_working_directory: "src",
        working_directory: "C:\\project\\src",
      })),
    },
    ...overrides,
  };
}

function allRevisions(): DefinitionBrickRevision[] {
  return [
    revision(refs.sys, "sys_prompt", { text: "System\r\nline" }),
    revision(refs.initial, "prompt", { kind: "composite", parts: [{ kind: "text", text: "Init" }] }),
    revision(refs.backend, "backend", backendBody),
    revision(refs.toolset, "toolset", { providers }),
    revision(refs.runtime, "runtime_config", { workspace: { root_id: "workspace", relative_working_directory: "src" } }),
  ];
}

describe("ActorTemplate validation and compiler", () => {
  it("validates an empty Prompt composition and compiles caller-supplied identity/time", async () => {
    const emptySpec: ActorTemplateSpec = {
      ...candidateSpec,
      spec: { ...candidateSpec.spec, system_prompt: { bricks: [] }, initial_prompt: { bricks: [] } },
    };
    const actorPorts = ports(allRevisions());
    const result = await resolveAndValidateActorTemplateCandidate(candidate(emptySpec), actorPorts);
    expect(result.report).toEqual({ valid: true, issues: [] });
    expect(result.resolved).toBeDefined();

    const input: ActorCompilerInput = {
      snapshot_id: `actor_config_${UUID}`,
      created_at: "2026-07-19T04:05:06.000Z",
      source_template: {
        template_uid: templateUid,
        human_readable_id: "coder",
        revision: 2,
        revision_digest: computeTemplateRevisionDigest(candidateSpec.metadata, candidateSpec.spec),
      },
      candidate: result.resolved!,
    };
    const compiled = compileActorTemplate(input);
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    expect(compiled.snapshot.head.snapshot_id).toBe(input.snapshot_id);
    expect(compiled.snapshot.head.created_at).toBe(input.created_at);
    expect(compiled.snapshot.resolved.backend).toEqual(backendBody);
    expect(compiled.snapshot.resolved.backend.config).not.toHaveProperty("model_id");
    expect(compiled.snapshot.resolved.initial_prompts).toEqual([]);
    expect(actorPorts.definitionBricks.resolveExact).toHaveBeenCalledTimes(3);
  });

  it("preserves authored Prompt order, composite Initial Prompt content, and exact source provenance", async () => {
    const actorPorts = ports(allRevisions());
    const result = await resolveAndValidateActorTemplateCandidate(candidate(), actorPorts);
    expect(result.report).toEqual({ valid: true, issues: [] });
    expect(result.resolved).toBeDefined();
    const resolveCalls = (actorPorts.definitionBricks.resolveExact as ReturnType<typeof vi.fn>).mock.calls;
    expect(resolveCalls.map((call) => (call[1] as ExactBrickRef).id)).toEqual([
      "system",
      "initial",
      "backend",
      "tools",
      "runtime",
    ]);

    const compiled = compileActorTemplate({
      snapshot_id: `actor_config_${UUID}`,
      created_at: "2026-07-19T04:05:06.000Z",
      source_template: {
        template_uid: templateUid,
        human_readable_id: "coder",
        revision: 2,
        revision_digest: computeTemplateRevisionDigest(candidateSpec.metadata, candidateSpec.spec),
      },
      candidate: result.resolved!,
    });
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    expect(compiled.snapshot.resolved.system_prompts).toEqual([{ text: "System\nline" }]);
    expect(compiled.snapshot.resolved.initial_prompts).toEqual([
      { kind: "composite", parts: [{ kind: "text", text: "Init" }] },
    ]);
    expect(compiled.snapshot.head.source_template.revision_digest).toBe(
      computeTemplateRevisionDigest(candidateSpec.metadata, candidateSpec.spec),
    );
    expect(compiled.snapshot.source_bricks.map((entry) => entry.slot)).toEqual([
      "sys_prompt",
      "prompt",
      "backend",
      "toolset",
      "runtime_config",
    ]);
  });

  it("uses stable schema issue mapping and performs no semantic resolution after shape failure", async () => {
    const invalid = {
      ...candidateSpec,
      schema_version: "2.0.0",
      extra: true,
      spec: (() => {
        const { backend: _backend, ...withoutBackend } = candidateSpec.spec;
        return withoutBackend;
      })(),
    };
    const actorPorts = ports(allRevisions());
    const report = await validateActorTemplateCandidate(candidate(invalid), actorPorts);
    expect(report.valid).toBe(false);
    if (report.valid) return;
    expect(report.issues).toEqual([
      { code: "missing_required_component", path: "/backend" },
      { code: "unknown_field", path: "/extra" },
      { code: "unsupported_schema_version", path: "/schema_version" },
    ]);
    expect(actorPorts.definitionBricks.resolveExact).not.toHaveBeenCalled();
  });

  it("sorts and deduplicates semantic findings while preserving authored resolution order", async () => {
    const duplicateSpec: ActorTemplateSpec = {
      ...candidateSpec,
      spec: {
        ...candidateSpec.spec,
        system_prompt: { bricks: [{ ref: refs.sys }, { ref: refs.sys }] },
      },
    };
    const actorPorts = ports(allRevisions(), {
      definitionBricks: {
        resolveExact: vi.fn(async (_project: ProjectId, ref: ExactBrickRef) => {
          if (ref.id === refs.initial.id) return undefined;
          if (ref.id === refs.toolset.id) return revision(ref, "backend", { ...backendBody });
          return allRevisions().find((item) => item.brick_id === ref.id);
        }),
      },
      backendValidators: {
        find: () => ({ validate: () => [{ code: "raw-secret-looking-detail", safe_details: { secret: "redact" } }] }),
      },
      workspace: { resolveWorkingDirectory: vi.fn(async (): Promise<WorkspaceResolution> => ({ kind: "path_escape" })) },
    });
    const report = await validateActorTemplateCandidate(candidate(duplicateSpec), actorPorts);
    expect(report.valid).toBe(false);
    if (report.valid) return;
    expect(report.issues).toEqual([
      { code: "backend_config_invalid", path: "/backend/ref" },
      { code: "ref_not_found", path: "/initial_prompt/bricks/0/ref", resource_id: "initial", revision: 1 },
      { code: "workspace_path_escape", path: "/runtime_config/ref" },
      { code: "duplicate_brick_ref", path: "/system_prompt/bricks/1/ref", resource_id: "system", revision: 1 },
      { code: "brick_kind_mismatch", path: "/toolset/ref", expected_kind: "toolset", actual_kind: "backend" },
    ]);
    expect((actorPorts.definitionBricks.resolveExact as ReturnType<typeof vi.fn>).mock.invocationCallOrder).toEqual(
      [...(actorPorts.definitionBricks.resolveExact as ReturnType<typeof vi.fn>).mock.invocationCallOrder].sort((a, b) => a - b),
    );
  });

  it("returns fixed, safe operation envelopes and rejects inconsistent compiler input", async () => {
    const report = await validateActorTemplateCandidate(candidateSpec as unknown, ports(allRevisions()));
    const error = createActorTemplateValidationError(report);
    expect(error).toMatchObject({
      code: "actor_template.validation_failed",
      category: "validation",
      retryable: false,
      message: "ActorTemplate validation failed.",
      details: { report },
    });
    expect(error.details).toEqual({ report });

    const failure = compileActorTemplate({
      snapshot_id: "not-a-snapshot-id" as ActorCompilerInput["snapshot_id"],
      created_at: "not-a-timestamp" as ActorCompilerInput["created_at"],
      source_template: {} as ActorCompilerInput["source_template"],
      candidate: {} as ActorCompilerInput["candidate"],
    });
    expect(failure).toEqual({
      ok: false,
      error: {
        schema_version: "1.0.0",
        code: "actor_template.compilation_failed",
        category: "internal",
        retryable: false,
        message: "ActorTemplate compilation failed.",
      },
    });
  });

  it("keeps revision and configuration digests separate", () => {
    const revisionMaterial = computeTemplateRevisionDigest(candidateSpec.metadata, candidateSpec.spec);
    const sameExecution = computeConfigurationDigest({
      system_prompts: [{ text: "System" }],
      initial_prompts: [{ kind: "text", text: "Init" }],
      backend: backendBody,
      tool_providers: providers,
      working_directory: "C:\\project\\src",
    });
    const differentMetadataRevision = computeTemplateRevisionDigest(
      { ...candidateSpec.metadata, description: "Different" },
      candidateSpec.spec,
    );
    expect(revisionMaterial).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(sameExecution).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(differentMetadataRevision).not.toBe(revisionMaterial);
  });
});
