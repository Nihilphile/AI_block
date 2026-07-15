import Type from "typebox";
import {
  CanonicalTimestampSchema,
  ContractSchemaVersionSchema,
  HostInstanceIdSchema,
  HostMessageIdSchema,
  ActorIdSchema,
  InvocationIdSchema,
  ProjectIdSchema,
} from "../identity/identity.js";
import {
  ActorLaunchSpecSchema,
  InvocationResultSchema,
  InvocationSpecSchema,
} from "../actor/schemas.js";
import { BrickPromptSchema } from "../brick/schemas.js";
import {
  PackageRefSchema,
  PackageTypeSchema,
} from "../package/schemas.js";

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
const JSON_KEY_PATTERN = "^[\\s\\S]*$";

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
  return Type.Object(
    {
      schema_version: ContractSchemaVersionSchema,
      code: Type.String({ pattern: "^[a-z][a-z0-9_]*(?:\\.[a-z0-9_]+)+$" }),
      category: Type.Union(ERROR_CATEGORIES.map((category) => Type.Literal(category))),
      message: Type.String({ minLength: 1 }),
      retryable: Type.Boolean(),
      correlation_id: Type.Optional(Type.String({ minLength: 1 })),
      details: Type.Optional(uniqueJsonObjectSchema(`${prefix}Details`)),
    },
    { additionalProperties: false },
  );
}

export const HOST_PROTOCOL_VERSION = "1.0.0" as const;
export const HostProtocolVersionSchema = Type.Literal(HOST_PROTOCOL_VERSION);
export type HostProtocolVersion = Type.Static<typeof HostProtocolVersionSchema>;

const SenderSequenceSchema = Type.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER });
const ConnectionGenerationSchema = Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER });

export const InitializeActorHostPayloadSchema = Type.Object(
  {
    kind: Type.Literal("initialize_actor_host"),
    launch_spec: ActorLaunchSpecSchema,
  },
  { additionalProperties: false },
);
export type InitializeActorHostPayload = Type.Static<typeof InitializeActorHostPayloadSchema>;

export const StartInvocationPayloadSchema = Type.Object(
  {
    kind: Type.Literal("start_invocation"),
    invocation_spec: InvocationSpecSchema,
  },
  { additionalProperties: false },
);
export type StartInvocationPayload = Type.Static<typeof StartInvocationPayloadSchema>;

