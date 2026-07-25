import canonicalize from "canonicalize";
import { createHash } from "node:crypto";
import type { DefinitionBrickBody } from "../actor-template/schemas.js";
import type {
  BrickPromptBody,
  BrickSysPromptBody,
} from "../brick/schemas.js";
import type {
  BrickKind,
  DefinitionBrickDigest,
} from "../identity/identity.js";

function canonicalizeText(value: string): string {
  return value.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function assertCanonicalizableJson(value: unknown, seen = new WeakSet<object>()): void {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (Number.isFinite(value)) return;
    throw new TypeError("Structured Body contains a non-finite number.");
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) throw new TypeError("Structured Body contains a circular reference.");
    seen.add(value);
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new TypeError("Structured Body contains a sparse array.");
      assertCanonicalizableJson(value[index], seen);
    }
    seen.delete(value);
    return;
  }
  if (typeof value !== "object") {
    throw new TypeError("Structured Body contains a non-JSON value.");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("Structured Body contains a non-plain object.");
  }
  if (seen.has(value)) throw new TypeError("Structured Body contains a circular reference.");
  seen.add(value);
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new TypeError("Structured Body contains a symbol property.");
  }
  for (const key of Object.keys(value)) {
    assertCanonicalizableJson((value as Record<string, unknown>)[key], seen);
  }
  seen.delete(value);
}

function canonicalizeStructuredBody(value: unknown): string {
  assertCanonicalizableJson(value);
  const serialized = canonicalize(value);
  if (serialized === undefined) {
    throw new TypeError("Structured Body is not canonicalizable JSON.");
  }
  return serialized;
}

function normalizePromptBody(body: BrickPromptBody): BrickPromptBody {
  return body.kind === "text"
    ? { kind: "text", text: canonicalizeText(body.text) }
    : { kind: "composite", parts: body.parts.map(normalizePromptBody) };
}

function normalizeDefinitionBrickBody(body: DefinitionBrickBody): DefinitionBrickBody {
  if ("kind" in body) {
    return normalizePromptBody(body);
  }
  if ("text" in body) {
    return { text: canonicalizeText(body.text) } as BrickSysPromptBody;
  }
  return body;
}

export function computeDefinitionBrickDigest(
  kind: BrickKind,
  body: DefinitionBrickBody,
): DefinitionBrickDigest {
  const material = {
    kind,
    schema_version: "1.0.0" as const,
    body: normalizeDefinitionBrickBody(body),
  };
  const canonical = canonicalizeStructuredBody(material);
  const digest = createHash("sha256").update(canonical, "utf8").digest("hex");
  return `sha256:${digest}` as DefinitionBrickDigest;
}
