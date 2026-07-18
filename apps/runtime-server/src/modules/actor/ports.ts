import type {
  ActorConfigSnapshot,
  ActorConfigSnapshotId,
  ActorTemplateId,
  ActorTemplateRevisionSummary,
  ActorTemplateRevisionView,
  ActorTemplateSummary,
  BackendAdapterId,
  BackendBrickBody,
  CanonicalTimestamp,
  DefinitionBrickRevision,
  ExactBrickRef,
  HumanReadableId,
  PositiveRevision,
  ProjectId,
  RuntimeConfigBrickBody,
  ToolProviderBrickConfig,
  ToolProviderId,
  ToolsetBrickBody,
} from "@ai-block/runtime-contracts";

export type ActorResourceKind = "actor_template";

export type ProjectResourceReservation =
  | "reserved"
  | "occupied"
  | "project_not_found";

export interface ProjectNamespacePort {
  inspect(
    projectId: ProjectId,
    kind: ActorResourceKind,
    resourceId: HumanReadableId,
  ): Promise<"available" | "occupied" | "project_not_found">;

  reserve(
    projectId: ProjectId,
    kind: ActorResourceKind,
    resourceId: HumanReadableId,
  ): Promise<ProjectResourceReservation>;
}

export interface DefinitionBrickResolverPort {
  resolveExact(
    projectId: ProjectId,
    ref: ExactBrickRef,
  ): Promise<DefinitionBrickRevision | undefined>;
}

export type ValidatorFinding = Readonly<{
  code: string;
  provider_id?: ToolProviderId;
  safe_details?: Readonly<Record<string, string>>;
}>;

export interface BackendAdapterValidatorPort {
  validate(body: BackendBrickBody): readonly ValidatorFinding[];
}

export interface BackendAdapterValidatorRegistryPort {
  find(adapterId: BackendAdapterId): BackendAdapterValidatorPort | undefined;
}

export interface ToolProviderValidatorPort {
  validate(config: ToolProviderBrickConfig): readonly ValidatorFinding[];
}

export interface ToolProviderValidatorRegistryPort {
  find(providerId: ToolProviderId): ToolProviderValidatorPort | undefined;
}

export interface BackendToolsetCompatibilityPort {
  validate(
    backend: BackendBrickBody,
    toolset: ToolsetBrickBody,
  ): readonly ValidatorFinding[];
}

export type WorkspaceResolution =
  | Readonly<{
      kind: "resolved";
      root_id: HumanReadableId;
      relative_working_directory: string;
      working_directory: string;
    }>
  | Readonly<{ kind: "root_not_found" }>
  | Readonly<{ kind: "path_escape" }>;

export interface ProjectWorkspaceResolverPort {
  resolveWorkingDirectory(
    projectId: ProjectId,
    workspace: RuntimeConfigBrickBody["workspace"],
  ): Promise<WorkspaceResolution>;
}

export interface ActorClockPort {
  now(): CanonicalTimestamp;
}

export interface ActorIdentityProviderPort {
  newTemplateUid(projectId: ProjectId, templateId: HumanReadableId): ActorTemplateId;

  newSnapshotId(projectId: ProjectId): ActorConfigSnapshotId;
}

export type ActorTemplateCreateResult = "created" | "resource_id_conflict";

export type ActorTemplateRevisionWriteResult =
  | "appended"
  | "not_found"
  | "archived"
  | "base_revision_conflict";

export type ActorTemplateArchiveResult =
  | "archived"
  | "not_found"
  | "base_revision_conflict";

export interface ActorTemplateRepositoryPort {
  listSummaries(
    projectId: ProjectId,
  ): Promise<readonly ActorTemplateSummary[] | undefined>;

  findSummary(
    projectId: ProjectId,
    templateId: HumanReadableId,
  ): Promise<ActorTemplateSummary | undefined>;

  findRevision(
    projectId: ProjectId,
    templateId: HumanReadableId,
    revision: PositiveRevision,
  ): Promise<ActorTemplateRevisionView | undefined>;

  listRevisionSummaries(
    projectId: ProjectId,
    templateId: HumanReadableId,
  ): Promise<readonly ActorTemplateRevisionSummary[] | undefined>;

  create(
    revision: ActorTemplateRevisionView,
  ): Promise<ActorTemplateCreateResult>;

  appendRevision(
    revision: ActorTemplateRevisionView,
    expectedCurrentRevision: PositiveRevision,
  ): Promise<ActorTemplateRevisionWriteResult>;

  archive(
    projectId: ProjectId,
    templateId: HumanReadableId,
    expectedCurrentRevision: PositiveRevision,
  ): Promise<ActorTemplateArchiveResult>;
}

export type ActorConfigSnapshotWriteResult = "created" | "snapshot_id_conflict";

export interface ActorConfigSnapshotRepositoryPort {
  find(snapshotId: ActorConfigSnapshotId): Promise<ActorConfigSnapshot | undefined>;

  save(snapshot: ActorConfigSnapshot): Promise<ActorConfigSnapshotWriteResult>;
}

export interface ActorUnitOfWork {
  namespace: ProjectNamespacePort;
  templates: ActorTemplateRepositoryPort;
  snapshots: ActorConfigSnapshotRepositoryPort;
}

export interface ActorUnitOfWorkPort {
  run<T>(work: (uow: ActorUnitOfWork) => Promise<T>): Promise<T>;
}

export interface ActorModulePorts {
  clock: ActorClockPort;
  identity: ActorIdentityProviderPort;
  definitionBricks: DefinitionBrickResolverPort;
  backendValidators: BackendAdapterValidatorRegistryPort;
  toolProviderValidators: ToolProviderValidatorRegistryPort;
  compatibility: BackendToolsetCompatibilityPort;
  workspace: ProjectWorkspaceResolverPort;
  unitOfWork: ActorUnitOfWorkPort;
}
