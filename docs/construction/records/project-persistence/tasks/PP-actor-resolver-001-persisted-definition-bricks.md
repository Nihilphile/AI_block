# PP-actor-resolver-001 Persisted Definition Brick Resolver Integration

- owner: Runtime Server Project Module provider / Actor Module existing consumer port
- follows: PP-actor-resolver-preflight-001
- affected modules: Runtime Server Project Module; Runtime Server Actor Module test consumer; workspace checker
- workflow: W3 cross-state-owner integration + Early Review
- base reason: the accepted Project persistence producer now satisfies an existing Actor public port and requires controlled dependency/error semantics before whole-change acceptance
- implementation/product subject: `131baec`
- orchestration baseline: task-record commit (self)

## Objective

Implement and independently accept a Project-owned adapter for OpenSpec tasks
`5.1` through `5.3` that resolves exact persisted Definition Brick revisions
through the existing Actor `DefinitionBrickResolverPort`, without changing the
port, Actor source, Runtime Contracts, SQLite schema, or Server composition.

## Scope and authority

- read scope:
  - accepted Project application/SQLite source, tests, exports, card, Tasks,
    evidence, and exact subject history;
  - accepted Actor source/tests/root exports, resolver/application ports,
    Template/Snapshot compilation/provenance behavior, card, and closeout;
  - root Runtime Contracts, Runtime Server package/TypeScript/test layout,
    workspace checker, active OpenSpec artifacts, and current Runtime
    invariants.
- implementation write scope after explicit authorization:
  - `apps/runtime-server/src/modules/project/infrastructure/actor-definition-brick-resolver.ts`
  - `apps/runtime-server/src/modules/project/index.ts`
  - `apps/runtime-server/test/modules/project/actor-definition-brick-resolver.test.ts`
  - `scripts/check-workspace-boundaries.mjs`
  - `project_state/apps/runtime-server/modules/project/README.md`
  - checkbox state for OpenSpec tasks `5.1` through `5.3` only
- delegated discretion:
  - private Project-local adapter/helper/type naming inside the authorized new
    source file;
  - deterministic Project/Actor fixture composition inside the authorized test
    file;
  - exact restrictive checker-policy identifiers within the existing checker.
- tools/external actions: deterministic local source/test/type/build/boundary/
  Git commands and explicitly prefixed disposable OS-temp SQLite databases
  only; no install, network service, production database, destructive action,
  dependency/lockfile/schema/Contract/Actor-source/Actor-card/root-meta write,
  or unrelated Git-history action.
- delegation: none
- authority mode: task
- output mode: commit

## Frozen implementation decisions

### Ownership and dependency direction

- The adapter is Project-owned infrastructure and depends inward only on the
  Project exact-read application surface plus root-exported Runtime Contracts.
- It must not import Actor source/types, `node:sqlite`, SQLite implementation
  files, deep Runtime Contract paths, Server composition, or another module's
  implementation.
- The adapter factory accepts only the minimal existing Project application
  capability needed to invoke `readExactDefinitionBrickRevision`; it does not
  open/close a database, create a Project/Brick, or own a Unit of Work.
- Its returned object is structurally assignable to the existing Actor
  `DefinitionBrickResolverPort`. Prove that assignment in the focused test;
  do not duplicate, re-export, or change the Actor port.
- Export the provider from the existing Project root. Actor source and its root
  export remain unchanged.

### Exact resolution and failure mapping

- `resolveExact(projectId, reference)` delegates to the accepted Project exact
  read using the exact Project, Brick ID, kind, and revision supplied by Actor.
- Return the Contract-valid persisted exact revision unchanged. Never select
  latest, canonicalize into a different value, create a revision, or repair
  data.
- Map only these stable Project errors to ordinary resolver absence:
  - `project_not_found`;
  - `definition_brick_not_found`;
  - `definition_brick_revision_not_found`.
- Every other Project failure—including
  `definition_brick_integrity_error`, `persistence_failure`, invalid/conflict/
  archived outcomes, or any unexpected result/exception—throws one static,
  redacted Project-local resolver failure. Do not expose SQL, paths, stored
  values, internal codes, or driver details.
