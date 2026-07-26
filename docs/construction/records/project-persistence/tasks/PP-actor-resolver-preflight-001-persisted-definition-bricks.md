# PP-actor-resolver-preflight-001 Persisted Definition Brick Resolver Preflight

- owner: Runtime Server Project/Actor boundary
- follows: accepted Project SQLite subject `38fe697`
- affected modules: Runtime Server Project Module; Runtime Server Actor Module; workspace boundary checker if topology requires it
- workflow: W3 cross-state-owner preflight + Early Review
- base reason: the accepted Project persistence producer is about to satisfy an existing Actor public port, so ownership and dependency direction must freeze before product writes
- implementation/product subject: `131baec`
- orchestration baseline: task-record commit (self)

## Objective

Return a no-write READY/BLOCKED implementation plan for OpenSpec tasks `5.1`
through `5.3` that connects exact persisted Definition Brick revisions to the
existing Actor `DefinitionBrickResolverPort` without changing resolver
semantics, public Contracts, Server composition, or either module's state
ownership.

## Construction map and durable routes

```text
accepted Project application + SQLite producer (38fe697)
  -> this no-write ownership/dependency preflight
  -> PP-actor-resolver-001 implementation Task
  -> one committed cross-module integration subject
  -> independent integrated acceptance
  -> module/boundary review
  -> Orchestrator Project State and OpenSpec closeout
```

Planned records:

- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-001-persisted-definition-bricks.md`
- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-acceptance-001-persisted-definition-bricks.md`
- `docs/construction/records/project-persistence/reports/PP-actor-resolver-acceptance-001-persisted-definition-bricks.testing.md`
- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-review-001-persisted-definition-bricks.md`
- `docs/construction/records/project-persistence/reports/PP-actor-resolver-review-001-persisted-definition-bricks.reviewing.md`

## Scope and authority

- read scope:
  - accepted Project application/SQLite source, tests, exports, card, Tasks,
    evidence, and exact subject history;
  - accepted Actor source, tests, root exports, resolver/application ports,
    Snapshot compilation/provenance behavior, card, and closeout evidence;
  - root-exported Runtime Contracts used by both modules;
  - Runtime Server package/TypeScript/test layout, workspace checker, and
    repository boundary conventions;
  - active OpenSpec proposal/design/spec/tasks and current Runtime invariants.
- write scope: none
- delegated discretion:
  - recommend one exact state owner and source/test placement;
  - choose a minimal adapter/lifecycle shape using existing public/local ports;
  - choose focused cross-module test placement and fixture structure;
  - identify exact candidate-card changes required by actual implementation.
- tools/external actions: deterministic local read-only repository/Git/type
  surface inspection only; no source/test/config/dependency/lockfile/Project
  State/OpenSpec/Task/Report edit, database creation, install, network service,
  destructive action, or Git-history action.
- delegation: none
- authority mode: task
- output mode: reply

## Frozen decisions and escalation

- Existing Project persistence and Actor resolver semantics are accepted
  boundaries. Do not propose a Contract change unless the existing surfaces
  are demonstrably incapable; if so, return BLOCKED with the exact missing
  capability.
- Exact Project/Brick/revision lookup returns the Contract-valid persisted
  revision. Ordinary missing Project/Brick/revision maps to resolver absence;
  integrity, unsupported schema, configuration, lock, or persistence failure
  must remain fail closed and must not be collapsed into absence.
- Archived exact revisions remain resolvable. Never substitute the latest
  revision or create a new revision.
- Snapshot compilation/provenance semantics remain unchanged and must consume
  the exact returned revision.
- The adapter does not gain Project authoring, ActorTemplate/Snapshot
  persistence, cross-family Unit of Work, Server composition, default database
  configuration, Actor creation, Host launch, HTTP/CLI, Package, Run, Graph,
  recovery automation, or execution authority.
- No third-party dependency, lockfile change, Runtime Contract edit, schema
  migration, engine/toolchain change, or new state card is authorized by this
  preflight.
- Project application code and Actor application code must not import
  `node:sqlite` or SQLite implementation details. Consumers continue importing
  Runtime Contracts from the package root.
- Recommend card writes only when implementation changes a card's production
  dependency, implemented behavior, condition, or evidence route. Root,
  parent, system map, and current focus remain Orchestrator-owned.
- Return `LOAD_REQUEST` for missing normative context and `BLOCKED` for a
  required public/dependency/state-owner expansion. Do not edit.

## References

- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `project_state/apps/runtime-server/modules/project/README.md`
- `project_state/apps/runtime-server/modules/actor/README.md`
- `docs/construction/records/project-persistence/reports/PP-sqlite-remediation-review-001-integrity-and-path-boundary.reviewing.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

Return:

1. exact accepted subject/current HEAD and clean-worktree confirmation;
2. existing Project read/lifecycle and Actor resolver/compilation surfaces
   relevant to the integration;
3. one recommended owner, exact source/export/test/card/checker write paths,
   and dependency direction;
4. exact ordinary-absence versus fail-closed error mapping without a Contract
   change;
5. focused scenarios for exact resolution, archived history, missing exact
   revision, no latest substitution, Snapshot provenance, integrity failure,
   restart, and excluded-scope/dependency checks;
6. self-verification plus later independent testing/review commands and
   evidence boundaries;
7. any scope, Contract, dependency, schema, state-card, or external-action
   escalation;
8. `READY` or `BLOCKED`.

## Handoff

Return only the delta preflight through `output_mode: reply`; create no file,
database, edit, stage, or commit. Do not authorize implementation, schedule
evidence, update Project State/OpenSpec, or continue into Server composition.
