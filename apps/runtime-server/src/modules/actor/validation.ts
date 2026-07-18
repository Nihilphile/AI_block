import {
  BackendBrickBodySchema,
  BrickPromptBodySchema,
  BrickSysPromptBodySchema,
  CONTRACT_SCHEMA_VERSION,
  decodeContract,
  RuntimeConfigBrickBodySchema,
  ToolsetBrickBodySchema,
  ValidateActorTemplateCandidateSchema,
  type ActorTemplateValidationFailedDetails,
  type ActorTemplateValidationReport,
  type ActorTemplateSpec,
  type BackendBrickBody,
  type BrickKind,
  type DefinitionBrickRevision,
  type ExactBrickRef,
  type ProjectId,
  type ToolsetBrickBody,
  type ValidateActorTemplateCandidate,
} from "@ai-block/runtime-contracts";
import type { ActorModulePorts } from "./ports.js";
import { bindDefinitionBrickRef } from "./values.js";

export type ActorTemplateValidationPorts = Pick<
  ActorModulePorts,
  "definitionBricks" | "backendValidators" | "toolProviderValidators" | "compatibility" | "workspace"
>;

export type ResolvedActorTemplateBrick = Readonly<{
  authored: ExactBrickRef;
  revision: DefinitionBrickRevision;
}>;

export type ResolvedActorTemplateCandidate = Readonly<{
  project_id: ProjectId;
  system_prompts: readonly ResolvedActorTemplateBrick[];
  initial_prompts: readonly ResolvedActorTemplateBrick[];
  backend: ResolvedActorTemplateBrick;
  toolset: ResolvedActorTemplateBrick;
  runtime_config: ResolvedActorTemplateBrick;
  working_directory: string;
}>;

export type ActorTemplateValidationOutcome = Readonly<{
  report: ActorTemplateValidationReport;
  resolved?: ResolvedActorTemplateCandidate;
}>;

export type ActorTemplateValidationError = Omit<
  ContractErrorEnvelopeWithoutDetails,
  "details"
> & Readonly<{ details: ActorTemplateValidationFailedDetails }>;

type ContractErrorEnvelopeWithoutDetails = {
  schema_version: typeof CONTRACT_SCHEMA_VERSION;
  code: "actor_template.validation_failed";
  category: "validation";
  message: "ActorTemplate validation failed.";
  retryable: false;
  details?: unknown;
};

type ShapeRule =
  | "required"
  | "additional_property"
  | "literal"
  | "format"
  | "range"
  | "reference"
  | "structure"
  | "type"
  | string;

type ShapeIssue = Readonly<{ path: string; rule: ShapeRule }>;

type StableIssueCode =
  | "missing_required_component"
  | "duplicate_brick_ref"
  | "ref_not_found"
  | "brick_kind_mismatch"
  | "backend_config_invalid"
  | "tool_provider_invalid"
  | "backend_toolset_incompatible"
  | "workspace_root_not_found"
  | "workspace_path_escape"
  | "unsupported_schema_version"
  | "unknown_field"
  | "schema_invalid";

type PublicIssue = Readonly<{
  code: StableIssueCode;
  path: string;
  resource_id?: string;
  revision?: number;
  expected_kind?: BrickKind;
  actual_kind?: BrickKind;
  provider_id?: string;
}>;

type RefSlot =
  | "system_prompt"
  | "initial_prompt"
  | "backend"
  | "toolset"
  | "runtime_config";

type RefDescriptor = Readonly<{
  slot: RefSlot;
  path: string;
  expectedKind: BrickKind;
  ref: ExactBrickRef;
  order?: number;
}>;

