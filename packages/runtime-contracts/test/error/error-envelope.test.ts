import { describe, expect, it } from "vitest";
import {
  ContractErrorEnvelopeSchema,
  JsonObjectSchema,
  JsonValueSchema,
  decodeContract,
} from "../../src/index.js";

describe("B.1 stable error envelope", () => {
  it("normalizes materialization failures to the frozen project error", () => {
    const input = Object.defineProperty({}, "secret", { get: () => { throw new Error("trap"); } });
    const result = decodeContract(JsonValueSchema, input);

    expect(result).toEqual({
      ok: false,
      error: {
        schema_version: "1.0.0",
        code: "contract.invalid_json_value",
        category: "validation",
        message: "Invalid JSON contract value.",
        retryable: false,
        details: { path: "/secret", reason: "accessor_property" },
      },
    });
  });

  it("normalizes schema failures without leaking Ajv wording", () => {
    const result = decodeContract(JsonObjectSchema, { "bad\u0000key": true });
    expect(result).toEqual({
      ok: true,
      value: { "bad\u0000key": true },
    });

    const mismatch = decodeContract(
      {
        type: "object",
        properties: { count: { type: "integer" } },
        required: ["count"],
        additionalProperties: false,
      } as const,
      { count: "wrong", extra: true },
    );
    expect(mismatch).toMatchObject({
      ok: false,
      error: {
        schema_version: "1.0.0",
        code: "contract.schema_mismatch",
        category: "validation",
        message: "Contract schema validation failed.",
        retryable: false,
        details: {
          issues: [
            { path: "/count", rule: "type" },
            { path: "/extra", rule: "additional_property" },
          ],
        },
      },
    });
    if (mismatch.ok) return;
    expect(JSON.stringify(mismatch.error)).not.toContain("must be");
    expect(JSON.stringify(mismatch.error)).not.toContain("additionalProperties");
  });

  it("strictly validates the public error envelope", () => {
    const valid = {
      schema_version: "1.0.0",
      code: "contract.schema_mismatch",
      category: "validation",
      message: "Contract schema validation failed.",
      retryable: false,
      details: { issues: [{ path: "/value", rule: "type" }] },
    };
    const decoded = decodeContract(ContractErrorEnvelopeSchema, valid);
    expect(decoded).toMatchObject({ ok: true });
    expect(decodeContract(ContractErrorEnvelopeSchema, { ...valid, extra: true }).ok).toBe(false);
    expect(decodeContract(ContractErrorEnvelopeSchema, { ...valid, details: null }).ok).toBe(false);
  });
});
