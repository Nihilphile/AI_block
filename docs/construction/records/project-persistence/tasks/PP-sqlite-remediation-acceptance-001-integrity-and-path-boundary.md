# PP-sqlite-remediation-acceptance-001 SQLite Remediation Focused Retest

- owner: Runtime Server Project Module
- follows: PP-sqlite-remediation-001
- affected modules: Runtime Server Project Module
- workflow: W3 independent focused retest + Recovery + Security Review
- base reason: both acceptance-blocking P1 corrections require independent closure evidence against the new immutable subject
- implementation/product subject: `38fe697c12be6ce7032334cdd10897f554117dfc`
- defective subject: `2cf9b84a87b72199ba41c610864364e93cf550c4`
- remediation baseline: `bed9abb`
- orchestration baseline: task-record commit (self)

## Objective

Independently verify that the immutable remediation subject closes both SQLite
review findings without regressing accepted persistence, transaction,
integrity, compatibility, scope, or candidate-card behavior.

## Scope and authority

- read scope:
  - exact remediation/defective subjects, remediation baseline, committed diff,
    changed SQLite source/test/card, original acceptance and review evidence,
    remediation Task, and directly relevant Project persistence behavior;
  - active OpenSpec design/spec/tasks and repository verification commands
    needed to judge the focused correction.
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-sqlite-remediation-acceptance-001-integrity-and-path-boundary.testing.md`
- delegated discretion: choose bounded no-product-write substantiation needed
  to distinguish closure, bypass, regression, environment failure, subject
  mismatch, or evidence gap.
- tools/external actions: deterministic local read/test/type/build/boundary/Git
  inspection and explicitly prefixed disposable OS-temp SQLite databases only;
  no install, network service, production database, product/config/dependency/
  lockfile/Project State/OpenSpec/Task edit, destructive action, or unrelated
  Git-history action.
- delegation: none
- authority mode: task
- output mode: file

## Frozen decisions and escalation

- Treat `38fe697` as immutable and do not fix a finding.
- Disposition both prior P1 findings separately:
  1. exact/history reads fail closed when the persisted revision aggregate UID
     or the aggregate UID is independently corrupted, while valid bindings and
     reads remain unchanged;
  2. canonical database paths equal to or below the executing cwd/workspace
     root are rejected, while an outside disposable absolute path and a
     sibling-prefix path remain valid.
- Confirm schema v1/DDL, public APIs, connection/transaction behavior, error
  categories, dependency/lockfile, engine floor, checker, and excluded modules
  did not change.
- Verify the candidate Project card matches the remediation and plainly keeps
  focused retest/re-review pending.
- Tester reports mismatch without editing source, tests, card, Tasks, OpenSpec,
  or prior evidence.

## References

- `docs/construction/records/project-persistence/reports/PP-sqlite-review-001-versioned-project-persistence.reviewing.md`
- `docs/construction/records/project-persistence/tasks/PP-sqlite-remediation-001-integrity-and-path-boundary.md`
- `docs/construction/records/project-persistence/reports/PP-sqlite-acceptance-001-versioned-project-persistence.testing.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Confirm exact remediation/defective subjects, baseline, current
   orchestration HEAD, record-only intervening range, clean start, and
   unchanged remediation subject.
2. Run fresh focused SQLite evidence for both finding closures and nearby valid
   behavior, followed by relevant Runtime Server types/full suite, Runtime
   Contracts compatibility, build, boundaries, diff/import/scope, and clean
   checks.
3. Demonstrate closure rather than bypass for both findings; identify any
   nearby regression, card mismatch, or evidence limitation.
4. Return PASS only when both findings are closed and no product defect,
   blocking evidence gap, subject mismatch, or card mismatch remains.

## Handoff

Write only the declared delta-only testing Report and commit it as:
`test(server): retest project sqlite remediation`.
Return the report commit, finding dispositions, PASS/FAIL, decisive evidence,
coverage limits, residual risk, and final repository state, then stop. Do not
remediate, review, reconcile root/meta, authorize Actor integration, or edit
OpenSpec.
