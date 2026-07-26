import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import type {
  DefinitionBrickId,
  DefinitionBrickRevisionId,
  ProjectId,
} from "@ai-block/runtime-contracts";
import {
  openProjectSqlitePersistence,
  ProjectApplicationService,
  type ProjectSqlitePersistence,
} from "../../../src/modules/project/index.js";
import {
  openConfiguredProjectSqliteDatabase,
} from "../../../src/modules/project/infrastructure/sqlite/configuration.js";
import { createInMemoryProjectAdapters } from "./in-memory-adapters.js";

const openedPersistence: ProjectSqlitePersistence[] = [];
const temporaryDirectories: string[] = [];

afterEach(async () => {
  for (const persistence of openedPersistence.splice(0).reverse()) {
    await persistence.close();
  }
  for (const directory of temporaryDirectories.splice(0).reverse()) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function temporaryDatabase(): { directory: string; databasePath: string } {
  const directory = mkdtempSync(join(tmpdir(), "ai-block-project-sqlite-"));
  temporaryDirectories.push(directory);
  return { directory, databasePath: join(directory, "project.sqlite") };
}

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

function openHarness(databasePath: string, seed = 1) {
  const opened = openProjectSqlitePersistence({ databasePath });
  expect(opened.ok).toBe(true);
  if (!opened.ok) throw new Error(opened.error.code);
  openedPersistence.push(opened.persistence);

  const ids = Array.from({ length: 30 }, (_, offset) => uuid(seed * 100 + offset));
  const adapters = createInMemoryProjectAdapters({
    projectIds: ids.slice(0, 5).map((id) => `project_${id}` as ProjectId),
    brickIds: ids.slice(5, 20).map((id) => `brick_${id}` as DefinitionBrickId),
    revisionIds: ids.slice(5, 30).map((id) => `brickrev_${id}` as DefinitionBrickRevisionId),
    timestamps: Array.from(
      { length: 30 },
      (_, offset) => `2026-07-26T${(offset % 24).toString().padStart(2, "0")}:00:00.000Z`,
    ),
  });
  const service = new ProjectApplicationService({
    ...adapters.ports,
    unitOfWork: opened.persistence.unitOfWork,
  });
  return { persistence: opened.persistence, service };
}

async function createProject(service: ProjectApplicationService): Promise<ProjectId> {
  const result = await service.createProject({});
  expect("project" in result).toBe(true);
  if (!("project" in result)) throw new Error(result.error.code);
  return result.project.project_id;
}

function createBrick(projectId: ProjectId, brickId: string, text = "System") {
  return {
    project_id: projectId,
    requested_brick_id: brickId,
    kind: "sys_prompt" as const,
    body: { text },
  };
}

const persistenceFailure = {
  error: { code: "persistence_failure", category: "persistence" },
};
const factoryPersistenceFailure = {
  ok: false,
  ...persistenceFailure,
};
const integrityFailure = {
  error: { code: "definition_brick_integrity_error", category: "integrity" },
};
const unsupportedSchema = {
  ok: false,
  error: { code: "unsupported_schema_version", category: "compatibility" },
};

describe("Project SQLite persistence", () => {
  it("rejects invalid paths and bootstraps a locked-down versioned store", async () => {
    const { directory, databasePath } = temporaryDatabase();
    const missingParent = join(directory, "missing", "project.sqlite");
    const directoryTarget = join(directory, "directory-target");
    mkdirSync(directoryTarget);

    for (const invalid of ["", "relative.sqlite", ":memory:", missingParent, directoryTarget]) {
      expect(openProjectSqlitePersistence({ databasePath: invalid })).toEqual(
        factoryPersistenceFailure,
      );
    }
    expect(openProjectSqlitePersistence({ databasePath, extra: true } as never)).toEqual(
      factoryPersistenceFailure,
    );

    const configured = openConfiguredProjectSqliteDatabase({ databasePath });
    try {
      expect(configured.database.prepare("PRAGMA foreign_keys").get()).toEqual({
        foreign_keys: 1n,
      });
      expect(configured.database.prepare("SELECT CAST(1 AS INTEGER) AS value").get()).toEqual({
        value: 1n,
      });
      expect(() => configured.database.enableLoadExtension(true)).toThrow();
      configured.database.exec("PRAGMA writable_schema = ON");
      expect(configured.database.prepare("PRAGMA writable_schema").get()).toEqual({
        writable_schema: 0n,
      });
    } finally {
      configured.database.close();
    }

    const { persistence } = openHarness(databasePath);
    const raw = new DatabaseSync(databasePath, { readBigInts: true });
    try {
      expect(raw.prepare(
        "SELECT version FROM project_schema_migrations",
      ).all()).toEqual([{ version: 1n }]);
      expect(raw.prepare(`
        SELECT name FROM sqlite_schema
        WHERE name NOT LIKE 'sqlite_%'
        ORDER BY name
      `).all()).toEqual([
        { name: "definition_brick_aggregates" },
        { name: "definition_brick_revisions" },
        { name: "definition_brick_revisions_exact" },
        { name: "project_schema_migrations" },
        { name: "projects" },
      ]);
    } finally {
      raw.close();
    }
    await persistence.close();
  });

  it("binds hostile Body values and preserves durable archive/history and Project isolation", async () => {
    const { databasePath } = temporaryDatabase();
    const first = openHarness(databasePath);
    const project1 = await createProject(first.service);
    const project2 = await createProject(first.service);
    const hostile = `x'); DROP TABLE projects; --\u0000"`;

    const created1 = await first.service.createDefinitionBrick(
      createBrick(project1, "shared", hostile),
    );
    const created2 = await first.service.createDefinitionBrick(
      createBrick(project2, "shared", "Other"),
    );
    expect(created1).toMatchObject({
      revision: { body: { text: hostile }, revision: 1 },
    });
    expect(created2).toMatchObject({
      brick: { project_id: project2, brick_id: "shared" },
    });

    const revised = await first.service.reviseDefinitionBrick({
      project_id: project1,
      brick_id: "shared",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "Revision two" },
    });
    expect(revised).toMatchObject({ revision: { revision: 2 } });
    expect(await first.service.archiveDefinitionBrick({
      project_id: project1,
      brick_id: "shared",
    })).toMatchObject({ brick: { status: "archived" } });
    await first.persistence.close();

    const reopened = openHarness(databasePath, 2);
    expect(await reopened.service.listDefinitionBrickHistory({
      project_id: project1,
      brick_id: "shared",
    })).toMatchObject({
      brick: { status: "archived", current_revision: 2 },
      revisions: [
        { revision: 1, body: { text: hostile } },
        { revision: 2, body: { text: "Revision two" } },
      ],
    });
    expect(await reopened.service.readExactDefinitionBrickRevision({
      project_id: project1,
      ref: { id: "shared", revision: 1 },
    })).toMatchObject({ revision: { body: { text: hostile } } });
    expect(await reopened.service.listDefinitionBricks({ project_id: project2 })).toMatchObject({
      bricks: [{ project_id: project2, brick_id: "shared", status: "active" }],
    });
  });

  it("rolls back Project create, Brick create, revise, and archive failures", async () => {
    const { databasePath } = temporaryDatabase();
    const { service } = openHarness(databasePath);
    const raw = new DatabaseSync(databasePath);
    try {
      raw.exec(`
        CREATE TRIGGER fail_project AFTER INSERT ON projects
        BEGIN SELECT RAISE(ABORT, 'fail project'); END
      `);
      expect(await service.createProject({})).toEqual(persistenceFailure);
      expect(raw.prepare("SELECT count(*) AS count FROM projects").get()).toEqual({ count: 0 });
      raw.exec("DROP TRIGGER fail_project");

      const projectId = await createProject(service);
      raw.exec(`
        CREATE TRIGGER fail_brick BEFORE INSERT ON definition_brick_revisions
        BEGIN SELECT RAISE(ABORT, 'fail brick'); END
      `);
      expect(await service.createDefinitionBrick(createBrick(projectId, "rollback"))).toEqual(
        persistenceFailure,
      );
      expect(raw.prepare(
        "SELECT count(*) AS count FROM definition_brick_aggregates",
      ).get()).toEqual({ count: 0 });
      raw.exec("DROP TRIGGER fail_brick");

      expect(await service.createDefinitionBrick(
        createBrick(projectId, "rollback"),
      )).toMatchObject({ revision: { revision: 1 } });
      raw.exec(`
        CREATE TRIGGER fail_revise BEFORE INSERT ON definition_brick_revisions
        WHEN NEW.revision > 1
        BEGIN SELECT RAISE(ABORT, 'fail revise'); END
      `);
      expect(await service.reviseDefinitionBrick({
        project_id: projectId,
        brick_id: "rollback",
        base_revision: 1,
        kind: "sys_prompt",
        body: { text: "two" },
      })).toEqual(persistenceFailure);
      expect(raw.prepare(`
        SELECT current_revision FROM definition_brick_aggregates
        WHERE project_id = ? AND brick_id = ?
      `).get(projectId, "rollback")).toEqual({ current_revision: 1 });
      raw.exec("DROP TRIGGER fail_revise");

      expect(await service.reviseDefinitionBrick({
        project_id: projectId,
        brick_id: "rollback",
        base_revision: 1,
        kind: "sys_prompt",
        body: { text: "two" },
      })).toMatchObject({ revision: { revision: 2 } });
      raw.exec(`
        CREATE TRIGGER fail_archive AFTER UPDATE OF status ON definition_brick_aggregates
        BEGIN SELECT RAISE(ABORT, 'fail archive'); END
      `);
      expect(await service.archiveDefinitionBrick({
        project_id: projectId,
        brick_id: "rollback",
      })).toEqual(persistenceFailure);
      expect(raw.prepare(`
        SELECT status FROM definition_brick_aggregates
        WHERE project_id = ? AND brick_id = ?
      `).get(projectId, "rollback")).toEqual({ status: "active" });
      raw.exec("DROP TRIGGER fail_archive");
      expect(await service.archiveDefinitionBrick({
        project_id: projectId,
        brick_id: "rollback",
      })).toMatchObject({ brick: { status: "archived" } });
    } finally {
      raw.close();
    }
  });

  it("serializes adapters by canonical path and returns one stale-base conflict", async () => {
    const { databasePath } = temporaryDatabase();
    const first = openHarness(databasePath, 1);
    const second = openHarness(databasePath, 2);
    const projectId = await createProject(first.service);
    await first.service.createDefinitionBrick(createBrick(projectId, "concurrent"));

    const command = {
      project_id: projectId,
      brick_id: "concurrent",
      base_revision: 1,
      kind: "sys_prompt" as const,
      body: { text: "same candidate" },
    };
    const results = await Promise.all([
      first.service.reviseDefinitionBrick(command),
      second.service.reviseDefinitionBrick(command),
    ]);
    expect(results.filter((result) => "revision" in result)).toHaveLength(1);
    expect(results.filter((result) => (
      "error" in result && result.error.code === "definition_brick_revision_conflict"
    ))).toHaveLength(1);
  });

  it("maps an external writer lock to persistence failure after the bounded timeout", async () => {
    const { databasePath } = temporaryDatabase();
    const { service } = openHarness(databasePath);
    const projectId = await createProject(service);
    const lock = new DatabaseSync(databasePath);
    lock.exec("BEGIN IMMEDIATE");
    try {
      const startedAt = Date.now();
      expect(await service.readProject({ project_id: projectId })).toEqual(persistenceFailure);
      expect(Date.now() - startedAt).toBeGreaterThanOrEqual(200);
      expect(Date.now() - startedAt).toBeLessThan(2_000);
    } finally {
      lock.exec("ROLLBACK");
      lock.close();
    }
  });

  it("enforces relational, uniqueness, kind, lifecycle, and positive-revision constraints", async () => {
    const { databasePath } = temporaryDatabase();
    openHarness(databasePath);
    const raw = new DatabaseSync(databasePath, { enableForeignKeyConstraints: true });
    try {
      expect(() => raw.prepare(
        "INSERT INTO projects(project_id, created_at) VALUES (?, ?)",
      ).run("project_x", "2026-07-26T00:00:00.000Z")).not.toThrow();
      expect(() => raw.prepare(
        "INSERT INTO projects(project_id, created_at) VALUES (?, ?)",
      ).run("project_x", "2026-07-26T00:00:00.000Z")).toThrow();
      expect(() => raw.prepare(`
        INSERT INTO definition_brick_aggregates(
          brick_uid, project_id, brick_id, kind, current_revision, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "brick_x",
        "project_missing",
        "x",
        "sys_prompt",
        1,
        "active",
        "2026-07-26T00:00:00.000Z",
      )).toThrow();
      expect(() => raw.prepare(`
        INSERT INTO definition_brick_aggregates(
          brick_uid, project_id, brick_id, kind, current_revision, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "brick_x",
        "project_x",
        "x",
        "invalid_kind",
        0,
        "deleted",
        "2026-07-26T00:00:00.000Z",
      )).toThrow();
    } finally {
      raw.close();
    }
  });

  it("fails closed for malformed initialization, unledgered, unsupported, and altered stores", async () => {
    const malformed = temporaryDatabase();
    writeFileSync(malformed.databasePath, "not a sqlite database");
    expect(openProjectSqlitePersistence({ databasePath: malformed.databasePath })).toEqual(
      factoryPersistenceFailure,
    );

    const unledgered = temporaryDatabase();
    const rawUnledgered = new DatabaseSync(unledgered.databasePath);
    rawUnledgered.exec("CREATE TABLE unrelated(value TEXT) STRICT");
    rawUnledgered.close();
    expect(openProjectSqlitePersistence({ databasePath: unledgered.databasePath })).toEqual(
      unsupportedSchema,
    );

    const unsupported = temporaryDatabase();
    const first = openHarness(unsupported.databasePath);
    await first.persistence.close();
    const rawUnsupported = new DatabaseSync(unsupported.databasePath);
    rawUnsupported.exec("UPDATE project_schema_migrations SET version = 2");
    rawUnsupported.close();
    expect(openProjectSqlitePersistence({ databasePath: unsupported.databasePath })).toEqual(
      unsupportedSchema,
    );

    const altered = temporaryDatabase();
    const second = openHarness(altered.databasePath, 2);
    await second.persistence.close();
    const rawAltered = new DatabaseSync(altered.databasePath);
    rawAltered.exec("ALTER TABLE projects ADD COLUMN altered TEXT");
    rawAltered.close();
    expect(openProjectSqlitePersistence({ databasePath: altered.databasePath })).toEqual(
      unsupportedSchema,
    );
  });

  it("routes malformed JSON, canonical Body, digest, binding, ID, and integer rows to integrity", async () => {
    const { databasePath } = temporaryDatabase();
    const { service } = openHarness(databasePath);
    const projectId = await createProject(service);
    const created = await service.createDefinitionBrick(createBrick(projectId, "corrupt"));
    expect("revision" in created).toBe(true);
    if (!("revision" in created)) return;
    const original = created.revision;
    const raw = new DatabaseSync(databasePath);
    const exact = () => service.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "corrupt", revision: 1 },
    });
    try {
      raw.exec("PRAGMA ignore_check_constraints = ON");
      raw.prepare(
        "UPDATE definition_brick_revisions SET body_json = ? WHERE revision_uid = ?",
      ).run("{", original.revision_uid);
      expect(await exact()).toEqual(integrityFailure);

      raw.prepare(
        "UPDATE definition_brick_revisions SET body_json = ? WHERE revision_uid = ?",
      ).run(JSON.stringify({ text: "\uFEFFSystem\r\n" }), original.revision_uid);
      expect(await exact()).toEqual(integrityFailure);

      raw.prepare(`
        UPDATE definition_brick_revisions
        SET body_json = ?, digest = ?
        WHERE revision_uid = ?
      `).run(JSON.stringify(original.body), `sha256:${"f".repeat(64)}`, original.revision_uid);
      expect(await exact()).toEqual(integrityFailure);

      raw.exec("PRAGMA foreign_keys = OFF");
      raw.prepare(`
        UPDATE definition_brick_revisions
        SET digest = ?, kind = 'prompt'
        WHERE revision_uid = ?
      `).run(original.digest, original.revision_uid);
      expect(await exact()).toEqual(integrityFailure);

      raw.prepare(`
        UPDATE definition_brick_revisions
        SET kind = ?, revision_uid = 'invalid'
        WHERE revision_uid = ?
      `).run(original.kind, original.revision_uid);
      expect(await exact()).toEqual(integrityFailure);

      raw.prepare(`
        UPDATE definition_brick_aggregates
        SET current_revision = ?
        WHERE project_id = ? AND brick_id = ?
      `).run(Number.MAX_SAFE_INTEGER + 1, projectId, "corrupt");
      expect(await service.readDefinitionBrick({
        project_id: projectId,
        brick_id: "corrupt",
      })).toEqual(integrityFailure);
    } finally {
      raw.close();
    }
  });
});
