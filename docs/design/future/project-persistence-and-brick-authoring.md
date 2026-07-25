# Project Persistence and Brick Authoring

> Overall status: **product design draft**.
>
> Authority: future product-design input only, not implementation authorization. This file is not current implementation evidence, an accepted OpenSpec specification, or a physical schema.

## Read contract

- **Owner:** future Project/persistence and Definition Brick authoring boundaries on the Runtime Server.
- **Inputs:** Project administration intent, candidate Definition Brick Bodies or source imports, exact typed references, and current Snapshot construction constraints.
- **Outputs:** conceptual Project/Brick records, immutable revisions, authoring results, and repository interfaces.
- **Not owned here:** Actor creation, Host launch, `model_id` launch transport, Package workflow, Run/Invocation, Graph, or Package-as-Brick.

Current constraints are inherited from the [Runtime invariant kernel](../current/runtime-invariants.md); they are not redefined here.

## Inherited current constraints

- Project-scoped identity is present at current Contract and ActorTemplate construction boundaries.
- Definition Brick and ActorTemplate references are exact and revision-aware.
- ActorTemplate compilation produces immutable, self-contained Snapshots with provenance and digests.
- Runtime Contracts owns schemas/values, while repositories and migrations belong to their owning Server modules.
- Source files are inputs to registration or authoring; they are not authoritative runtime records.

## Accepted future boundaries

The following direction is accepted-future, not current behavior:

1. Project is the top-level resource namespace, ownership, permission, and desired/runtime activation boundary.
2. Client Project selection changes Client context; Project Runtime activation is a distinct Server operation.
3. Persisted resource identity is typed by `Project + resource type`; unrelated resource kinds do not share one universal name namespace.
4. The Runtime Server is the authoritative writer. Runtime CLI remains a stateless Client, and ActorHost does not register or compile Definition Bricks.
5. A Definition Brick has stable aggregate identity and immutable revisions. The Server owns identity, Project ownership, digest, and provenance; the caller supplies a candidate typed Body.
6. Archived exact revisions remain resolvable for historical Template/Snapshot reproducibility, subject to explicit authorization.
7. Module-owned repositories and transaction ports isolate storage mechanics from domain/application logic.

## Product design draft

The following is coherent draft direction but is not frozen:

- one Server-owned SQLite database as an initial persistence substrate;
- logical records for Project, Definition Brick aggregate/revision, ActorTemplate revision, and ActorConfigSnapshot;
- validate/create/revise/archive authoring operations;
- strict create semantics, stale-base detection, and atomic aggregate/revision updates;
- Project-root containment, redacted diagnostics, and no secret persistence;
- restart recovery that reconstructs authoritative records without treating source files as live state;
- future CLI/API adapters that translate external input into typed application commands.

No SQL DDL, migration numbering, public wire shape, CLI grammar, or operational backup contract is accepted by this draft.

## Open decisions

- Project bootstrap, aliasing, data directory, database filename, workspace-root mutation, deactivation, and deletion.
- Source metadata retention and Markdown/file-to-Body mapping.
- Transaction serialization and concurrency policy across Project, Brick, Template, and Snapshot operations.
- Whether file registration generates IDs, deduplicates by digest, or combines registration with Template creation.
- Backup, export/import, and disaster-recovery guarantees.
- Whether Definition Brick persistence remains Actor-owned or later becomes a separate module.

These questions remain open and require a later accepted design/OpenSpec change.

## Non-goals

This file does not define Actor creation or Host launch, does not carry `model_id` into a LaunchSpec, does not define Package/Delivery behavior, and does not authorize persistence implementation. Package-as-Brick is outside this design.
