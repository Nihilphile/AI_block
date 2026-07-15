import * as AjvModule from "ajv";
import * as AjvFormatsModule from "ajv-formats";
import { describe, expect, it } from "vitest";
import {
  ActorIdSchema,
  CanonicalTimestampSchema,
  ClientPrincipalIdSchema,
  ContractErrorEnvelopeSchema,
  ContractSchemaVersionSchema,
  DeliveryIdSchema,
  GraphIdSchema,
  HostInstanceIdSchema,
  HostMessageIdSchema,
  InvocationIdSchema,
  JsonObjectSchema,
  JsonValueSchema,
  PackageIdSchema,
  ProjectIdSchema,
  RunIdSchema,
  ActorConfigSnapshotIdSchema,
  ActorTemplateIdSchema,
  decodeContract,
} from "../../src/index.js";

type TestAjv = {
  compile(schema: unknown): (value: unknown) => boolean;
};

const Ajv = AjvModule.default as unknown as new (options: Record<string, unknown>) => TestAjv;
const addFormats = AjvFormatsModule.default as unknown as (ajv: TestAjv) => TestAjv;

describe("B.1 validation kernel", () => {
  it("compiles every exported B.1 schema with the Ajv main export", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv);
    const schemas = [
      [JsonValueSchema, { nested: [true, null] }],
      [JsonObjectSchema, { nested: [true, null] }],
      [ContractSchemaVersionSchema, "1.0.0"],
      [CanonicalTimestampSchema, "2026-07-16T12:34:56.789Z"],
      [ContractErrorEnvelopeSchema, {
        schema_version: "1.0.0",
        code: "contract.schema_mismatch",
        category: "validation",
        message: "Contract schema validation failed.",
        retryable: false,
      }],
      [ProjectIdSchema, "project_00000000-0000-4000-8000-000000000000"],
      [ActorTemplateIdSchema, "actor_template_00000000-0000-4000-8000-000000000000"],
      [ActorConfigSnapshotIdSchema, "actor_config_00000000-0000-4000-8000-000000000000"],
      [ActorIdSchema, "actor_00000000-0000-4000-8000-000000000000"],
      [PackageIdSchema, "package_00000000-0000-4000-8000-000000000000"],
      [DeliveryIdSchema, "delivery_00000000-0000-4000-8000-000000000000"],
      [RunIdSchema, "run_00000000-0000-4000-8000-000000000000"],
      [InvocationIdSchema, "invocation_00000000-0000-4000-8000-000000000000"],
      [HostInstanceIdSchema, "host_00000000-0000-4000-8000-000000000000"],
      [HostMessageIdSchema, "message_00000000-0000-4000-8000-000000000000"],
      [ClientPrincipalIdSchema, "client_00000000-0000-4000-8000-000000000000"],
      [GraphIdSchema, "graph_00000000-0000-4000-8000-000000000000"],
    ];

    for (const [schema, value] of schemas) {
      expect(() => ajv.compile(schema)).not.toThrow();
      expect(ajv.compile(schema)(value)).toBe(true);
    }
  });

  it("returns a defensive deeply frozen copy for valid input", () => {
    const input = { nested: { values: ["first", 2, true] } };
    const result = decodeContract(JsonObjectSchema, input);

    expect(result).toEqual({ ok: true, value: input });
    if (!result.ok) return;
    const value = result.value as unknown as { readonly nested: { readonly values: readonly unknown[] } };
    expect(Object.isFrozen(result)).toBe(true);
    expect(value).not.toBe(input);
    expect(value.nested).not.toBe(input.nested);
    expect(value.nested.values).not.toBe(input.nested.values);
    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.nested)).toBe(true);
    expect(Object.isFrozen(value.nested.values)).toBe(true);
    expect(Reflect.set(value.nested, "extra", true)).toBe(false);
  });

  it("copies shared subtrees independently and protects __proto__", () => {
    const shared = { value: 1 };
    const input = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(input, "left", { value: shared, enumerable: true });
    Object.defineProperty(input, "right", { value: shared, enumerable: true });
    Object.defineProperty(input, "__proto__", { value: { polluted: true }, enumerable: true });

    const result = decodeContract(JsonObjectSchema, input);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const value = result.value as unknown as { readonly left: unknown; readonly right: unknown };
    expect(value.left).not.toBe(value.right);
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(value, "__proto__")).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("accepts JSON primitives and canonicalizes negative zero", () => {
    expect(decodeContract(JsonValueSchema, null)).toEqual({ ok: true, value: null });
    expect(decodeContract(JsonValueSchema, -0)).toEqual({ ok: true, value: 0 });
    expect(decodeContract(JsonValueSchema, ["text", false, 3])).toEqual({
      ok: true,
      value: ["text", false, 3],
    });
  });

  it("rejects unknown fields, coercion, defaults, and invalid nulls", () => {
    const schema = {
      type: "object",
      properties: { count: { type: "integer" } },
      required: ["count"],
      additionalProperties: false,
    } as const;

    expect(decodeContract(schema, { count: 1, extra: true }).ok).toBe(false);
    expect(decodeContract(schema, { count: "1" }).ok).toBe(false);
    expect(decodeContract(schema, {}).ok).toBe(false);
    expect(decodeContract(schema, null).ok).toBe(false);
  });

  it.each([
    ["custom prototype", () => Object.create({ inherited: true })],
    ["accessor", () => Object.defineProperty({}, "value", { get: () => 1 })],
    ["symbol key", () => ({ [Symbol("key")]: 1 })],
    ["sparse array", () => Object.assign([], { length: 1 })],
    ["array extra property", () => Object.assign([1], { extra: true })],
    ["cycle", () => { const value: Record<string, unknown> = {}; value.self = value; return value; }],
    ["undefined", () => ({ value: undefined })],
    ["bigint", () => ({ value: 1n })],
    ["function", () => ({ value: () => true })],
    ["symbol", () => Symbol("value")],
    ["non-finite number", () => Infinity],
    ["lone surrogate", () => "bad\uD800value"],
    ["lone surrogate key", () => ({ ["bad\uD800key"]: true })],
  ])("rejects %s", (_label, makeValue) => {
    const result = decodeContract(JsonValueSchema, makeValue());
    expect(result).toMatchObject({ ok: false, error: { code: "contract.invalid_json_value" } });
  });

  it("normalizes reflection failures from revoked proxies", () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    expect(decodeContract(JsonValueSchema, proxy)).toMatchObject({
      ok: false,
      error: { code: "contract.invalid_json_value", details: { reason: "reflection_failed" } },
    });
  });
});
