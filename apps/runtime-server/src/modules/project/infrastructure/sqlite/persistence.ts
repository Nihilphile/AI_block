import type {
  BrickKind,
  DefinitionBrickRevision,
  DefinitionBrickSummary,
  HumanReadableId,
  PositiveRevision,
  ProjectDefinitionBrickError,
  ProjectId,
  ProjectRecord,
} from "@ai-block/runtime-contracts";
import type { DatabaseSync, StatementSync } from "node:sqlite";
import type {
  DefinitionBrickAppendWriteResult,
  DefinitionBrickArchiveWriteResult,
  DefinitionBrickCreateWriteResult,
  DefinitionBrickRepositoryPort,
  ProjectCreateWriteResult,
  ProjectRepositoryPort,
  ProjectUnitOfWork,
  ProjectUnitOfWorkPort,
} from "../../ports.js";
import {
  openConfiguredProjectSqliteDatabase,
  type ProjectSqliteConfiguration,
} from "./configuration.js";
import {
  initializeProjectSchemaV1,
  UnsupportedProjectSchemaError,
} from "./migrations/v1.js";

type SqliteRow = Readonly<Record<string, unknown>>;

const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

function invalidStoredValue<T>(): T {
  return {} as T;
}

function positiveSafeInteger(value: unknown): PositiveRevision | undefined {
  if (
    typeof value !== "bigint"
    || value < 1n
    || value > MAX_SAFE_INTEGER_BIGINT
  ) {
    return undefined;
  }
  return Number(value) as PositiveRevision;
}

function projectFromRow(row: SqliteRow): ProjectRecord {
  if (typeof row.project_id !== "string" || typeof row.created_at !== "string") {
    return invalidStoredValue<ProjectRecord>();
  }
  return {
    project_id: row.project_id as ProjectId,
    created_at: row.created_at as ProjectRecord["created_at"],
  };
}

function summaryFromRow(row: SqliteRow): DefinitionBrickSummary {
  const currentRevision = positiveSafeInteger(row.current_revision);
  if (
    typeof row.brick_uid !== "string"
    || typeof row.project_id !== "string"
    || typeof row.brick_id !== "string"
    || typeof row.kind !== "string"
    || currentRevision === undefined
    || typeof row.status !== "string"
    || typeof row.created_at !== "string"
  ) {
    return invalidStoredValue<DefinitionBrickSummary>();
  }
  return {
    brick_uid: row.brick_uid as DefinitionBrickSummary["brick_uid"],
    project_id: row.project_id as ProjectId,
    brick_id: row.brick_id as HumanReadableId,
    kind: row.kind as BrickKind,
    current_revision: currentRevision,
    status: row.status as DefinitionBrickSummary["status"],
    created_at: row.created_at as DefinitionBrickSummary["created_at"],
  };
}

function revisionFromRow(
  row: SqliteRow,
  expectedBrickUid: unknown,
): DefinitionBrickRevision {
  const revision = positiveSafeInteger(row.revision);
  if (
    typeof row.revision_uid !== "string"
    || typeof row.brick_uid !== "string"
    || row.brick_uid !== expectedBrickUid
    || typeof row.project_id !== "string"
    || typeof row.brick_id !== "string"
    || typeof row.kind !== "string"
    || revision === undefined
    || typeof row.body_json !== "string"
    || typeof row.digest !== "string"
    || typeof row.created_at !== "string"
  ) {
    return invalidStoredValue<DefinitionBrickRevision>();
  }

  let body: unknown;
  try {
    body = JSON.parse(row.body_json);
  } catch {
    return invalidStoredValue<DefinitionBrickRevision>();
  }

  return {
    revision_uid: row.revision_uid as DefinitionBrickRevision["revision_uid"],
    project_id: row.project_id as ProjectId,
    brick_id: row.brick_id as HumanReadableId,
    kind: row.kind as BrickKind,
    revision,
    body: body as DefinitionBrickRevision["body"],
    digest: row.digest as DefinitionBrickRevision["digest"],
    created_at: row.created_at as DefinitionBrickRevision["created_at"],
  };
}

function changedExactlyOne(changes: number | bigint): boolean {
  return changes === 1 || changes === 1n;
}

