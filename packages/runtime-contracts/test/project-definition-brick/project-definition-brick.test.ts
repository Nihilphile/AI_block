import { describe, expect, it } from "vitest";
import {
  ArchiveDefinitionBrickCommandSchema,
  ArchiveDefinitionBrickResultSchema,
  CreateDefinitionBrickCommandSchema,
  CreateDefinitionBrickResultSchema,
  CreateProjectCommandSchema,
  CreateProjectResultSchema,
  DefinitionBrickBodySchema,
  DefinitionBrickIdSchema,
  DefinitionBrickRevisionSchema,
  DefinitionBrickStatusSchema,
  DefinitionBrickSummarySchema,
  ListDefinitionBrickHistoryCommandSchema,
  ListDefinitionBrickHistoryResultSchema,
  ListDefinitionBricksCommandSchema,
  ListDefinitionBricksResultSchema,
  PROJECT_DEFINITION_BRICK_ERROR_CODES,
  ProjectDefinitionBrickErrorSchema,
  ProjectDefinitionBrickErrorCodeSchema,
  ProjectRecordSchema,
  ReadDefinitionBrickCommandSchema,
  ReadDefinitionBrickResultSchema,
  ReadExactDefinitionBrickRevisionCommandSchema,
  ReadExactDefinitionBrickRevisionResultSchema,
  ReadProjectCommandSchema,
  ReadProjectResultSchema,
  ReviseDefinitionBrickCommandSchema,
  ReviseDefinitionBrickResultSchema,
  decodeContract,
} from "../../src/index.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const PROJECT_ID = `project_${UUID}`;
const BRICK_UID = `brick_${UUID}`;
const REVISION_UID = `brickrev_${UUID}`;
const CREATED_AT = "2026-07-26T12:34:56.789Z";
const DIGEST = `sha256:${"a".repeat(64)}`;

const project = { project_id: PROJECT_ID, created_at: CREATED_AT } as const;
const summary = {
  brick_uid: BRICK_UID,
  project_id: PROJECT_ID,
  brick_id: "coder-core",
  kind: "sys_prompt",
  current_revision: 1,
  status: "active",
  created_at: CREATED_AT,
} as const;
const body = { text: "You are a coding worker." } as const;
const revision = {
  revision_uid: REVISION_UID,
  brick_id: "coder-core",
  project_id: PROJECT_ID,
  kind: "sys_prompt",
  revision: 1,
  body,
  digest: DIGEST,
  created_at: CREATED_AT,
} as const;

function expectRoundTrip(schema: Parameters<typeof decodeContract>[0], value: unknown): void {
  const decoded = decodeContract(schema, value);
  expect(decoded.ok).toBe(true);
  if (decoded.ok) expect(decoded.value).toEqual(value);
}

