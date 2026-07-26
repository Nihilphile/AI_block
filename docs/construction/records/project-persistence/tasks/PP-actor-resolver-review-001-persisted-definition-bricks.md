# PP-actor-resolver-review-001 Project Persistence Boundary Review

- owner: Runtime Server Project/Actor boundary
- follows: PP-actor-resolver-acceptance-001
- affected modules: Runtime Contracts; Runtime Server Project Module; Runtime Server Actor Module; workspace/toolchain boundary
- workflow: W3 module/boundary review + Compatibility + Recovery + Security Review
- base reason: the complete producer/persistence/consumer boundary requires semantic and ownership acceptance before Orchestrator closeout
- implementation/product subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- implementation baseline: `e181255`
- accepted Project SQLite subject: `38fe697c12be6ce7032334cdd10897f554117dfc`
- orchestration baseline: task-record commit (self)

## Objective

Independently review the complete Project/Definition Brick persistence and
Actor exact-resolution boundary, its integrated testing evidence, changed
Project card, unchanged neighboring cards, and exclusion discipline for
acceptance or precise remediation.

## Scope and authority

- read scope:
  - exact integration subject/baseline and the accepted Contract, Project
    application, SQLite/remediation, ActorTemplate, and integrated-testing
    evidence needed to judge the current boundary;
  - Runtime Contracts, Project/Actor source/tests/exports/cards, checker,
    manifests/lockfile, active OpenSpec artifacts, implementation/evidence
    Tasks, current Runtime invariants, root/current system routes;
  - Git subject/range history and minimal local substantiation needed for a
    precise finding.
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-actor-resolver-review-001-persisted-definition-bricks.reviewing.md`
- delegated discretion: identify precise defects, blocking evidence gaps,
  card mismatches, acceptable limitations, or residual risks without
  redesigning the accepted product boundary.
- tools/external actions: read-only repository/Git inspection and minimal local
  substantiation only; no install, network service, database mutation, product
  write, Project State/OpenSpec/Task/prior-evidence edit, destructive action,
  or unrelated Git-history action.
- delegation: none
- authority mode: task
- output mode: file

## Review dimensions

- Confirm exact subject, baseline, integrated testing evidence, orchestration
  HEAD, and record-only intervening commits.
- Review shared Contract ownership/root exports and confirm no transport, SQL,
  path, or driver details leaked into the public surface.
- Review Project aggregate/application ownership, canonical Body/digest,
  immutable history, optimistic concurrency, archive semantics, exact read,
  error precedence, and inward ports.
- Review SQLite schema v1/ledger/constraints, prepared values, transaction and
  rollback ordering, same-process FIFO, cross-process timeout, startup
  validation, safe integer conversion, corruption/schema/configuration
  fail-closed behavior, deterministic close, path/security settings, and
  synchronous runtime bounds.
- Review the Project-owned resolver provider's structural compatibility,
  absence whitelist, redacted fail-closed mapping, exact/no-latest behavior,
  archived history, restart behavior, Snapshot provenance, dependency
  direction, and lack of Actor/SQLite coupling.
- Verify the Project candidate card against the exact subject/evidence and
  verify that unchanged Runtime Contracts and Actor cards remain accurate.
- Verify checker policy, supported Node/toolchain policy, no third-party
  SQLite dependency/lockfile drift, and exclusion discipline.
- Separate product defects, evidence gaps, card/reconciliation gaps, accepted
  synchronous/lock/stress limitations, and deliberately deferred work.
- Do not duplicate the integrated test suite; run only minimal substantiation
  for a concrete finding.

## References

- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-001-persisted-definition-bricks.md`
- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-acceptance-001-persisted-definition-bricks.md`
- `docs/construction/records/project-persistence/reports/PP-actor-resolver-acceptance-001-persisted-definition-bricks.testing.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `project_state/apps/runtime-server/modules/project/README.md`
- `project_state/apps/runtime-server/modules/actor/README.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Confirm exact implementation/evidence subjects, baseline, orchestration
   HEAD, clean start, and unchanged product subject.
2. Lead with actionable findings ordered by consequence, or state explicitly
   that none exist.
3. Cover every review dimension above without re-reviewing accepted unchanged
   details beyond what integrated-boundary judgment requires.
4. Give explicit Project/Runtime Contracts/Actor card dispositions and
   distinguish Orchestrator-only root/meta reconciliation.
5. Return ACCEPT only when no actionable finding, blocking evidence gap,
   subject mismatch, or candidate/neighbor-card mismatch remains.

## Handoff

Write only the declared delta-only reviewing Report and commit it as:
`review(server): review project persistence boundary`.
Return report commit and `ACCEPT` or `REMEDIATION_REQUIRED`, findings, coverage
limits, and residual risk, then stop. Do not repair, reconcile root/meta,
edit OpenSpec, authorize further implementation, or archive the change.
