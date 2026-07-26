---
module: Runtime Server Project Module
implementation_state: functional
work_state: stable
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

The current implementation creates and reads explicit Project
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

A file-backed `node:sqlite` adapter now supplies the Project Unit of Work behind
an explicit absolute Server-owned database path. It uses schema version 1,
prepared and bound statements, process-wide FIFO serialization by canonical
database path, `BEGIN IMMEDIATE` transactions with rollback-before-mapping,
foreign keys, defensive mode, disabled extensions, safe integer decoding, and
a bounded lock timeout. Startup atomically bootstraps only a structurally empty
store, validates an exact existing schema and migration ledger, and fails
closed for unsupported or altered stores. Explicit close/reopen preserves
Projects, aggregate lifecycle, immutable history, and exact revisions.

## Boundary and dependencies

Application production source depends only on Runtime Contracts and
same-module relative imports. The owned SQLite infrastructure additionally
depends only on the built-in `node:sqlite`, `node:fs`, and `node:path`
facilities. It does not import Actor implementation, transport, CLI,
ActorHost, Host Gateway, Package, Run, Graph, or Server composition. The
Project Unit of Work owns only Project records and Definition Brick
aggregate/revision state; it does not coordinate ActorTemplate or Snapshot
state.

The in-memory adapters remain deterministic test evidence. Server composition,
public database-path configuration, external authoring adapters, and Actor
resolver integration are not part of this boundary.

## Current condition

The bounded application and deterministic in-memory behavior are accepted at
implementation subject `0b0d0bf`. Independent focused testing and re-review
closed the canonical-Body and exact-revision integrity findings with no
remaining actionable finding or blocking evidence gap.

The application behavior remains accepted at `0b0d0bf`. The versioned SQLite
persistence implementation and its focused verification evidence are present
in the current implementation work; independent persistence testing and
review remain pending. Server composition, external adapters, Actor-side
resolver wiring, and every execution workflow remain deferred.

## Read next

- [Project source](../../../../../apps/runtime-server/src/modules/project/)
- [Project tests](../../../../../apps/runtime-server/test/modules/project/)
- [Runtime Contracts card](../../../../packages/runtime-contracts/README.md)
- [Current Runtime invariants](../../../../../docs/design/current/runtime-invariants.md)
- [Project/Brick application Task](../../../../../docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md)
- [Project integrity remediation Task](../../../../../docs/construction/records/project-persistence/tasks/PP-application-remediation-001-project-brick-integrity.md)
- [Project SQLite persistence Task](../../../../../docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md)
- [Independent remediation testing](../../../../../docs/construction/records/project-persistence/reports/PP-application-remediation-acceptance-001-project-brick-integrity.testing.md)
- [Focused remediation re-review](../../../../../docs/construction/records/project-persistence/reports/PP-application-remediation-review-001-project-brick-integrity.reviewing.md)
- [Project persistence OpenSpec change](../../../../../openspec/changes/build-project-and-definition-brick-persistence/)

## Evidence

- Source: [`apps/runtime-server/src/modules/project/`](../../../../../apps/runtime-server/src/modules/project/)
- Tests: [`apps/runtime-server/test/modules/project/`](../../../../../apps/runtime-server/test/modules/project/)
- Construction task: [PP-application-001](../../../../../docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md)
- SQLite source and migration:
  [`apps/runtime-server/src/modules/project/infrastructure/sqlite/`](../../../../../apps/runtime-server/src/modules/project/infrastructure/sqlite/)
- SQLite focused test:
  [`apps/runtime-server/test/modules/project/sqlite-persistence.test.ts`](../../../../../apps/runtime-server/test/modules/project/sqlite-persistence.test.ts)
- SQLite construction task:
  [PP-sqlite-001](../../../../../docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md)
- Accepted remediation evidence:
  [testing](../../../../../docs/construction/records/project-persistence/reports/PP-application-remediation-acceptance-001-project-brick-integrity.testing.md)
  and
  [re-review](../../../../../docs/construction/records/project-persistence/reports/PP-application-remediation-review-001-project-brick-integrity.reviewing.md)
