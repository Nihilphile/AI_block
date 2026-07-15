# Phase 0B Runtime Contracts Design

## Status

Architecture approved on 2026-07-14. This document defines Phase 0B only. Implementation remains slice-authorized through the construction Runbook.

## 1. Outcome

Phase 0B turns `@ai-block/runtime-contracts` into the single cross-process contract package used by Runtime Server, ActorHost, Runtime CLI, and deterministic tests.

It freezes the minimal JSON shapes and boundary semantics needed by the later FakeBackend walking skeleton:

- strict JSON boundary decoding and deep immutability;
- opaque identifiers, exact versions, and canonical timestamps;
- stable error envelopes;
- `BrickPrompt` and `BrickSysPrompt`;
- immutable `Package`, `PackageRef`, and minimal `Delivery` snapshots;
- Package RFC 8785 canonicalization and SHA-256 identity;
- `ActorLaunchSpec`, `InvocationSpec`, and process-level `InvocationResult`;
- the minimal transport-neutral Host protocol envelope and message variants.

Phase 0B contains no persistence, network transport, process management, ActorTemplate compilation, Run workflow, Package routing behavior, Claude Code flags, or Graph schemas beyond opaque `GraphId`.

## 2. Architectural boundaries

`runtime-contracts` owns wire shapes, value validation, canonicalization rules, and stable boundary error data. It owns no state and makes no orchestration decision.

The package must remain importable only through its root export. Its internal directories are implementation organization, not public subpath APIs.

The dependency direction remains:

```text
runtime-contracts
        ↑
runtime-server / actor-host / runtime-cli / tests
```

`runtime-contracts` must never import an application, repository, database, transport, process supervisor, Claude adapter, or Graph evaluator.

## 3. Internal source organization

The implementation should use domain-oriented directories rather than a flat source directory or a catch-all `common`, `shared`, `core`, or `utils` directory:

```text
packages/runtime-contracts/
├── src/
│   ├── validation/
│   ├── identity/
│   ├── error/
│   ├── brick/
│   ├── package/
│   ├── actor/
│   ├── host/
│   └── index.ts
└── test/
    ├── validation/
    ├── brick/
    ├── package/
    ├── actor/
    ├── host/
    └── fixtures/
```

Only directories backed by real files are created. Exact filenames belong to the implementation plan, but each file must have one recognizable contract responsibility.

## 4. Contract representation and decoding

Cross-process values are JSON only. Schemas are `typebox@1.3.6` definitions compiled through Ajv `8.20.0`. TypeScript types are derived from the schemas rather than maintained as parallel handwritten interfaces.

Phase 0B uses the Ajv main export and a JSON Schema Draft-07-compatible TypeBox subset. TypeBox 1.x support for newer drafts does not authorize switching the shared validator to Ajv's 2020-12 mode. Every exported schema must pass a Node 24, TypeScript 7.0.2, NodeNext compile-and-runtime compatibility test against the selected Ajv mode. A builder that emits incompatible schema is rejected or isolated behind a separately approved dialect decision.

All boundary decoders apply the same policy:

1. Input is an already parsed, unknown JavaScript value, not raw JSON text.
2. Before schema validation, the value is safely materialized into inert JSON data.
3. Accepted containers are arrays and plain objects with `Object.prototype` or a null prototype.
4. Accessors, custom prototypes, symbol keys, sparse arrays, cycles, `undefined`, `BigInt`, functions, symbols, and non-finite numbers are rejected.
5. Strings and object keys containing unpaired UTF-16 surrogates are rejected.
6. `-0` is accepted and canonicalizes to `0`, as required by ECMAScript/JCS value semantics.
7. Every schema rejects unknown fields. Ajv coercion, default insertion, and removal of additional fields are disabled.
8. `null` is rejected unless the schema explicitly declares it meaningful.
9. Accepted values are defensive copies and are deeply frozen before being returned.
10. Validation-library wording and stack traces are normalized away from the stable error envelope.

Plain-object outputs retain ordinary JSON object behavior and are populated through own data-property definitions so a `__proto__` key cannot mutate their prototype. Shared but acyclic input references are copied as independent JSON subtrees because JSON has no alias identity.

JavaScript provides no reliable, side-effect-free Proxy detection: even reflection can trigger Proxy traps. Boundary decoding catches reflection failures and returns an invalid-JSON error, but the in-process `unknown` API assumes a non-hostile caller. Untrusted cross-process bytes must first pass through the future transport parser; Phase 0B does not claim a security boundary against a malicious in-process Proxy.

