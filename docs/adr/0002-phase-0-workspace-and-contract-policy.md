# ADR-0002: Phase 0 Workspace and Contract Policy

## Status

Accepted for Phase 0 planning.

## Phase boundary

Phase 0 is split into two independently reviewable deliverables:

- Phase 0A: workspace, toolchain, package boundaries, and import rules
- Phase 0B: Runtime Contracts, fixtures, compatibility vectors, and deterministic Contract tests

Phase 0 contains no persistence, transport implementation, process management, Claude adapter logic, Run workflow, or Graph behavior.

## Workspace decisions

1. Private pnpm workspace.
2. Node.js 24 LTS major is the supported runtime for the first implementation line.
3. ESM-first TypeScript with strict type checking and Node-compatible module resolution.
4. No dual CommonJS output without a concrete consumer requirement.
5. Public packages expose explicit root exports; consumers cannot depend on private deep-import paths.
6. Initial applications are `runtime-server`, `actor-host`, and `runtime-cli`.
7. Initial shared package is `@ai-block/runtime-contracts`; other domain packages are created only when their implementation phase begins.
8. Graph package and Graph schemas are deferred until the Graph phase. Phase 0 may define only an opaque `GraphId` needed by generic references.

The delegated compatibility report selected this exact baseline:

- pnpm `11.10.0`
- TypeScript `7.0.2`
- `@types/node` `24.13.3`
- `@sinclair/typebox` `0.34.49`
- Ajv `8.20.0`
- `ajv-formats` `3.0.1`
- Vitest `4.1.10`
- fast-check `4.8.0`

Production workers do not choose unpinned “latest” dependencies. Phase 0A installs only workspace/toolchain dependencies. Runtime-schema and test dependencies enter in Phase 0B. A maintained RFC 8785 implementation still requires a separate delegated decision before Phase 0B Package hashing begins.

## Contract representation

1. Cross-process Contracts use JSON only.
2. Runtime validation is JSON-Schema-first, implemented with a TypeBox/Ajv family selected by the dependency compatibility report.
3. Every process boundary rejects unknown fields.
4. Optional values are represented by omission. `null` is rejected unless a field explicitly defines `null` as a semantic value.
5. Boundary parsers do not silently apply defaults.
6. Parsed Contract values are returned as defensive, deeply frozen values.
7. Generic Contracts contain backend-neutral concepts only. Claude CLI flags, event shapes, MCP internals, executable paths, and resume mechanics are adapter-private.

## Identity and version policy

1. Internal resource IDs are opaque lowercase strings with a stable resource prefix and UUID payload.
2. IDs are compared case-sensitively and are never parsed for business meaning beyond schema validation.
3. Contract, schema, protocol, and package release versions are distinct concepts.
4. Phase 0 uses exact schema/protocol version `1.0.0` matching. Unsupported versions are rejected; implicit minor-version compatibility is deferred until an actual second version exists.
5. Timestamps use canonical UTC RFC 3339 form with millisecond precision.

## Package canonicalization and hash

1. Package remains immutable after creation.
2. Delivery and route state never participate in Package identity or Package hash.
3. Package hash material includes every immutable Package field, including Package ID, type, schema version, Project ID, creator, timestamp, provenance, and the single root BrickPrompt Body.
4. The `content_hash` field itself is excluded from hash material.
5. Canonical JSON follows RFC 8785 semantics.
6. Hash algorithm is SHA-256 and serialized form is `sha256:` followed by lowercase hexadecimal digest.
7. Object key order is non-semantic; array order is semantic.
8. Contract-level payload size and recursion limits are deferred to Package/API policy. Phase 0 tests structure and canonicalization, not transport quotas.

## Stable error envelope

Shared boundary failures use a stable envelope containing:

- schema version
- stable error code
- error category
- human-readable message
- retryable flag
- optional correlation ID
- optional JSON details object

Validation-library-specific wording and stack traces are never part of the stable Contract.

## Host protocol envelope

Phase 0 defines only the transport-neutral message envelope and variants required for the walking skeleton:

- protocol version
- message ID
- optional correlation ID
- sender sequence
- connection generation
- sent timestamp
- discriminated message kind and payload
- ACK referencing the original message ID

Duplicate message IDs are idempotent within a connection generation. Replay persistence, retry timing, and reconnect recovery are Phase 3 behaviors and are not implemented in Phase 0.

## Testing consequences

The independent Contract suite verifies strict parsing, exact version rejection, discriminated unions, round-trip JSON, deep immutability, canonical hash vectors, stable error categories, Host correlation/ACK shapes, and absence of infrastructure dependencies.
