import Type from "typebox";
import {
  ActorConfigSnapshotIdSchema,
  ActorTemplateIdSchema,
  BrickKindSchema,
  CanonicalTimestampSchema,
  ContractSchemaVersionSchema,
  DefinitionBrickDigestSchema,
  DefinitionBrickRevisionIdSchema,
  HumanReadableIdSchema,
  PositiveRevisionSchema,
  ProjectIdSchema,
} from "../identity/identity.js";
import {
  BrickPromptBodySchema,
  BrickSysPromptBodySchema,
} from "../brick/schemas.js";
import {
  BackendAdapterIdSchema,
  ToolProviderIdSchema,
} from "../actor/schemas.js";

const JSON_KEY_PATTERN = "^[\\s\\S]*$";

// --- Schema version ---

export const ACTOR_TEMPLATE_SPEC_SCHEMA_VERSION = "1.0.0" as const;
export const ActorTemplateSpecSchemaVersionSchema = Type.Literal(ACTOR_TEMPLATE_SPEC_SCHEMA_VERSION);
export type ActorTemplateSpecSchemaVersion = Type.Static<typeof ActorTemplateSpecSchemaVersionSchema>;

// --- Exact Brick references ---

export const ExactBrickRefSchema = Type.Object(
  {
    id: HumanReadableIdSchema,
    revision: PositiveRevisionSchema,
  },
  { additionalProperties: false },
);
export type ExactBrickRef = Type.Static<typeof ExactBrickRefSchema>;

export const ResolvedBrickRefSchema = Type.Object(
  {
    uid: DefinitionBrickRevisionIdSchema,
    digest: DefinitionBrickDigestSchema,
  },
  { additionalProperties: false },
);
export type ResolvedBrickRef = Type.Static<typeof ResolvedBrickRefSchema>;

// --- Definition Brick Body schemas (from actor-template domain) ---

const OpaqueJsonObjectSchema = Type.Record(
  Type.String({ pattern: JSON_KEY_PATTERN }),
  Type.Unknown(),
);

export const BackendBrickBodySchema = Type.Object(
  {
    adapter_id: BackendAdapterIdSchema,
    model_id: Type.String({ minLength: 1 }),
    config: OpaqueJsonObjectSchema,
  },
  { additionalProperties: false },
);
export type BackendBrickBody = Type.Static<typeof BackendBrickBodySchema>;

export const ToolProviderBrickConfigSchema = Type.Object(
  {
    provider_id: ToolProviderIdSchema,
    config: OpaqueJsonObjectSchema,
  },
  { additionalProperties: false },
);
export type ToolProviderBrickConfig = Type.Static<typeof ToolProviderBrickConfigSchema>;

export const ToolsetBrickBodySchema = Type.Object(
  {
    providers: Type.Array(ToolProviderBrickConfigSchema),
  },
  { additionalProperties: false },
);
export type ToolsetBrickBody = Type.Static<typeof ToolsetBrickBodySchema>;