class SqliteProjectRepositories {
  private readonly insertProject: StatementSync;
  private readonly selectProject: StatementSync;
  private readonly insertAggregate: StatementSync;
  private readonly insertRevision: StatementSync;
  private readonly selectSummary: StatementSync;
  private readonly selectSummaries: StatementSync;
  private readonly selectRevision: StatementSync;
  private readonly selectRevisions: StatementSync;
  private readonly advanceAggregate: StatementSync;
  private readonly archiveAggregate: StatementSync;

  public readonly projects: ProjectRepositoryPort;
  public readonly definitionBricks: DefinitionBrickRepositoryPort;

  public constructor(database: DatabaseSync) {
    this.insertProject = database.prepare(`
      INSERT INTO projects(project_id, created_at)
      VALUES ($project_id, $created_at)
    `);
    this.selectProject = database.prepare(`
      SELECT project_id, created_at
      FROM projects
      WHERE project_id = $project_id
    `);
    this.insertAggregate = database.prepare(`
      INSERT INTO definition_brick_aggregates(
        brick_uid, project_id, brick_id, kind, current_revision, status, created_at
      ) VALUES (
        $brick_uid, $project_id, $brick_id, $kind, $current_revision, $status, $created_at
      )
    `);
    this.insertRevision = database.prepare(`
      INSERT INTO definition_brick_revisions(
        revision_uid, brick_uid, project_id, brick_id, kind, revision,
        body_json, digest, created_at
      ) VALUES (
        $revision_uid, $brick_uid, $project_id, $brick_id, $kind, $revision,
        $body_json, $digest, $created_at
      )
    `);
    this.selectSummary = database.prepare(`
      SELECT brick_uid, project_id, brick_id, kind, current_revision, status, created_at
      FROM definition_brick_aggregates
      WHERE project_id = $project_id AND brick_id = $brick_id
    `);
    this.selectSummaries = database.prepare(`
      SELECT brick_uid, project_id, brick_id, kind, current_revision, status, created_at
      FROM definition_brick_aggregates
      WHERE project_id = $project_id
      ORDER BY brick_id
    `);
    this.selectRevision = database.prepare(`
      SELECT revision_uid, brick_uid, project_id, brick_id, kind, revision,
        body_json, digest, created_at
      FROM definition_brick_revisions
      WHERE project_id = $project_id AND brick_id = $brick_id AND revision = $revision
    `);
    this.selectRevisions = database.prepare(`
      SELECT revision_uid, brick_uid, project_id, brick_id, kind, revision,
        body_json, digest, created_at
      FROM definition_brick_revisions
      WHERE project_id = $project_id AND brick_id = $brick_id
      ORDER BY revision
    `);
    this.advanceAggregate = database.prepare(`
      UPDATE definition_brick_aggregates
      SET current_revision = $next_revision
      WHERE project_id = $project_id
        AND brick_id = $brick_id
        AND kind = $kind
        AND status = 'active'
        AND current_revision = $expected_revision
    `);
    this.archiveAggregate = database.prepare(`
      UPDATE definition_brick_aggregates
      SET status = 'archived'
      WHERE project_id = $project_id
        AND brick_id = $brick_id
        AND current_revision = $expected_revision
    `);

    this.projects = {
      create: (project) => this.createProject(project),
      find: (projectId) => this.findProject(projectId),
    };
    this.definitionBricks = {
      create: (summary, revision) => this.createBrick(summary, revision),
      findSummary: (projectId, brickId) => this.findSummary(projectId, brickId),
      listSummaries: (projectId) => this.listSummaries(projectId),
      findRevision: (projectId, brickId, revision) => (
        this.findRevision(projectId, brickId, revision)
      ),
      listRevisions: (projectId, brickId) => this.listRevisions(projectId, brickId),
      appendRevision: (revision, expected) => this.appendRevision(revision, expected),
      archive: (projectId, brickId, expected) => this.archive(projectId, brickId, expected),
    };
  }

  private async createProject(project: ProjectRecord): Promise<ProjectCreateWriteResult> {
    if (this.selectProject.get({ $project_id: project.project_id }) !== undefined) {
      return "project_id_conflict";
    }
    this.insertProject.run({
      $project_id: project.project_id,
      $created_at: project.created_at,
    });
    return "created";
  }

  private async findProject(projectId: ProjectId): Promise<ProjectRecord | undefined> {
    const row = this.selectProject.get({ $project_id: projectId });
    return row === undefined ? undefined : projectFromRow(row);
  }

