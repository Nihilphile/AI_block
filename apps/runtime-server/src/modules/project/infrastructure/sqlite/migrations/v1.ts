import type { DatabaseSync } from "node:sqlite";

export const PROJECT_SCHEMA_VERSION = 1;

export const PROJECT_SCHEMA_V1_OBJECTS = [
  {
    type: "table",
    name: "project_schema_migrations",
    sql: `CREATE TABLE project_schema_migrations (
      version INTEGER PRIMARY KEY CHECK(version >= 1)
    ) STRICT`,
  },
  {
    type: "table",
    name: "projects",
    sql: `CREATE TABLE projects (
      project_id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    ) STRICT`,
  },
  {
    type: "table",
    name: "definition_brick_aggregates",
    sql: `CREATE TABLE definition_brick_aggregates (
      brick_uid TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      brick_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('sys_prompt', 'prompt', 'backend', 'toolset', 'runtime_config')),
      current_revision INTEGER NOT NULL CHECK(current_revision >= 1),
      status TEXT NOT NULL CHECK(status IN ('active', 'archived')),
      created_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(project_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
      UNIQUE(project_id, brick_id),
      UNIQUE(brick_uid, project_id, brick_id, kind)
    ) STRICT`,
  },
  {
    type: "table",
    name: "definition_brick_revisions",
    sql: `CREATE TABLE definition_brick_revisions (
      revision_uid TEXT PRIMARY KEY,
      brick_uid TEXT NOT NULL,
      project_id TEXT NOT NULL,
      brick_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('sys_prompt', 'prompt', 'backend', 'toolset', 'runtime_config')),
      revision INTEGER NOT NULL CHECK(revision >= 1),
      body_json TEXT NOT NULL CHECK(length(body_json) > 0 AND json_valid(body_json)),
      digest TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(brick_uid, project_id, brick_id, kind)
        REFERENCES definition_brick_aggregates(brick_uid, project_id, brick_id, kind)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
      UNIQUE(brick_uid, revision)
    ) STRICT`,
  },
  {
    type: "index",
    name: "definition_brick_revisions_exact",
    sql: `CREATE INDEX definition_brick_revisions_exact
      ON definition_brick_revisions(project_id, brick_id, revision)`,
  },
] as const;

export class UnsupportedProjectSchemaError extends Error {}

type SchemaObjectRow = Readonly<{
  type: unknown;
  name: unknown;
  sql: unknown;
}>;

function normalizeSql(sql: string): string {
  return sql.replaceAll(/\s+/g, " ").trim();
}

function schemaObjects(database: DatabaseSync): readonly SchemaObjectRow[] {
  return database.prepare(`
    SELECT type, name, sql
    FROM sqlite_schema
    WHERE name NOT LIKE 'sqlite_%'
    ORDER BY type, name
  `).all() as unknown as readonly SchemaObjectRow[];
}

function isStructurallyEmpty(database: DatabaseSync): boolean {
  return schemaObjects(database).length === 0;
}

function validateSchema(database: DatabaseSync): void {
  const expected = [...PROJECT_SCHEMA_V1_OBJECTS]
    .sort((left, right) => left.type.localeCompare(right.type) || left.name.localeCompare(right.name));
  const actual = schemaObjects(database);
  if (actual.length !== expected.length) {
    throw new UnsupportedProjectSchemaError("schema object count mismatch");
  }
  for (let index = 0; index < expected.length; index += 1) {
    const wanted = expected[index];
    const found = actual[index];
    if (
      found?.type !== wanted?.type
      || found.name !== wanted.name
      || typeof found.sql !== "string"
      || normalizeSql(found.sql) !== normalizeSql(wanted.sql)
    ) {
      throw new UnsupportedProjectSchemaError("schema object mismatch");
    }
  }

  const versions = database.prepare(
    "SELECT version FROM project_schema_migrations ORDER BY version",
  ).all();
  if (versions.length !== 1 || versions[0]?.version !== 1n) {
    throw new UnsupportedProjectSchemaError("unsupported schema version");
  }
}

function initializeProjectSchemaV1Unchecked(database: DatabaseSync): void {
  if (isStructurallyEmpty(database)) {
    try {
      database.exec("BEGIN IMMEDIATE");
      if (!isStructurallyEmpty(database)) {
        throw new UnsupportedProjectSchemaError("schema appeared during bootstrap");
      }
      for (const object of PROJECT_SCHEMA_V1_OBJECTS) {
        database.exec(object.sql);
      }
      database.prepare(
        "INSERT INTO project_schema_migrations(version) VALUES ($version)",
      ).run({ $version: PROJECT_SCHEMA_VERSION });
      database.exec("COMMIT");
    } catch (error) {
      try {
        database.exec("ROLLBACK");
      } catch {
        // Rollback is best-effort; initialization still fails closed.
      }
      if (error instanceof UnsupportedProjectSchemaError) throw error;
      throw new UnsupportedProjectSchemaError("schema bootstrap failed");
    }
  }

  validateSchema(database);
}

export function initializeProjectSchemaV1(database: DatabaseSync): void {
  try {
    initializeProjectSchemaV1Unchecked(database);
  } catch (error) {
    if (error instanceof UnsupportedProjectSchemaError) throw error;
    throw new UnsupportedProjectSchemaError("schema initialization failed");
  }
}
