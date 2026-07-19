import {
  ACTOR_TEMPLATE_SPEC_SCHEMA_VERSION,
  BackendBrickBodySchema,
  BrickPromptBodySchema,
  BrickSysPromptBodySchema,
  CONTRACT_SCHEMA_VERSION,
  decodeContract,
  RuntimeConfigBrickBodySchema,
  ToolsetBrickBodySchema,
  type ActorConfigSnapshot,
  type ActorTemplateId,
  type ActorTemplateRevisionView,
  type ActorTemplateSpec,
  type ActorTemplateSummary,
  type ActorTemplateRevisionSummary,
  type ActorTemplateValidationFailedDetails,
  type BrickPromptBody,
  type CanonicalTimestamp,
  type ConfigDigest,
  type CreateActorTemplateCommand,
  type CreateActorTemplateResult,
  type HumanReadableId,
  type PositiveRevision,
  type ProjectId,
  type ReviseActorTemplateCommand,
  type ReviseActorTemplateResult,
  type ValidateActorTemplateCandidate,
  type ValidateActorTemplateCandidateResult,
} from "@ai-block/runtime-contracts";
import { compileActorTemplate, type ActorCompilationError } from "./compiler.js";
import {
  createActorTemplateValidationError,
  resolveAndValidateActorTemplateCandidate,
  type ActorTemplateValidationOptions,
  type ActorTemplateValidationOutcome,
  type PersistedDefinitionBrickProvenance,
  type ResolvedActorTemplateCandidate,
  type ResolvedActorTemplateBrick,
} from "./validation.js";
import { computeConfigurationDigest, computeTemplateRevisionDigest } from "./values.js";
import type { ActorModulePorts, ActorUnitOfWork } from "./ports.js";

export type ActorTemplateCompileCommand = Readonly<{
  project_id: ProjectId;
  template_id: HumanReadableId;
  revision: PositiveRevision;
}>;

export type ActorApplicationErrorCode =
  | "project.not_found"
  | "project.resource_id_conflict"
  | "actor_template.not_found"
  | "actor_template.archived"
  | "actor_template.base_revision_conflict"
  | "actor_template.validation_failed"
  | "actor_template.compilation_failed"
  | "actor_template.operation_failed";

export type ActorApplicationError = Readonly<{
  schema_version: typeof CONTRACT_SCHEMA_VERSION;
  code: ActorApplicationErrorCode;
  category: "not_found" | "conflict" | "validation" | "internal";
  message: string;
  retryable: false;
  details?: ActorTemplateValidationFailedDetails;
}>;

type ActorOperationFailureError = Readonly<{
  schema_version: typeof CONTRACT_SCHEMA_VERSION;
  code: "actor_template.operation_failed";
  category: "internal";
  message: "ActorTemplate operation failed.";
  retryable: false;
}>;

export type ActorOperationResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: ActorApplicationError }>;

class ActorOperationAbort extends Error {
  public constructor(public readonly error: ActorApplicationError) {
    super("Actor operation aborted.");
  }
}

function operationError(
  code: Exclude<ActorApplicationErrorCode, "actor_template.validation_failed" | "actor_template.compilation_failed" | "actor_template.operation_failed">,
  category: ActorApplicationError["category"],
  message: string,
): ActorApplicationError {
  return {
    schema_version: CONTRACT_SCHEMA_VERSION,
    code,
    category,
    message,
    retryable: false,
  };
}

function operationFailure(): ActorOperationFailureError {
  return {
    schema_version: CONTRACT_SCHEMA_VERSION,
    code: "actor_template.operation_failed",
    category: "internal",
    message: "ActorTemplate operation failed.",
    retryable: false,
  };
}

function projectNotFound(): ActorApplicationError {
  return operationError("project.not_found", "not_found", "Project not found.");
}

function templateNotFound(): ActorApplicationError {
  return operationError("actor_template.not_found", "not_found", "ActorTemplate not found.");
}

function templateArchived(): ActorApplicationError {
  return operationError("actor_template.archived", "conflict", "ActorTemplate is archived.");
}

function baseRevisionConflict(): ActorApplicationError {
  return operationError(
    "actor_template.base_revision_conflict",
    "conflict",
    "ActorTemplate base revision conflict.",
  );
}

function resourceIdConflict(): ActorApplicationError {
  return operationError(
    "project.resource_id_conflict",
    "conflict",
    "Project resource ID conflict.",
  );
}

function validationError(outcome: ActorTemplateValidationOutcome): ActorApplicationError {
  return createActorTemplateValidationError(outcome.report);
}

function compilationError(error: ActorCompilationError): ActorApplicationError {
  return error;
}

