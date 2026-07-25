# PP-explore-001 Persistence-first Boundary — Exploring Report

- inspected repository subject: `166b1ac261c9d1a783339541ff7415581d87f7e4`
- question: Is a persistence-first Project and Definition Brick authoring slice the smallest coherent next construction step for the accepted reference-only ActorTemplate/Snapshot boundary?
- decision informed: the scope and required decisions for a later W3 implementation proposal owned by the future Project/persistence boundary.

## Answer first

**Yes.** A Server-owned Project plus immutable Definition Brick authoring and exact-revision resolution is a coherent, independently acceptable next slice.  It supplies the authoritative records required by the existing Actor validation path, without changing Actor lifecycle or beginning any execution workflow.  The recommended slice is deliberately **not** a production conversion of the ActorTemplate/Snapshot repositories: that would add a second aggregate family and enlarge the persistence transaction boundary before Project/Brick semantics are accepted.

## Verified facts

### Present consumer boundary and reusable seams

- Runtime Contracts already makes Project identity, human-readable Brick identity, immutable positive revisions, Brick kind, revision UID, digest, and typed Brick bodies values: `packages/runtime-contracts/src/identity/identity.ts` (`ProjectIdSchema`, `DefinitionBrickRevisionIdSchema`, `PositiveRevisionSchema`, `BrickKindSchema`) and `packages/runtime-contracts/src/actor-template/schemas.ts` (`DefinitionBrickRevisionSchema`).  The revision view is Project-scoped and contains `brick_id`, `revision`, `kind`, `body`, `digest`, and `created_at`.
- `DefinitionBrickResolverPort.resolveExact(projectId, ref)` is the only current Actor-side need for persisted Bricks, and returns `DefinitionBrickRevision | undefined`: `apps/runtime-server/src/modules/actor/ports.ts`.
- `resolveAndValidateActorTemplateCandidate` resolves every exact reference, checks Project/id/revision binding, validates the returned Contract shape, recomputes the Brick digest, and rejects provenance drift during Snapshot compilation: `apps/runtime-server/src/modules/actor/validation.ts` (`resolveCandidate`); `apps/runtime-server/src/modules/actor/values.ts` (`bindDefinitionBrickRef`, `computeDefinitionBrickDigest`).  A persistence adapter must therefore preserve exact historical rows, not merely a latest Brick body.
- The current Project namespace seam is intentionally narrow: `ProjectNamespacePort.inspect/reserve` currently admits only `ActorResourceKind = "actor_template"`, and is combined with ActorTemplate/Snapshot repositories in `ActorUnitOfWork`: `apps/runtime-server/src/modules/actor/ports.ts`.  It is reusable as a pattern but not directly sufficient for a Brick aggregate or Project bootstrap.
- The Actor application service supplies reusable persistence behavior patterns: strict non-upsert create with namespace reservation, compare-and-set revision append, idempotent archive, explicit repository outcomes, and one Unit-of-Work callback: `apps/runtime-server/src/modules/actor/application.ts` (`create`, `revise`, `archive`, `compileAndPersist`).
- The test in-memory adapters are a useful test pattern, not a production adapter.  They clone state and roll back namespace/template/snapshot writes around `ActorUnitOfWorkPort.run`: `apps/runtime-server/test/modules/actor/in-memory-adapters.ts` (`createInMemoryActorAdapters`).  Tests cover strict create, immutable history, archive behavior, failure rollback, and Snapshot persistence failure: `apps/runtime-server/test/modules/actor/actor-application.test.ts` (the tests beginning at lines 121, 180, 356, and 420).
- `computeDefinitionBrickDigest` provides the existing canonical digest rule, including prompt text normalization: `apps/runtime-server/src/modules/actor/values.ts`.  No new digest algorithm is required for a Project/Brick slice.

### Present exclusions and configuration evidence

- The accepted Actor boundary is reference-only and says that its repository/UoW implementations are test-only; no production persistence adapter belongs to that boundary: `project_state/apps/runtime-server/modules/actor/README.md` (“Implemented today”).  The accepted closeout likewise states that concrete Brick/Template/Snapshot persistence, namespace, workspace, validator, HTTP, and CLI adapters are absent: `docs/construction/records/actor-template/reference-only-actor-template-closeout.md` (“Deferred scope and risk”).
- The current future design assigns Project/Brick authoring to the Runtime Server, says the Server is the authoritative writer, requires stable Brick aggregate identity with immutable revisions, and puts repositories/transactions behind owning Server modules: `docs/design/future/project-persistence-and-brick-authoring.md` (“Accepted future boundaries”).  It is expressly draft input, not a physical schema or implementation authorization.
- Neither `apps/runtime-server/package.json`, root `package.json`, nor `pnpm-lock.yaml` contains a SQLite/persistence library or migration tool (narrow `rg` inspection).  Selecting and adding a durable substrate would therefore be a new proposal decision, not reuse of an installed persistence stack.
- Current Runtime invariants require Project-scoped Definition Brick references, immutable self-contained Snapshots, Contracts as the shared schema/value boundary, and module-owned storage rather than infrastructure leakage: `docs/design/current/runtime-invariants.md`, confirmed-current items 1–3 and 8–9.

## Strong inference

The existing Contract's `DefinitionBrickRevision` is sufficient for the Actor resolver and Snapshot provenance, but it does not define a Brick aggregate summary, Project record, authoring command/result, repository operation, persistence status, or migration/public-adapter shape.  A new owner module can therefore implement the necessary aggregate and storage ports without changing the existing Actor resolver Contract; external authoring inputs/results will still need an explicit Contract decision if the new application interface crosses an application/process boundary.