Duplicate object keys and lexical distinctions in raw JSON, including whether a source token was written as `-0`, cannot be recovered from an already parsed value. Detecting those properties belongs to a future transport parser and is outside Phase 0B.

The public decoding entry is named `decodeContract(schema, input)`. Its exact public shape is:

```ts
type ContractValue<T> =
  T extends null | string | number | boolean
    ? T
    : T extends readonly unknown[]
      ? { readonly [K in keyof T]: ContractValue<T[K]> }
      : T extends object
        ? { readonly [K in keyof T]: ContractValue<T[K]> }
        : never;

type ContractDecodeResult<T> =
  | Readonly<{ ok: true; value: ContractValue<T> }>
  | Readonly<{ ok: false; error: ContractErrorEnvelope }>;

function decodeContract<TSchema extends Type.TSchema>(
  schema: TSchema,
  input: unknown,
): ContractDecodeResult<Type.Static<TSchema>>;
```

`ContractValue<T>` is exported and reflects recursive runtime immutability for primitives, arrays, and object properties. The implementation may cache compiled validators privately but may not expose Ajv instances, raw Ajv errors, materialization helpers, normalizers, or freeze helpers. Phase 0B does not add a throwing assertion API. If exact TypeBox 1.3.6 namespace names differ from this signature during the required compile gate, implementation stops for a Controller clarification rather than changing the public behavior.

## 5. Identity, version, and time

Internal resource IDs are opaque, lowercase, prefix-qualified UUID strings. Phase 0B defines the identifiers required by the current contracts, including Project, ActorTemplate, ActorConfigSnapshot, Actor, Package, Delivery, Run, Invocation, Host instance, Host message, Client principal, and opaque Graph identifiers.

The UUID payload is validated structurally but no business meaning is inferred from its version bits. Generation policy belongs to the owning runtime module.

The exact B.1 prefixes are frozen as follows:

| Type | Prefix |
|---|---|
| `ProjectId` | `project_` |
| `ActorTemplateId` | `actor_template_` |
| `ActorConfigSnapshotId` | `actor_config_` |
| `ActorId` | `actor_` |
| `PackageId` | `package_` |
| `DeliveryId` | `delivery_` |
| `RunId` | `run_` |
| `InvocationId` | `invocation_` |
| `HostInstanceId` | `host_` |
| `HostMessageId` | `message_` |
| `ClientPrincipalId` | `client_` |
| `GraphId` | `graph_` |

Each prefix is followed by a canonical lowercase `8-4-4-4-12` hexadecimal UUID payload. Uppercase, braces, compact UUIDs, and alternate separators are rejected. The schemas do not require or interpret a particular UUID version or variant. Backend session IDs are adapter-owned opaque strings and are defined with Invocation contracts rather than this resource-ID family.

Contract schema version, Package schema version, and Host protocol version are separate exported concepts. Their Phase 0 values are all exactly `1.0.0`; each appears under the field appropriate to its contract and unsupported values fail closed.

Timestamps use UTC RFC 3339 with exactly millisecond precision:

```text
YYYY-MM-DDTHH:mm:ss.SSSZ
```

Decoders validate both lexical form and calendar validity. Canonical timestamps accept years `0001` through `9999`, uppercase `T` and `Z`, hours `00` through `23`, and seconds `00` through `59`. Year `0000`, leap-second `60`, offsets, lowercase separators, `24:00`, missing fractions, and fractions other than exactly three digits are rejected.

B.1 exports only the Contract version family:

- `CONTRACT_SCHEMA_VERSION` with exact value `1.0.0`;
- `ContractSchemaVersionSchema`;
- derived type `ContractSchemaVersion`.

`PACKAGE_SCHEMA_VERSION` and its schema/type are introduced in B.2; `HOST_PROTOCOL_VERSION` and its schema/type are introduced in B.3. All remain distinct concepts even while their first values are equal.

## 6. Stable error envelope

The shared error value contains:

- `schema_version`;
- stable lowercase dotted `code`;
- category;
- human-readable `message`;
- `retryable`;
- optional `correlation_id`;
- optional JSON object `details`.

The initial category set is structural rather than module-specific: validation, compatibility, authentication, authorization, not-found, conflict, unavailable, timeout, backend, and internal.

Specific Server and Host modules may add stable error codes later without changing the envelope. Ajv paths may be normalized into deterministic details, but Ajv messages are never the public code or message contract.

B.1 freezes these initial codes and fixed public messages:

| Code | Category | Message |
|---|---|---|
| `contract.invalid_json_value` | validation | `Invalid JSON contract value.` |
| `contract.schema_mismatch` | validation | `Contract schema validation failed.` |
| `contract.unsupported_version` | compatibility | `Unsupported contract version.` |

