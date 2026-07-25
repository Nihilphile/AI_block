# PP-sqlite-preflight-001 Versioned Project SQLite Persistence Preflight

- owner: Runtime Server Project Module
- follows: accepted Project application subject `0b0d0bf`
- affected modules: Runtime Server Project Module; workspace Node/toolchain boundary
- workflow: W3 + Compatibility + Recovery + Security Review + Early Review
- base reason: the slice adds the first production persistence substrate, changes the supported Node floor, and will be consumed by the later Actor resolver adapter
- implementation/product subject: `e31f3bc`
- orchestration baseline: task-record commit (self)

## Objective

Close the exact implementation, compatibility, schema, transaction,
serialization, recovery, security, test, and Project State choices required to
authorize OpenSpec tasks `4.1` through `4.5`, or return one precise blocker
without modifying the repository.

## W3 construction map

```text
A. Compatibility and boundary freeze
   -> OpenSpec 1.1-1.3
   -> exact Node/type/runtime floor and file plan

B. Versioned SQLite adapter
   -> OpenSpec 4.1-4.5
   -> one Project-owned persistence deliverable

C. Independent acceptance and Early Review
   -> persistence, concurrency, recovery, security, and card evidence

D. Actor exact-resolver integration
   -> OpenSpec 5.1-5.3
   -> separately authorized only after B/C acceptance
```

Current clean baseline and accepted Project application subject are `e31f3bc`
and `0b0d0bf`, respectively. Planned durable authority/evidence paths are:

- this preflight Task;
- `docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md`;
- `docs/construction/records/project-persistence/tasks/PP-sqlite-acceptance-001-versioned-project-persistence.md`;
- `docs/construction/records/project-persistence/reports/PP-sqlite-acceptance-001-versioned-project-persistence.testing.md`;
- `docs/construction/records/project-persistence/tasks/PP-sqlite-review-001-versioned-project-persistence.md`;
- `docs/construction/records/project-persistence/reports/PP-sqlite-review-001-versioned-project-persistence.reviewing.md`.

## Scope and authority

- read scope:
  - root/runtime-server manifests, lockfile, TypeScript configuration, workspace
    checker, current Node runtime, and installed Node type declarations;
  - accepted Project source/tests/card and directly consumed Runtime Contracts;
  - active OpenSpec proposal/design/spec/tasks and current Runtime invariants;
  - accepted Node 24 SQLite research and current official Node 24 `node:sqlite`
    documentation;
  - repository test/temp-directory conventions and relevant infrastructure
    adapter patterns.
- write scope: none
- delegated discretion:
  - propose exact Project-owned infrastructure source/test paths;
  - propose schema/migration file layout and version-ledger shape;
  - select a positive bounded busy timeout and same-process write-serialization
    mechanism with rationale;
  - select explicit transaction SQL and rollback-before-mapping structure;
  - select safe integer/read representation, prepared-statement boundaries,
    startup validation, close lifecycle, and deterministic test strategy.
- tools/external actions: read-only local inspection and current official
  documentation lookup only; no install, runtime upgrade, file-backed probe,
  database creation, network service, destructive action, or Git-history action
- delegation: none
- authority mode: task
- output mode: reply

## Frozen decisions and escalation

- Preflight authorizes no edits, database file, package install, or runtime
  upgrade.
- Use built-in `node:sqlite` only; do not add a third-party SQLite runtime
  dependency.
- Enforce Node `>=24.15 <25`. The current orchestration environment is Node
  `v24.14.1` and the current declared type package is `@types/node 24.13.3`;
  implementation authorization is blocked until an actual Node 24.15+ runtime
  and compatible pinned Node types are available for fresh verification.
- Persistence receives one explicit absolute database path. Do not derive a
  production path from `cwd`, a Project repository, a platform default, or an
  implicit environment variable.
- Explicitly enable foreign keys and defensive mode, keep extensions disabled,
  choose a positive bounded busy timeout, use prepared statements/bound values,
  and define deliberate safe-integer behavior.
- Schema version 1 is a clean bootstrap with a migration ledger, Projects,
  Definition Brick aggregates, and immutable revisions. No legacy import,
  destructive downgrade, automatic database deletion, backup/export, or
  recovery automation is authorized.
- Acquire write intent before multi-statement mutation and roll back before
  mapping any error. Strict create, stale-base revise, archive, namespace,
  revision, and integrity invariants require both application checks and
  database constraints where representable.
- Same-process conflicting writes require one explicit bounded serialization
  mechanism; SQLite lock timeout remains a separate cross-connection/process
  failure boundary, not an in-process retry loop.
- Startup must validate path/configuration, schema version, foreign keys,
  defensive/extension posture, and required schema before serving operations.
  Unsupported/failed schema initialization fails closed and preserves a
  non-disposable database for diagnosis.
- Tests may create and remove only explicitly identified disposable temporary
  databases under repository test conventions; no production-like database is
  deleted automatically after a failure.
- Do not modify Runtime Contracts, Project application ports/semantics, Actor,
  Server startup/composition, CLI/HTTP/file import, Package, Run, Graph,
  recovery automation, or another Project State card.
- The Project card remains the direct state context. Preflight must state
  exactly how a later authorized Coder would add production persistence facts
  without redefining Intent or creating a speculative persistence facet/card.
- Compatibility evidence must separate:
  - current official Node documentation;
  - actual runtime/type/toolchain proof under Node 24.15+;
  - implementation/restart/contention/corruption evidence.
- Use `LOAD_REQUEST`, `SCOPE_ESCALATION`, or `BLOCKED` rather than inferring an
  unlisted normative decision or widening the future implementation surface.

## References

- `openspec/changes/build-project-and-definition-brick-persistence/proposal.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `openspec/changes/build-project-and-definition-brick-persistence/tasks.md`
- `docs/construction/records/project-persistence/reports/PP-research-001-node24-sqlite-substrate.researching.md`
- `project_state/apps/runtime-server/modules/project/README.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

Return:

1. lease/subject/worktree integrity and the exact Compatibility blocker state;
2. exact source/test/config/manifest/lockfile/checker/card file plan;
3. dependency direction and construction slice/commit plan;
4. database-path configuration value and validation boundary;
5. busy timeout, same-process serialization, connection lifecycle, and
   synchronous-runtime bounds;
6. schema version ledger and table/index/constraint/migration layout;
7. prepared repository and `BEGIN IMMEDIATE`/commit/rollback operation flow;
8. driver/constraint/lock/schema/integrity error mapping and recovery posture;
9. focused bootstrap/reopen/rollback/concurrency/archive/isolation/timeout/
   schema/corruption test matrix;
10. exact verification commands, Project card consequence, excluded scope, and
    `READY` or `BLOCKED`.

`READY` requires an available Node 24.15+ runtime and compatible pinned types.
Otherwise return `BLOCKED` with the smallest user/Orchestrator action that can
unblock implementation.

## Handoff

Return the delta preflight through `output_mode: reply`; create no Report,
database, edit, stage, or commit. Do not authorize implementation, update
OpenSpec beyond the already recorded 1.1 construction map, schedule testing,
or continue into Actor integration.