  private insertRevisionRecord(
    revision: DefinitionBrickRevision,
    brickUid: DefinitionBrickSummary["brick_uid"],
  ): void {
    this.insertRevision.run({
      $revision_uid: revision.revision_uid,
      $brick_uid: brickUid,
      $project_id: revision.project_id,
      $brick_id: revision.brick_id,
      $kind: revision.kind,
      $revision: revision.revision,
      $body_json: JSON.stringify(revision.body),
      $digest: revision.digest,
      $created_at: revision.created_at,
    });
  }

  private async createBrick(
    summary: DefinitionBrickSummary,
    revision: DefinitionBrickRevision,
  ): Promise<DefinitionBrickCreateWriteResult> {
    if (
      this.selectSummary.get({
        $project_id: summary.project_id,
        $brick_id: summary.brick_id,
      }) !== undefined
    ) {
      return "already_exists";
    }
    this.insertAggregate.run({
      $brick_uid: summary.brick_uid,
      $project_id: summary.project_id,
      $brick_id: summary.brick_id,
      $kind: summary.kind,
      $current_revision: summary.current_revision,
      $status: summary.status,
      $created_at: summary.created_at,
    });
    this.insertRevisionRecord(revision, summary.brick_uid);
    return "created";
  }

  private async findSummary(
    projectId: ProjectId,
    brickId: HumanReadableId,
  ): Promise<DefinitionBrickSummary | undefined> {
    const row = this.selectSummary.get({
      $project_id: projectId,
      $brick_id: brickId,
    });
    return row === undefined ? undefined : summaryFromRow(row);
  }

  private async listSummaries(
    projectId: ProjectId,
  ): Promise<readonly DefinitionBrickSummary[]> {
    return this.selectSummaries.all({ $project_id: projectId }).map(summaryFromRow);
  }

  private async findRevision(
    projectId: ProjectId,
    brickId: HumanReadableId,
    revision: PositiveRevision,
  ): Promise<DefinitionBrickRevision | undefined> {
    const summaryRow = this.selectSummary.get({
      $project_id: projectId,
      $brick_id: brickId,
    });
    const row = this.selectRevision.get({
      $project_id: projectId,
      $brick_id: brickId,
      $revision: revision,
    });
    return row === undefined
      ? undefined
      : revisionFromRow(row, summaryRow?.brick_uid);
  }

  private async listRevisions(
    projectId: ProjectId,
    brickId: HumanReadableId,
  ): Promise<readonly DefinitionBrickRevision[] | undefined> {
    const summaryRow = this.selectSummary.get({
      $project_id: projectId,
      $brick_id: brickId,
    });
    if (summaryRow === undefined) return undefined;
    return this.selectRevisions.all({
      $project_id: projectId,
      $brick_id: brickId,
    }).map((row) => revisionFromRow(row, summaryRow.brick_uid));
  }

  private async appendRevision(
    revision: DefinitionBrickRevision,
    expectedCurrentRevision: PositiveRevision,
  ): Promise<DefinitionBrickAppendWriteResult> {
    const stored = await this.findSummary(revision.project_id, revision.brick_id);
    if (stored === undefined) return "not_found";
    if (stored.kind !== revision.kind) return "kind_mismatch";
    if (stored.status === "archived") return "archived";
    if (stored.current_revision !== expectedCurrentRevision) {
      return "base_revision_conflict";
    }
    if (revision.revision !== expectedCurrentRevision + 1) {
      throw new Error("invalid next revision");
    }

    const result = this.advanceAggregate.run({
      $next_revision: revision.revision,
      $project_id: revision.project_id,
      $brick_id: revision.brick_id,
      $kind: revision.kind,
      $expected_revision: expectedCurrentRevision,
    });
    if (!changedExactlyOne(result.changes)) return "base_revision_conflict";
    this.insertRevisionRecord(revision, stored.brick_uid);
    return "appended";
  }

  private async archive(
    projectId: ProjectId,
    brickId: HumanReadableId,
    expectedCurrentRevision: PositiveRevision,
  ): Promise<DefinitionBrickArchiveWriteResult> {
    const stored = await this.findSummary(projectId, brickId);
    if (stored === undefined) return "not_found";
    if (stored.current_revision !== expectedCurrentRevision) {
      return "base_revision_conflict";
    }
    const result = this.archiveAggregate.run({
      $project_id: projectId,
      $brick_id: brickId,
      $expected_revision: expectedCurrentRevision,
    });
    return changedExactlyOne(result.changes) ? "archived" : "base_revision_conflict";
  }
}

