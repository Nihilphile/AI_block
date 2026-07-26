# PP-sqlite-remediation-001 SQLite Integrity and Path Boundary Remediation

- owner: Runtime Server Project Module
- follows: PP-sqlite-review-001
- affected modules: Runtime Server Project Module
- workflow: W3 bounded remediation + Recovery + Security Review + focused retest/re-review
- base reason: two acceptance-blocking P1 findings must close before the Project persistence boundary can be accepted or consumed by Actor
- implementation/product subject: `2cf9b84a87b72199ba41c610864364e93cf550c4`
- orchestration baseline: task-record commit (self)

## Objective

Close only the two accepted SQLite review findings by failing closed on
revision-to-aggregate UID corruption and rejecting an explicit database path at
or below the executing workspace/repository root.

## Scope and authority

- read scope:
  - exact implementation subject, remediation Task baseline, implementation
    diff, SQLite source/tests, Project application values, and candidate Project
    card;
  - independent acceptance and Early Review Tasks/Reports;
  - active OpenSpec design/spec/tasks and repository path/test conventions
    needed to implement the two corrections.
- write scope:
  - `apps/runtime-server/src/modules/project/infrastructure/sqlite/configuration.ts`
  - `apps/runtime-server/src/modules/project/infrastructure/sqlite/persistence.ts`
  - `apps/runtime-server/test/modules/project/sqlite-persistence.test.ts`
  - `project_state/apps/runtime-server/modules/project/README.md`
- delegated discretion:
  - private stored-row field naming and helper placement inside the two
    authorized SQLite implementation files;
  - focused disposable-database fixture details needed to corrupt each UID
    binding with foreign-key enforcement deliberately disabled outside the
    production adapter.
- tools/external actions: deterministic local source/test/type/build/boundary/
  Git inspection and explicitly prefixed disposable OS-temp SQLite databases
  only; no install, network service, production database, destructive action,
  dependency/lockfile/configuration/tooling/OpenSpec/root-meta/cross-module
  write, or unrelated Git-history action.
- delegation: none
- authority mode: task
- output mode: commit

## Frozen decisions and escalation

- Treat `2cf9b84` as the immutable defective subject and the Task-record commit
  as the implementation baseline.
- Revision queries must select the persisted revision row's aggregate
  `brick_uid`. Exact and history reads must require that value to equal the
  already validated aggregate summary UID before returning a Contract value.
  A mismatch maps through the existing Project integrity boundary; it is never
  ordinary absence or `persistence_failure`.
- Add separate focused corruption cases for:
  1. changing only a revision row's persisted aggregate UID binding;
  2. changing only the aggregate row's UID so it no longer matches its
     persisted revisions.
  Both must fail closed on exact and/or history read as appropriate without
  inference or repair.
- Preserve schema version 1 and its DDL. Do not add a migration or alter the
  accepted database layout.
- Preserve the exact factory input `{ databasePath: string }`. Canonicalize the
  existing database parent and the current working-directory root with real
  filesystem paths, then reject a candidate database path equal to or
  descendant from that root. The comparison must be path-segment aware and
  Windows-case-insensitive where the platform requires it; sibling-prefix
  paths remain valid.
- This correction is a rejection boundary only. Do not derive a default path,
  accept an environment path, create a parent, add Project-repository
  configuration, or change the process working directory.
- Preserve every other accepted connection option, transaction/serialization
  behavior, timeout, error mapping, API/export, dependency direction, and
  exclusion.
- Update only the Project card's concrete implementation/evidence/current
  candidate condition. Do not edit Intent, ownership, exclusions, root route,
  system map, or current focus.
- Do not mark OpenSpec task `7.4` complete. The Orchestrator owns that checkbox
  only after focused independent retest and re-review both accept the new exact
  subject.
- Stop with `SCOPE_EXPANSION_REQUIRED` before changing any unlisted path,
  Contract/application port, schema/DDL, dependency, lockfile, checker,
  package engine, or cross-module behavior.

## References

- `docs/construction/records/project-persistence/reports/PP-sqlite-review-001-versioned-project-persistence.reviewing.md`
- `docs/construction/records/project-persistence/reports/PP-sqlite-acceptance-001-versioned-project-persistence.testing.md`
- `docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `project_state/apps/runtime-server/modules/project/README.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Confirm exact defective subject, Task baseline, clean start, actual Node
   `>=24.15 <25`, pnpm `11.10.0`, and unchanged dependency/lockfile/schema.
2. Add focused evidence that both UID-binding corruption shapes fail closed and
   that valid exact/history reads remain unchanged.
3. Add focused evidence that a database at/below the canonical cwd/workspace
   root is rejected while an absolute disposable path outside it remains
   accepted and sibling-prefix comparison is not overbroad.
4. Run focused SQLite tests followed by relevant Runtime Server types/full
   suite, Runtime Contracts compatibility, build, workspace boundaries, full
   repository verification, diff, and exact-scope checks.
5. Commit only the authorized correction, tests, and candidate-card update as
   `fix(server): close project sqlite review findings`.
6. Leave the card plainly self-verified with focused independent retest and
   re-review pending.

## Handoff

Use `output_mode: commit` with a compact receipt in the commit body naming the
Task, baseline, exact checks, deviation, and residual risk. Create no coding
Report. Return the commit SHA, changed surfaces, verification, remaining risk,
and unique handoff, then stop. Do not schedule retest/re-review, edit root/meta,
authorize Actor integration, or continue OpenSpec work.
