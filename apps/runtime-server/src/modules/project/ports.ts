import type {
  BrickKind,
  CanonicalTimestamp,
  DefinitionBrickBody,
  DefinitionBrickDigest,
  DefinitionBrickId,
  DefinitionBrickRevision,
  DefinitionBrickRevisionId,
  DefinitionBrickSummary,
  HumanReadableId,
  PositiveRevision,
  ProjectId,
  ProjectRecord,
} from "@ai-block/runtime-contracts";

export interface ProjectClockPort {
  now(): CanonicalTimestamp;
}

export interface ProjectIdentityProviderPort {
  newProjectId(): ProjectId;
  newDefinitionBrickId(projectId: ProjectId, brickId: HumanReadableId): DefinitionBrickId;
  newDefinitionBrickRevisionId(
    projectId: ProjectId,
    brickId: HumanReadableId,
    revision: PositiveRevision,
  ): DefinitionBrickRevisionId;
}

export interface DefinitionBrickDigestPort {
  compute(kind: BrickKind, body: DefinitionBrickBody): DefinitionBrickDigest;
}

export type ProjectCreateWriteResult = "created" | "project_id_conflict";

export interface ProjectRepositoryPort {
  create(project: ProjectRecord): Promise<ProjectCreateWriteResult>;
  find(projectId: ProjectId): Promise<ProjectRecord | undefined>;
}

export type DefinitionBrickCreateWriteResult =
  | "created"
  | "already_exists";

export type DefinitionBrickAppendWriteResult =
  | "appended"
  | "not_found"
  | "archived"
  | "kind_mismatch"
  | "base_revision_conflict";

export type DefinitionBrickArchiveWriteResult =
  | "archived"
  | "not_found"
  | "base_revision_conflict";

export interface DefinitionBrickRepositoryPort {
  create(
    summary: DefinitionBrickSummary,
    revision: DefinitionBrickRevision,
  ): Promise<DefinitionBrickCreateWriteResult>;

  findSummary(
    projectId: ProjectId,
    brickId: HumanReadableId,
  ): Promise<DefinitionBrickSummary | undefined>;

  listSummaries(projectId: ProjectId): Promise<readonly DefinitionBrickSummary[]>;

  findRevision(
    projectId: ProjectId,
    brickId: HumanReadableId,
    revision: PositiveRevision,
  ): Promise<DefinitionBrickRevision | undefined>;

  listRevisions(
    projectId: ProjectId,
    brickId: HumanReadableId,
  ): Promise<readonly DefinitionBrickRevision[] | undefined>;

  appendRevision(
    revision: DefinitionBrickRevision,
    expectedCurrentRevision: PositiveRevision,
  ): Promise<DefinitionBrickAppendWriteResult>;

  archive(
    projectId: ProjectId,
    brickId: HumanReadableId,
    expectedCurrentRevision: PositiveRevision,
  ): Promise<DefinitionBrickArchiveWriteResult>;
}

export interface ProjectUnitOfWork {
  projects: ProjectRepositoryPort;
  definitionBricks: DefinitionBrickRepositoryPort;
}

export interface ProjectUnitOfWorkPort {
  run<T>(work: (uow: ProjectUnitOfWork) => Promise<T>): Promise<T>;
}

export interface ProjectModulePorts {
  clock: ProjectClockPort;
  identity: ProjectIdentityProviderPort;
  digest: DefinitionBrickDigestPort;
  unitOfWork: ProjectUnitOfWorkPort;
}
