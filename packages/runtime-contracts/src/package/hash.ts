import { createHash } from "node:crypto";
import canonicalize from "canonicalize";
import type { ContractErrorEnvelope } from "../error/error.js";
import type { ContractDecodeResult, ContractValue } from "../validation/decode.js";
import { decodeContract } from "../validation/decode.js";
import {
  PackageHashMaterialSchema,
  PackageSchema,
  type ContentHash,
  type PackageHashMaterial,
} from "./schemas.js";

const CANONICALIZATION_FAILED_ERROR = Object.freeze({
  schema_version: "1.0.0",
  code: "contract.canonicalization_failed",
  category: "internal",
  message: "Package canonicalization failed.",
  retryable: false,
}) as unknown as ContractErrorEnvelope;

function canonicalizationFailure<T>(): ContractDecodeResult<T> {
  return Object.freeze({ ok: false, error: CANONICALIZATION_FAILED_ERROR });
}

function frozenSuccess<T>(value: T): ContractDecodeResult<T> {
  return Object.freeze({ ok: true, value: value as ContractValue<T> });
}

export function derivePackageHashMaterial(input: unknown): ContractDecodeResult<PackageHashMaterial> {
  const decoded = decodeContract(PackageSchema, input);
  if (!decoded.ok) return decoded;
  const { content_hash: _contentHash, ...head } = decoded.value.head;
  return decodeContract(PackageHashMaterialSchema, { head, body: decoded.value.body });
}

export function computePackageContentHash(input: unknown): ContractDecodeResult<ContentHash> {
  const decoded = decodeContract(PackageHashMaterialSchema, input);
  if (!decoded.ok) return decoded;

  try {
    const canonical = canonicalize(decoded.value);
    if (typeof canonical !== "string") return canonicalizationFailure();
    const digest = createHash("sha256").update(canonical, "utf8").digest("hex");
    return frozenSuccess(`sha256:${digest}` as ContentHash);
  } catch {
    return canonicalizationFailure();
  }
}

export function verifyPackageContentHash(input: unknown): ContractDecodeResult<boolean> {
  const decoded = decodeContract(PackageSchema, input);
  if (!decoded.ok) return decoded;
  const material = derivePackageHashMaterial(decoded.value);
  if (!material.ok) return material;
  const computed = computePackageContentHash(material.value);
  if (!computed.ok) return computed;
  return frozenSuccess(computed.value === decoded.value.head.content_hash);
}
