import Type from "typebox";
import {
  BrickKindSchema,
  CanonicalTimestampSchema,
  DefinitionBrickIdSchema,
  HumanReadableIdSchema,
  PositiveRevisionSchema,
  ProjectIdSchema,
} from "../identity/identity.js";
import {
  DefinitionBrickBodySchema,
  DefinitionBrickRevisionSchema,
  ExactBrickRefSchema,
} from "../actor-template/schemas.js";

const strict = { additionalProperties: false } as const;

export const DefinitionBrickStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("archived"),
]);
export type DefinitionBrickStatus = Type.Static<typeof DefinitionBrickStatusSchema>;

export const ProjectRecordSchema = Type.Object(
  {
    project_id: ProjectIdSchema,
    created_at: CanonicalTimestampSchema,
  },
  strict,
);
export type ProjectRecord = Type.Static<typeof ProjectRecordSchema>;

export const DefinitionBrickSummarySchema = Type.Object(
  {
    brick_uid: DefinitionBrickIdSchema,
    project_id: ProjectIdSchema,
    brick_id: HumanReadableIdSchema,
    kind: BrickKindSchema,
    current_revision: PositiveRevisionSchema,
    status: DefinitionBrickStatusSchema,
    created_at: CanonicalTimestampSchema,
  },
  strict,
);
export type DefinitionBrickSummary = Type.Static<typeof DefinitionBrickSummarySchema>;

export const PROJECT_DEFINITION_BRICK_ERROR_CODES = [
  "project_not_found",
  "definition_brick_already_exists",
  "definition_brick_not_found",
  "definition_brick_revision_not_found",
  "definition_brick_revision_conflict",
  "definition_brick_archived",
  "definition_brick_invalid_candidate",
  "definition_brick_integrity_error",
  "unsupported_schema_version",
  "persistence_failure",
] as const;

export const ProjectDefinitionBrickErrorCodeSchema = Type.Union(
  PROJECT_DEFINITION_BRICK_ERROR_CODES.map((code) => Type.Literal(code)),
);
export type ProjectDefinitionBrickErrorCode = Type.Static<typeof ProjectDefinitionBrickErrorCodeSchema>;

const projectNotFoundError = Type.Object(
  { code: Type.Literal("project_not_found"), category: Type.Literal("not_found") },
  strict,
);
const definitionBrickAlreadyExistsError = Type.Object(
  { code: Type.Literal("definition_brick_already_exists"), category: Type.Literal("conflict") },
  strict,
);
const definitionBrickNotFoundError = Type.Object(
  { code: Type.Literal("definition_brick_not_found"), category: Type.Literal("not_found") },
  strict,
);
const definitionBrickRevisionNotFoundError = Type.Object(
  { code: Type.Literal("definition_brick_revision_not_found"), category: Type.Literal("not_found") },
  strict,
);
const definitionBrickRevisionConflictError = Type.Object(
  { code: Type.Literal("definition_brick_revision_conflict"), category: Type.Literal("conflict") },
  strict,
);
const definitionBrickArchivedError = Type.Object(
  { code: Type.Literal("definition_brick_archived"), category: Type.Literal("conflict") },
  strict,
);
const definitionBrickInvalidCandidateError = Type.Object(
  { code: Type.Literal("definition_brick_invalid_candidate"), category: Type.Literal("validation") },
  strict,
);
const definitionBrickIntegrityError = Type.Object(
  { code: Type.Literal("definition_brick_integrity_error"), category: Type.Literal("integrity") },
  strict,
);
const unsupportedSchemaVersionError = Type.Object(
  { code: Type.Literal("unsupported_schema_version"), category: Type.Literal("compatibility") },
  strict,
);
const persistenceFailureError = Type.Object(
  { code: Type.Literal("persistence_failure"), category: Type.Literal("persistence") },
  strict,
);

export const ProjectDefinitionBrickErrorSchema = Type.Union([
  projectNotFoundError,
  definitionBrickAlreadyExistsError,
  definitionBrickNotFoundError,
  definitionBrickRevisionNotFoundError,
  definitionBrickRevisionConflictError,
  definitionBrickArchivedError,
  definitionBrickInvalidCandidateError,
  definitionBrickIntegrityError,
  unsupportedSchemaVersionError,
  persistenceFailureError,
]);
export type ProjectDefinitionBrickError = Type.Static<typeof ProjectDefinitionBrickErrorSchema>;

const errorResult = Type.Object({ error: ProjectDefinitionBrickErrorSchema }, strict);

export const CreateProjectCommandSchema = Type.Object({}, strict);
export type CreateProjectCommand = Type.Static<typeof CreateProjectCommandSchema>;

export const CreateProjectResultSchema = Type.Union([
  Type.Object({ project: ProjectRecordSchema }, strict),
  errorResult,
]);
export type CreateProjectResult = Type.Static<typeof CreateProjectResultSchema>;

