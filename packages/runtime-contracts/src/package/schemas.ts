import Type from "typebox";
import {
  ActorIdSchema,
  CanonicalTimestampSchema,
  ClientPrincipalIdSchema,
  DeliveryIdSchema,
  InvocationIdSchema,
  PackageIdSchema,
  ProjectIdSchema,
  RunIdSchema,
} from "../identity/identity.js";
import { BrickPromptSchema } from "../brick/schemas.js";

export const PACKAGE_SCHEMA_VERSION = "1.0.0" as const;
export const PackageSchemaVersionSchema = Type.Literal(PACKAGE_SCHEMA_VERSION);
export type PackageSchemaVersion = Type.Static<typeof PackageSchemaVersionSchema>;

export const PackageTypeSchema = Type.Union([
  Type.Literal("task"),
  Type.Literal("request"),
  Type.Literal("artifact"),
  Type.Literal("report"),
  Type.Literal("summary"),
  Type.Literal("result"),
  Type.Literal("error"),
  Type.Literal("state_patch"),
]);
export type PackageType = Type.Static<typeof PackageTypeSchema>;

export const ContentHashSchema = Type.String({ pattern: "^sha256:[0-9a-f]{64}$" });
export type ContentHash = Type.Static<typeof ContentHashSchema>;

export const PackageRefSchema = Type.Object(
  {
    package_id: PackageIdSchema,
    content_hash: ContentHashSchema,
  },
  { additionalProperties: false },
);
export type PackageRef = Type.Static<typeof PackageRefSchema>;

const clientPackageCreatorSchema = Type.Object(
  {
    kind: Type.Literal("client"),
    client_id: ClientPrincipalIdSchema,
  },
  { additionalProperties: false },
);
const actorPackageCreatorSchema = Type.Object(
  {
    kind: Type.Literal("actor"),
    actor_id: ActorIdSchema,
  },
  { additionalProperties: false },
);
const runtimePackageCreatorSchema = Type.Object(
  {
    kind: Type.Literal("runtime"),
  },
  { additionalProperties: false },
);

export const PackageCreatorSchema = Type.Union([
  clientPackageCreatorSchema,
  actorPackageCreatorSchema,
  runtimePackageCreatorSchema,
]);
export type PackageCreator = Type.Static<typeof PackageCreatorSchema>;

const parentRefs = Type.Array(PackageRefSchema);
const parentOnlyProvenanceSchema = Type.Object(
  { parent_refs: parentRefs },
  { additionalProperties: false },
);
const runProvenanceSchema = Type.Object(
  {
    parent_refs: parentRefs,
    run_id: RunIdSchema,
  },
  { additionalProperties: false },
);
const invocationProvenanceSchema = Type.Object(
  {
    parent_refs: parentRefs,
    run_id: RunIdSchema,
    invocation_id: InvocationIdSchema,
  },
  { additionalProperties: false },
);

export const PackageProvenanceSchema = Type.Union([
  parentOnlyProvenanceSchema,
  runProvenanceSchema,
  invocationProvenanceSchema,
]);
export type PackageProvenance = Type.Static<typeof PackageProvenanceSchema>;

export const PackageHeadSchema = Type.Object(
  {
    package_id: PackageIdSchema,
    package_type: PackageTypeSchema,
    schema_version: PackageSchemaVersionSchema,
    project_id: ProjectIdSchema,
    created_by: PackageCreatorSchema,
    created_at: CanonicalTimestampSchema,
    content_hash: ContentHashSchema,
    provenance: PackageProvenanceSchema,
  },
  { additionalProperties: false },
);
export type PackageHead = Type.Static<typeof PackageHeadSchema>;

const PackageHashMaterialHeadSchema = Type.Object(
  {
    package_id: PackageIdSchema,
    package_type: PackageTypeSchema,
    schema_version: PackageSchemaVersionSchema,
    project_id: ProjectIdSchema,
    created_by: PackageCreatorSchema,
    created_at: CanonicalTimestampSchema,
    provenance: PackageProvenanceSchema,
  },
  { additionalProperties: false },
);

export const PackageHashMaterialSchema = Type.Object(
  {
    head: PackageHashMaterialHeadSchema,
    body: BrickPromptSchema,
  },
  { additionalProperties: false },
);
export type PackageHashMaterial = Type.Static<typeof PackageHashMaterialSchema>;

export const PackageSchema = Type.Object(
  {
    head: PackageHeadSchema,
    body: BrickPromptSchema,
  },
  { additionalProperties: false },
);
export type Package = Type.Static<typeof PackageSchema>;

export const DeliveryStateSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("delivered"),
  Type.Literal("acknowledged"),
  Type.Literal("failed"),
]);
export type DeliveryState = Type.Static<typeof DeliveryStateSchema>;

export const DeliverySchema = Type.Object(
  {
    delivery_id: DeliveryIdSchema,
    package_ref: PackageRefSchema,
    project_id: ProjectIdSchema,
    run_id: RunIdSchema,
    target_actor_id: ActorIdSchema,
    state: DeliveryStateSchema,
    created_at: CanonicalTimestampSchema,
  },
  { additionalProperties: false },
);
export type Delivery = Type.Static<typeof DeliverySchema>;
