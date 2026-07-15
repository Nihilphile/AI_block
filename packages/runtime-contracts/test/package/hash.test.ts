import { readFileSync } from "node:fs";
import canonicalize from "canonicalize";
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  computePackageContentHash,
  derivePackageHashMaterial,
  verifyPackageContentHash,
} from "../../src/index.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const packageId = `package_${UUID}`;
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const runId = `run_${UUID}`;
const invocationId = `invocation_${UUID}`;
const contentHash = `sha256:${"a".repeat(64)}`;

function makePackage(parts = [{ kind: "text", text: "work" }]) {
  return {
    head: {
      package_id: packageId,
      package_type: "task",
      schema_version: "1.0.0",
      project_id: projectId,
      created_by: { kind: "actor", actor_id: actorId },
      created_at: "2026-07-16T12:34:56.789Z",
      content_hash: contentHash,
      provenance: {
        parent_refs: [
          { package_id: `package_${"11111111-1111-4111-8111-111111111111"}`, content_hash: `sha256:${"b".repeat(64)}` },
          { package_id: `package_${"22222222-2222-4222-8222-222222222222"}`, content_hash: `sha256:${"c".repeat(64)}` },
        ],
        run_id: runId,
        invocation_id: invocationId,
      },
    },
    body: { kind: "composite", parts },
  };
}

function mustValue<T>(result: { ok: true; value: T } | { ok: false }): T {
  if (!result.ok) throw new Error("expected a successful contract result");
  return result.value;
}