function abort(error: ActorApplicationError): never {
  throw new ActorOperationAbort(error);
}

function asValidationCandidate(
  command: CreateActorTemplateCommand | ReviseActorTemplateCommand,
): ValidateActorTemplateCandidate {
  if ("template_id" in command) {
    return {
      project_id: command.project_id,
      requested_template_id: command.template_id,
      operation: "revise",
      base_revision: command.base_revision,
      spec: command.spec,
    };
  }
  return {
    project_id: command.project_id,
    requested_template_id: command.requested_template_id,
    operation: "create",
    spec: command.spec,
  };
}

function authoredSpecFromRevision(view: ActorTemplateRevisionView): ActorTemplateSpec {
  return {
    schema_version: ACTOR_TEMPLATE_SPEC_SCHEMA_VERSION,
    kind: "actor_template_spec",
    metadata: view.metadata,
    spec: {
      system_prompt: { bricks: view.spec.system_prompt.bricks.map((entry) => ({ ref: entry.ref })) },
      initial_prompt: { bricks: view.spec.initial_prompt.bricks.map((entry) => ({ ref: entry.ref })) },
      backend: { ref: view.spec.backend.ref },
      toolset: { ref: view.spec.toolset.ref },
      runtime_config: { ref: view.spec.runtime_config.ref },
    },
  };
}

function validationCandidateFromRevision(view: ActorTemplateRevisionView): ValidateActorTemplateCandidate {
  return {
    project_id: view.project_id,
    requested_template_id: view.template_id,
    operation: "revise",
    base_revision: view.revision,
    spec: authoredSpecFromRevision(view),
  };
}

function persistedProvenanceFromRevision(
  view: ActorTemplateRevisionView,
): ReadonlyMap<string, PersistedDefinitionBrickProvenance> {
  const provenance = new Map<string, PersistedDefinitionBrickProvenance>();
  const add = (
    path: string,
    entry: ActorTemplateRevisionView["spec"]["backend"],
    kind: PersistedDefinitionBrickProvenance["kind"],
  ): void => {
    provenance.set(path, {
      project_id: view.project_id,
      brick_id: entry.ref.id,
      revision: entry.ref.revision,
      kind,
      revision_uid: entry.resolved.uid,
      digest: entry.resolved.digest,
    });
  };
  view.spec.system_prompt.bricks.forEach((entry, index) => add(`/system_prompt/bricks/${index}/ref`, entry, "sys_prompt"));
  view.spec.initial_prompt.bricks.forEach((entry, index) => add(`/initial_prompt/bricks/${index}/ref`, entry, "prompt"));
  add("/backend/ref", view.spec.backend, "backend");
  add("/toolset/ref", view.spec.toolset, "toolset");
  add("/runtime_config/ref", view.spec.runtime_config, "runtime_config");
  return provenance;
}

function templateRevisionDigestMatches(view: ActorTemplateRevisionView): boolean {
  const authored = authoredSpecFromRevision(view);
  return computeTemplateRevisionDigest(authored.metadata, authored.spec) === view.revision_digest;
}

function resolvedEntry(entry: ResolvedActorTemplateBrick): ActorTemplateRevisionView["spec"]["backend"] {
  return {
    ref: entry.authored,
    resolved: {
      uid: entry.revision.revision_uid,
      digest: entry.revision.digest,
    },
  };
}

function configurationDigestFor(candidate: ResolvedActorTemplateCandidate): ConfigDigest | undefined {
  const systemPrompts = candidate.system_prompts.map((entry) => decodeContract(BrickSysPromptBodySchema, entry.revision.body));
  const initialPrompts = candidate.initial_prompts.map((entry) => decodeContract(BrickPromptBodySchema, entry.revision.body));
  const backend = decodeContract(BackendBrickBodySchema, candidate.backend.revision.body);
  const toolset = decodeContract(ToolsetBrickBodySchema, candidate.toolset.revision.body);
  const runtimeConfig = decodeContract(RuntimeConfigBrickBodySchema, candidate.runtime_config.revision.body);
  if (
    systemPrompts.some((result) => !result.ok)
    || initialPrompts.some((result) => !result.ok)
    || !backend.ok
    || !toolset.ok
    || !runtimeConfig.ok
  ) {
    return undefined;
  }
  const systemPromptBodies = systemPrompts.map((result) => {
    if (!result.ok) throw new Error("unreachable");
    return result.value;
  });
  const initialPromptBodies = initialPrompts.map((result) => {
    if (!result.ok) throw new Error("unreachable");
    return result.value;
  });
  return computeConfigurationDigest({
    system_prompts: systemPromptBodies,
    initial_prompts: initialPromptBodies as unknown as BrickPromptBody[],
    backend: backend.value,
    tool_providers: toolset.value.providers,
    working_directory: candidate.working_directory,
  });
}

