---
module: Runtime Server Project Module
implementation_state: application-only
work_state: active
source_roots:
  - apps/runtime-server/src/modules/project/
test_roots:
  - apps/runtime-server/test/modules/project/
---

# Runtime Server Project Module

## Intent

The Project Module owns the Runtime Server's minimal Project identity
prerequisite and Project-local Definition Brick aggregate/revision authoring
boundary. It defines application behavior and inward repository, identity,
clock, digest, and Unit-of-Work ports without assigning storage mechanics or
execution responsibilities to the module.

## Implemented today

The current application-only implementation creates and reads explicit Project
records and provides strict Definition Brick create, revise, archive,
aggregate read/list, immutable history, and exact-revision reads. It preserves
one shared Project-local Brick namespace across Definition Brick kinds,
immutable kind and revisions, optimistic base-revision conflicts, fresh
revision identity for equal canonical content, idempotent archive without ID
release, deterministic list/history ordering, and exact archived-revision
resolution.

Commands and results use the root-exported Runtime Contracts. Candidate Bodies
are validated by their declared kind, normalized through the shared Runtime
Contracts Definition Brick normalizer, and returned and persisted canonically
on create and revise. Digests use the sole shared Runtime Contracts Definition
Brick digest helper. Stored Project, aggregate, revision, identity binding,
canonical Body, digest, and revision-range coherence are checked before reads
return them. Exact-revision absence beyond the aggregate head remains not
found, while an absent claimed-history revision or a returned beyond-head
revision fails closed as an integrity error. Deterministic test-only in-memory
repositories snapshot all Project, namespace, aggregate, and revision state
and prove complete Unit-of-Work rollback.

## Boundary and dependencies

Production source depends only on Runtime Contracts and same-module relative
imports. It does not import Actor implementation, SQLite, transport, CLI,
ActorHost, Host Gateway, Package, Run, Graph, or Server composition. The
Project Unit of Work owns only Project records and Definition Brick
aggregate/revision state; it does not coordinate ActorTemplate or Snapshot
state.

The in-memory adapters are test evidence, not a production persistence
adapter. No database, schema, migration, database path, external authoring
adapter, or Actor resolver integration is part of this boundary.

## Current condition

The bounded application and deterministic in-memory behavior are implemented
and locally self-verified. Independent testing and review remain required
before acceptance. Production persistence, restart recovery, Server
composition, external adapters, Actor-side resolver wiring, and every execution
workflow remain deferred.

## Read next

- [Project source](../../../../../apps/runtime-server/src/modules/project/)
- [Project tests](../../../../../apps/runtime-server/test/modules/project/)
- [Runtime Contracts card](../../../../packages/runtime-contracts/README.md)
- [Current Runtime invariants](../../../../../docs/design/current/runtime-invariants.md)
- [Project/Brick application Task](../../../../../docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md)
- [Project persistence OpenSpec change](../../../../../openspec/changes/build-project-and-definition-brick-persistence/)

## Evidence

- Source: [`apps/runtime-server/src/modules/project/`](../../../../../apps/runtime-server/src/modules/project/)
- Tests: [`apps/runtime-server/test/modules/project/`](../../../../../apps/runtime-server/test/modules/project/)
- Construction task: [PP-application-001](../../../../../docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md)
