import * as AjvModule from "ajv";
import * as AjvFormatsModule from "ajv-formats";
import { describe, expect, it } from "vitest";
import {
  ContentHashSchema,
  DeliverySchema,
  DeliveryStateSchema,
  PackageCreatorSchema,
  PackageHeadSchema,
  PackageHashMaterialSchema,
  PackageProvenanceSchema,
  PackageRefSchema,
  PackageSchema,
  PackageSchemaVersionSchema,
  PackageTypeSchema,
  decodeContract,
} from "../../src/index.js";

type TestAjv = {
  compile(schema: unknown): (value: unknown) => boolean;
};

const Ajv = AjvModule.default as unknown as new (options: Record<string, unknown>) => TestAjv;
const addFormats = AjvFormatsModule.default as unknown as (ajv: TestAjv) => TestAjv;
const UUID = "00000000-0000-4000-8000-000000000000";
const packageId = `package_${UUID}`;
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const runId = `run_${UUID}`;
const invocationId = `invocation_${UUID}`;
const contentHash = `sha256:${"a".repeat(64)}`;
const packageRef = { package_id: packageId, content_hash: contentHash };
const provenance = { parent_refs: [packageRef], run_id: runId, invocation_id: invocationId };
const head = {
  package_id: packageId,
  package_type: "task",
  schema_version: "1.0.0",
  project_id: projectId,
  created_by: { kind: "actor", actor_id: actorId },
  created_at: "2026-07-16T12:34:56.789Z",
  content_hash: contentHash,
  provenance,
};
const { content_hash: _contentHash, ...hashMaterialHead } = head;
const pkg = { head, body: { kind: "text", text: "work" } };
const delivery = {
  delivery_id: `delivery_${UUID}`,
  package_ref: packageRef,
  project_id: projectId,
  run_id: runId,
  target_actor_id: actorId,
  state: "pending",
  created_at: "2026-07-16T12:34:56.789Z",
};

describe("B.2 Package and Delivery contracts", () => {
  it("compiles every public Package schema with the Ajv main export", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv);
    for (const [name, schema, value] of [
      ["PackageSchemaVersion", PackageSchemaVersionSchema, "1.0.0"],
      ["PackageType", PackageTypeSchema, "task"],
      ["ContentHash", ContentHashSchema, contentHash],
      ["PackageRef", PackageRefSchema, packageRef],
      ["PackageCreator", PackageCreatorSchema, { kind: "runtime" }],
      ["PackageProvenance", PackageProvenanceSchema, { parent_refs: [] }],
      ["PackageHead", PackageHeadSchema, head],
      ["PackageHashMaterial", PackageHashMaterialSchema, { head: hashMaterialHead, body: pkg.body }],
      ["Package", PackageSchema, pkg],
      ["DeliveryState", DeliveryStateSchema, "pending"],
      ["Delivery", DeliverySchema, delivery],
    ] as const) {
      expect(() => ajv.compile(schema)).not.toThrow();
      expect(ajv.compile(schema)(value), name).toBe(true);
    }
  });

  it("decodes the exact creator, provenance, Package, and Delivery shapes", () => {
    expect(decodeContract(PackageCreatorSchema, { kind: "client", client_id: `client_${UUID}` }).ok).toBe(true);
    expect(decodeContract(PackageCreatorSchema, { kind: "actor", actor_id: actorId }).ok).toBe(true);
    expect(decodeContract(PackageCreatorSchema, { kind: "runtime" }).ok).toBe(true);
    expect(decodeContract(PackageProvenanceSchema, { parent_refs: [] }).ok).toBe(true);
    expect(decodeContract(PackageProvenanceSchema, { parent_refs: [], run_id: runId }).ok).toBe(true);
    expect(decodeContract(PackageProvenanceSchema, provenance).ok).toBe(true);
    expect(decodeContract(PackageSchema, pkg)).toMatchObject({ ok: true });
    expect(decodeContract(DeliverySchema, delivery)).toMatchObject({ ok: true });
    for (const state of ["pending", "delivered", "acknowledged", "failed"]) {
      expect(decodeContract(DeliveryStateSchema, state).ok).toBe(true);
    }
  });

  it("rejects unknown fields, invalid provenance, and a system prompt Package body", () => {
    expect(decodeContract(PackageSchema, { ...pkg, extra: true }).ok).toBe(false);
    expect(decodeContract(PackageHeadSchema, { ...head, extra: true }).ok).toBe(false);
    expect(decodeContract(PackageRefSchema, { ...packageRef, extra: true }).ok).toBe(false);
    expect(decodeContract(PackageCreatorSchema, { kind: "runtime", actor_id: actorId }).ok).toBe(false);
    expect(decodeContract(PackageProvenanceSchema, { parent_refs: [], invocation_id: invocationId }).ok).toBe(false);
    expect(decodeContract(PackageSchema, { ...pkg, body: { kind: "system_text", text: "secret" } }).ok).toBe(false);
    expect(decodeContract(ContentHashSchema, "sha256:ABC").ok).toBe(false);
    expect(decodeContract(DeliveryStateSchema, "queued").ok).toBe(false);
  });
});
