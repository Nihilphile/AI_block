import {
  ActorConfigSnapshotIdSchema,
  ActorTemplateIdSchema,
  ActorConfigSnapshotSchema,
  BackendBrickBodySchema,
  BrickPromptBodySchema,
  BrickSysPromptBodySchema,
  CanonicalTimestampSchema,
  CONTRACT_SCHEMA_VERSION,
  decodeContract,
  DefinitionBrickRevisionSchema,
  ExactBrickRefSchema,
  HumanReadableIdSchema,
  PositiveRevisionSchema,
  ProjectIdSchema,
  RuntimeConfigBrickBodySchema,
  TemplateRevisionDigestSchema,
  ToolsetBrickBodySchema,
  type ActorConfigSnapshot,
  type ActorConfigSnapshotId,
  type ActorTemplateId,
  type BrickPromptBody,
  type BrickSysPromptBody,
  type CanonicalTimestamp,
  type HumanReadableId,
  type PositiveRevision,
  type ProjectId,
  type TemplateRevisionDigest,
} from "@ai-block/runtime-contracts";
import {
  canonicalizeText,
  computeConfigurationDigest,
  type ConfigurationDigestMaterial,
} from "./values.js";
import type { ResolvedActorTemplateCandidate, ResolvedActorTemplateBrick } from "./validation.js";

export type ActorCompilerInput = Readonly<{
  snapshot_id: ActorConfigSnapshotId;
  created_at: CanonicalTimestamp;
  source_template: Readonly<{
    template_uid: ActorTemplateId;
    human_readable_id: HumanReadableId;
    revision: PositiveRevision;
    revision_digest: TemplateRevisionDigest;
  }>;
  candidate: ResolvedActorTemplateCandidate;
}>;

export type ActorCompilationError = Readonly<{
  schema_version: typeof CONTRACT_SCHEMA_VERSION;
  code: "actor_template.compilation_failed";
  category: "internal";
  retryable: false;
  message: "ActorTemplate compilation failed.";
}>;

export type ActorCompilationResult =
  | Readonly<{ ok: true; snapshot: ActorConfigSnapshot }>
  | Readonly<{ ok: false; error: ActorCompilationError }>;

function failure(): Readonly<{ ok: false; error: ActorCompilationError }> {
  return {
    ok: false,
    error: {
      schema_version: CONTRACT_SCHEMA_VERSION,
      code: "actor_template.compilation_failed",
      category: "internal",
      retryable: false,
      message: "ActorTemplate compilation failed.",
    },
  };
}

function isValid<T>(schema: Parameters<typeof decodeContract>[0], value: unknown): value is T {
  return decodeContract(schema, value).ok;
}

function normalizedSysPrompt(entry: ResolvedActorTemplateBrick): BrickSysPromptBody | undefined {
  const decoded = decodeContract(BrickSysPromptBodySchema, entry.revision.body);
  return decoded.ok ? { text: canonicalizeText(decoded.value.text) } : undefined;
}

function normalizedPrompt(value: unknown): BrickPromptBody | undefined {
  const decoded = decodeContract(BrickPromptBodySchema, value);
  if (!decoded.ok) return undefined;
  if (decoded.value.kind === "text") return { kind: "text", text: canonicalizeText(decoded.value.text) };
  const parts = decoded.value.parts.map((part) => normalizedPrompt(part));
  return parts.every((part): part is BrickPromptBody => part !== undefined)
    ? { kind: "composite", parts }
    : undefined;
}

function normalizedInitialPrompt(entry: ResolvedActorTemplateBrick): BrickPromptBody | undefined {
  return normalizedPrompt(entry.revision.body);
}

function validRevision(
  projectId: ProjectId,
  entry: ResolvedActorTemplateBrick,
  expectedKind: string,
): boolean {
  if (!decodeContract(ExactBrickRefSchema, entry.authored).ok) return false;
  if (entry.authored.id !== entry.revision.brick_id || entry.authored.revision !== entry.revision.revision) return false;
  if (entry.revision.project_id !== projectId || entry.revision.kind !== expectedKind) return false;
  return decodeContract(DefinitionBrickRevisionSchema, entry.revision).ok;
}

function sourceBrick(
  slot: "sys_prompt" | "prompt" | "backend" | "toolset" | "runtime_config",
  entry: ResolvedActorTemplateBrick,
  order?: number,
): ActorConfigSnapshot["source_bricks"][number] {
  return order === undefined
    ? { slot, revision_uid: entry.revision.revision_uid, digest: entry.revision.digest }
    : { slot, order, revision_uid: entry.revision.revision_uid, digest: entry.revision.digest };
}

function validProviderList(body: unknown): boolean {
  return Array.isArray(body);
}

