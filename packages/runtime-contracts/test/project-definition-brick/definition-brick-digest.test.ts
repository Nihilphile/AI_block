import { describe, expect, it } from "vitest";
import {
  computeDefinitionBrickDigest,
  normalizeDefinitionBrickBody,
  type BrickKind,
  type DefinitionBrickBody,
  type DefinitionBrickDigest,
} from "../../src/index.js";

type DigestCase = Readonly<{
  kind: BrickKind;
  body: DefinitionBrickBody;
  expected: DefinitionBrickDigest;
}>;

const KNOWN_DIGESTS: readonly DigestCase[] = [
  {
    kind: "sys_prompt",
    body: { text: "\uFEFFLine one\r\nLine two\rLine three\n" },
    expected: "sha256:5c09277d759228b5bf32b7eb11c52a8e7b47c2521b731f2c53f6824056f741a1",
  },
  {
    kind: "prompt",
    body: { kind: "text", text: "\uFEFFLine one\r\nLine two\rLine three\n" },
    expected: "sha256:ae7f883a82c738788f1efa3251acaeb8470979b622034efab7bfa3204ced9a44",
  },
  {
    kind: "prompt",
    body: {
      kind: "composite",
      parts: [
        { kind: "text", text: "\uFEFFFirst\r\n" },
        { kind: "composite", parts: [{ kind: "text", text: "Second\rThird" }] },
      ],
    },
    expected: "sha256:6eb137a3ec5995d0d2134071e1db949dbf092f3d223ba40ff5d27f801c578fca",
  },
  {
    kind: "backend",
    body: { adapter_id: "claude.code", model_id: "model", config: { z: 1, a: 2 } },
    expected: "sha256:1ec2819267b4a20306628c672a4b8e4624471a611c6ac666e92f097d01f1cdf0",
  },
  {
    kind: "toolset",
    body: { providers: [{ provider_id: "ai.block.tool", config: { z: true, a: [2, 1] } }] },
    expected: "sha256:21da4a4b528ecacad92e8c368a5cbbc4392bd57cddf247af0521dae90f82c39a",
  },
  {
    kind: "runtime_config",
    body: { workspace: { root_id: "primary", relative_working_directory: "src" } },
    expected: "sha256:f5239756d71f18a498793fcf58ad9f0fbaaf77ccb5fdb4b82edde685d0492a29",
  },
];

