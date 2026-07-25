import {
  ArchiveDefinitionBrickCommandSchema,
  CreateDefinitionBrickCommandSchema,
  CreateProjectCommandSchema,
  DefinitionBrickRevisionSchema,
  DefinitionBrickSummarySchema,
  ListDefinitionBrickHistoryCommandSchema,
  ListDefinitionBricksCommandSchema,
  ProjectRecordSchema,
  ReadDefinitionBrickCommandSchema,
  ReadExactDefinitionBrickRevisionCommandSchema,
  ReadProjectCommandSchema,
  ReviseDefinitionBrickCommandSchema,
  decodeContract,
  type ArchiveDefinitionBrickResult,
  type CreateDefinitionBrickResult,
  type CreateProjectResult,
  type DefinitionBrickBody,
  type DefinitionBrickRevision,
  type DefinitionBrickSummary,
  type ListDefinitionBrickHistoryResult,
  type ListDefinitionBricksResult,
  type PositiveRevision,
  type ReadDefinitionBrickResult,
  type ReadExactDefinitionBrickRevisionResult,
  type ReadProjectResult,
  type ReviseDefinitionBrickResult,
} from "@ai-block/runtime-contracts";
import {
  ProjectOperationAbort,
  abortProjectOperation,
  definitionBrickAlreadyExistsError,
  definitionBrickArchivedError,
  definitionBrickIntegrityError,
  definitionBrickInvalidCandidateError,
  definitionBrickNotFoundError,
  definitionBrickRevisionConflictError,
  definitionBrickRevisionNotFoundError,
  errorResult,
  persistenceFailureError,
  projectNotFoundError,
  type ProjectApplicationErrorResult,
} from "./errors.js";
import type {
  ProjectModulePorts,
  ProjectUnitOfWork,
} from "./ports.js";
import {
  canonicalDefinitionBrickBody,
  decodeStoredProject,
  decodeStoredRevision,
  decodeStoredSummary,
} from "./values.js";

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export class ProjectApplicationService {
  public constructor(private readonly ports: ProjectModulePorts) {}

  public async createProject(command: unknown): Promise<CreateProjectResult> {
    if (!decodeContract(CreateProjectCommandSchema, command).ok) {
      return errorResult(definitionBrickInvalidCandidateError());
    }
    return this.runInTransaction(async (uow) => {
      const project = {
        project_id: this.ports.identity.newProjectId(),
        created_at: this.ports.clock.now(),
      };
      if (!decodeContract(ProjectRecordSchema, project).ok) {
        abortProjectOperation(persistenceFailureError());
      }
      const result = await uow.projects.create(project);
      if (result !== "created") abortProjectOperation(persistenceFailureError());
      return { project };
    });
  }

  public async readProject(command: unknown): Promise<ReadProjectResult> {
    const decoded = decodeContract(ReadProjectCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    return this.runInTransaction(async (uow) => {
      const stored = await uow.projects.find(decoded.value.project_id);
      if (stored === undefined) abortProjectOperation(projectNotFoundError());
      const project = decodeStoredProject(stored, decoded.value.project_id);
      if (project === undefined) abortProjectOperation(definitionBrickIntegrityError());
      return { project };
    });
  }

  public async createDefinitionBrick(command: unknown): Promise<CreateDefinitionBrickResult> {
    const decoded = decodeContract(CreateDefinitionBrickCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    const body = canonicalDefinitionBrickBody(decoded.value.kind, decoded.value.body);
    if (body === undefined) return errorResult(definitionBrickInvalidCandidateError());
    const digest = this.candidateDigest(decoded.value.kind, body);
    if (digest === undefined) return errorResult(definitionBrickInvalidCandidateError());

    return this.runInTransaction(async (uow) => {
      await this.requireProject(uow, decoded.value.project_id);
      const revisionNumber = 1 as PositiveRevision;
      const createdAt = this.ports.clock.now();
      const brick = {
        brick_uid: this.ports.identity.newDefinitionBrickId(
          decoded.value.project_id,
          decoded.value.requested_brick_id,
        ),
        project_id: decoded.value.project_id,
        brick_id: decoded.value.requested_brick_id,
        kind: decoded.value.kind,
        current_revision: revisionNumber,
        status: "active" as const,
        created_at: createdAt,
      };
      const revision = this.newRevision(
        brick,
        revisionNumber,
        body,
        digest,
        createdAt,
      );
      if (
        !decodeContract(DefinitionBrickSummarySchema, brick).ok
        || !decodeContract(DefinitionBrickRevisionSchema, revision).ok
      ) {
        abortProjectOperation(persistenceFailureError());
      }
      const result = await uow.definitionBricks.create(brick, revision);
      if (result === "already_exists") abortProjectOperation(definitionBrickAlreadyExistsError());
      if (result !== "created") abortProjectOperation(persistenceFailureError());
      return { brick, revision };
    });
  }

  public async reviseDefinitionBrick(command: unknown): Promise<ReviseDefinitionBrickResult> {
    const decoded = decodeContract(ReviseDefinitionBrickCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    const body = canonicalDefinitionBrickBody(decoded.value.kind, decoded.value.body);
    if (body === undefined) return errorResult(definitionBrickInvalidCandidateError());
    const digest = this.candidateDigest(decoded.value.kind, body);
    if (digest === undefined) return errorResult(definitionBrickInvalidCandidateError());

    return this.runInTransaction(async (uow) => {
      await this.requireProject(uow, decoded.value.project_id);
      const current = await this.requireSummary(
        uow,
        decoded.value.project_id,
        decoded.value.brick_id,
      );
      if (current.kind !== decoded.value.kind) {
        abortProjectOperation(definitionBrickInvalidCandidateError());
      }
      if (current.status === "archived") abortProjectOperation(definitionBrickArchivedError());
      if (current.current_revision !== decoded.value.base_revision) {
        abortProjectOperation(definitionBrickRevisionConflictError());
      }
      const nextRevision = (current.current_revision + 1) as PositiveRevision;
      const createdAt = this.ports.clock.now();
      const revision = this.newRevision(current, nextRevision, body, digest, createdAt);
      if (!decodeContract(DefinitionBrickRevisionSchema, revision).ok) {
        abortProjectOperation(persistenceFailureError());
      }
      const result = await uow.definitionBricks.appendRevision(
        revision,
        decoded.value.base_revision,
      );
      if (result === "not_found") abortProjectOperation(definitionBrickNotFoundError());
      if (result === "archived") abortProjectOperation(definitionBrickArchivedError());
      if (result === "kind_mismatch") abortProjectOperation(definitionBrickInvalidCandidateError());
      if (result === "base_revision_conflict") {
        abortProjectOperation(definitionBrickRevisionConflictError());
      }
      if (result !== "appended") abortProjectOperation(persistenceFailureError());
      return {
        brick: { ...current, current_revision: nextRevision },
        revision,
      };
    });
  }

  public async archiveDefinitionBrick(command: unknown): Promise<ArchiveDefinitionBrickResult> {
    const decoded = decodeContract(ArchiveDefinitionBrickCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    return this.runInTransaction(async (uow) => {
      await this.requireProject(uow, decoded.value.project_id);
      const current = await this.requireSummary(
        uow,
        decoded.value.project_id,
        decoded.value.brick_id,
      );
      if (current.status === "archived") return { brick: current };
      const result = await uow.definitionBricks.archive(
        decoded.value.project_id,
        decoded.value.brick_id,
        current.current_revision,
      );
      if (result === "not_found") abortProjectOperation(definitionBrickNotFoundError());
      if (result === "base_revision_conflict") {
        abortProjectOperation(definitionBrickRevisionConflictError());
      }
      if (result !== "archived") abortProjectOperation(persistenceFailureError());
      return { brick: { ...current, status: "archived" as const } };
    });
  }

  public async readDefinitionBrick(command: unknown): Promise<ReadDefinitionBrickResult> {
    const decoded = decodeContract(ReadDefinitionBrickCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    return this.runInTransaction(async (uow) => {
      await this.requireProject(uow, decoded.value.project_id);
      const brick = await this.requireSummary(
        uow,
        decoded.value.project_id,
        decoded.value.brick_id,
      );
      return { brick };
    });
  }

  public async listDefinitionBricks(command: unknown): Promise<ListDefinitionBricksResult> {
    const decoded = decodeContract(ListDefinitionBricksCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    return this.runInTransaction(async (uow) => {
      await this.requireProject(uow, decoded.value.project_id);
      const stored = await uow.definitionBricks.listSummaries(decoded.value.project_id);
      const bricks = stored.map((candidate) => {
        const brick = decodeStoredSummary(candidate, decoded.value.project_id);
        if (brick === undefined) abortProjectOperation(definitionBrickIntegrityError());
        return brick;
      }).sort((left, right) => compareText(left.brick_id, right.brick_id));
      return { bricks };
    });
  }

  public async listDefinitionBrickHistory(
    command: unknown,
  ): Promise<ListDefinitionBrickHistoryResult> {
    const decoded = decodeContract(ListDefinitionBrickHistoryCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    return this.runInTransaction(async (uow) => {
      await this.requireProject(uow, decoded.value.project_id);
      const brick = await this.requireSummary(
        uow,
        decoded.value.project_id,
        decoded.value.brick_id,
      );
      const stored = await uow.definitionBricks.listRevisions(
        decoded.value.project_id,
        decoded.value.brick_id,
      );
      if (stored === undefined) abortProjectOperation(definitionBrickIntegrityError());
      const revisions = stored.map((candidate) => this.requireRevisionIntegrity(candidate, brick))
        .sort((left, right) => left.revision - right.revision);
      if (
        revisions.length !== brick.current_revision
        || revisions.some((revision, index) => revision.revision !== index + 1)
      ) {
        abortProjectOperation(definitionBrickIntegrityError());
      }
      return { brick, revisions };
    });
  }

  public async readExactDefinitionBrickRevision(
    command: unknown,
  ): Promise<ReadExactDefinitionBrickRevisionResult> {
    const decoded = decodeContract(ReadExactDefinitionBrickRevisionCommandSchema, command);
    if (!decoded.ok) return errorResult(definitionBrickInvalidCandidateError());
    return this.runInTransaction(async (uow) => {
      await this.requireProject(uow, decoded.value.project_id);
      const brick = await this.requireSummary(
        uow,
        decoded.value.project_id,
        decoded.value.ref.id,
      );
      const stored = await uow.definitionBricks.findRevision(
        decoded.value.project_id,
        decoded.value.ref.id,
        decoded.value.ref.revision,
      );
      if (stored === undefined) abortProjectOperation(definitionBrickRevisionNotFoundError());
      const revision = this.requireRevisionIntegrity(
        stored,
        brick,
        decoded.value.ref.revision,
      );
      return { brick, revision };
    });
  }

  private candidateDigest(
    kind: DefinitionBrickSummary["kind"],
    body: DefinitionBrickBody,
  ): DefinitionBrickRevision["digest"] | undefined {
    try {
      return this.ports.digest.compute(kind, body);
    } catch {
      return undefined;
    }
  }

  private newRevision(
    brick: DefinitionBrickSummary,
    revision: PositiveRevision,
    body: DefinitionBrickBody,
    digest: DefinitionBrickRevision["digest"],
    createdAt: DefinitionBrickRevision["created_at"],
  ): DefinitionBrickRevision {
    return {
      revision_uid: this.ports.identity.newDefinitionBrickRevisionId(
        brick.project_id,
        brick.brick_id,
        revision,
      ),
      project_id: brick.project_id,
      brick_id: brick.brick_id,
      kind: brick.kind,
      revision,
      body,
      digest,
      created_at: createdAt,
    };
  }

  private async requireProject(
    uow: ProjectUnitOfWork,
    projectId: DefinitionBrickSummary["project_id"],
  ): Promise<void> {
    const stored = await uow.projects.find(projectId);
    if (stored === undefined) abortProjectOperation(projectNotFoundError());
    if (decodeStoredProject(stored, projectId) === undefined) {
      abortProjectOperation(definitionBrickIntegrityError());
    }
  }

  private async requireSummary(
    uow: ProjectUnitOfWork,
    projectId: DefinitionBrickSummary["project_id"],
    brickId: DefinitionBrickSummary["brick_id"],
  ): Promise<DefinitionBrickSummary> {
    const stored = await uow.definitionBricks.findSummary(projectId, brickId);
    if (stored === undefined) abortProjectOperation(definitionBrickNotFoundError());
    const summary = decodeStoredSummary(stored, projectId, brickId);
    if (summary === undefined) abortProjectOperation(definitionBrickIntegrityError());
    return summary;
  }

  private requireRevisionIntegrity(
    stored: unknown,
    brick: DefinitionBrickSummary,
    expectedRevision?: PositiveRevision,
  ): DefinitionBrickRevision {
    const revision = decodeStoredRevision(stored, brick, expectedRevision);
    if (revision === undefined) abortProjectOperation(definitionBrickIntegrityError());
    try {
      if (this.ports.digest.compute(revision.kind, revision.body) !== revision.digest) {
        abortProjectOperation(definitionBrickIntegrityError());
      }
    } catch {
      abortProjectOperation(definitionBrickIntegrityError());
    }
    return revision;
  }

  private async runInTransaction<T extends object>(
    work: (uow: ProjectUnitOfWork) => Promise<T>,
  ): Promise<T | ProjectApplicationErrorResult> {
    try {
      return await this.ports.unitOfWork.run(work);
    } catch (error) {
      if (error instanceof ProjectOperationAbort) {
        return errorResult(error.operationError);
      }
      return errorResult(persistenceFailureError());
    }
  }
}
