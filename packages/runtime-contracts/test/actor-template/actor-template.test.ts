import * as AjvModule from "ajv";
import { describe, expect, it } from "vitest";
import {
  ActorConfigSnapshotSchema,
  ActorTemplateSpecSchema,
  BackendBrickBodySchema,
  BrickPromptBodySchema,
  BrickSysPromptBodySchema,
  CreateActorTemplateCommandSchema,
  DefinitionBrickRevisionSchema,
  ExactBrickRefSchema,
  ResolvedBrickRefSchema,
  RuntimeConfigBrickBodySchema,
  ToolsetBrickBodySchema,
  ValidateActorTemplateCandidateSchema,
  ValidationIssueSchema,
  decodeContract,
} from "../../src/index.js";
import { actorTemplateFixtures } from "./fixtures.js";

type TestAjv = {
  compile(schema: unknown): (value: unknown) => boolean;
};

const Ajv = AjvModule.default as unknown as new (options: Record<string, unknown>) => TestAjv;

function roundTrip(schema: unknown, value: unknown): boolean {
  const decoded = decodeContract(schema as Parameters<typeof decodeContract>[0], value);
  if (!decoded.ok) return false;
  const back = decodeContract(schema as Parameters<typeof decodeContract>[0], JSON.parse(JSON.stringify(decoded.value)));
  return back.ok;
}

