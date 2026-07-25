## Context

The Runtime currently has a reference-only ActorTemplate/Snapshot application
boundary. It already validates exact Definition Brick references and exposes
`DefinitionBrickResolverPort`, repository ports, and Unit-of-Work patterns, but
all persistence implementations in that boundary are test-only. There is no
authoritative Project record, durable Definition Brick aggregate, production
resolver, or Server composition root.

This change introduces the smallest durable Server-owned producer needed by
that existing consumer. It is a W3 public-boundary change because it adds shared
Runtime Contracts, a new state owner, a persistence substrate, and a
cross-module resolver adapter.

The repository supports Node `>=24 <25` today and has no SQLite package.
Official Node 24 documentation establishes that built-in `node:sqlite` supplies
the required file-backed, prepared-statement, transaction, constraint, and
migration primitives. Its stability becomes release candidate at Node 24.15.0,
so this design raises the minimum Node version rather than adding a third-party
native dependency.

## Goals / Non-Goals

**Goals:**

- Establish an explicit, durable Project identity prerequisite.
- Provide strict Definition Brick create, revise, archive, read, list, history,
  and exact-revision resolution.
- Preserve immutable revision provenance and the existing Actor digest and
  resolver semantics.
- Define a typed shared application boundary without inventing HTTP, CLI, or
  file-import grammar.
- Prove transactional rollback, optimistic revision concurrency, restart
  durability, schema compatibility, integrity failure, and Actor-side
  resolution.
- Establish a real Project/persistence state owner with bounded Project State
  maintenance.

**Non-Goals:**

- Project selection, activation, deactivation, deletion, aliasing, permissions,
  workspace-root mutation, or multiple-active-Project behavior.
- Actor creation, ActorPool, ActorTrace, Host launch, `model_id` transport, or a
  Server composition root.
- Production ActorTemplate/Snapshot repositories or one cross-family Unit of
  Work.
- Package/Delivery, Run/Invocation, CLI/HTTP, recovery automation,
  backup/export/import, or Graph.
- Package-as-Brick, file auto-registration, digest deduplication, or a general
  persistence framework.

## Decisions

### 1. One new Project module owns this slice

Create one Runtime Server Project module that owns the minimal Project record,
Definition Brick aggregates/revisions, their application operations, repository
ports, and transaction semantics. Infrastructure adapters depend inward on this
module. The Actor Module consumes exact persisted revisions through its existing
resolver port and does not gain database authority.

This keeps the first durable producer independently acceptable. Splitting
Definition Brick persistence into another module remains possible after usage
reveals an independently hand-offable boundary.

**Alternative considered:** put Brick persistence into the Actor Module and
Project records elsewhere. Rejected for this slice because Project existence
and the Project-local Brick namespace must commit under one explicit owner
before ActorTemplate/Snapshot persistence is introduced.

### 2. Shared Contracts define application values, not transport

Add strict root-exported Runtime Contract schemas for the minimal Project record
and Project/Definition Brick application commands, results, summaries, and
stable error categories. Reuse the existing Definition Brick Body, exact
reference, revision, digest, identity, and time values.

Do not add HTTP routes, CLI grammar, file paths, database rows, or
driver-specific errors to Runtime Contracts. Local ports may wrap these shared
values but may not create a competing public schema.

**Alternative considered:** keep all authoring types private until an external
adapter exists. Rejected because the new Project module and existing Actor
consumer form a real cross-module boundary, and later adapters should translate
into one already validated application surface.

### 3. Use built-in `node:sqlite` with a Node 24.15 floor

Set the supported Node engine to `>=24.15 <25` and implement the file-backed
adapter with built-in `node:sqlite` `DatabaseSync`/`StatementSync`. Do not add a
third-party SQLite runtime package.

The adapter must:

- use prepared statements and bound values;
- keep extension loading disabled;
- explicitly enable foreign keys and defensive mode;
- use an explicit, bounded busy timeout;
- deliberately handle integer conversion and safe-range behavior;
- close connections deterministically in tests and lifecycle wiring.

Synchronous database work is acceptable for this first local, bounded module
slice. Operations and migrations must remain small; no long-running query or
busy-wait policy is introduced.

**Alternative considered:** a third-party async/native SQLite driver. Deferred
because the built-in API provides the required primitives and avoids another
native supply-chain and compatibility surface. Reconsider only if measured
Server concurrency requirements later invalidate the synchronous boundary.

### 4. Require an explicit Server-owned database path

Persistence initialization receives an authoritative absolute database file
path from Server configuration. It must not derive product state from the
current working directory or place persistence inside an arbitrary Project
repository. One physical database may contain multiple logically isolated
Projects even though Direct Actor MVP activates at most one Project at a time.

There is no platform-default data directory or public configuration API in this
slice. Supplying and validating the path is an application/bootstrap
responsibility exercised through tests until a Server composition root exists.

### 5. Use aggregate plus immutable-revision records

The initial logical schema contains:

- a schema/migration ledger;
- Project records;
- Definition Brick aggregate records keyed by Project and Brick identity;
- immutable Definition Brick revision records keyed by aggregate and revision.