const REQUIRED_COMPONENT_PATHS = new Set([
  "/system_prompt",
  "/initial_prompt",
  "/backend",
  "/toolset",
  "/runtime_config",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function manifestPath(path: string): string {
  if (path === "/spec/spec") return "/";
  if (path.startsWith("/spec/spec/")) return path.slice("/spec/spec".length);
  if (path === "/spec") return "/";
  if (path.startsWith("/spec/")) return path.slice("/spec".length);
  return path.length > 0 ? path : "/";
}

function shapeIssues(error: unknown): readonly ShapeIssue[] {
  if (!isRecord(error) || !isRecord(error.details)) return [];
  const details = error.details;
  if (!Array.isArray(details.issues)) return [];
  return details.issues.flatMap((issue): ShapeIssue[] => {
    if (!isRecord(issue) || typeof issue.path !== "string" || typeof issue.rule !== "string") return [];
    return [{ path: manifestPath(issue.path), rule: issue.rule as ShapeRule }];
  });
}

function materializationPath(error: unknown): string {
  if (!isRecord(error) || !isRecord(error.details) || typeof error.details.path !== "string") return "/";
  return manifestPath(error.details.path);
}

function shapeCode(issue: ShapeIssue): StableIssueCode {
  if (issue.rule === "additional_property") return "unknown_field";
  if (issue.path === "/schema_version") return "unsupported_schema_version";
  if (issue.rule === "required" && REQUIRED_COMPONENT_PATHS.has(issue.path)) {
    return "missing_required_component";
  }
  return "schema_invalid";
}

function pushIssue(
  issues: PublicIssue[],
  code: StableIssueCode,
  path: string,
  fields: Partial<Omit<PublicIssue, "code" | "path">> = {},
): void {
  issues.push({ code, path, ...fields });
}

function sortAndDeduplicateIssues(issues: readonly PublicIssue[]): PublicIssue[] {
  const indexed = issues.map((issue, index) => ({ issue, index }));
  indexed.sort((left, right) => {
    if (left.issue.path < right.issue.path) return -1;
    if (left.issue.path > right.issue.path) return 1;
    if (left.issue.code < right.issue.code) return -1;
    if (left.issue.code > right.issue.code) return 1;
    return left.index - right.index;
  });

  const unique: PublicIssue[] = [];
  const seen = new Set<string>();
  for (const { issue } of indexed) {
    const key = JSON.stringify(issue);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(issue);
  }
  return unique;
}

function reportFor(issues: readonly PublicIssue[]): ActorTemplateValidationReport {
  const sorted = sortAndDeduplicateIssues(issues);
  return sorted.length === 0
    ? { valid: true, issues: [] }
    : { valid: false, issues: sorted as unknown as ActorTemplateValidationReport["issues"] };
}

function shapeReport(input: unknown): ActorTemplateValidationReport | undefined {
  const decoded = decodeContract(ValidateActorTemplateCandidateSchema, input);
  if (decoded.ok) return undefined;

  const issues: PublicIssue[] = [];
  const rawIssues = shapeIssues(decoded.error);
  if (rawIssues.length > 0) {
    for (const issue of rawIssues) pushIssue(issues, shapeCode(issue), issue.path);
  } else {
    pushIssue(issues, "schema_invalid", materializationPath(decoded.error));
  }
  return reportFor(issues);
}

function descriptorsFor(spec: ActorTemplateSpec["spec"]): RefDescriptor[] {
  const descriptors: RefDescriptor[] = [];
  for (const [order, item] of spec.system_prompt.bricks.entries()) {
    descriptors.push({
      slot: "system_prompt",
      path: `/system_prompt/bricks/${order}/ref`,
      expectedKind: "sys_prompt",
      ref: item.ref,
      order,
    });
  }
  for (const [order, item] of spec.initial_prompt.bricks.entries()) {
    descriptors.push({
      slot: "initial_prompt",
      path: `/initial_prompt/bricks/${order}/ref`,
      expectedKind: "prompt",
      ref: item.ref,
      order,
    });
  }
  descriptors.push(
    { slot: "backend", path: "/backend/ref", expectedKind: "backend", ref: spec.backend.ref },
    { slot: "toolset", path: "/toolset/ref", expectedKind: "toolset", ref: spec.toolset.ref },
    { slot: "runtime_config", path: "/runtime_config/ref", expectedKind: "runtime_config", ref: spec.runtime_config.ref },
  );
  return descriptors;
}

function duplicatePromptIssues(descriptors: readonly RefDescriptor[], issues: PublicIssue[]): void {
  const seen = new Map<RefSlot, Set<string>>();
  for (const descriptor of descriptors) {
    if (descriptor.slot !== "system_prompt" && descriptor.slot !== "initial_prompt") continue;
    const keys = seen.get(descriptor.slot) ?? new Set<string>();
    const key = `${descriptor.ref.id}\u0000${descriptor.ref.revision}`;
    if (keys.has(key)) {
      pushIssue(issues, "duplicate_brick_ref", descriptor.path, {
        resource_id: descriptor.ref.id,
        revision: descriptor.ref.revision,
      });
    }
    keys.add(key);
    seen.set(descriptor.slot, keys);
  }
}

function mapValidatorFinding(
  kind: "backend" | "tool_provider" | "compatibility",
  path: string,
  providerId: string | undefined,
  issues: PublicIssue[],
): void {
  const code = kind === "backend"
    ? "backend_config_invalid"
    : kind === "tool_provider"
      ? "tool_provider_invalid"
      : "backend_toolset_incompatible";
  pushIssue(issues, code, path, providerId === undefined ? {} : { provider_id: providerId });
}

function validateSysPromptBody(
  entry: ResolvedActorTemplateBrick,
  path: string,
  issues: PublicIssue[],
): boolean {
  const decoded = decodeContract(BrickSysPromptBodySchema, entry.revision.body);
  if (!decoded.ok) {
    pushIssue(issues, "schema_invalid", path);
    return false;
  }
  return true;
}

function validatePromptBody(
  entry: ResolvedActorTemplateBrick,
  path: string,
  issues: PublicIssue[],
): boolean {
  const decoded = decodeContract(BrickPromptBodySchema, entry.revision.body);
  if (!decoded.ok) {
    pushIssue(issues, "schema_invalid", path);
    return false;
  }
  return true;
}

async function resolveCandidate(
  command: ValidateActorTemplateCandidate,
  ports: ActorTemplateValidationPorts,
): Promise<ActorTemplateValidationOutcome> {
  const issues: PublicIssue[] = [];
  const descriptors = descriptorsFor(command.spec.spec);
  duplicatePromptIssues(descriptors, issues);

  const resolved = new Map<RefSlot, ResolvedActorTemplateBrick[]>();
  for (const descriptor of descriptors) {
    const candidate = await ports.definitionBricks.resolveExact(command.project_id, descriptor.ref);
    const binding = bindDefinitionBrickRef(command.project_id, descriptor.ref, candidate);
    if (binding.kind === "unresolved") {
      pushIssue(issues, "ref_not_found", descriptor.path, {
        resource_id: descriptor.ref.id,
        revision: descriptor.ref.revision,
      });
      continue;
    }
    if (candidate === undefined || candidate.kind !== descriptor.expectedKind) {
      pushIssue(issues, "brick_kind_mismatch", descriptor.path, {
        expected_kind: descriptor.expectedKind,
        actual_kind: candidate?.kind,
      });
      continue;
    }
    const entries = resolved.get(descriptor.slot) ?? [];
    entries.push({ authored: descriptor.ref, revision: candidate });
    resolved.set(descriptor.slot, entries);
  }

  const systemPrompts = resolved.get("system_prompt") ?? [];
  const initialPrompts = resolved.get("initial_prompt") ?? [];
  const backend = resolved.get("backend")?.[0];
  const toolset = resolved.get("toolset")?.[0];
  const runtimeConfig = resolved.get("runtime_config")?.[0];

  for (const entry of systemPrompts) validateSysPromptBody(entry, "/system_prompt", issues);
  for (const entry of initialPrompts) validatePromptBody(entry, "/initial_prompt", issues);

  let backendBody: BackendBrickBody | undefined;
  if (backend) {
    const decoded = decodeContract(BackendBrickBodySchema, backend.revision.body);
    if (!decoded.ok) {
      pushIssue(issues, "backend_config_invalid", "/backend/ref");
    } else {
      backendBody = decoded.value as BackendBrickBody;
      const validator = ports.backendValidators.find(decoded.value.adapter_id);
      if (validator === undefined) {
        mapValidatorFinding("backend", "/backend/ref", undefined, issues);
      } else {
        try {
          for (const _finding of validator.validate(decoded.value)) {
            mapValidatorFinding("backend", "/backend/ref", undefined, issues);
          }
        } catch {
          mapValidatorFinding("backend", "/backend/ref", undefined, issues);
        }
      }
    }
  }

  let toolsetBody: ToolsetBrickBody | undefined;
  if (toolset) {
    const decoded = decodeContract(ToolsetBrickBodySchema, toolset.revision.body);
    if (!decoded.ok) {
      pushIssue(issues, "tool_provider_invalid", "/toolset/ref");
    } else {
      toolsetBody = decoded.value as unknown as ToolsetBrickBody;
      const providerIds = new Set<string>();
      for (const provider of decoded.value.providers) {
        if (providerIds.has(provider.provider_id)) {
          mapValidatorFinding("tool_provider", "/toolset/ref", provider.provider_id, issues);
          continue;
        }
        providerIds.add(provider.provider_id);
        const validator = ports.toolProviderValidators.find(provider.provider_id);
        if (validator === undefined) {
          mapValidatorFinding("tool_provider", "/toolset/ref", provider.provider_id, issues);
          continue;
        }
        try {
          for (const _finding of validator.validate(provider)) {
            mapValidatorFinding("tool_provider", "/toolset/ref", provider.provider_id, issues);
          }
        } catch {
          mapValidatorFinding("tool_provider", "/toolset/ref", provider.provider_id, issues);
        }
      }
    }
  }

  if (backendBody !== undefined && toolsetBody !== undefined) {
    try {
      for (const _finding of ports.compatibility.validate(backendBody, toolsetBody)) {
        mapValidatorFinding("compatibility", "/toolset/ref", undefined, issues);
      }
    } catch {
      mapValidatorFinding("compatibility", "/toolset/ref", undefined, issues);
    }
  }

  let workingDirectory: string | undefined;
  if (runtimeConfig) {
    const decoded = decodeContract(RuntimeConfigBrickBodySchema, runtimeConfig.revision.body);
    if (!decoded.ok) {
      pushIssue(issues, "schema_invalid", "/runtime_config/ref");
    } else {
      try {
        const workspace = await ports.workspace.resolveWorkingDirectory(command.project_id, decoded.value.workspace);
        if (workspace.kind === "root_not_found") {
          pushIssue(issues, "workspace_root_not_found", "/runtime_config/ref");
        } else if (workspace.kind === "path_escape") {
          pushIssue(issues, "workspace_path_escape", "/runtime_config/ref");
        } else {
          workingDirectory = workspace.working_directory;
        }
      } catch {
        pushIssue(issues, "workspace_root_not_found", "/runtime_config/ref");
      }
    }
  }

  const report = reportFor(issues);
  if (!report.valid || backend === undefined || toolset === undefined || runtimeConfig === undefined || workingDirectory === undefined) {
    return { report };
  }

  return {
    report,
    resolved: {
      project_id: command.project_id,
      system_prompts: systemPrompts,
      initial_prompts: initialPrompts,
      backend,
      toolset,
      runtime_config: runtimeConfig,
      working_directory: workingDirectory,
    },
  };
}

export async function resolveAndValidateActorTemplateCandidate(
  input: unknown,
  ports: ActorTemplateValidationPorts,
): Promise<ActorTemplateValidationOutcome> {
  const shape = shapeReport(input);
  if (shape !== undefined) return { report: shape };
  const decoded = decodeContract(ValidateActorTemplateCandidateSchema, input);
  if (!decoded.ok) return { report: reportFor([{ code: "schema_invalid", path: "/" }]) };
  return resolveCandidate(decoded.value as ValidateActorTemplateCandidate, ports);
}

export async function validateActorTemplateCandidate(
  input: unknown,
  ports: ActorTemplateValidationPorts,
): Promise<ActorTemplateValidationReport> {
  return (await resolveAndValidateActorTemplateCandidate(input, ports)).report;
}

export function createActorTemplateValidationError(
  report: ActorTemplateValidationReport,
): ActorTemplateValidationError {
  return {
    schema_version: CONTRACT_SCHEMA_VERSION,
    code: "actor_template.validation_failed",
    category: "validation",
    message: "ActorTemplate validation failed.",
    retryable: false,
    details: { report },
  };
}