describe("B.2 Package hashing", () => {
  it("matches the attributed Cyberphone JCS sample", () => {
    const fixture = JSON.parse(readFileSync(new URL("../fixtures/rfc8785/vectors.json", import.meta.url), "utf8")) as Array<{
      name: string;
      input: unknown;
      canonical?: string;
      expectedOrder?: string[];
    }>;
    expect(fixture).toHaveLength(2);
    const cyberphoneSample = fixture.find((vector) => vector.name === "cyberphone-sample");
    expect(cyberphoneSample).toBeDefined();
    expect(canonicalize(cyberphoneSample?.input)).toBe(cyberphoneSample?.canonical);

    const utf16Vector = fixture.find((vector) => vector.name === "rfc8785-utf16-property-order");
    expect(utf16Vector).toBeDefined();
    expect(utf16Vector?.expectedOrder).toEqual(["\r", "1", "\u0080", "\u00f6", "\u20ac", "\ud83d\ude00", "\ufb33"]);
    const canonical = canonicalize(utf16Vector?.input);
    expect(canonical).toBeTypeOf("string");
    if (canonical !== undefined && utf16Vector?.expectedOrder !== undefined) {
      let previousKeyPosition = -1;
      for (const key of utf16Vector.expectedOrder) {
        const keyPosition = canonical.indexOf(`${JSON.stringify(key)}:`, previousKeyPosition + 1);
        expect(keyPosition, key).toBeGreaterThan(previousKeyPosition);
        previousKeyPosition = keyPosition;
      }
    }
    expect(canonicalize({ zero: -0 })).toBe('{"zero":0}');
  });

  it("derives material without content_hash and verifies the computed digest", () => {
    const pkg = makePackage();
    const material = mustValue(derivePackageHashMaterial(pkg));
    expect(material.head).not.toHaveProperty("content_hash");
    const hash = mustValue(computePackageContentHash(material));
    expect(hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    const complete = { ...pkg, head: { ...pkg.head, content_hash: hash } };
    expect(verifyPackageContentHash(complete)).toEqual({ ok: true, value: true });
    expect(verifyPackageContentHash({ ...complete, head: { ...complete.head, content_hash: `sha256:${"f".repeat(64)}` } })).toEqual({ ok: true, value: false });
  });

  it("ignores object key order, preserves array order, and ignores only content_hash", () => {
    const pkg = makePackage([{ kind: "text", text: "first" }, { kind: "text", text: "second" }]);
    const material = mustValue(derivePackageHashMaterial(pkg));
    const reordered = {
      body: material.body,
      head: {
        provenance: material.head.provenance,
        created_at: material.head.created_at,
        created_by: material.head.created_by,
        project_id: material.head.project_id,
        schema_version: material.head.schema_version,
        package_type: material.head.package_type,
        package_id: material.head.package_id,
      },
    };
    expect(computePackageContentHash(reordered)).toEqual(computePackageContentHash(material));
    const compositeBody = material.body as Extract<typeof material.body, { readonly kind: "composite" }>;
    expect(computePackageContentHash({ ...material, body: { kind: "composite", parts: [...compositeBody.parts].reverse() } })).not.toEqual(computePackageContentHash(material));
    expect(computePackageContentHash({ ...pkg, head: { ...pkg.head, content_hash: `sha256:${"f".repeat(64)}` } }).ok).toBe(false);
    const alternateContentHash = { ...pkg, head: { ...pkg.head, content_hash: `sha256:${"f".repeat(64)}` } };
    expect(derivePackageHashMaterial(alternateContentHash)).toEqual(derivePackageHashMaterial(pkg));
  });

  it("changes the digest for every variable immutable Package field", () => {
    const pkg = makePackage([{ kind: "text", text: "stable" }]);
    const baseline = computePackageContentHash(mustValue(derivePackageHashMaterial(pkg)));
    const changed: Array<[string, unknown]> = [
      ["package_id", { ...pkg, head: { ...pkg.head, package_id: `package_${"33333333-3333-4333-8333-333333333333"}` } }],
      ["package_type", { ...pkg, head: { ...pkg.head, package_type: "report" } }],
      ["project_id", { ...pkg, head: { ...pkg.head, project_id: `project_${"33333333-3333-4333-8333-333333333333"}` } }],
      ["created_by", { ...pkg, head: { ...pkg.head, created_by: { kind: "client", client_id: `client_${"33333333-3333-4333-8333-333333333333"}` } } }],
      ["created_at", { ...pkg, head: { ...pkg.head, created_at: "2026-07-17T12:34:56.789Z" } }],
      ["parent_refs", { ...pkg, head: { ...pkg.head, provenance: { ...pkg.head.provenance, parent_refs: [{ package_id: `package_${"33333333-3333-4333-8333-333333333333"}`, content_hash: `sha256:${"d".repeat(64)}` }] } } }],
      ["run_id", { ...pkg, head: { ...pkg.head, provenance: { ...pkg.head.provenance, run_id: `run_${"33333333-3333-4333-8333-333333333333"}` } } }],
      ["invocation_id", { ...pkg, head: { ...pkg.head, provenance: { ...pkg.head.provenance, invocation_id: `invocation_${"33333333-3333-4333-8333-333333333333"}` } } }],
      ["body", { ...pkg, body: { kind: "composite", parts: [{ kind: "text", text: "changed" }] } }],
    ];
    for (const [field, changedPackage] of changed) {
      const material = derivePackageHashMaterial(changedPackage);
      expect(material.ok, field).toBe(true);
      if (!material.ok) continue;
      expect(computePackageContentHash(material), field).not.toEqual(baseline);
    }
  });

  it("fails before canonicalization for non-I-JSON or behavioral values", () => {
    const material = mustValue(derivePackageHashMaterial(makePackage()));
    expect(computePackageContentHash({ ...material, body: { kind: "text", text: () => "bad" } })).toMatchObject({
      ok: false,
      error: { code: "contract.invalid_json_value" },
    });
    expect(computePackageContentHash({ ...material, body: { ...material.body, extra: -0 } })).toMatchObject({
      ok: false,
      error: { code: "contract.schema_mismatch" },
    });
  });

  it("keeps object-key permutations hash invariant for generated safe text", () => {
    const safeText = fc.array(fc.constantFrom("a", "b", "c", " ", "0", "1"), { minLength: 1, maxLength: 12 }).map((chars) => chars.join(""));
    fc.assert(fc.property(safeText, (text) => {
      const material = mustValue(derivePackageHashMaterial(makePackage([{ kind: "text", text }])));
      const reordered = {
        body: material.body,
        head: {
          package_type: material.head.package_type,
          package_id: material.head.package_id,
          provenance: material.head.provenance,
          schema_version: material.head.schema_version,
          created_at: material.head.created_at,
          project_id: material.head.project_id,
          created_by: material.head.created_by,
        },
      };
      expect(computePackageContentHash(reordered)).toEqual(computePackageContentHash(material));
    }), { numRuns: 25 });
  });
});
