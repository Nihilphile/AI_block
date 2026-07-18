import { describe, expect, it } from "vitest";
import type {
  BackendBrickBody,
  BrickKind,
  DefinitionBrickRevision,
  ExactBrickRef,
  ProjectId,
  ToolProviderBrickConfig,
} from "@ai-block/runtime-contracts";
import {
  bindDefinitionBrickRef,
  buildConfigurationDigestMaterial,
  buildDefinitionBrickDigestMaterial,
  buildTemplateRevisionDigestMaterial,
  canonicalizeStructuredBody,
  canonicalizeText,
  parseExactBrickRef,
} from "../../../src/modules/actor/index.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const OTHER_UUID = "11111111-1111-4111-8111-111111111111";
const projectId = `project_${UUID}` as ProjectId;
const otherProjectId = `project_${OTHER_UUID}` as ProjectId;
const exactRef: ExactBrickRef = { id: "coder-core", revision: 3 };
const digest = `sha256:${"a".repeat(64)}`;

function definitionBrick(overrides: Partial<DefinitionBrickRevision> = {}): DefinitionBrickRevision {
  return {
    revision_uid: `brickrev_${UUID}`,
    brick_id: exactRef.id,
    project_id: projectId,
    kind: "sys_prompt",
    revision: exactRef.revision,
    body: { text: "You are a coding worker." },
    digest,
    created_at: "2026-07-16T12:34:56.789Z",
    ...overrides,
  };
}

describe("Actor Module foundation values", () => {
  it("accepts exact references and rejects floating references", () => {
    expect(parseExactBrickRef(exactRef)).toEqual({ kind: "valid", value: exactRef });
    expect(parseExactBrickRef({ id: "coder-core", revision: "latest" })).toEqual({
      kind: "invalid",
      reason: "not_exact",
    });
    expect(parseExactBrickRef({ id: "coder-core", revision: 0 })).toEqual({
      kind: "invalid",
      reason: "not_exact",
    });
  });

  it("preserves authored and resolved identity when binding a Definition Brick", () => {
    expect(bindDefinitionBrickRef(projectId, exactRef, definitionBrick())).toEqual({
      kind: "resolved",
      authored: exactRef,
      resolved: { uid: `brickrev_${UUID}`, digest },
    });
  });

  it("does not reveal missing or cross-Project resolution details", () => {
    expect(bindDefinitionBrickRef(projectId, exactRef, undefined)).toEqual({
      kind: "unresolved",
      reason: "not_found",
    });
    expect(bindDefinitionBrickRef(projectId, exactRef, definitionBrick({ project_id: otherProjectId }))).toEqual({
      kind: "unresolved",
      reason: "not_found",
    });
    expect(bindDefinitionBrickRef(projectId, exactRef, definitionBrick({ revision: 4 }))).toEqual({
      kind: "unresolved",
      reason: "not_found",
    });
  });

  it("canonicalizes text without changing meaningful whitespace", () => {
    expect(canonicalizeText("\uFEFF first\r\nsecond\rthird\n")).toBe(" first\nsecond\nthird\n");
  });

  it("uses RFC 8785 canonical JSON semantics for structured values", () => {
    expect(canonicalizeStructuredBody({ numbers: [333333333.33333329, 1e30, 4.5, 2e-3, 1e-27] })).toBe(
      '{"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27]}',
    );
    expect(canonicalizeStructuredBody({ zero: -0 })).toBe('{"zero":0}');
    expect(canonicalizeStructuredBody({ "\u20ac": "Euro", "\r": "CR", "\ufb33": "Hebrew", "1": "One", "\ud83d\ude00": "Emoji", "\u0080": "Control", "\u00f6": "Latin" })).toBe(
      '{"\\r":"CR","1":"One","\u0080":"Control","\u00f6":"Latin","€":"Euro","😀":"Emoji","\ufb33":"Hebrew"}',
    );
    expect(() => canonicalizeStructuredBody({ invalid: undefined })).toThrow();
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => canonicalizeStructuredBody(circular)).toThrow();
  });

  it("builds revision material with metadata and configuration material without metadata", () => {
    const metadata = { display_name: "Coder", description: "Worker", labels: { role: "coder" } };
    const spec = {
      system_prompt: { bricks: [{ ref: exactRef }] },
      initial_prompt: { bricks: [] },
      backend: { ref: { id: "backend", revision: 1 } },
      toolset: { ref: { id: "tools", revision: 1 } },
      runtime_config: { ref: { id: "default", revision: 1 } },
    };
    expect(buildTemplateRevisionDigestMaterial(metadata, spec)).toEqual({
      schema_version: "1.0.0",
      metadata,
      spec,
    });

    const backend: BackendBrickBody = { adapter_id: "claude-code", model_id: "deepseek-v4-pro", config: { temperature: 0 } };
    const providers: ToolProviderBrickConfig[] = [{ provider_id: "runtime-control", config: { enabled: true } }];
    const config = buildConfigurationDigestMaterial({
      system_prompts: [{ text: "System" }],
      initial_prompts: [{ kind: "text", text: "Initialize" }],
      backend,
      tool_providers: providers,
      working_directory: "C:\\work",
    });
    expect(config).toEqual({
      system_prompts: [{ text: "System" }],
      initial_prompts: [{ kind: "text", text: "Initialize" }],
      backend,
      tool_providers: providers,
      working_directory: "C:\\work",
    });
    expect(config.backend.model_id).toBe("deepseek-v4-pro");
    expect(config.backend.config).not.toHaveProperty("model_id");
    expect(canonicalizeStructuredBody(config)).toBe(canonicalizeStructuredBody({ ...config }));
  });

  it("includes Brick kind and normalized Body in Definition Brick material", () => {
    const kind: BrickKind = "sys_prompt";
    expect(buildDefinitionBrickDigestMaterial(kind, { text: "\uFEFFone\r\ntwo" })).toEqual({
      kind,
      schema_version: "1.0.0",
      body: { text: "one\ntwo" },
    });
    expect(buildDefinitionBrickDigestMaterial("prompt", { kind: "text", text: "one\r\ntwo" })).toEqual({
      kind: "prompt",
      schema_version: "1.0.0",
      body: { kind: "text", text: "one\ntwo" },
    });
  });
});