describe("Definition Brick canonical digest", () => {
  it("preserves the frozen digest for every accepted Body kind", () => {
    for (const fixture of KNOWN_DIGESTS) {
      expect(computeDefinitionBrickDigest(fixture.kind, fixture.body)).toBe(fixture.expected);
      expect(computeDefinitionBrickDigest(
        fixture.kind,
        normalizeDefinitionBrickBody(fixture.body),
      )).toBe(fixture.expected);
      expect(computeDefinitionBrickDigest(fixture.kind, fixture.body)).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it("normalizes sys prompt and Prompt text without mutating either input", () => {
    const sysPrompt: DefinitionBrickBody = {
      text: "\uFEFFLine one\r\nLine two\rLine three\n",
    };
    const promptText: DefinitionBrickBody = {
      kind: "text",
      text: "\uFEFFLine one\r\nLine two\rLine three\n",
    };

    expect(normalizeDefinitionBrickBody(sysPrompt)).toEqual({
      text: "Line one\nLine two\nLine three\n",
    });
    expect(normalizeDefinitionBrickBody(promptText)).toEqual({
      kind: "text",
      text: "Line one\nLine two\nLine three\n",
    });
    expect(sysPrompt).toEqual({
      text: "\uFEFFLine one\r\nLine two\rLine three\n",
    });
    expect(promptText).toEqual({
      kind: "text",
      text: "\uFEFFLine one\r\nLine two\rLine three\n",
    });
  });

  it("removes one leading BOM and normalizes CRLF and CR to LF", () => {
    expect(normalizeDefinitionBrickBody({
      text: "\uFEFF\uFEFFText",
    })).toEqual({
      text: "\uFEFFText",
    });

    expect(computeDefinitionBrickDigest("sys_prompt", {
      text: "\uFEFFLine one\r\nLine two\rLine three\n",
    })).toBe(computeDefinitionBrickDigest("sys_prompt", {
      text: "Line one\nLine two\nLine three\n",
    }));

    expect(computeDefinitionBrickDigest("sys_prompt", { text: "\uFEFF\uFEFFText" }))
      .not.toBe(computeDefinitionBrickDigest("sys_prompt", { text: "\uFEFFText" }));
  });

  it("normalizes recursive Prompt content without changing part order", () => {
    const mixed: DefinitionBrickBody = {
      kind: "composite",
      parts: [
        { kind: "text", text: "\uFEFFFirst\r\n" },
        { kind: "composite", parts: [{ kind: "text", text: "Second\rThird" }] },
      ],
    };
    const normalized: DefinitionBrickBody = {
      kind: "composite",
      parts: [
        { kind: "text", text: "First\n" },
        { kind: "composite", parts: [{ kind: "text", text: "Second\nThird" }] },
      ],
    };
    const reordered: DefinitionBrickBody = {
      kind: "composite",
      parts: [...normalized.parts].reverse(),
    };
    const original = {
      kind: "composite",
      parts: [
        { kind: "text", text: "\uFEFFFirst\r\n" },
        { kind: "composite", parts: [{ kind: "text", text: "Second\rThird" }] },
      ],
    };

    expect(normalizeDefinitionBrickBody(mixed)).toEqual(normalized);
    expect(mixed).toEqual(original);
    expect(computeDefinitionBrickDigest("prompt", mixed))
      .toBe(computeDefinitionBrickDigest("prompt", normalized));
    expect(computeDefinitionBrickDigest("prompt", reordered))
      .not.toBe(computeDefinitionBrickDigest("prompt", normalized));
  });

  it("uses canonical property ordering for structured Bodies", () => {
    const unordered: DefinitionBrickBody = {
      adapter_id: "claude.code",
      model_id: "model",
      config: { z: 1, a: 2 },
    };
    const ordered: DefinitionBrickBody = {
      adapter_id: "claude.code",
      model_id: "model",
      config: { a: 2, z: 1 },
    };

    expect(normalizeDefinitionBrickBody(unordered)).toEqual(unordered);
    expect(computeDefinitionBrickDigest("backend", unordered))
      .toBe(computeDefinitionBrickDigest("backend", ordered));
  });

  it("preserves structured Body values and ordering without mutation", () => {
    const bodies: readonly DefinitionBrickBody[] = [
      { adapter_id: "claude.code", model_id: "model", config: { z: 1, a: 2 } },
      {
        providers: [
          { provider_id: "first", config: { enabled: true } },
          { provider_id: "second", config: { enabled: false } },
        ],
      },
      { workspace: { root_id: "primary", relative_working_directory: "src" } },
    ];
    const snapshots = bodies.map((body) => structuredClone(body));

    for (const [index, body] of bodies.entries()) {
      expect(normalizeDefinitionBrickBody(body)).toEqual(snapshots[index]);
      expect(body).toEqual(snapshots[index]);
    }
    expect(Object.keys((normalizeDefinitionBrickBody(bodies[0]!) as {
      config: Record<string, unknown>;
    }).config)).toEqual(["z", "a"]);
  });

  it("fails closed for values without one canonical JSON serialization", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const sparse: unknown[] = [];
    sparse.length = 1;

    const invalidBodies = [
      { adapter_id: "claude.code", model_id: "model", config: { invalid: undefined } },
      { adapter_id: "claude.code", model_id: "model", config: circular },
      { providers: [{ provider_id: "ai.block.tool", config: { sparse } }] },
      { adapter_id: "claude.code", model_id: "model", config: { invalid: Number.NaN } },
    ];

    for (const body of invalidBodies) {
      expect(() => computeDefinitionBrickDigest("backend", body as unknown as DefinitionBrickBody))
        .toThrow(TypeError);
    }
  });
});