Project+Brick-only is independently useful: it establishes authoritative Project-local, immutable, exact-revision records and can be proven through its own authoring and resolver tests.  It does not falsely imply that ActorTemplate or Snapshot persistence is already durable.  By contrast, making one production Unit of Work cover namespace, Bricks, ActorTemplates, and Snapshots now requires defining aggregate ownership and cross-family transaction semantics that the current scope does not need.

## Recommended boundary

### Minimum deliverable

One Server-side **Project persistence and Definition Brick authoring module** with:

1. A minimal Project record and explicit bootstrap/create operation sufficient to establish an authoritative `ProjectId`; Project selection, activation, deactivation, deletion, aliasing, and permissions are excluded.
2. Definition Brick create, exact-revision read/resolve, aggregate read/list/history, revise with stale-base detection, and archive operations.  Create is strict (never upsert); each revision is immutable and persists Project/id/kind/revision UID/body/digest/timestamp.
3. A module-owned Brick repository plus transaction port.  A resolver adapter implements the existing `DefinitionBrickResolverPort` so the Actor module can consume authored exact revisions unchanged.
4. Canonical body normalization and `computeDefinitionBrickDigest`-equivalent integrity checks at the authoring boundary and read/resolve boundary.
5. Tests patterned after the Actor in-memory adapter tests: strict create, exact Project-local resolution, revision CAS, archive/historical resolvability, transaction rollback, and digest/provenance corruption rejection.

This meets the persistence-first objective without claiming a Client/HTTP/CLI interface.  A module-local application service and deterministic Contract-shaped results can be accepted before an adapter is introduced.

### Plausible boundaries compared

| Boundary | What it delivers | Why it is or is not recommended |
| --- | --- | --- |
| **A. Project + Brick authoring/resolution (recommended)** | Durable Project and immutable Brick records, authoring operations, repository/UoW, and an Actor `DefinitionBrickResolverPort` adapter. | Smallest authoritative producer for the accepted Actor consumer.  It leaves ActorTemplate/Snapshot production persistence and all execution work out. |
| B. Project + Brick + production ActorTemplate/Snapshot persistence | One durable UoW for namespace, Bricks, Templates, and Snapshots; potentially wires `ActorTemplateApplicationService` to storage. | Plausible later continuation, but it requires unaccepted ownership and transaction coupling across four resource families and is not required to author/resolve Bricks. |
| C. Full Direct Actor persistence/authoring and launch | Adds Actor creation, Snapshot-to-Actor transition, Host launch, and likely external adapters. | Explicitly conflicts with the task exclusions and the accepted Actor module boundary. |

### Explicit exclusions

No Actor creation or ActorPool, Host launch, `model_id` transport/LaunchSpec, Package/Delivery workflow, Run/Invocation, CLI or HTTP behavior, recovery, Graph, Package-as-Brick, file import/auto-registration, workspace-root mutation, backup/export/import, or Project deletion belongs in boundary A.  ActorTemplate and Snapshot durable repositories are also excluded; their existing reference-only implementation remains unchanged.

## Contract and public-boundary decision required before proposal

The proposal must close **one** Contract boundary decision: whether the Project/Brick authoring application API is a shared Runtime Contract now, and—if so—the exact command/result/error schemas for Project bootstrap and Brick create/revise/archive/read/list/history.  Recommendation: make those typed values part of `@ai-block/runtime-contracts`, consistent with the current ActorTemplate command schemas, while keeping HTTP/CLI/wire grammar out of this slice.  Existing `DefinitionBrickRevisionSchema`, exact refs, body schemas, and digest representation should be reused; do not change the Actor resolver interface unless evidence exposes a missing resolver need.

The implementation proposal must also select a first durable Server-owned storage substrate, data-root/bootstrap responsibility, and minimum transaction serialization rule.  SQLite is only a draft candidate in the future design, so it cannot be assumed.  A physical schema, migration numbering, public wire shape, file mapping, digest deduplication, and backup policy are not decisions this report settles.

## Project State maintenance consequence

- The directly affected existing card is `project_state/apps/runtime-server/modules/actor/README.md`.  It must be reconciled if the accepted implementation wires a production Project/Brick resolver or otherwise changes that card's dependency direction, persistence statement, source/test entry points, or current condition.  A Brick-only module that is not wired into Actor production behavior does not justify claiming the Actor module has production persistence.
- A new Project/persistence card is **not warranted at planning**: Project State is a current-state read model, not a future-work promise (`project_state/README.md`).  It is warranted **during implementation** once an owned module, source/test roots, and current condition exist; its final accepted condition must be reconciled at acceptance.
- The Project State root route and cross-module/meta surfaces remain Orchestrator-owned: the cross-module system map, current focus, and accepted/deferred summaries are not Worker-owned (`project_state/README.md`, “Maintenance”).  This exploration reports the needed update and does not edit those surfaces.

## Decisions that block the recommended slice

1. Confirm the Project bootstrap identity/data-root authority and the first durable Server-owned persistence substrate; the current repository provides no established production store.
2. Accept the minimal transaction/concurrency rule needed to make strict create, revision CAS, archive, and exact historical resolution atomic.
3. Close the Project/Brick authoring Contract boundary described above (shared typed application schemas now, with no HTTP/CLI adapter, is recommended).

All other draft questions—Project aliasing/deactivation/deletion, source-file metadata/import mapping, digest deduplication, Template/Snapshot persistence, backup/export/import, and future module separation—do not block boundary A because they are explicitly excluded.

## Unknowns

- There is no accepted physical persistence design, migration convention, or operational data-root policy in the authorized evidence.
- The evidence does not decide whether Definition Brick persistence will permanently remain Actor-adjacent or become a separate module; boundary A should establish the new owner without deciding that later organizational question.
- No authorized evidence specifies a Client, HTTP, or CLI consumer for Brick authoring.  The recommended Contract decision intentionally avoids inventing one.