function inputIsConsistent(input: ActorCompilerInput): boolean {
  if (!isValid<ActorConfigSnapshotId>(ActorConfigSnapshotIdSchema, input.snapshot_id)) return false;
  if (!isValid<CanonicalTimestamp>(CanonicalTimestampSchema, input.created_at)) return false;
  if (!isValid<ProjectId>(ProjectIdSchema, input.candidate.project_id)) return false;
  if (!isValid<ActorTemplateId>(ActorTemplateIdSchema, input.source_template.template_uid)) return false;
  if (!isValid<HumanReadableId>(HumanReadableIdSchema, input.source_template.human_readable_id)) return false;
  if (!isValid<PositiveRevision>(PositiveRevisionSchema, input.source_template.revision)) return false;
  if (!isValid<TemplateRevisionDigest>(TemplateRevisionDigestSchema, input.source_template.revision_digest)) return false;
  if (typeof input.candidate.working_directory !== "string" || input.candidate.working_directory.length === 0) return false;
  if (!Array.isArray(input.candidate.system_prompts) || !Array.isArray(input.candidate.initial_prompts)) return false;
  if (!validRevision(input.candidate.project_id, input.candidate.backend, "backend")) return false;
  if (!validRevision(input.candidate.project_id, input.candidate.toolset, "toolset")) return false;
  if (!validRevision(input.candidate.project_id, input.candidate.runtime_config, "runtime_config")) return false;

  const promptEntries = [
    ...input.candidate.system_prompts.map((entry) => validRevision(input.candidate.project_id, entry, "sys_prompt")),
    ...input.candidate.initial_prompts.map((entry) => validRevision(input.candidate.project_id, entry, "prompt")),
  ];
  if (promptEntries.some((valid) => !valid)) return false;
  return true;
}

export function compileActorTemplate(input: ActorCompilerInput): ActorCompilationResult {
  try {
    if (!inputIsConsistent(input)) return failure();

    const normalizedSystemPrompts = input.candidate.system_prompts.map(normalizedSysPrompt);
    const normalizedInitialPrompts = input.candidate.initial_prompts.map(normalizedInitialPrompt);
    if (normalizedSystemPrompts.some((body) => body === undefined)) return failure();
    if (normalizedInitialPrompts.some((body) => body === undefined)) return failure();
    const systemPrompts = normalizedSystemPrompts as BrickSysPromptBody[];
    const initialPrompts = normalizedInitialPrompts as BrickPromptBody[];

    const backend = decodeContract(BackendBrickBodySchema, input.candidate.backend.revision.body);
    const toolset = decodeContract(ToolsetBrickBodySchema, input.candidate.toolset.revision.body);
    const runtimeConfig = decodeContract(RuntimeConfigBrickBodySchema, input.candidate.runtime_config.revision.body);
    if (!backend.ok || !toolset.ok || !runtimeConfig.ok) return failure();
    if (!validProviderList(toolset.value.providers)) return failure();
    const providers = toolset.value.providers.map((provider) => ({
      provider_id: provider.provider_id,
      config: provider.config,
    }));
    if (new Set(providers.map((provider) => provider.provider_id)).size !== providers.length) return failure();

    const configMaterial: ConfigurationDigestMaterial = {
      system_prompts: systemPrompts,
      initial_prompts: initialPrompts,
      backend: backend.value,
      tool_providers: providers,
      working_directory: input.candidate.working_directory,
    };
    const configDigest = computeConfigurationDigest(configMaterial);
    const snapshot: ActorConfigSnapshot = {
      head: {
        snapshot_id: input.snapshot_id,
        project_id: input.candidate.project_id,
        source_template: {
          template_uid: input.source_template.template_uid,
          human_readable_id: input.source_template.human_readable_id,
          revision: input.source_template.revision,
          revision_digest: input.source_template.revision_digest,
        },
        config_digest: configDigest,
        created_at: input.created_at,
      },
      source_bricks: [
        ...input.candidate.system_prompts.map((entry, index) => sourceBrick("sys_prompt", entry, index)),
        ...input.candidate.initial_prompts.map((entry, index) => sourceBrick("prompt", entry, index)),
        sourceBrick("backend", input.candidate.backend),
        sourceBrick("toolset", input.candidate.toolset),
        sourceBrick("runtime_config", input.candidate.runtime_config),
      ],
      resolved: {
        system_prompts: systemPrompts,
        initial_prompts: initialPrompts,
        backend: {
          adapter_id: backend.value.adapter_id,
          model_id: backend.value.model_id,
          config: backend.value.config,
        },
        tool_providers: providers,
        working_directory: input.candidate.working_directory,
      },
    };
    if (!decodeContract(ActorConfigSnapshotSchema, snapshot).ok) return failure();
    return { ok: true, snapshot };
  } catch {
    return failure();
  }
}