describe("Actor template contracts", () => {
  // --- 1.1 Identity and exact-reference schemas ---

  it("decodes valid exact and resolved Brick refs", () => {
    expect(roundTrip(ExactBrickRefSchema, actorTemplateFixtures.exactBrickRef)).toBe(true);
    expect(roundTrip(ResolvedBrickRefSchema, actorTemplateFixtures.resolvedBrickRef)).toBe(true);
  });

  it("rejects invalid Brick refs", () => {
    for (const invalid of [
      { id: "Coder-Core", revision: 3 },                    // uppercase
      { id: "coder-core", revision: 0 },                     // revision not positive
      { id: "coder-core", revision: -1 },
      { id: "", revision: 3 },                               // empty id
      { id: "a".repeat(65), revision: 1 },                    // id too long
      { id: "coder-core" },                                   // missing revision
      { revision: 3 },                                        // missing id
      { id: "coder-core", revision: 3, extra: true },
    ]) {
      expect(decodeContract(ExactBrickRefSchema, invalid).ok).toBe(false);
    }

    for (const invalid of [
      { uid: "brickrev_00000000-0000-4000-8000-000000000000" }, // missing digest
      { digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }, // missing uid
      { uid: "not-a-uid", digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    ]) {
      expect(decodeContract(ResolvedBrickRefSchema, invalid).ok).toBe(false);
    }
  });

  // --- 1.2 Design Brick Body schemas ---

  it("decodes valid BrickSysPromptBody", () => {
    expect(decodeContract(BrickSysPromptBodySchema, actorTemplateFixtures.brickSysPromptBody).ok).toBe(true);
    expect(decodeContract(BrickSysPromptBodySchema, { text: "" }).ok).toBe(false);
    expect(decodeContract(BrickSysPromptBodySchema, { kind: "system_text", text: "a" }).ok).toBe(false);
  });

  it("decodes valid BrickPromptBody (recursive)", () => {
    expect(roundTrip(BrickPromptBodySchema, actorTemplateFixtures.brickPromptBodyText)).toBe(true);
    expect(roundTrip(BrickPromptBodySchema, actorTemplateFixtures.brickPromptBodyComposite)).toBe(true);
    expect(decodeContract(BrickPromptBodySchema, { kind: "text", text: "" }).ok).toBe(false);
    expect(decodeContract(BrickPromptBodySchema, { kind: "composite", parts: [] }).ok).toBe(false);
  });

  it("decodes valid BackendBrickBody", () => {
    expect(roundTrip(BackendBrickBodySchema, actorTemplateFixtures.backendBrickBody)).toBe(true);
    for (const invalid of [
      { adapter_id: "claude.code", config: {} },                        // missing model_id
      { adapter_id: "claude.code", model_id: "", config: {} },          // empty model_id
      { adapter_id: "claude.code", model_id: "deep", config: 42 },      // config not object
      { model_id: "deep", config: {} },                                  // missing adapter_id
      { adapter_id: "INVALID", model_id: "deep", config: {} },          // bad adapter_id
    ]) {
      expect(decodeContract(BackendBrickBodySchema, invalid).ok).toBe(false);
    }
  });

  it("decodes valid ToolsetBrickBody", () => {
    expect(roundTrip(ToolsetBrickBodySchema, actorTemplateFixtures.toolsetBrickBody)).toBe(true);
    // duplicate provider_id is a later validation concern; schema accepts it at the contract level
    expect(decodeContract(ToolsetBrickBodySchema, { providers: [{ provider_id: "a.b", config: {} }, { provider_id: "a.b", config: {} }] }).ok).toBe(true);
    // empty providers is valid per schema
    expect(decodeContract(ToolsetBrickBodySchema, { providers: [] }).ok).toBe(true);
    // missing provider_id
    expect(decodeContract(ToolsetBrickBodySchema, { providers: [{ config: {} }] }).ok).toBe(false);
    // providers not an array
    expect(decodeContract(ToolsetBrickBodySchema, { providers: "not-an-array" }).ok).toBe(false);
  });

  it("decodes valid RuntimeConfigBrickBody", () => {
    expect(roundTrip(RuntimeConfigBrickBodySchema, actorTemplateFixtures.runtimeConfigBrickBody)).toBe(true);
    for (const invalid of [
      { workspace: { root_id: "primary" } },                              // missing relative_working_directory
      { workspace: { root_id: "primary", relative_working_directory: "" } }, // empty dir
      { workspace: { relative_working_directory: "." } },                  // missing root_id
    ]) {
      expect(decodeContract(RuntimeConfigBrickBodySchema, invalid).ok).toBe(false);
    }
  });

  it("decodes valid DefinitionBrickRevision", () => {
    expect(roundTrip(DefinitionBrickRevisionSchema, actorTemplateFixtures.definitionBrickRevision)).toBe(true);
  });

  // --- 1.3 ActorTemplateSpec, views, and snapshot ---

  it("decodes a minimal ActorTemplateSpec", () => {
    expect(decodeContract(ActorTemplateSpecSchema, actorTemplateFixtures.emptyPromptsSpec).ok).toBe(true);
  });

  it("decodes a full ActorTemplateSpec", () => {
    expect(roundTrip(ActorTemplateSpecSchema, actorTemplateFixtures.minimalSpec)).toBe(true);
  });

  it("rejects a spec with unknown fields", () => {
    const invalid = {
      ...actorTemplateFixtures.emptyPromptsSpec,
      extra_field: true,
    };
    expect(decodeContract(ActorTemplateSpecSchema, invalid).ok).toBe(false);
  });

  it("rejects a spec with missing required components", () => {
    const badSpec = {
      schema_version: "1.0.0",
      kind: "actor_template_spec",
      metadata: { display_name: "Test", description: "", labels: {} },
      spec: {
        system_prompt: { bricks: [] },
        // missing initial_prompt, backend, toolset, runtime_config
      },
    };
    expect(decodeContract(ActorTemplateSpecSchema, badSpec).ok).toBe(false);
  });

  it("rejects a spec with wrong schema_version", () => {
    const badSpec = {
      ...actorTemplateFixtures.emptyPromptsSpec,
      schema_version: "0.9.0",
    };
    expect(decodeContract(ActorTemplateSpecSchema, badSpec).ok).toBe(false);
  });

  it("decodes valid ActorConfigSnapshot", () => {
    expect(roundTrip(ActorConfigSnapshotSchema, actorTemplateFixtures.configSnapshot)).toBe(true);
  });

  it("decodes valid ValidationIssue", () => {
    expect(roundTrip(ValidationIssueSchema, actorTemplateFixtures.validationIssue)).toBe(true);
  });

  it("decodes valid ValidateActorTemplateCandidate command", () => {
    expect(decodeContract(ValidateActorTemplateCandidateSchema, actorTemplateFixtures.validateCandidate).ok).toBe(true);
  });

  it("decodes valid CreateActorTemplateCommand", () => {
    expect(decodeContract(CreateActorTemplateCommandSchema, actorTemplateFixtures.createCommand).ok).toBe(true);
  });

  // --- Compile every public schema ---

  it("compiles every public actor-template schema with the Ajv main export", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    const pairs = [
      [ExactBrickRefSchema, actorTemplateFixtures.exactBrickRef],
      [ResolvedBrickRefSchema, actorTemplateFixtures.resolvedBrickRef],
      [BackendBrickBodySchema, actorTemplateFixtures.backendBrickBody],
      [ToolsetBrickBodySchema, actorTemplateFixtures.toolsetBrickBody],
      [RuntimeConfigBrickBodySchema, actorTemplateFixtures.runtimeConfigBrickBody],
      [ActorTemplateSpecSchema, actorTemplateFixtures.minimalSpec],
      [ValidationIssueSchema, actorTemplateFixtures.validationIssue],
      [ValidateActorTemplateCandidateSchema, actorTemplateFixtures.validateCandidate],
      [CreateActorTemplateCommandSchema, actorTemplateFixtures.createCommand],
    ] as const;
    for (const [schema, value] of pairs) {
      expect(() => ajv.compile(schema)).not.toThrow();
      expect(ajv.compile(schema)(value)).toBe(true);
    }
  });
});