import canonicalize from "canonicalize";
import { createHash } from "node:crypto";
import {
  decodeContract,
  ExactBrickRefSchema,
  type ActorTemplateSpec,
  type BackendBrickBody,
  type BrickKind,
  type BrickPromptBody,
  type BrickSysPromptBody,
  type ConfigDigest,
  type DefinitionBrickRevision,
  type DefinitionBrickDigest,
  type ExactBrickRef,
  type TemplateRevisionDigest,
  type ToolProviderBrickConfig,
} from "@ai-block/runtime-contracts";
import type { ProjectId } from "@ai-block/runtime-contracts";

export type ExactBrickRefParseResult =
  | Readonly<{ kind: "valid"; value: ExactBrickRef }>
  | Readonly<{ kind: "invalid"; reason: "not_exact" }>;

export type BoundDefinitionBrickRef = Readonly<{
  authored: ExactBrickRef;
  resolved: Readonly<{
    uid: DefinitionBrickRevision["revision_uid"];
    digest: DefinitionBrickRevision["digest"];
  }>;
}>;

export type DefinitionBrickRefBindingResult =
  | (BoundDefinitionBrickRef & Readonly<{ kind: "resolved" }>)
  | Readonly<{ kind: "unresolved"; reason: "not_found" }>;

export function parseExactBrickRef(input: unknown): ExactBrickRefParseResult {
  const decoded = decodeContract(ExactBrickRefSchema, input);
  return decoded.ok
    ? { kind: "valid", value: decoded.value }
    : { kind: "invalid", reason: "not_exact" };
}

export function bindDefinitionBrickRef(
  projectId: ProjectId,
  authored: ExactBrickRef,
  resolved: DefinitionBrickRevision | undefined,
): DefinitionBrickRefBindingResult {
  if (
    resolved === undefined
    || resolved.project_id !== projectId
    || resolved.brick_id !== authored.id
    || resolved.revision !== authored.revision
  ) {
    return { kind: "unresolved", reason: "not_found" };
  }

  return {
    kind: "resolved",
    authored,
    resolved: { uid: resolved.revision_uid, digest: resolved.digest },
  };
}

export function canonicalizeText(value: string): string {
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

export function canonicalizeStructuredBody(value: unknown): string {
  assertCanonicalizableJson(value);
  const serialized = canonicalize(value);
  if (serialized === undefined) {
    throw new TypeError("Structured Body is not canonicalizable JSON.");
  }
  return serialized;
}

type DefinitionBrickBody = DefinitionBrickRevision["body"];

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

export type DefinitionBrickDigestMaterial = Readonly<{
  kind: BrickKind;
  schema_version: "1.0.0";
  body: DefinitionBrickBody;
}>;

export function buildDefinitionBrickDigestMaterial(
  kind: BrickKind,
  body: DefinitionBrickBody,
): DefinitionBrickDigestMaterial {
  return {
    kind,
    schema_version: "1.0.0",
    body: normalizeDefinitionBrickBody(body),
  };
}

export type TemplateRevisionDigestMaterial = Readonly<{
  schema_version: "1.0.0";
  metadata: ActorTemplateSpec["metadata"];
  spec: ActorTemplateSpec["spec"];
}>;

export function buildTemplateRevisionDigestMaterial(
  metadata: ActorTemplateSpec["metadata"],
  spec: ActorTemplateSpec["spec"],
): TemplateRevisionDigestMaterial {
  return { schema_version: "1.0.0", metadata, spec };
}

export type ConfigurationDigestMaterial = Readonly<{
  system_prompts: readonly BrickSysPromptBody[];
  initial_prompts: readonly BrickPromptBody[];
  backend: BackendBrickBody;
  tool_providers: readonly ToolProviderBrickConfig[];
  working_directory: string;
}>;

export function buildConfigurationDigestMaterial(input: ConfigurationDigestMaterial): ConfigurationDigestMaterial {
  return {
    system_prompts: input.system_prompts.map((body) => ({ text: canonicalizeText(body.text) })),
    initial_prompts: input.initial_prompts.map(normalizePromptBody),
    backend: input.backend,
    tool_providers: input.tool_providers,
    working_directory: input.working_directory,
  };
}

export function sha256CanonicalJson(value: unknown): string {
  const canonical = canonicalizeStructuredBody(value);
  const digest = createHash("sha256").update(canonical, "utf8").digest("hex");
  return `sha256:${digest}`;
}

export function computeDefinitionBrickDigest(
  kind: BrickKind,
  body: DefinitionBrickRevision["body"],
): DefinitionBrickDigest {
  return sha256CanonicalJson(buildDefinitionBrickDigestMaterial(kind, body)) as DefinitionBrickDigest;
}

export function computeTemplateRevisionDigest(
  metadata: ActorTemplateSpec["metadata"],
  spec: ActorTemplateSpec["spec"],
): TemplateRevisionDigest {
  return sha256CanonicalJson(buildTemplateRevisionDigestMaterial(metadata, spec)) as TemplateRevisionDigest;
}

export function computeConfigurationDigest(input: ConfigurationDigestMaterial): ConfigDigest {
  return sha256CanonicalJson(buildConfigurationDigestMaterial(input)) as ConfigDigest;
}