Create writes revision `1` and its aggregate atomically. Revise compares the
stored current revision with `base_revision`, appends a fresh revision identity,
and advances the aggregate atomically. Equal content digests never collapse
explicit revisions. Archive changes aggregate lifecycle only; it never deletes
history or releases the Brick ID.

All Definition Brick kinds share one Project-local Brick namespace. Brick kind
is immutable. Unrelated resource types do not share that namespace.

### 6. Keep transaction semantics module-owned and fail closed

Expose a Project module Unit-of-Work/transaction port. The SQLite adapter uses
explicit `BEGIN`/`COMMIT`/`ROLLBACK` handling and acquires write intent before a
multi-statement mutation. Strict create, revision compare-and-set, archive, and
migration ledger updates are protected by database constraints as well as
application checks.

A transaction exception must roll back before the error is mapped. Lock,
constraint, driver, and schema failures map to stable owning-boundary errors;
they must not leak SQL or driver details across Runtime Contracts.

**Alternative considered:** coordinate Brick writes through the existing Actor
Unit of Work. Rejected because that Unit of Work currently owns
ActorTemplate/Snapshot test persistence and would prematurely create a
cross-family transaction.

### 7. Preserve Actor resolver semantics through an adapter

The infrastructure/application integration exposes an adapter compatible with
the existing Actor `DefinitionBrickResolverPort`. It returns the exact
Contract-valid revision or ordinary absence; it never substitutes the latest
revision.

Before returning data, the adapter verifies Project/ID/revision binding, strict
Contract shape, canonical Body, and digest. Corruption is a distinct fail-closed
integrity error, not a missing record. Archived exact revisions remain
resolvable for accepted historical provenance.

### 8. Start with schema version 1 and no legacy data migration

The repository has no accepted production Runtime database, so schema version 1
is a clean bootstrap rather than a data migration. Initialization creates an
empty compatible store atomically or validates an existing compatible store.
An unknown newer version, failed migration, or invalid required configuration
prevents the adapter from serving any Project/Brick operation.

Rollback of application code must preserve the database file for diagnosis.
No destructive automatic downgrade is allowed. Because no earlier product
schema exists, there is no legacy import path in this change.

### 9. Project State changes follow established ownership

Planning artifacts do not create a Project State card. When implementation
creates a real Project module with owned source/test roots, the implementing
Coder may create only its directly affected module card under explicit Task
authority.

The Runtime Contracts card changes only when the new accepted shared surface is
implemented. The Actor card changes only if its production dependency,
implemented behavior, condition, or read/evidence route changes. Testers report
card mismatches without editing claims; Reviewers verify changed cards against
the exact implementation subject.

The Orchestrator alone reconciles `project_state/README.md`,
`_meta/system-map.md`, `_meta/current-focus.md`, and cross-module
accepted/deferred summaries at module acceptance.

## Risks / Trade-offs

- **Synchronous SQLite work can block the Server event loop** → keep statements
  and transactions bounded, use a short explicit lock timeout, and require
  contention evidence; revisit the adapter only with measured need.
- **`node:sqlite` is release-candidate rather than stable in Node 24.15** →
  enforce the minimum version, pin CI/verification to the supported range, and
  include clean-install/type/runtime compatibility evidence.
- **A Project module that also owns Bricks may become broad** → limit this slice
  to the Project prerequisite and Brick authoring aggregate; do not absorb
  ActorTemplate/Snapshot or generic namespace infrastructure.
- **Shared Contract additions can get ahead of real consumers** → expose only
  operations implemented by this slice and one existing Actor resolver
  integration; omit transport grammar.
- **Corruption or incompatible schema could be mistaken for absence** → validate
  stored shape/digest and fail closed with separate integrity/schema errors.
- **Project State may overclaim end-to-end persistence** → create/update only
  directly affected cards and state explicitly that Server composition,
  ActorTemplate/Snapshot persistence, and execution remain absent.

## Migration Plan

1. Enforce the Node `>=24.15 <25` compatibility floor and verify built-in
   `node:sqlite` typing/runtime availability.
2. Add and independently verify the shared Project/Definition Brick Contract
   surface.
3. Implement the Project module domain/application boundary and deterministic
   in-memory evidence.
4. Implement schema version 1 and the SQLite adapter with transaction,
   integrity, restart, and failure evidence.
5. Add the existing Actor resolver adapter and focused cross-module evidence.
6. Create/reconcile directly affected module cards, then run independent
   integrated testing and module/boundary review against the committed subject.
7. The Orchestrator reconciles root/meta Project State and records closeout.

No existing persisted product data is transformed. If acceptance fails, do not
delete a produced database automatically; retain it as evidence, stop serving
it, and either correct forward under a bounded Task or remove only explicitly
identified disposable test artifacts.

## Open Questions

No product question remains open for the bounded slice. Implementation
preflight must select and record:

- the exact nonzero busy timeout and same-process write serialization mechanism;
- the schema version table and migration file/layout convention;
- the exact source/test roots and dependency-injection wiring before creating
  the new Project State card.

These are delegated implementation choices only within the requirements above;
they do not authorize a Server daemon, default platform data directory, or
external API.