describe("Project and Definition Brick application contracts", () => {
  it("exports strict Project, aggregate, and reused Body values from the package root", () => {
    expectRoundTrip(ProjectRecordSchema, project);
    expectRoundTrip(DefinitionBrickIdSchema, BRICK_UID);
    expectRoundTrip(DefinitionBrickStatusSchema, "archived");
    expectRoundTrip(DefinitionBrickSummarySchema, summary);
    expectRoundTrip(DefinitionBrickBodySchema, body);

    expect(decodeContract(DefinitionBrickIdSchema, `brickrev_${UUID}`).ok).toBe(false);
    expect(decodeContract(DefinitionBrickSummarySchema, { ...summary, brick_uid: "coder-core" }).ok).toBe(false);
    expect(decodeContract(DefinitionBrickSummarySchema, { ...summary, extra: true }).ok).toBe(false);
    expect(decodeContract(DefinitionBrickBodySchema, { text: "valid", unknown: true }).ok).toBe(false);
  });

  it("keeps aggregate identity separate from compatible immutable revision values", () => {
    expectRoundTrip(DefinitionBrickRevisionSchema, revision);
    expect(decodeContract(DefinitionBrickRevisionSchema, { ...revision, brick_uid: BRICK_UID }).ok).toBe(false);
    expect(summary.brick_uid).not.toBe(summary.brick_id);
    expect(summary.brick_uid).not.toBe(revision.revision_uid);
    expect(summary.brick_uid).not.toBe(revision.digest);
  });

  it("decodes strict project commands and result envelopes", () => {
    expectRoundTrip(CreateProjectCommandSchema, {});
    expectRoundTrip(CreateProjectResultSchema, { project });
    expectRoundTrip(ReadProjectCommandSchema, { project_id: PROJECT_ID });
    expectRoundTrip(ReadProjectResultSchema, { project });
    expect(decodeContract(CreateProjectCommandSchema, { activate: true }).ok).toBe(false);
    expect(decodeContract(ReadProjectCommandSchema, { project_id: PROJECT_ID, extra: true }).ok).toBe(false);
  });

  it("decodes all strict Definition Brick commands and summary-propagating results", () => {
    expectRoundTrip(CreateDefinitionBrickCommandSchema, {
      project_id: PROJECT_ID,
      requested_brick_id: "coder-core",
      kind: "sys_prompt",
      body,
    });
    expectRoundTrip(CreateDefinitionBrickResultSchema, { brick: summary, revision });
    expectRoundTrip(ReviseDefinitionBrickCommandSchema, {
      project_id: PROJECT_ID,
      brick_id: "coder-core",
      base_revision: 1,
      kind: "sys_prompt",
      body,
    });
    expectRoundTrip(ReviseDefinitionBrickResultSchema, { brick: summary, revision });
    expectRoundTrip(ArchiveDefinitionBrickCommandSchema, { project_id: PROJECT_ID, brick_id: "coder-core" });
    expectRoundTrip(ArchiveDefinitionBrickResultSchema, { brick: { ...summary, status: "archived" } });
    expectRoundTrip(ReadDefinitionBrickCommandSchema, { project_id: PROJECT_ID, brick_id: "coder-core" });
    expectRoundTrip(ReadDefinitionBrickResultSchema, { brick: summary });
    expectRoundTrip(ListDefinitionBricksCommandSchema, { project_id: PROJECT_ID });
    expectRoundTrip(ListDefinitionBricksResultSchema, { bricks: [summary] });
    expectRoundTrip(ListDefinitionBrickHistoryCommandSchema, { project_id: PROJECT_ID, brick_id: "coder-core" });
    expectRoundTrip(ListDefinitionBrickHistoryResultSchema, { brick: summary, revisions: [revision] });
    expectRoundTrip(ReadExactDefinitionBrickRevisionCommandSchema, {
      project_id: PROJECT_ID,
      ref: { id: "coder-core", revision: 1 },
    });
    expectRoundTrip(ReadExactDefinitionBrickRevisionResultSchema, { brick: summary, revision });

    expect(decodeContract(ReviseDefinitionBrickCommandSchema, {
      project_id: PROJECT_ID,
      brick_id: "coder-core",
      base_revision: 0,
      kind: "sys_prompt",
      body,
    }).ok).toBe(false);
    expect(decodeContract(CreateDefinitionBrickResultSchema, { brick: summary, revision, extra: true }).ok).toBe(false);
  });

  it("exposes only the stable application error vocabulary without retry or driver fields", () => {
    const errors = [
      { code: "project_not_found", category: "not_found" },
      { code: "definition_brick_already_exists", category: "conflict" },
      { code: "definition_brick_not_found", category: "not_found" },
      { code: "definition_brick_revision_not_found", category: "not_found" },
      { code: "definition_brick_revision_conflict", category: "conflict" },
      { code: "definition_brick_archived", category: "conflict" },
      { code: "definition_brick_invalid_candidate", category: "validation" },
      { code: "definition_brick_integrity_error", category: "integrity" },
      { code: "unsupported_schema_version", category: "compatibility" },
      { code: "persistence_failure", category: "persistence" },
    ] as const;

    expect(PROJECT_DEFINITION_BRICK_ERROR_CODES).toEqual(errors.map((error) => error.code));
    for (const error of errors) {
      expectRoundTrip(ProjectDefinitionBrickErrorCodeSchema, error.code);
      expectRoundTrip(ProjectDefinitionBrickErrorSchema, error);
    }
    expect(decodeContract(ProjectDefinitionBrickErrorSchema, {
      code: "project_not_found",
      category: "not_found",
      retryable: false,
    }).ok).toBe(false);
    expect(decodeContract(ProjectDefinitionBrickErrorSchema, {
      code: "project_not_found",
      category: "conflict",
    }).ok).toBe(false);
  });
});
