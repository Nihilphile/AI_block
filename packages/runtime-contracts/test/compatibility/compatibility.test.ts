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

describe("B.4 compatibility fixtures", () => {
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