class FifoMutex {
  private tail: Promise<void> = Promise.resolve();

  public async run<T>(work: () => Promise<T>): Promise<T> {
    let release = (): void => {};
    const turn = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.tail;
    this.tail = previous.then(() => turn);
    await previous;
    try {
      return await work();
    } finally {
      release();
    }
  }
}

type MutexRegistration = {
  readonly mutex: FifoMutex;
  references: number;
};

const databaseMutexes = new Map<string, MutexRegistration>();

function retainDatabaseMutex(canonicalPath: string): MutexRegistration {
  const existing = databaseMutexes.get(canonicalPath);
  if (existing !== undefined) {
    existing.references += 1;
    return existing;
  }
  const created = { mutex: new FifoMutex(), references: 1 };
  databaseMutexes.set(canonicalPath, created);
  return created;
}

function releaseDatabaseMutex(canonicalPath: string, registration: MutexRegistration): void {
  registration.references -= 1;
  if (registration.references === 0) databaseMutexes.delete(canonicalPath);
}

class SqliteProjectUnitOfWork implements ProjectUnitOfWorkPort {
  private closed = false;
  private readonly repositories: SqliteProjectRepositories;

  public constructor(
    private readonly database: DatabaseSync,
    private readonly mutex: FifoMutex,
  ) {
    this.repositories = new SqliteProjectRepositories(database);
  }

  public async run<T>(work: (uow: ProjectUnitOfWork) => Promise<T>): Promise<T> {
    return this.mutex.run(async () => {
      if (this.closed) throw new Error("persistence is closed");
      try {
        this.database.exec("BEGIN IMMEDIATE");
        const result = await work({
          projects: this.repositories.projects,
          definitionBricks: this.repositories.definitionBricks,
        });
        this.database.exec("COMMIT");
        return result;
      } catch (error) {
        try {
          this.database.exec("ROLLBACK");
        } catch {
          // The original operation failure remains authoritative.
        }
        throw error;
      }
    });
  }

  public async close(): Promise<void> {
    await this.mutex.run(async () => {
      if (this.closed) return;
      this.closed = true;
      this.database.close();
    });
  }
}

export type ProjectSqlitePersistence = Readonly<{
  unitOfWork: ProjectUnitOfWorkPort;
  close(): Promise<void>;
}>;

export type OpenProjectSqlitePersistenceResult =
  | Readonly<{ ok: true; persistence: ProjectSqlitePersistence }>
  | Readonly<{ ok: false; error: ProjectDefinitionBrickError }>;

export function openProjectSqlitePersistence(
  configuration: ProjectSqliteConfiguration,
): OpenProjectSqlitePersistenceResult {
  let database: DatabaseSync | undefined;
  let canonicalPath: string | undefined;
  let registration: MutexRegistration | undefined;
  try {
    const configured = openConfiguredProjectSqliteDatabase(configuration);
    database = configured.database;
    canonicalPath = configured.canonicalPath;
    initializeProjectSchemaV1(database);
    registration = retainDatabaseMutex(canonicalPath);
    const retainedPath = canonicalPath;
    const retainedRegistration = registration;
    const unitOfWork = new SqliteProjectUnitOfWork(database, retainedRegistration.mutex);
    let released = false;
    return {
      ok: true,
      persistence: {
        unitOfWork,
        close: async () => {
          try {
            await unitOfWork.close();
          } finally {
            if (!released) {
              released = true;
              releaseDatabaseMutex(retainedPath, retainedRegistration);
            }
          }
        },
      },
    };
  } catch (error) {
    if (registration !== undefined && canonicalPath !== undefined) {
      releaseDatabaseMutex(canonicalPath, registration);
    }
    if (database !== undefined) {
      try {
        database.close();
      } catch {
        // Startup failure remains authoritative.
      }
    }
    return error instanceof UnsupportedProjectSchemaError
      ? {
        ok: false,
        error: { code: "unsupported_schema_version", category: "compatibility" },
      }
      : {
        ok: false,
        error: { code: "persistence_failure", category: "persistence" },
      };
  }
}
