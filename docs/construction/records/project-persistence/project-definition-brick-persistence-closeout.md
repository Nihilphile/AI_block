# Project and Definition Brick Persistence Closeout

- status: accepted
- closed by: Orchestrator
- acceptance date: 2026-07-26
- OpenSpec change: `build-project-and-definition-brick-persistence`
- Contract subject: `7d3eca44f2b89011f9c979e1a6f6d3bad9018008`
- accepted Project application subject: `0b0d0bfd3139c9a9344cf9233da2578725b55608`
- accepted SQLite remediation subject: `38fe697c12be6ce7032334cdd10897f554117dfc`
- initial resolver integration subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- final resolver remediation subject: `021c00504d87eaedaf6faa09e9e32a989926eb2c`
- final independent retest: `f78565639e3c61b3da649f65dd0366ad8b9c096d`
- final focused re-review: `0bca96327097800d850101814f47585ca8826ea4`

## Accepted outcome

The Runtime Server Project Module now owns explicit Project identity,
Project-local Definition Brick authoring, immutable revision history, archive
semantics, and exact historical reads behind inward ports. A Project-owned
file-backed schema-v1 `node:sqlite` adapter supplies durable transactions and
restart behavior. A separate Project-owned provider structurally satisfies the
existing Actor `DefinitionBrickResolverPort` so ActorTemplate/Snapshot
construction can consume exact persisted revisions without an Actor-to-SQLite
dependency or Server composition root.

Only missing Project, Brick, or exact revision maps to resolver absence.
Integrity, persistence, malformed result, mismatched binding, schema,
configuration, and unexpected failures remain fail closed. Archived exact
history remains resolvable and later revisions never replace the requested
revision. Snapshot provenance retains the persisted revision UID and digest.

## Accepted capabilities

- Strict root-exported Project/Definition Brick application Contracts and
  stable owning-boundary error categories without transport or SQL detail.
- Explicit Project create/read without activation, implicit resources,
  deletion, aliasing, or workspace mutation.
- Strict Brick create/revise/archive/read/list/history/exact resolution with a
  shared Project-local namespace, immutable kind/history, optimistic
  concurrency, canonical Body/digest, and equal-content provenance.
- Deterministic in-memory Unit-of-Work evidence plus Project-owned production
  SQLite repositories and transactions.
- Schema-v1 ledger, structural startup validation, required constraints,
  prepared statements, `BEGIN IMMEDIATE`, rollback-before-mapping,
  process-wide FIFO serialization, and bounded cross-process lock timeout.
- Fail-closed stored Contract, canonical Body, digest, safe integer,
  Project/Brick/revision, and aggregate-UID binding validation.
- Explicit absolute database path outside the executing workspace root,
  disabled extensions, foreign keys, defensive mode, safe integer reads, and
  deterministic close/reopen behavior.
- Project-owned exact resolver provider with strict runtime result decoding,
  request binding validation, a three-code absence whitelist, and one static
  redacted failure for every other result or exception.

## Compatibility, security, and recovery policy

The accepted runtime range is Node `>=24.15 <25`; acceptance ran on Node
`v24.18.0` with pnpm `11.10.0` and exact `@types/node 24.13.3`. The adapter uses
built-in `node:sqlite` and adds no third-party SQLite dependency or lockfile
change. The final integrated Tester completed one frozen-lockfile install with
no tracked drift.

SQLite work is deliberately synchronous and bounded. The same-process FIFO
serializes Project write Units of Work; SQLite uses a 250 ms cross-process lock
timeout. Failed mutations roll back before error mapping. Unsupported,
altered, or corrupt stores fail closed and are preserved for diagnosis; there
is no automatic repair, downgrade, backup/export, or recovery automation.

## Review remediation and evidence

The initial SQLite review found unverified revision-to-aggregate UID binding
and workspace-contained database paths. Remediation `38fe697` closed both;
focused testing `4c0c5d9` and re-review `bf25b86` accepted the SQLite boundary.

Integrated testing of resolver subject `2da0f00` passed at `25cb066`, including
the full Project-create, Brick-author, restart, exact Actor-resolution and
Snapshot-provenance flow. Module review `2679a77` then found one fail-open
structural-reader result boundary: malformed results could become absence or
leak a raw exception.

Final remediation `021c005` added strict runtime result decoding, exact request
binding, and complete static redaction. Independent focused retest `f785656`
passed the resolver suite 4/4, Runtime Server 70/70, Runtime Contracts 91/91,
ActorHost 80/80, integration 5/5, build, types, boundaries, and clean checks.
Focused re-review `0bca963` closed the P1, accepted the post-validation type
adaptation, and found no new actionable finding or blocking evidence gap.

## Project State result

The existing Project Module card is the single owner route for application,
SQLite infrastructure, and the resolver provider. No SQLite facet/card or new
Actor card was created. Runtime Contracts and Actor cards remain accurate
because neither public Contract nor Actor production dependency changed.
Root, Runtime Server route, system map, and current focus are reconciled by the
Orchestrator at this closeout.

## Deferred scope and residual risk

- No Server composition root, daemon, public database-path configuration,
  HTTP/CLI authoring adapter, or external Project repository adapter exists.
- ActorTemplate/Snapshot production persistence, cross-family Unit of Work,
  Actor creation, ActorPool/Trace, Host launch, Package/Delivery,
  Run/Invocation, Graph, and execution remain outside this change.
- Automated recovery, repair, downgrade, backup/export/import, and
  cross-process SQLite stress testing remain absent.
- Synchronous SQLite can block the event loop; the accepted workload and
  contention bounds must be revisited if measured Server concurrency requires
  a different adapter.

## Next construction boundary

This change completes the persistence-first producer and exact Actor consumer
path. The next product boundary is intentionally undecided. A likely Direct
Actor continuation is immutable Actor creation from an accepted
ActorConfigSnapshot followed by a separately controlled Host-launch boundary,
but that requires a new design/OpenSpec decision and does not follow
automatically from this closeout.

All implementation tasks are complete. OpenSpec archiving and Git push remain
separate explicit actions.
