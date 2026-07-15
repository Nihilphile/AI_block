import { describe, expect, it } from "vitest";
import {
  ActorConfigSnapshotIdSchema,
  ActorIdSchema,
  ActorTemplateIdSchema,
  CanonicalTimestampSchema,
  ClientPrincipalIdSchema,
  ContractSchemaVersionSchema,
  DeliveryIdSchema,
  GraphIdSchema,
  HostInstanceIdSchema,
  HostMessageIdSchema,
  InvocationIdSchema,
  PackageIdSchema,
  ProjectIdSchema,
  RunIdSchema,
  decodeContract,
} from "../../src/index.js";

const UUID = "00000000-0000-4000-8000-000000000000";

describe("B.1 identity, version, and time", () => {
  it.each([
    [ProjectIdSchema, "project_"],
    [ActorTemplateIdSchema, "actor_template_"],
    [ActorConfigSnapshotIdSchema, "actor_config_"],
    [ActorIdSchema, "actor_"],
    [PackageIdSchema, "package_"],
    [DeliveryIdSchema, "delivery_"],
    [RunIdSchema, "run_"],
    [InvocationIdSchema, "invocation_"],
    [HostInstanceIdSchema, "host_"],
    [HostMessageIdSchema, "message_"],
    [ClientPrincipalIdSchema, "client_"],
    [GraphIdSchema, "graph_"],
  ])("accepts the exact %s prefix", (schema, prefix) => {
    expect(decodeContract(schema, `${prefix}${UUID}`)).toMatchObject({ ok: true });
  });

  it("rejects altered, uppercase, compact, and braced IDs", () => {
    for (const value of [
      "project_00000000-0000-4000-8000-00000000000A",
      `Project_${UUID}`,
      "project_00000000000040008000000000000000",
      `{project_${UUID}}`,
      `project_${UUID.slice(0, -1)}z`,
    ]) {
      expect(decodeContract(ProjectIdSchema, value).ok).toBe(false);
    }
  });

  it("accepts only the B.1 Contract schema version", () => {
    expect(decodeContract(ContractSchemaVersionSchema, "1.0.0")).toMatchObject({ ok: true });
    for (const value of ["1.0", "1.0.1", "0.0.0", "v1.0.0", 1]) {
      expect(decodeContract(ContractSchemaVersionSchema, value).ok).toBe(false);
    }
  });

  it("accepts canonical UTC timestamps and rejects non-canonical or invalid dates", () => {
    for (const value of ["0001-01-01T00:00:00.000Z", "2026-07-16T12:34:56.789Z", "9999-12-31T23:59:59.999Z"]) {
      expect(decodeContract(CanonicalTimestampSchema, value)).toMatchObject({ ok: true });
    }
    for (const value of [
      "0000-01-01T00:00:00.000Z",
      "2026-02-29T12:34:56.789Z",
      "2024-02-30T12:34:56.789Z",
      "2026-07-16T12:34:60.000Z",
      "2026-07-16T24:00:00.000Z",
      "2026-07-16T12:34:56Z",
      "2026-07-16t12:34:56.789z",
      "2026-07-16T12:34:56.789+00:00",
    ]) {
      expect(decodeContract(CanonicalTimestampSchema, value).ok).toBe(false);
    }
  });
});