Materialization failures use details `{ path, reason }`, where `path` is an RFC 6901 JSON Pointer and `reason` is one of:

```text
accessor_property
custom_prototype
symbol_key
sparse_array
array_extra_property
cyclic_reference
unsupported_type
non_finite_number
lone_surrogate
reflection_failed
```

Schema failures use `{ issues: [{ path, rule }] }`, where `rule` is one of:

```text
required
additional_property
type
literal
format
range
structure
reference
```

Ajv `required` and `additionalProperties` failures point at the affected child JSON Pointer. `const` and `enum` map to `literal`; lexical patterns map to `format`; numeric/string/array bounds map to `range`; composition and collection-shape keywords map to `structure`; references map to `reference`. Issues are deduplicated and sorted by path and then rule. Raw values, Ajv messages, schema paths, stacks, and library-specific params are never exposed. Empty details are omitted rather than emitted as `null`.

Generic `decodeContract` returns `contract.invalid_json_value` for materialization failure and `contract.schema_mismatch` for schema failure. `contract.unsupported_version` is reserved for version-aware top-level decoders introduced with their owning Package or Host contracts; a generic literal mismatch is not guessed to be a version error.

Public schema constants use PascalCase with a `Schema` suffix, their derived value types use the same base name without the suffix, and exact version values use uppercase constants. Public B.1 symbols include `JsonValueSchema`, `JsonObjectSchema`, `ContractDecodeResult`, `decodeContract`, the ID schemas/types above, separate schema/version constants, `CanonicalTimestampSchema`, and `ContractErrorEnvelopeSchema`. Private helper filenames do not define additional public API.

## 7. Brick contracts

`BrickPrompt` is ordinary model input and is a recursive discriminated union:

- `TextBrickPrompt`: `{ kind: "text", text: string }`, with non-empty text;
- `CompositeBrickPrompt`: `{ kind: "composite", parts: BrickPrompt[] }`, with a non-empty ordered child list.

This gives every Package exactly one root Body while allowing the Actor Module to compose several accepted Packages into one ordered invocation prompt.

`BrickSysPrompt` is the separate shape `{ kind: "system_text", text: string }` with non-empty system-instruction text. Package Body schemas accept only `BrickPrompt`; no decoder or conversion helper may reinterpret a Package Body as `BrickSysPrompt`. Text is not trimmed or normalized by the Contract layer; a non-empty whitespace-only string is structurally valid.

Public B.2 Brick symbols are `TextBrickPromptSchema`, `TextBrickPrompt`, `CompositeBrickPromptSchema`, `CompositeBrickPrompt`, `BrickPromptSchema`, `BrickPrompt`, `BrickSysPromptSchema`, and `BrickSysPrompt`. Every object branch rejects unknown fields.

Backend and Tool bricks are not frozen as public domain schemas in Phase 0B. Their cross-process launch representation is the controlled adapter extension described below; ActorTemplate compilation remains a later Actor Module responsibility.

## 8. Package contracts and hashing

`Package` has exactly two top-level fields:

```text
Package
├── head
└── body: one BrickPrompt
```

The Head contains immutable identity and provenance only:

- Package ID and Package schema version;
- Package type;
- Project ID;
- creator identity;
- creation timestamp;
- content hash;
- provenance, including ordered parent Package refs and optional Run/Invocation origin.

The initial Package type vocabulary is `task`, `request`, `artifact`, `report`, `summary`, `result`, `error`, and `state_patch`.

Creator identity is a discriminated union for Client, Actor, or Runtime creation. It identifies the creating principal; authoritative Run and Invocation context belongs to provenance. Runtime creation is explicit rather than represented by a missing creator.

The exact B.2 creator shapes are:

```text
{ kind: "client", client_id: ClientPrincipalId }
{ kind: "actor", actor_id: ActorId }
{ kind: "runtime" }
```

Creator identifies the creating principal only. Authoritative Run and Invocation context belongs to provenance rather than being duplicated inside the Actor creator branch.

`PackageProvenance` always contains the ordered `parent_refs` array, which may be empty. It has exactly three strict variants:

```text
{ parent_refs }
{ parent_refs, run_id }
{ parent_refs, run_id, invocation_id }
```

An Invocation origin therefore always has a Run origin. Relationship rules between creator kind and provenance are enforced later by the Package Module when it creates a Package; the cross-process structural schema does not guess workflow authority.

`PackageRef` always carries both `package_id` and `content_hash`. This allows a consumer to detect a mismatched immutable record instead of treating an ID alone as sufficient content identity.