- Unsupported schema or invalid SQLite configuration fails before an adapter
  can be constructed and is never converted to absence.
- Actor's accepted application layer remains responsible for converting a
  resolver throw to redacted `actor_template.operation_failed`.

### Focused evidence and state

- Use the accepted Project SQLite factory plus existing Actor in-memory
  Template/Snapshot fixture patterns. Every database lives in an explicitly
  prefixed disposable OS-temp directory outside the workspace and is closed
  before cleanup.
- Focused evidence must prove:
  1. exact Project/Brick/revision resolution and Project isolation;
  2. revision 1 remains selected after revision 2 exists;
  3. archived exact history resolves unchanged;
  4. missing Project, Brick, and exact revision return absence;
  5. Template creation followed by archive/restart and Snapshot compilation
     retains the persisted revision UID/digest provenance;
  6. raw persisted identity/digest corruption throws, Actor returns
     `actor_template.operation_failed`, and no Snapshot is created;
  7. close/reopen preserves exact resolver behavior;
  8. the adapter is structurally assignable to the Actor port with no Actor
     source change.
- Checker changes add only the exact new Project infrastructure source and test
  topology plus a restrictive Project-local/root-Contracts-only import policy.
- Update only the Project card's actual provider behavior, dependency,
  condition, and evidence route. It must say self-verification complete and
  independent integrated acceptance/review pending. The Actor card does not
  change because its port, implementation, dependencies, and accepted behavior
  remain unchanged.
- Mark only OpenSpec tasks `5.1` through `5.3`. Do not mark `6.2`, `6.3`,
  `7.1` through `7.3`, or any closeout task.

## Exclusions and escalation

- Do not add or change Runtime Contracts, Actor production source/tests outside
  the authorized focused file, Project application semantics/ports, SQLite
  schema/migration/configuration/persistence behavior, root engine/toolchain,
  dependency, lockfile, or another Project State card.
- Do not add ActorTemplate/Snapshot production persistence, cross-family Unit
  of Work, Server composition/default database configuration, Actor creation,
  Host launch, HTTP/CLI, Package, Run, Graph, recovery automation, or execution.
- Stop with `SCOPE_EXPANSION_REQUIRED` before changing any unlisted path,
  public Contract/port, dependency, state owner, schema, external action, or
  acceptance condition.

## References

- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-preflight-001-persisted-definition-bricks.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `project_state/apps/runtime-server/modules/project/README.md`
- `project_state/apps/runtime-server/modules/actor/README.md`
- `docs/construction/records/project-persistence/reports/PP-sqlite-remediation-review-001-integrity-and-path-boundary.reviewing.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Confirm Task baseline/current HEAD, clean worktree, exact accepted Project
   and Actor subjects, Node `>=24.15 <25`, pnpm `11.10.0`, and unchanged
   dependency/lockfile/schema/Contracts/Actor source.
2. Implement OpenSpec `5.1` through `5.3` only through the exact authorized
   Project provider, export, test, checker, and candidate-card paths.
3. Run the focused test after its Runtime Contracts build prerequisite, then
   Runtime Server types/full suite, Runtime Contracts tests/types, ActorHost
   and integration regressions, workspace build/types/boundaries/full
   verification, diff, import, subject, and exact-scope checks.
4. Verify no Actor/Project application import of SQLite, no deep Contract
   import, no excluded Server/execution composition, and no unintended card
   change.
5. Commit the exact integration subject as:
   `feat(server): resolve persisted definition bricks`.
6. Leave independent integrated testing and module/boundary review pending
   against that immutable subject.

## Handoff

Use `output_mode: commit`, stage only authorized paths, and put the compact
Task/baseline/toolchain/verification/deviation/residual-risk receipt in the
commit body. Create no coding Report. Return commit SHA, exact checks,
deviation, remaining risk, and unique handoff, then stop. Do not schedule
evidence, reconcile root/meta, authorize further implementation, or close the
OpenSpec change.
