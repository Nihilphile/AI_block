# PP-application-acceptance-001 Project and Definition Brick Application Acceptance

- owner: Runtime Server Project Module
- follows: PP-application-001
- affected modules: Runtime Server Project Module; workspace boundary-check tooling
- workflow: W3 Independent Test
- base reason: the new aggregate owner, transaction boundary, and state card must be independently verified before routing or persistence work consumes them
- implementation/product subject: `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`
- orchestration baseline: task-record commit (self)

## Objective

Independently verify the immutable Project application subject, including
Project/Definition Brick semantics, fail-closed validation and integrity,
complete in-memory Unit-of-Work rollback, dependency direction, the exact
checker delta, excluded scope, and the new module card.

## Scope and authority

- read scope:
  - subject `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`
  - baseline `ac409aba3b55c794b81fd7152267dbd038cf835b`
  - affected Project source/tests/card and checker delta
  - PP-application-001 Task and coding Report
  - accepted Runtime Contracts surface, active OpenSpec design/spec/tasks, and
    current runtime invariants needed to judge behavior
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-application-acceptance-001-project-brick-application.testing.md`
- delegated discretion: select additional deterministic read-only test,
  search, type, build, boundary, and negative-policy evidence and classify
  failures
- tools/external actions: deterministic local verification only; no install,
  network, service, database, destructive, product-write, Project State edit,
  OpenSpec edit, or Git-history action
- delegation: none

## Frozen decisions and escalation

- Treat `a1fb21d` as immutable; do not fix any finding.
- Verify strict Project create/read and missing behavior.
- Verify Project-local Brick namespace isolation and cross-kind uniqueness,
  immutable kind/revisions, optimistic base revision, equal-content fresh
  provenance, idempotent archive without ID release, deterministic
  list/history, and exact archived-revision resolution.
- Verify invalid commands cause no identity, clock, digest, repository, or
  transaction side effects where the boundary claims strict prevalidation.
- Verify stored shape, identity binding, history completeness/order, and digest
  corruption fail closed with the accepted stable error families.
- Verify injected failures restore all Project, namespace, aggregate, and
  revision state, including reserve/create, append, archive, and Project create
  paths.
- Verify the checker recognizes exactly the authorized Project source/test
  topology and rejects forbidden external or relative-escape production
  imports.
- Verify Project imports the Runtime Contracts digest helper, not Actor or a
  duplicate implementation.
- Tester reports module-card or OpenSpec mismatch without editing either.
- Stop with subject mismatch if post-subject changes outside authorized
  construction records are present.

## References

- `docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md`
- `docs/construction/records/project-persistence/reports/PP-application-001-project-brick-application.coding.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `docs/design/current/runtime-invariants.md`

References are audit pointers only.

## Acceptance

1. Confirm exact subject, baseline, clean worktree, and record-only
   post-subject commits.
2. Run fresh focused Project tests, Runtime Server types/full suite, workspace
   build, boundary checks, diff checks, and import/digest ownership searches.
3. Inspect focused evidence and add bounded deterministic substantiation as
   needed for every frozen semantic and rollback requirement.
4. Verify only OpenSpec tasks `3.1` through `3.5` changed and the new Project
   card describes the exact implementation without persistence or composition
   overclaim.
5. Return PASS or classified findings, coverage limits, residual risk, and
   final worktree state.

## Handoff

Write and commit only the testing Report as:
`test(server): accept project brick application module`.
Do not remediate, review, update Project State routing/meta, schedule SQLite,
or continue construction.