function revisionView(
  templateUid: ActorTemplateId,
  templateId: HumanReadableId,
  command: CreateActorTemplateCommand | ReviseActorTemplateCommand,
  candidate: ResolvedActorTemplateCandidate,
  revision: PositiveRevision,
  createdAt: CanonicalTimestamp,
): ActorTemplateRevisionView | undefined {
  const configDigest = configurationDigestFor(candidate);
  if (configDigest === undefined) return undefined;
  return {
    template_uid: templateUid,
    template_id: templateId,
    project_id: command.project_id,
    revision,
    revision_digest: computeTemplateRevisionDigest(command.spec.metadata, command.spec.spec),
    config_digest: configDigest,
    metadata: command.spec.metadata,
    spec: {
      system_prompt: { bricks: candidate.system_prompts.map(resolvedEntry) },
      initial_prompt: { bricks: candidate.initial_prompts.map(resolvedEntry) },
      backend: resolvedEntry(candidate.backend),
      toolset: resolvedEntry(candidate.toolset),
      runtime_config: resolvedEntry(candidate.runtime_config),
    },
    status: "active",
    created_at: createdAt,
  };
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function sortSummaries(summaries: readonly ActorTemplateSummary[]): ActorTemplateSummary[] {
  return [...summaries].sort((left, right) =>
    compareText(left.template_id, right.template_id)
    || compareText(left.template_uid, right.template_uid));
}

function sortHistory(history: readonly ActorTemplateRevisionSummary[]): ActorTemplateRevisionSummary[] {
  return [...history].sort((left, right) => left.revision - right.revision);
}

export class ActorTemplateApplicationService {
  public constructor(private readonly ports: ActorModulePorts) {}

  public async validate(input: unknown): Promise<ValidateActorTemplateCandidateResult> {
    const outcome = await this.authoritativeValidation(input);
    if ("code" in outcome) return { error: outcome };
    return { report: outcome.report };
  }

  public async read(
    projectId: ProjectId,
    templateId: HumanReadableId,
    revision?: PositiveRevision,
  ): Promise<ActorOperationResult<ActorTemplateRevisionView>> {
    return this.readInTransaction(async (uow) => {
      const summary = await uow.templates.findSummary(projectId, templateId);
      if (summary === undefined) abort(templateNotFound());
      const targetRevision = revision ?? summary.current_revision;
      const view = await uow.templates.findRevision(projectId, templateId, targetRevision);
      if (view === undefined) abort(templateNotFound());
      return view;
    });
  }

  public async list(
    projectId: ProjectId,
  ): Promise<ActorOperationResult<readonly ActorTemplateSummary[]>> {
    return this.readInTransaction(async (uow) => {
      const summaries = await uow.templates.listSummaries(projectId);
      if (summaries === undefined) abort(projectNotFound());
      return sortSummaries(summaries);
    });
  }

  public async history(
    projectId: ProjectId,
    templateId: HumanReadableId,
  ): Promise<ActorOperationResult<readonly ActorTemplateRevisionSummary[]>> {
    return this.readInTransaction(async (uow) => {
      const history = await uow.templates.listRevisionSummaries(projectId, templateId);
      if (history === undefined) abort(templateNotFound());
      return sortHistory(history);
    });
  }

  public async create(
    command: CreateActorTemplateCommand,
  ): Promise<ActorOperationResult<CreateActorTemplateResult>> {
    const outcome = await this.authoritativeValidation(asValidationCandidate(command));
    if ("code" in outcome) return { ok: false, error: outcome };
    if (!outcome.report.valid || outcome.resolved === undefined) {
      return { ok: false, error: validationError(outcome) };
    }
    return this.writeInTransaction(async (uow) => {
      const reservation = await uow.namespace.reserve(
        command.project_id,
        "actor_template",
        command.requested_template_id,
      );
      if (reservation === "project_not_found") abort(projectNotFound());
      if (reservation === "occupied") abort(resourceIdConflict());

      const revision = revisionView(
        this.ports.identity.newTemplateUid(command.project_id, command.requested_template_id),
        command.requested_template_id,
        command,
        outcome.resolved!,
        1 as PositiveRevision,
        this.ports.clock.now(),
      );
      if (revision === undefined) abort(operationFailure());
      const result = await uow.templates.create(revision);
      if (result === "resource_id_conflict") abort(resourceIdConflict());
      if (result !== "created") abort(operationFailure());
      return { revision };
    });
  }

  public async revise(
    command: ReviseActorTemplateCommand,
  ): Promise<ActorOperationResult<ReviseActorTemplateResult>> {
    const outcome = await this.authoritativeValidation(asValidationCandidate(command));
    if ("code" in outcome) return { ok: false, error: outcome };
    if (!outcome.report.valid || outcome.resolved === undefined) {
      return { ok: false, error: validationError(outcome) };
    }
    return this.writeInTransaction(async (uow) => {
      const current = await uow.templates.findSummary(command.project_id, command.template_id);
      if (current === undefined) abort(templateNotFound());
      if (current.status === "archived") abort(templateArchived());
      if (current.current_revision !== command.base_revision) abort(baseRevisionConflict());

      const nextRevision = (current.current_revision + 1) as PositiveRevision;
      const revision = revisionView(
        current.template_uid,
        command.template_id,
        command,
        outcome.resolved!,
        nextRevision,
        this.ports.clock.now(),
      );
      if (revision === undefined) abort(operationFailure());
      const result = await uow.templates.appendRevision(revision, command.base_revision);
      if (result === "not_found") abort(templateNotFound());
      if (result === "archived") abort(templateArchived());
      if (result === "base_revision_conflict") abort(baseRevisionConflict());
      if (result !== "appended") abort(operationFailure());
      return { revision };
    });
  }

  public async archive(
    projectId: ProjectId,
    templateId: HumanReadableId,
    expectedCurrentRevision?: PositiveRevision,
  ): Promise<ActorOperationResult<ActorTemplateSummary>> {
    return this.writeInTransaction(async (uow) => {
      const current = await uow.templates.findSummary(projectId, templateId);
      if (current === undefined) abort(templateNotFound());
      if (current.status === "archived") return current;
      const expectedRevision = expectedCurrentRevision ?? current.current_revision;
      if (expectedRevision !== current.current_revision) abort(baseRevisionConflict());
      const result = await uow.templates.archive(projectId, templateId, expectedRevision);
      if (result === "not_found") abort(templateNotFound());
      if (result === "base_revision_conflict") abort(baseRevisionConflict());
      if (result !== "archived") abort(operationFailure());
      const archived = await uow.templates.findSummary(projectId, templateId);
      if (archived === undefined) abort(operationFailure());
      return archived;
    });
  }

  public async compileAndPersist(
    command: ActorTemplateCompileCommand,
  ): Promise<ActorOperationResult<ActorConfigSnapshot>> {
    return this.writeInTransaction(async (uow) => {
      const view = await uow.templates.findRevision(command.project_id, command.template_id, command.revision);
      if (view === undefined) abort(templateNotFound());
      if (!templateRevisionDigestMatches(view)) abort(operationFailure());
      const outcome = await this.authoritativeValidation(
        validationCandidateFromRevision(view),
        { persistedProvenance: persistedProvenanceFromRevision(view) },
      );
      if ("code" in outcome) abort(outcome);
      if (!outcome.report.valid || outcome.resolved === undefined) abort(validationError(outcome));

      const compiled = compileActorTemplate({
        snapshot_id: this.ports.identity.newSnapshotId(command.project_id),
        created_at: this.ports.clock.now(),
        source_template: {
          template_uid: view.template_uid,
          human_readable_id: view.template_id,
          revision: view.revision,
          revision_digest: view.revision_digest,
        },
        candidate: outcome.resolved,
      });
      if (!compiled.ok) abort(compilationError(compiled.error));
      const saveResult = await uow.snapshots.save(compiled.snapshot);
      if (saveResult !== "created") abort(operationFailure());
      return compiled.snapshot;
    });
  }

  private async authoritativeValidation(
    input: unknown,
    options: ActorTemplateValidationOptions = {},
  ): Promise<ActorTemplateValidationOutcome | ActorOperationFailureError> {
    try {
      return await resolveAndValidateActorTemplateCandidate(input, this.ports, options);
    } catch {
      return operationFailure();
    }
  }

  private async readInTransaction<T>(
    work: (uow: ActorUnitOfWork) => Promise<T>,
  ): Promise<ActorOperationResult<T>> {
    return this.runInTransaction(work);
  }

  private async writeInTransaction<T>(
    work: (uow: ActorUnitOfWork) => Promise<T>,
  ): Promise<ActorOperationResult<T>> {
    return this.runInTransaction(work);
  }

  private async runInTransaction<T>(
    work: (uow: ActorUnitOfWork) => Promise<T>,
  ): Promise<ActorOperationResult<T>> {
    try {
      const value = await this.ports.unitOfWork.run(work);
      return { ok: true, value };
    } catch (error) {
      if (error instanceof ActorOperationAbort) return { ok: false, error: error.error };
      return { ok: false, error: operationFailure() };
    }
  }
}
