import { statSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const PROJECT_SQLITE_BUSY_TIMEOUT_MS = 250;

export type ProjectSqliteConfiguration = Readonly<{
  databasePath: string;
}>;

export type ConfiguredProjectSqliteDatabase = Readonly<{
  canonicalPath: string;
  database: DatabaseSync;
}>;

export class ProjectSqliteConfigurationError extends Error {}

function canonicalDatabasePath(databasePath: string): string {
  if (
    databasePath.length === 0
    || databasePath === ":memory:"
    || !isAbsolute(databasePath)
  ) {
    throw new ProjectSqliteConfigurationError("invalid database path");
  }

  const parentPath = realpathSync(dirname(databasePath));
  if (!statSync(parentPath).isDirectory()) {
    throw new ProjectSqliteConfigurationError("database parent is not a directory");
  }

  try {
    const target = statSync(databasePath);
    if (!target.isFile()) {
      throw new ProjectSqliteConfigurationError("database path is not a file");
    }
    return realpathSync(databasePath);
  } catch (error) {
    if (error instanceof ProjectSqliteConfigurationError) throw error;
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
    return join(parentPath, basename(databasePath));
  }
}

function verifyConnectionSettings(database: DatabaseSync): void {
  database.enableLoadExtension(false);
  database.enableDefensive(true);

  const foreignKeys = database.prepare("PRAGMA foreign_keys").get();
  if (foreignKeys?.foreign_keys !== 1n) {
    throw new ProjectSqliteConfigurationError("foreign keys are not enabled");
  }

  const integerProbe = database.prepare("SELECT CAST(1 AS INTEGER) AS value").get();
  if (integerProbe?.value !== 1n) {
    throw new ProjectSqliteConfigurationError("safe integer reads are not enabled");
  }

  database.exec("PRAGMA writable_schema = ON");
  const defensiveProbe = database.prepare("PRAGMA writable_schema").get();
  if (defensiveProbe?.writable_schema !== 0n) {
    throw new ProjectSqliteConfigurationError("defensive mode is not enabled");
  }

  let extensionEnableWasRejected = false;
  try {
    database.enableLoadExtension(true);
  } catch {
    extensionEnableWasRejected = true;
  } finally {
    database.enableLoadExtension(false);
  }
  if (!extensionEnableWasRejected) {
    throw new ProjectSqliteConfigurationError("extension loading is not locked down");
  }
}

export function openConfiguredProjectSqliteDatabase(
  configuration: ProjectSqliteConfiguration,
): ConfiguredProjectSqliteDatabase {
  if (
    typeof configuration !== "object"
    || configuration === null
    || Object.keys(configuration).length !== 1
    || typeof configuration.databasePath !== "string"
  ) {
    throw new ProjectSqliteConfigurationError("invalid configuration");
  }

  const canonicalPath = canonicalDatabasePath(configuration.databasePath);
  const database = new DatabaseSync(canonicalPath, {
    allowExtension: false,
    enableForeignKeyConstraints: true,
    defensive: true,
    readBigInts: true,
    allowBareNamedParameters: false,
    allowUnknownNamedParameters: false,
    timeout: PROJECT_SQLITE_BUSY_TIMEOUT_MS,
  });

  try {
    verifyConnectionSettings(database);
    return { canonicalPath, database };
  } catch (error) {
    try {
      database.close();
    } catch {
      // The startup error remains authoritative.
    }
    throw error;
  }
}