`ContentHash` has exact form `sha256:` followed by 64 lowercase hexadecimal characters.

The exact Package wire shape is:

```text
Package
├── head
│   ├── package_id
│   ├── package_type
│   ├── schema_version
│   ├── project_id
│   ├── created_by
│   ├── created_at
│   ├── content_hash
│   └── provenance
└── body: BrickPrompt
```

Mutable route state is excluded from Package. The exact minimal `Delivery` snapshot is:

```text
{
  delivery_id,
  package_ref,
  project_id,
  run_id,
  target_actor_id,
  state,
  created_at
}
```

`DeliveryState` is exactly `pending | delivered | acknowledged | failed`. Delivery transition behavior and update timestamps remain in the future Package Module.

B.2 exports `PACKAGE_SCHEMA_VERSION` with value `1.0.0` plus `PackageSchemaVersionSchema` and `PackageSchemaVersion`. It also exports schema/type pairs named `PackageType`, `ContentHash`, `PackageRef`, `PackageCreator`, `PackageProvenance`, `PackageHead`, `Package`, `PackageHashMaterial`, `DeliveryState`, and `Delivery`, using the usual `Schema` suffix for each schema constant.

### 8.1 Canonicalization decision

Phase 0B pins `canonicalize@3.0.0` as the RFC 8785 implementation. It is ESM-only, has zero runtime dependencies, is listed by RFC 8785 Appendix G, and matches the Node 24 ESM baseline.

The package is invoked only through a narrow wrapper after the inert JSON and schema gates have succeeded. No replacer, comparator, spacing option, `toJSON`, or arbitrary JavaScript object is accepted.

Hash material is the complete Package value with only `head.content_hash` omitted. All other immutable fields participate, including Package ID, type, version, Project, creator, timestamp, provenance, and Body.

The canonical string is encoded as UTF-8 and hashed with Node SHA-256. The serialized hash is:

```text
sha256:<64 lowercase hexadecimal characters>
```

Object key order is non-semantic, array order is semantic, and `-0` and `0` have the same canonical value.

Package creation remains a future Package Module operation. Runtime Contracts exports the pure hash-material, compute, and verify primitives needed to enforce the cross-process identity rule; it does not allocate IDs, persist records, or publish Packages.

The exact B.2 hashing API is:

```ts
function derivePackageHashMaterial(
  input: unknown,
): ContractDecodeResult<PackageHashMaterial>;

function computePackageContentHash(
  input: unknown,
): ContractDecodeResult<ContentHash>;

function verifyPackageContentHash(
  input: unknown,
): ContractDecodeResult<boolean>;
```

`derivePackageHashMaterial` accepts a full Package, validates it, and returns the frozen `{ head, body }` value with only `head.content_hash` omitted. `computePackageContentHash` accepts and validates a PackageHashMaterial value. `verifyPackageContentHash` accepts and validates a full Package; a structurally valid Package with a mismatched digest returns `{ ok: true, value: false }`, while malformed input returns the normal decode failure.

An unexpected canonicalizer failure after successful validation returns code `contract.canonicalization_failed`, category `internal`, fixed message `Package canonicalization failed.`, `retryable: false`, and no library-specific details. Canonicalization never throws a dependency-owned error across the public API.

## 9. Actor execution contracts

`ActorLaunchSpec` is an immutable Host initialization snapshot containing:

- schema version, Project ID, Actor ID, and ActorConfigSnapshot ID;
- ordered `BrickSysPrompt` values;
- a working-directory value;
- one backend adapter launch entry;
- an ordered set of tool-provider launch entries.

Backend and tool entries use a strict public wrapper:

```text
adapter_id/provider_id + config: JsonObject
```

The wrapper rejects unknown fields. The `config` field is an intentional JSON extension point and must receive second-stage validation from the selected adapter/provider before use. This preserves a backend-neutral shared package: Claude Code flags, executable discovery, MCP internals, Skills layout, and resume mechanics never become generic Runtime Contract fields.

`InvocationSpec` contains:

- schema version and Project/Run/Actor/Invocation identity;
- an ordered set of accepted PackageRefs;
- exactly one root `BrickPrompt` input;
- an explicit session directive: create, or resume with an opaque backend session ID.

No system prompt or tool mutation appears in an InvocationSpec.

`InvocationResult` is a process-level fact, not a Run completion decision. It reports Invocation identity, the observed backend session ID when available, process outcome/exit facts, emitted PackageRefs, whether completion was requested, and an optional stable error. Server Run Engine remains authoritative for completed, waiting, failed, or cancelled Run state.

## 10. Host protocol contracts

Every Host message uses one transport-neutral envelope containing:

