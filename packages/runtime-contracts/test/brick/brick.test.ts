import * as AjvModule from "ajv";
import { describe, expect, it } from "vitest";
import {
  BrickPromptSchema,
  BrickSysPromptSchema,
  CompositeBrickPromptSchema,
  TextBrickPromptSchema,
  decodeContract,
} from "../../src/index.js";

type TestAjv = {
  compile(schema: unknown): (value: unknown) => boolean;
};

const Ajv = AjvModule.default as unknown as new (options: Record<string, unknown>) => TestAjv;

describe("B.2 Brick contracts", () => {
  it("compiles every public Brick schema with the Ajv main export", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    for (const [schema, value] of [
      [TextBrickPromptSchema, { kind: "text", text: "hello" }],
      [CompositeBrickPromptSchema, { kind: "composite", parts: [{ kind: "text", text: "hello" }] }],
      [BrickPromptSchema, { kind: "composite", parts: [{ kind: "text", text: "hello" }] }],
      [BrickSysPromptSchema, { kind: "system_text", text: "policy" }],
    ] as const) {
      expect(() => ajv.compile(schema)).not.toThrow();
      expect(ajv.compile(schema)(value)).toBe(true);
    }
  });

  it("decodes text and recursively ordered composite prompts", () => {
    const input = {
      kind: "composite",
      parts: [
        { kind: "text", text: "first" },
        { kind: "composite", parts: [{ kind: "text", text: "second" }] },
      ],
    };
    expect(decodeContract(BrickPromptSchema, input)).toEqual({ ok: true, value: input });
  });

  it("rejects empty values, unknown fields, and system prompts as model prompts", () => {
    for (const value of [
      { kind: "text", text: "" },
      { kind: "composite", parts: [] },
      { kind: "text", text: "ok", extra: true },
      { kind: "composite", parts: [{ kind: "text", text: "ok", extra: true }] },
      { kind: "system_text", text: "privileged" },
    ]) {
      expect(decodeContract(BrickPromptSchema, value).ok).toBe(false);
    }
    expect(decodeContract(BrickSysPromptSchema, { kind: "text", text: "ordinary" }).ok).toBe(false);
    expect(decodeContract(BrickSysPromptSchema, { kind: "system_text", text: "" }).ok).toBe(false);
  });
});
