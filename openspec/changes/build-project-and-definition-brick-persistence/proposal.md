## Why

The accepted reference-only ActorTemplate/Snapshot boundary can validate and
compile exact Definition Brick references, but the Runtime has no authoritative
Project or durable Definition Brick producer from which those references can be
created, revised, recovered, and resolved. Establishing that bounded producer
now supplies the first durable Server-owned input to Actor construction without
prematurely coupling persistence to Actor creation, Host launch, Package, Run,
CLI, recovery automation, or Graph.

## What Changes

- Add a minimal Runtime Server Project bootstrap/persistence boundary that
  creates and reads authoritative Project identity required by Definition Brick
  ownership.
- Add Server-owned Definition Brick authoring for strict create, immutable
  revision, stale-base-protected revise, archive, aggregate/history reads, and
  exact historical revision resolution.
- Add typed Runtime Contract values for the Project/Definition Brick
  application boundary while leaving HTTP, CLI, and file-import grammar out of
  scope.
- Add a module-owned durable adapter using the Node 24 built-in `node:sqlite`,
  with schema/migration bootstrap, transaction boundary, integrity checks, and
  restart evidence.
- Adapt exact persisted Brick revisions to the existing Actor Module
  `DefinitionBrickResolverPort` without adding ActorTemplate/Snapshot production
  persistence.
- Add focused Contract, application, persistence, rollback, corruption, and
  cross-module resolver evidence.
- Create a Project/persistence Project State card only after the implementation
  establishes a real owned source/test boundary; reconcile only directly
  affected Runtime Contracts and Actor cards, while root map/focus updates
  remain Orchestrator-owned at acceptance.

## Capabilities

### New Capabilities

- `project-definition-brick-persistence`: Minimal authoritative Project
  bootstrap plus durable, transactional Definition Brick authoring, immutable
  revision history, archive semantics, and exact Actor-side resolution.

### Modified Capabilities

None.

## Impact

- Adds a new Runtime Server module boundary for Project and Definition Brick
  persistence/authoring and a SQLite infrastructure adapter.
- Adds Project/Definition Brick application schemas and results to
  `@ai-block/runtime-contracts`; the existing Brick revision/reference values
  and Actor resolver behavior remain compatible.
- Raises the supported Node floor to `>=24.15 <25` and uses the built-in
  release-candidate `node:sqlite` API, avoiding a third-party SQLite runtime
  dependency. The synchronous execution and exact supported-version policy are
  verified under the Compatibility gate.
- Adds source/test roots that may justify a new Project State card during
  implementation. Runtime Contracts and Actor cards change only when their
  accepted statements, dependency routes, or source/test entry points change.
- Does not add Project selection/activation/deletion, Actor creation,
  ActorTemplate/Snapshot durable repositories, Host launch, `model_id`
  transport, Package/Delivery workflow, Run/Invocation, HTTP/CLI behavior,
  automated recovery, backup/export, or Graph.