- exact protocol version;
- message ID;
- optional correlation ID;
- non-negative sender sequence;
- positive connection generation;
- sent timestamp;
- discriminated message payload.

The minimal Phase 0B message set is:

Server to Host:

- initialize ActorHost with ActorLaunchSpec;
- start Invocation with InvocationSpec;
- stop Invocation;
- shutdown Host;
- ACK.

Host to Server:

- Host hello/registration identity;
- ready report;
- heartbeat;
- backend session report;
- process-level InvocationResult;
- Package publication request;
- completion request;
- Host fault;
- ACK.

A Package publication request contains only Actor-produced semantic material: idempotency key, Package type, one BrickPrompt Body, and parent PackageRefs. Server-side identity, Project, Actor, Run, Invocation, timestamp, and hash are authoritative and are not trusted from the Actor payload.

ACK references the original message ID. Duplicate message IDs are defined as idempotent within one connection generation, but retry timers, replay persistence, and reconnect reconciliation are not implemented in Phase 0B.

## 11. Dependency policy

Phase 0B adds only the already selected, exact versions:

- runtime: `typebox` `1.3.6`, Ajv `8.20.0`, `ajv-formats` `3.0.1`, and `canonicalize` `3.0.0`;
- test/development: Vitest `4.1.10` and fast-check `4.8.0`.

The existing exact Node, pnpm, TypeScript, and `@types/node` baseline remains unchanged. Lockfile changes are expected and frozen installation must remain reproducible.

## 12. Verification strategy

The deterministic Contract suite must cover:

1. positive and negative decoding for every public schema;
2. unknown-field, invalid-null, invalid-version, invalid-ID, and invalid-timestamp rejection;
3. inert JSON materialization, including custom prototype, accessor, sparse array, cycle, non-finite number, and lone-surrogate rejection;
4. defensive-copy and recursive-freeze behavior;
5. Brick recursive unions and the strict single Package Body invariant;
6. Package hash verification and sensitivity to every immutable field except `content_hash`;
7. object-key permutation invariance and array-order sensitivity with fast-check;
8. a curated, attributed set of RFC 8785/Cyberphone canonicalization vectors, including number and UTF-16 key ordering cases;
9. strict Host envelope/message discriminators, correlation, ACK, generation, and sequence rules;
10. round-trip JSON compatibility fixtures consumed through the package root by each application;
11. TypeScript 7.0.2 build and Node 24 runtime verification;
12. Package dependency and project-reference boundaries without introducing a handwritten JavaScript/TypeScript import parser.
13. compile-and-runtime compatibility of every exported TypeBox schema with the selected Ajv main-export dialect.

Vendored RFC fixture material must include source and Apache-2.0 attribution. The 100-million-number corpus is not committed or run in the default suite; a small high-value deterministic subset is sufficient for Phase 0B.

## 13. Sequential delivery inside Phase 0B

One Luna Coder is reused for the whole Runtime Contracts module to retain context, but work is authorized in small sequential slices:

```text
B.1 validation, identity, version, timestamp, and stable error kernel
→ B.2 Brick and Package contracts plus JCS/SHA-256 primitives
→ B.3 ActorLaunchSpec, Invocation contracts, and Host protocol
→ B.4 compatibility fixtures, boundary verification, and module-level hardening
```

Every slice begins with the required read-only Coder preflight. The controller issues `IMPLEMENTATION_AUTHORIZED` only after implicit decisions and gaps are resolved. Tester remains independent. A module-level Reviewer is scheduled after B.4, with earlier review only if a slice changes cross-process semantics unexpectedly or exposes a high-risk issue.

## 14. Deferred decisions

The following are explicitly not frozen by Phase 0B:

- raw HTTP/WebSocket JSON parser behavior, including duplicate-key rejection;
- transport framing, authentication, retry timing, and replay persistence;
- database representations and migration policy;
- ActorTemplate, ActorConfigSnapshot compilation, and adapter-specific config schemas;
- Package publication, idempotency storage, Delivery transitions, and routing;
- Run state transitions and wake-up policy;
- GraphTemplate, GraphInstance, Node, Connection, and GraphPolicy schemas;
- payload quotas, recursion limits, archival, and garbage collection;
- compatibility negotiation beyond exact `1.0.0` matching.

## 15. Acceptance boundary

Phase 0B is accepted when the root-exported package builds reproducibly, all deterministic contract and compatibility tests pass, official JCS vectors are attributed and green, malformed boundary values fail with stable errors, outputs are deeply immutable, no infrastructure behavior enters the package, and independent Tester/Reviewer reports find no unresolved correctness or boundary issue.