export const RuntimeConfigBrickBodySchema = Type.Object(
  {
    workspace: Type.Object(
      {
        root_id: HumanReadableIdSchema,
        relative_working_directory: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type RuntimeConfigBrickBody = Type.Static<typeof RuntimeConfigBrickBodySchema>;

// --- Registered Definition Brick revision (resolver output) ---

const DefinitionBrickBodySchema = Type.Union([
  BrickSysPromptBodySchema,
  BrickPromptBodySchema,
  BackendBrickBodySchema,
  ToolsetBrickBodySchema,
  RuntimeConfigBrickBodySchema,
]);

export const DefinitionBrickRevisionSchema = Type.Object(
  {
    revision_uid: DefinitionBrickRevisionIdSchema,
    brick_id: HumanReadableIdSchema,
    project_id: ProjectIdSchema,
    kind: BrickKindSchema,
    revision: PositiveRevisionSchema,
    body: DefinitionBrickBodySchema,
    digest: DefinitionBrickDigestSchema,
    created_at: CanonicalTimestampSchema,
  },
  { additionalProperties: false },
);
export type DefinitionBrickRevision = Type.Static<typeof DefinitionBrickRevisionSchema>;

// --- ActorTemplate spec ---

const SystemPromptBrickRefSchema = Type.Object(
  { ref: ExactBrickRefSchema },
  { additionalProperties: false },
);

const BackendBrickRefSchema = Type.Object(
  { ref: ExactBrickRefSchema },
  { additionalProperties: false },
);

const ToolsetBrickRefSchema = Type.Object(
  { ref: ExactBrickRefSchema },
  { additionalProperties: false },
);

const RuntimeConfigBrickRefSchema = Type.Object(
  { ref: ExactBrickRefSchema },
  { additionalProperties: false },
);

export const ActorTemplateLabelsSchema = Type.Record(
  Type.String({ pattern: JSON_KEY_PATTERN, maxLength: 128 }),
  Type.String({ minLength: 1, maxLength: 256 }),
);

export const ActorTemplateSpecSchema = Type.Object(
  {
    schema_version: ActorTemplateSpecSchemaVersionSchema,
    kind: Type.Literal("actor_template_spec"),
    metadata: Type.Object(
      {
        display_name: Type.String({ minLength: 1 }),
        description: Type.String({ minLength: 0 }),
        labels: ActorTemplateLabelsSchema,
      },
      { additionalProperties: false },
    ),
    spec: Type.Object(
      {
        system_prompt: Type.Object(
          { bricks: Type.Array(SystemPromptBrickRefSchema) },
          { additionalProperties: false },
        ),
        initial_prompt: Type.Object(
          { bricks: Type.Array(SystemPromptBrickRefSchema) },
          { additionalProperties: false },
        ),
        backend: BackendBrickRefSchema,
        toolset: ToolsetBrickRefSchema,
        runtime_config: RuntimeConfigBrickRefSchema,
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type ActorTemplateSpec = Type.Static<typeof ActorTemplateSpecSchema>;

// --- Resolved spec (with both authored and resolved refs) ---

const ResolvedBrickEntrySchema = Type.Object(
  {
    ref: ExactBrickRefSchema,
    resolved: ResolvedBrickRefSchema,
  },
  { additionalProperties: false },
);

// --- Validation ---

export const ACTOR_TEMPLATE_VALIDATION_ISSUE_CODES = [
  "missing_required_component",
  "duplicate_brick_ref",
  "ref_not_found",
  "brick_kind_mismatch",
  "backend_config_invalid",
  "tool_provider_invalid",
  "backend_toolset_incompatible",
  "workspace_root_not_found",
  "workspace_path_escape",
  "unsupported_schema_version",
  "unknown_field",
  "schema_invalid",
] as const;

export const ValidationIssueCodeSchema = Type.Union(
  ACTOR_TEMPLATE_VALIDATION_ISSUE_CODES.map((code) => Type.Literal(code)),
);
export type ValidationIssueCode = Type.Static<typeof ValidationIssueCodeSchema>;

export const ValidationIssueSchema = Type.Object(
  {
    code: ValidationIssueCodeSchema,
    path: Type.String({ minLength: 1 }),
    resource_id: Type.Optional(HumanReadableIdSchema),
    revision: Type.Optional(PositiveRevisionSchema),
    expected_kind: Type.Optional(BrickKindSchema),
    actual_kind: Type.Optional(BrickKindSchema),
    provider_id: Type.Optional(ToolProviderIdSchema),
  },
  { additionalProperties: false },
);
export type ValidationIssue = Type.Static<typeof ValidationIssueSchema>;

export const TemplateRevisionDigestSchema = Type.String({ pattern: "^sha256:[0-9a-f]{64}$" });
export type TemplateRevisionDigest = Type.Static<typeof TemplateRevisionDigestSchema>;

export const ConfigDigestSchema = Type.String({ pattern: "^sha256:[0-9a-f]{64}$" });
export type ConfigDigest = Type.Static<typeof ConfigDigestSchema>;

// --- Template revision view ---

export const ActorTemplateRevisionViewSchema = Type.Object(
  {
    template_uid: ActorTemplateIdSchema,
    template_id: HumanReadableIdSchema,
    project_id: ProjectIdSchema,
    revision: PositiveRevisionSchema,
    revision_digest: TemplateRevisionDigestSchema,
    config_digest: ConfigDigestSchema,
    metadata: Type.Object(
      {
        display_name: Type.String({ minLength: 1 }),
        description: Type.String({ minLength: 0 }),
        labels: ActorTemplateLabelsSchema,
      },
      { additionalProperties: false },
    ),
    spec: Type.Object(
      {
        system_prompt: Type.Object(
          { bricks: Type.Array(ResolvedBrickEntrySchema) },
          { additionalProperties: false },
        ),
        initial_prompt: Type.Object(
          { bricks: Type.Array(ResolvedBrickEntrySchema) },
          { additionalProperties: false },
        ),
        backend: ResolvedBrickEntrySchema,
        toolset: ResolvedBrickEntrySchema,
        runtime_config: ResolvedBrickEntrySchema,
      },
      { additionalProperties: false },
    ),
    status: Type.Union([Type.Literal("active"), Type.Literal("archived")]),
    created_at: CanonicalTimestampSchema,
  },
  { additionalProperties: false },
);
export type ActorTemplateRevisionView = Type.Static<typeof ActorTemplateRevisionViewSchema>;

export const ActorTemplateSummarySchema = Type.Object(
  {
    template_uid: ActorTemplateIdSchema,
    template_id: HumanReadableIdSchema,
    project_id: ProjectIdSchema,
    display_name: Type.String({ minLength: 1 }),
    current_revision: PositiveRevisionSchema,
    status: Type.Union([Type.Literal("active"), Type.Literal("archived")]),
    created_at: CanonicalTimestampSchema,
  },
  { additionalProperties: false },
);
export type ActorTemplateSummary = Type.Static<typeof ActorTemplateSummarySchema>;

export const ActorTemplateRevisionSummarySchema = Type.Object(
  {
    revision: PositiveRevisionSchema,
    revision_digest: TemplateRevisionDigestSchema,
    config_digest: ConfigDigestSchema,
    status: Type.Union([Type.Literal("active"), Type.Literal("archived")]),
    created_at: CanonicalTimestampSchema,
  },
  { additionalProperties: false },
);
export type ActorTemplateRevisionSummary = Type.Static<typeof ActorTemplateRevisionSummarySchema>;

// --- Snapshot ---

const SnapshotBrickEntrySchema = Type.Object(
  {
    slot: BrickKindSchema,
    order: Type.Optional(Type.Integer({ minimum: 0 })),
    revision_uid: DefinitionBrickRevisionIdSchema,
    digest: DefinitionBrickDigestSchema,
  },
  { additionalProperties: false },
);

const SnapshotResolvedBackendSchema = Type.Object(
  {
    adapter_id: BackendAdapterIdSchema,
    model_id: Type.String({ minLength: 1 }),
    config: OpaqueJsonObjectSchema,
  },
  { additionalProperties: false },
);

const SnapshotToolProviderSchema = Type.Object(
  {
    provider_id: ToolProviderIdSchema,
    config: OpaqueJsonObjectSchema,
  },
  { additionalProperties: false },
);

export const ActorConfigSnapshotSchema = Type.Object(
  {
    head: Type.Object(
      {
        snapshot_id: ActorConfigSnapshotIdSchema,
        project_id: ProjectIdSchema,
        source_template: Type.Object(
          {
            template_uid: ActorTemplateIdSchema,
            human_readable_id: HumanReadableIdSchema,
            revision: PositiveRevisionSchema,
            revision_digest: TemplateRevisionDigestSchema,
          },
          { additionalProperties: false },
        ),
        config_digest: ConfigDigestSchema,
        created_at: CanonicalTimestampSchema,
      },
      { additionalProperties: false },
    ),
    source_bricks: Type.Array(SnapshotBrickEntrySchema),
    resolved: Type.Object(
      {
        system_prompts: Type.Array(BrickSysPromptBodySchema),
        initial_prompts: Type.Array(BrickPromptBodySchema),
        backend: SnapshotResolvedBackendSchema,
        tool_providers: Type.Array(SnapshotToolProviderSchema),
        working_directory: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type ActorConfigSnapshot = Type.Static<typeof ActorConfigSnapshotSchema>;

// --- Domain command shapes ---

export const ValidateActorTemplateCandidateSchema = Type.Object(
  {
    project_id: ProjectIdSchema,
    requested_template_id: HumanReadableIdSchema,
    operation: Type.Union([Type.Literal("create"), Type.Literal("revise")]),
    base_revision: Type.Optional(PositiveRevisionSchema),
    spec: ActorTemplateSpecSchema,
  },
  { additionalProperties: false },
);
export type ValidateActorTemplateCandidate = Type.Static<
  typeof ValidateActorTemplateCandidateSchema
>;

export const CreateActorTemplateCommandSchema = Type.Object(
  {
    project_id: ProjectIdSchema,
    requested_template_id: HumanReadableIdSchema,
    spec: ActorTemplateSpecSchema,
  },
  { additionalProperties: false },
);
export type CreateActorTemplateCommand = Type.Static<
  typeof CreateActorTemplateCommandSchema
>;

export const ReviseActorTemplateCommandSchema = Type.Object(
  {
    project_id: ProjectIdSchema,
    template_id: HumanReadableIdSchema,
    base_revision: PositiveRevisionSchema,
    spec: ActorTemplateSpecSchema,
  },
  { additionalProperties: false },
);
export type ReviseActorTemplateCommand = Type.Static<
  typeof ReviseActorTemplateCommandSchema
>;

// --- Validation reports and operation results ---

export const ActorTemplateValidationReportSchema = Type.Union([
  Type.Object(
    {
      valid: Type.Literal(true),
      issues: Type.Array(ValidationIssueSchema, { maxItems: 0 }),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      valid: Type.Literal(false),
      issues: Type.Array(ValidationIssueSchema, { minItems: 1 }),
    },
    { additionalProperties: false },
  ),
]);
export type ActorTemplateValidationReport = Type.Static<typeof ActorTemplateValidationReportSchema>;

export const ActorTemplateValidationFailedDetailsSchema = Type.Object(
  {
    report: ActorTemplateValidationReportSchema,
  },
  { additionalProperties: false },
);
export type ActorTemplateValidationFailedDetails = Type.Static<
  typeof ActorTemplateValidationFailedDetailsSchema
>;

export const ValidateActorTemplateCandidateResultSchema = Type.Object(
  {
    report: ActorTemplateValidationReportSchema,
  },
  { additionalProperties: false },
);
export type ValidateActorTemplateCandidateResult = Type.Static<
  typeof ValidateActorTemplateCandidateResultSchema
>;

const ActorTemplateRevisionResultSchema = Type.Object(
  {
    revision: ActorTemplateRevisionViewSchema,
  },
  { additionalProperties: false },
);

export const CreateActorTemplateResultSchema = ActorTemplateRevisionResultSchema;
export type CreateActorTemplateResult = Type.Static<typeof CreateActorTemplateResultSchema>;

export const ReviseActorTemplateResultSchema = ActorTemplateRevisionResultSchema;
export type ReviseActorTemplateResult = Type.Static<typeof ReviseActorTemplateResultSchema>;