export const ReadProjectCommandSchema = Type.Object({ project_id: ProjectIdSchema }, strict);
export type ReadProjectCommand = Type.Static<typeof ReadProjectCommandSchema>;

export const ReadProjectResultSchema = Type.Union([
  Type.Object({ project: ProjectRecordSchema }, strict),
  errorResult,
]);
export type ReadProjectResult = Type.Static<typeof ReadProjectResultSchema>;

export const CreateDefinitionBrickCommandSchema = Type.Object(
  {
    project_id: ProjectIdSchema,
    requested_brick_id: HumanReadableIdSchema,
    kind: BrickKindSchema,
    body: DefinitionBrickBodySchema,
  },
  strict,
);
export type CreateDefinitionBrickCommand = Type.Static<typeof CreateDefinitionBrickCommandSchema>;

export const CreateDefinitionBrickResultSchema = Type.Union([
  Type.Object({ brick: DefinitionBrickSummarySchema, revision: DefinitionBrickRevisionSchema }, strict),
  errorResult,
]);
export type CreateDefinitionBrickResult = Type.Static<typeof CreateDefinitionBrickResultSchema>;

export const ReviseDefinitionBrickCommandSchema = Type.Object(
  {
    project_id: ProjectIdSchema,
    brick_id: HumanReadableIdSchema,
    base_revision: PositiveRevisionSchema,
    kind: BrickKindSchema,
    body: DefinitionBrickBodySchema,
  },
  strict,
);
export type ReviseDefinitionBrickCommand = Type.Static<typeof ReviseDefinitionBrickCommandSchema>;

export const ReviseDefinitionBrickResultSchema = Type.Union([
  Type.Object({ brick: DefinitionBrickSummarySchema, revision: DefinitionBrickRevisionSchema }, strict),
  errorResult,
]);
export type ReviseDefinitionBrickResult = Type.Static<typeof ReviseDefinitionBrickResultSchema>;

export const ArchiveDefinitionBrickCommandSchema = Type.Object(
  { project_id: ProjectIdSchema, brick_id: HumanReadableIdSchema },
  strict,
);
export type ArchiveDefinitionBrickCommand = Type.Static<typeof ArchiveDefinitionBrickCommandSchema>;

export const ArchiveDefinitionBrickResultSchema = Type.Union([
  Type.Object({ brick: DefinitionBrickSummarySchema }, strict),
  errorResult,
]);
export type ArchiveDefinitionBrickResult = Type.Static<typeof ArchiveDefinitionBrickResultSchema>;

export const ReadDefinitionBrickCommandSchema = Type.Object(
  { project_id: ProjectIdSchema, brick_id: HumanReadableIdSchema },
  strict,
);
export type ReadDefinitionBrickCommand = Type.Static<typeof ReadDefinitionBrickCommandSchema>;

export const ReadDefinitionBrickResultSchema = Type.Union([
  Type.Object({ brick: DefinitionBrickSummarySchema }, strict),
  errorResult,
]);
export type ReadDefinitionBrickResult = Type.Static<typeof ReadDefinitionBrickResultSchema>;

export const ListDefinitionBricksCommandSchema = Type.Object({ project_id: ProjectIdSchema }, strict);
export type ListDefinitionBricksCommand = Type.Static<typeof ListDefinitionBricksCommandSchema>;

export const ListDefinitionBricksResultSchema = Type.Union([
  Type.Object({ bricks: Type.Array(DefinitionBrickSummarySchema) }, strict),
  errorResult,
]);
export type ListDefinitionBricksResult = Type.Static<typeof ListDefinitionBricksResultSchema>;

export const ListDefinitionBrickHistoryCommandSchema = Type.Object(
  { project_id: ProjectIdSchema, brick_id: HumanReadableIdSchema },
  strict,
);
export type ListDefinitionBrickHistoryCommand = Type.Static<typeof ListDefinitionBrickHistoryCommandSchema>;

export const ListDefinitionBrickHistoryResultSchema = Type.Union([
  Type.Object({ brick: DefinitionBrickSummarySchema, revisions: Type.Array(DefinitionBrickRevisionSchema) }, strict),
  errorResult,
]);
export type ListDefinitionBrickHistoryResult = Type.Static<typeof ListDefinitionBrickHistoryResultSchema>;

export const ReadExactDefinitionBrickRevisionCommandSchema = Type.Object(
  { project_id: ProjectIdSchema, ref: ExactBrickRefSchema },
  strict,
);
export type ReadExactDefinitionBrickRevisionCommand = Type.Static<typeof ReadExactDefinitionBrickRevisionCommandSchema>;

export const ReadExactDefinitionBrickRevisionResultSchema = Type.Union([
  Type.Object({ brick: DefinitionBrickSummarySchema, revision: DefinitionBrickRevisionSchema }, strict),
  errorResult,
]);
export type ReadExactDefinitionBrickRevisionResult = Type.Static<typeof ReadExactDefinitionBrickRevisionResultSchema>;
