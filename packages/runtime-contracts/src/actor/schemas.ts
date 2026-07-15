import Type from "typebox";
import {
  ActorConfigSnapshotIdSchema,
  ActorIdSchema,
  ContractSchemaVersionSchema,
  InvocationIdSchema,
  ProjectIdSchema,
  RunIdSchema,
} from "../identity/identity.js";
import { BrickPromptSchema, BrickSysPromptSchema } from "../brick/schemas.js";
import { PackageRefSchema } from "../package/schemas.js";

const EXTENSION_ID_PATTERN = "^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$";
const JSON_KEY_PATTERN = "^[\\s\\S]*$";
const ERROR_CATEGORIES = [
  "validation",
  "compatibility",
  "authentication",
  "authorization",
  "not-found",
  "conflict",
  "unavailable",
  "timeout",
  "backend",
  "internal",
] as const;

function uniqueJsonObjectSchema(prefix: string) {
  const jsonName = `${prefix}Json`;
  const objectName = `${prefix}JsonObject`;
  return Type.Cyclic(
    {
      [jsonName]: Type.Union([
        Type.Null(),
        Type.Boolean(),
        Type.Number(),
        Type.String(),
        Type.Array(Type.Ref(jsonName)),
        Type.Record(Type.String({ pattern: JSON_KEY_PATTERN }), Type.Ref(jsonName)),
      ]),
      [objectName]: Type.Record(Type.String({ pattern: JSON_KEY_PATTERN }), Type.Ref(jsonName)),
    },
    objectName,
  );
}

function uniqueErrorEnvelopeSchema(prefix: string) {
  const detailsSchema = uniqueJsonObjectSchema(`${prefix}Details`);
  return Type.Object(
    {
      schema_version: ContractSchemaVersionSchema,
      code: Type.String({ pattern: "^[a-z][a-z0-9_]*(?:\\.[a-z0-9_]+)+$" }),
      category: Type.Union(ERROR_CATEGORIES.map((category) => Type.Literal(category))),
      message: Type.String({ minLength: 1 }),
      retryable: Type.Boolean(),
      correlation_id: Type.Optional(Type.String({ minLength: 1 })),
      details: Type.Optional(detailsSchema),
    },
    { additionalProperties: false },
  );
}

const BackendConfigJsonObjectSchema = uniqueJsonObjectSchema("BackendConfig");
const ToolProviderConfigJsonObjectSchema = uniqueJsonObjectSchema("ToolProviderConfig");

export const BackendAdapterIdSchema = Type.String({ pattern: EXTENSION_ID_PATTERN });
export type BackendAdapterId = Type.Static<typeof BackendAdapterIdSchema>;

export const ToolProviderIdSchema = Type.String({ pattern: EXTENSION_ID_PATTERN });
export type ToolProviderId = Type.Static<typeof ToolProviderIdSchema>;

export const BackendSessionIdSchema = Type.String({ minLength: 1 });
export type BackendSessionId = Type.Static<typeof BackendSessionIdSchema>;

export const BackendAdapterLaunchConfigSchema = Type.Object(
  {
    adapter_id: BackendAdapterIdSchema,
    config: BackendConfigJsonObjectSchema,
  },
  { additionalProperties: false },
);
export type BackendAdapterLaunchConfig = Type.Static<typeof BackendAdapterLaunchConfigSchema>;

export const ToolProviderLaunchConfigSchema = Type.Object(
  {
    provider_id: ToolProviderIdSchema,
    config: ToolProviderConfigJsonObjectSchema,
  },
  { additionalProperties: false },
);
export type ToolProviderLaunchConfig = Type.Static<typeof ToolProviderLaunchConfigSchema>;

export const ActorLaunchSpecSchema = Type.Object(
  {
    schema_version: ContractSchemaVersionSchema,
    project_id: ProjectIdSchema,
    actor_id: ActorIdSchema,
    actor_config_snapshot_id: ActorConfigSnapshotIdSchema,
    system_prompts: Type.Array(BrickSysPromptSchema),
    working_directory: Type.String({ minLength: 1 }),
    backend: BackendAdapterLaunchConfigSchema,
    tool_providers: Type.Array(ToolProviderLaunchConfigSchema),
  },
  { additionalProperties: false },
);
export type ActorLaunchSpec = Type.Static<typeof ActorLaunchSpecSchema>;

export const CreateSessionDirectiveSchema = Type.Object(
  { mode: Type.Literal("create") },
  { additionalProperties: false },
);
export type CreateSessionDirective = Type.Static<typeof CreateSessionDirectiveSchema>;

export const ResumeSessionDirectiveSchema = Type.Object(
  {
    mode: Type.Literal("resume"),
    session_id: BackendSessionIdSchema,
  },
  { additionalProperties: false },
);
export type ResumeSessionDirective = Type.Static<typeof ResumeSessionDirectiveSchema>;

export const SessionDirectiveSchema = Type.Union([
  CreateSessionDirectiveSchema,
  ResumeSessionDirectiveSchema,
]);
export type SessionDirective = Type.Static<typeof SessionDirectiveSchema>;

export const InvocationSpecSchema = Type.Object(
  {
    schema_version: ContractSchemaVersionSchema,
    project_id: ProjectIdSchema,
    run_id: RunIdSchema,
    actor_id: ActorIdSchema,
    invocation_id: InvocationIdSchema,
    input_package_refs: Type.Array(PackageRefSchema, { minItems: 1 }),
    prompt: BrickPromptSchema,
    session: SessionDirectiveSchema,
  },
  { additionalProperties: false },
);
export type InvocationSpec = Type.Static<typeof InvocationSpecSchema>;

const ExitCodeSchema = Type.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER });

export const ExitedProcessFactSchema = Type.Object(
  {
    status: Type.Literal("exited"),
    exit_code: ExitCodeSchema,
  },
  { additionalProperties: false },
);
export type ExitedProcessFact = Type.Static<typeof ExitedProcessFactSchema>;

export const SignaledProcessFactSchema = Type.Object(
  {
    status: Type.Literal("signaled"),
    signal: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type SignaledProcessFact = Type.Static<typeof SignaledProcessFactSchema>;

export const StoppedProcessFactSchema = Type.Object(
  { status: Type.Literal("stopped") },
  { additionalProperties: false },
);
export type StoppedProcessFact = Type.Static<typeof StoppedProcessFactSchema>;

export const LaunchFailedProcessFactSchema = Type.Object(
  {
    status: Type.Literal("launch_failed"),
    error: uniqueErrorEnvelopeSchema("LaunchFailed"),
  },
  { additionalProperties: false },
);
export type LaunchFailedProcessFact = Type.Static<typeof LaunchFailedProcessFactSchema>;

export const InvocationProcessFactSchema = Type.Union([
  ExitedProcessFactSchema,
  SignaledProcessFactSchema,
  StoppedProcessFactSchema,
  LaunchFailedProcessFactSchema,
]);
export type InvocationProcessFact = Type.Static<typeof InvocationProcessFactSchema>;

export const InvocationResultSchema = Type.Object(
  {
    schema_version: ContractSchemaVersionSchema,
    project_id: ProjectIdSchema,
    run_id: RunIdSchema,
    actor_id: ActorIdSchema,
    invocation_id: InvocationIdSchema,
    session_id: Type.Optional(BackendSessionIdSchema),
    process: InvocationProcessFactSchema,
    emitted_package_refs: Type.Array(PackageRefSchema),
    completion_requested: Type.Boolean(),
  },
  { additionalProperties: false },
);
export type InvocationResult = Type.Static<typeof InvocationResultSchema>;