export const StopInvocationPayloadSchema = Type.Object(
  {
    kind: Type.Literal("stop_invocation"),
    invocation_id: InvocationIdSchema,
    reason: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type StopInvocationPayload = Type.Static<typeof StopInvocationPayloadSchema>;

export const ShutdownHostPayloadSchema = Type.Object(
  {
    kind: Type.Literal("shutdown_host"),
    reason: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type ShutdownHostPayload = Type.Static<typeof ShutdownHostPayloadSchema>;

export const HostHelloPayloadSchema = Type.Object(
  {
    kind: Type.Literal("host_hello"),
    project_id: ProjectIdSchema,
    host_instance_id: HostInstanceIdSchema,
    actor_id: ActorIdSchema,
  },
  { additionalProperties: false },
);
export type HostHelloPayload = Type.Static<typeof HostHelloPayloadSchema>;

export const HostReadyPayloadSchema = Type.Object(
  {
    kind: Type.Literal("host_ready"),
    actor_id: ActorIdSchema,
  },
  { additionalProperties: false },
);
export type HostReadyPayload = Type.Static<typeof HostReadyPayloadSchema>;

export const HeartbeatPayloadSchema = Type.Object(
  { kind: Type.Literal("heartbeat") },
  { additionalProperties: false },
);
export type HeartbeatPayload = Type.Static<typeof HeartbeatPayloadSchema>;

export const SessionReportPayloadSchema = Type.Object(
  {
    kind: Type.Literal("session_report"),
    invocation_id: InvocationIdSchema,
    session_id: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type SessionReportPayload = Type.Static<typeof SessionReportPayloadSchema>;

export const InvocationResultPayloadSchema = Type.Object(
  {
    kind: Type.Literal("invocation_result"),
    result: InvocationResultSchema,
  },
  { additionalProperties: false },
);
export type InvocationResultPayload = Type.Static<typeof InvocationResultPayloadSchema>;

export const PackagePublishRequestPayloadSchema = Type.Object(
  {
    kind: Type.Literal("package_publish_request"),
    invocation_id: InvocationIdSchema,
    idempotency_key: Type.String({ minLength: 1 }),
    package_type: PackageTypeSchema,
    body: BrickPromptSchema,
    parent_refs: Type.Array(PackageRefSchema),
  },
  { additionalProperties: false },
);
export type PackagePublishRequestPayload = Type.Static<typeof PackagePublishRequestPayloadSchema>;

export const CompletionRequestPayloadSchema = Type.Object(
  {
    kind: Type.Literal("completion_request"),
    invocation_id: InvocationIdSchema,
    result_package_refs: Type.Array(PackageRefSchema, { minItems: 1 }),
  },
  { additionalProperties: false },
);
export type CompletionRequestPayload = Type.Static<typeof CompletionRequestPayloadSchema>;

export const HostFaultPayloadSchema = Type.Object(
  {
    kind: Type.Literal("host_fault"),
    invocation_id: Type.Optional(InvocationIdSchema),
    error: uniqueErrorEnvelopeSchema("HostFault"),
  },
  { additionalProperties: false },
);
export type HostFaultPayload = Type.Static<typeof HostFaultPayloadSchema>;

export const AckPayloadSchema = Type.Object(
  {
    kind: Type.Literal("ack"),
    acknowledged_message_id: HostMessageIdSchema,
  },
  { additionalProperties: false },
);
export type AckPayload = Type.Static<typeof AckPayloadSchema>;

export const ServerToHostPayloadSchema = Type.Union([
  InitializeActorHostPayloadSchema,
  StartInvocationPayloadSchema,
  StopInvocationPayloadSchema,
  ShutdownHostPayloadSchema,
  AckPayloadSchema,
]);
export type ServerToHostPayload = Type.Static<typeof ServerToHostPayloadSchema>;

export const HostToServerPayloadSchema = Type.Union([
  HostHelloPayloadSchema,
  HostReadyPayloadSchema,
  HeartbeatPayloadSchema,
  SessionReportPayloadSchema,
  InvocationResultPayloadSchema,
  PackagePublishRequestPayloadSchema,
  CompletionRequestPayloadSchema,
  HostFaultPayloadSchema,
  AckPayloadSchema,
]);
export type HostToServerPayload = Type.Static<typeof HostToServerPayloadSchema>;

export const ServerToHostMessageSchema = Type.Object(
  {
    protocol_version: HostProtocolVersionSchema,
    message_id: HostMessageIdSchema,
    correlation_id: Type.Optional(HostMessageIdSchema),
    sender_sequence: SenderSequenceSchema,
    connection_generation: ConnectionGenerationSchema,
    sent_at: CanonicalTimestampSchema,
    payload: ServerToHostPayloadSchema,
  },
  { additionalProperties: false },
);
export type ServerToHostMessage = Type.Static<typeof ServerToHostMessageSchema>;

export const HostToServerMessageSchema = Type.Object(
  {
    protocol_version: HostProtocolVersionSchema,
    message_id: HostMessageIdSchema,
    correlation_id: Type.Optional(HostMessageIdSchema),
    sender_sequence: SenderSequenceSchema,
    connection_generation: ConnectionGenerationSchema,
    sent_at: CanonicalTimestampSchema,
    payload: HostToServerPayloadSchema,
  },
  { additionalProperties: false },
);
export type HostToServerMessage = Type.Static<typeof HostToServerMessageSchema>;
