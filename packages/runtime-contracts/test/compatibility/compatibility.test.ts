import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ActorLaunchSpecSchema,
  ContractErrorEnvelopeSchema,
  DeliverySchema,
  HostToServerMessageSchema,
  PackageSchema,
  ServerToHostMessageSchema,
  decodeContract,
} from "../../src/index.js";
import { compatibilityFixtures } from "./fixtures.js";

type SerializedCompatibilityFixture = {
  name: string;
  schema: string;
  value: unknown;
};

const sourceSchemas = {
  ContractErrorEnvelopeSchema,
  PackageSchema,
  DeliverySchema,
  ActorLaunchSpecSchema,
  ServerToHostMessageSchema,
  HostToServerMessageSchema,
} as const;

function readSerializedFixtures(): SerializedCompatibilityFixture[] {
  return JSON.parse(readFileSync(new URL("./fixtures.json", import.meta.url), "utf8")) as SerializedCompatibilityFixture[];
}

describe("B.4 compatibility fixtures", () => {
  it("decodes the shared serialized fixtures through the built package-root artifact", async () => {
    const contracts = await import("@ai-block/runtime-contracts");
    const fixtures = readSerializedFixtures();
    const schemas = {
      ContractErrorEnvelopeSchema: contracts.ContractErrorEnvelopeSchema,
      PackageSchema: contracts.PackageSchema,
      DeliverySchema: contracts.DeliverySchema,
      ActorLaunchSpecSchema: contracts.ActorLaunchSpecSchema,
      ServerToHostMessageSchema: contracts.ServerToHostMessageSchema,
      HostToServerMessageSchema: contracts.HostToServerMessageSchema,
    } as const;

    expect(fixtures).toHaveLength(6);
    for (const fixture of fixtures) {
      const schema = schemas[fixture.schema as keyof typeof schemas];
      expect(schema, fixture.name).toBeDefined();
      const decoded = contracts.decodeContract(schema, fixture.value);
      expect(decoded.ok, fixture.name).toBe(true);
      if (decoded.ok) {
        expect(contracts.decodeContract(schema, JSON.parse(JSON.stringify(decoded.value))), fixture.name).toEqual(decoded);
      }
    }
  });

  it("decodes the shared serialized fixtures through the source compatibility entrypoint", () => {
    const fixtures = readSerializedFixtures();

    expect(fixtures).toHaveLength(6);
    for (const fixture of fixtures) {
      const schema = sourceSchemas[fixture.schema as keyof typeof sourceSchemas];
      expect(schema, fixture.name).toBeDefined();
      const decoded = decodeContract(schema, fixture.value);
      expect(decoded.ok, fixture.name).toBe(true);
      if (decoded.ok) {
        expect(decodeContract(schema, JSON.parse(JSON.stringify(decoded.value))), fixture.name).toEqual(decoded);
      }
    }
  });

  it("round-trips representative B.1-B.3 values through the public entrypoint", () => {
    const cases = [
      ["ContractErrorEnvelope", ContractErrorEnvelopeSchema, compatibilityFixtures.error],
      ["Package", PackageSchema, compatibilityFixtures.package],
      ["Delivery", DeliverySchema, compatibilityFixtures.delivery],
      ["ActorLaunchSpec", ActorLaunchSpecSchema, compatibilityFixtures.launchSpec],
      ["ServerToHostMessage", ServerToHostMessageSchema, compatibilityFixtures.serverMessage],
      ["HostToServerMessage", HostToServerMessageSchema, compatibilityFixtures.hostMessage],
    ] as const;

    for (const [name, schema, value] of cases) {
      const decoded = decodeContract(schema, value);
      expect(decoded.ok, name).toBe(true);
      if (decoded.ok) {
        const roundTripped = decodeContract(schema, JSON.parse(JSON.stringify(decoded.value)));
        expect(roundTripped, name).toEqual(decoded);
      }
    }
  });

  it("fails closed when a compatibility fixture crosses its frozen boundary", () => {
    expect(decodeContract(PackageSchema, {
      ...compatibilityFixtures.package,
      body: { kind: "system_text", text: "private" },
    }).ok).toBe(false);
    expect(decodeContract(ServerToHostMessageSchema, {
      ...compatibilityFixtures.serverMessage,
      payload: compatibilityFixtures.hostMessage.payload,
    }).ok).toBe(false);
    expect(decodeContract(ContractErrorEnvelopeSchema, {
      ...compatibilityFixtures.error,
      unexpected: true,
    }).ok).toBe(false);
  });
});
