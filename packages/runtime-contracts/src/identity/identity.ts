import Type from "typebox";

export const CONTRACT_SCHEMA_VERSION = "1.0.0" as const;
export const ContractSchemaVersionSchema = Type.Literal(CONTRACT_SCHEMA_VERSION);
export type ContractSchemaVersion = Type.Static<typeof ContractSchemaVersionSchema>;

const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

function resourceIdSchema(prefix: string) {
  return Type.String({ pattern: `^${prefix}${UUID_PATTERN}$` });
}

export const ProjectIdSchema = resourceIdSchema("project_");
export type ProjectId = Type.Static<typeof ProjectIdSchema>;

export const ActorTemplateIdSchema = resourceIdSchema("actor_template_");
export type ActorTemplateId = Type.Static<typeof ActorTemplateIdSchema>;

export const ActorConfigSnapshotIdSchema = resourceIdSchema("actor_config_");
export type ActorConfigSnapshotId = Type.Static<typeof ActorConfigSnapshotIdSchema>;

export const ActorIdSchema = resourceIdSchema("actor_");
export type ActorId = Type.Static<typeof ActorIdSchema>;

export const PackageIdSchema = resourceIdSchema("package_");
export type PackageId = Type.Static<typeof PackageIdSchema>;

export const DeliveryIdSchema = resourceIdSchema("delivery_");
export type DeliveryId = Type.Static<typeof DeliveryIdSchema>;

export const RunIdSchema = resourceIdSchema("run_");
export type RunId = Type.Static<typeof RunIdSchema>;

export const InvocationIdSchema = resourceIdSchema("invocation_");
export type InvocationId = Type.Static<typeof InvocationIdSchema>;

export const HostInstanceIdSchema = resourceIdSchema("host_");
export type HostInstanceId = Type.Static<typeof HostInstanceIdSchema>;

export const HostMessageIdSchema = resourceIdSchema("message_");
export type HostMessageId = Type.Static<typeof HostMessageIdSchema>;

export const ClientPrincipalIdSchema = resourceIdSchema("client_");
export type ClientPrincipalId = Type.Static<typeof ClientPrincipalIdSchema>;

export const GraphIdSchema = resourceIdSchema("graph_");
export type GraphId = Type.Static<typeof GraphIdSchema>;

export const DefinitionBrickRevisionIdSchema = resourceIdSchema("brickrev_");
export type DefinitionBrickRevisionId = Type.Static<typeof DefinitionBrickRevisionIdSchema>;

export const PositiveRevisionSchema = Type.Integer({ minimum: 1 });
export type PositiveRevision = Type.Static<typeof PositiveRevisionSchema>;

export const HumanReadableIdSchema = Type.String({
  pattern: "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",
  maxLength: 64,
});
export type HumanReadableId = Type.Static<typeof HumanReadableIdSchema>;

export const BrickKindSchema = Type.Union([
  Type.Literal("sys_prompt"),
  Type.Literal("prompt"),
  Type.Literal("backend"),
  Type.Literal("toolset"),
  Type.Literal("runtime_config"),
]);
export type BrickKind = Type.Static<typeof BrickKindSchema>;

export const DefinitionBrickDigestSchema = Type.String({ pattern: "^sha256:[0-9a-f]{64}$" });
export type DefinitionBrickDigest = Type.Static<typeof DefinitionBrickDigestSchema>;

export const CanonicalTimestampSchema = Type.String({
  format: "date-time",
  pattern: "^(?!0000)[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\\.[0-9]{3}Z$",
});
export type CanonicalTimestamp = Type.Static<typeof CanonicalTimestampSchema>;

export function isCanonicalTimestamp(value: unknown): value is CanonicalTimestamp {
  if (typeof value !== "string" || !/^(?!0000)[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\.[0-9]{3}Z$/.test(value)) return false;

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}
