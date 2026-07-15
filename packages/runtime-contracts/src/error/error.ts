import Type from "typebox";
import {
  CONTRACT_SCHEMA_VERSION,
  ContractSchemaVersionSchema,
} from "../identity/identity.js";
import { JsonObjectSchema } from "../validation/schemas.js";

const CONTRACT_ERROR_CATEGORIES = [
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

export const ContractErrorEnvelopeSchema = Type.Object(
  {
    schema_version: ContractSchemaVersionSchema,
    code: Type.String({ pattern: "^[a-z][a-z0-9_]*(?:\\.[a-z0-9_]+)+$" }),
    category: Type.Union(CONTRACT_ERROR_CATEGORIES.map((category) => Type.Literal(category))),
    message: Type.String({ minLength: 1 }),
    retryable: Type.Boolean(),
    correlation_id: Type.Optional(Type.String({ minLength: 1 })),
    details: Type.Optional(JsonObjectSchema),
  },
  { additionalProperties: false },
);
export type ContractErrorEnvelope = Type.Static<typeof ContractErrorEnvelopeSchema>;

export const INVALID_JSON_VALUE_ERROR = {
  schema_version: CONTRACT_SCHEMA_VERSION,
  code: "contract.invalid_json_value",
  category: "validation",
  message: "Invalid JSON contract value.",
  retryable: false,
} as const;

export const SCHEMA_MISMATCH_ERROR = {
  schema_version: CONTRACT_SCHEMA_VERSION,
  code: "contract.schema_mismatch",
  category: "validation",
  message: "Contract schema validation failed.",
  retryable: false,
} as const;

export const UNSUPPORTED_VERSION_ERROR = {
  schema_version: CONTRACT_SCHEMA_VERSION,
  code: "contract.unsupported_version",
  category: "compatibility",
  message: "Unsupported contract version.",
  retryable: false,
} as const;

export type MaterializationReason =
  | "accessor_property"
  | "custom_prototype"
  | "symbol_key"
  | "sparse_array"
  | "array_extra_property"
  | "cyclic_reference"
  | "unsupported_type"
  | "non_finite_number"
  | "lone_surrogate"
  | "reflection_failed";

export type SchemaIssueRule =
  | "required"
  | "additional_property"
  | "type"
  | "literal"
  | "format"
  | "range"
  | "structure"
  | "reference";
