# PP-application-review-001 Project and Definition Brick Application Review

- owner: Runtime Server Project Module
- follows: PP-application-acceptance-001
- affected modules: Runtime Server Project Module; Runtime Contracts consumer; workspace boundary-check tooling
- workflow: W3 Early Review
- base reason: later SQLite and resolver slices will consume this aggregate and transaction boundary, so semantic, ownership, and maintainability defects must close first
- implementation/product subject: `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`
- orchestration baseline: task-record commit (self)

## Objective

Review the immutable Project application subject for correctness, aggregate and
transaction ownership, Contract alignment, failure behavior, dependency
direction, checker precision, test adequacy, maintainability, excluded scope,
and exact Project module-card representation.

## Scope and authority

- read scope:
  - subject `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`
  - baseline `ac409aba3b55c794b81fd7152267dbd038cf835b`
  - affected Project source/tests/card and checker delta
  - PP-application-001 Task/coding Report and independent acceptance evidence
  - accepted Runtime Contracts, current design invariants, and active OpenSpec
    design/spec/tasks needed to judge the boundary
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-application-review-001-project-brick-application.reviewing.md`
- delegated discretion: identify precise correctness, atomicity, integrity,
  ownership, dependency, checker, evidence, maintainability, or state-card
  findings
- tools/external actions: read-only repository/Git inspection and minimal local
  substantiation only; no install, network, service, database, product write,
  Project State edit, OpenSpec edit, or destructive action
- delegation: none

## Frozen decisions and escalation

- Review only; do not fix or edit any prior artifact.
- Verify command validation precedes side effects and public results/errors stay
  aligned with the accepted Runtime Contracts.
- Verify one transaction boundary covers every mutated Project/Brick owner and
  rollback cannot leak identities, namespace reservations, aggregate changes,
  revisions, or archive state.
- Verify create/revise/archive/read/list/history/exact-revision semantics,
  Project isolation, immutable provenance, corruption detection, and stable
  error mapping are coherent under edge cases.
- Verify application source depends only on Runtime Contracts and same-module
  ports and does not absorb storage, Actor, Server composition, or execution
  ownership.
- Verify in-memory adapters remain test evidence rather than disguised
  production persistence.
- Verify the checker delta is exact, exercises the Project import policy, and
  does not weaken another topology, manifest, probe, or import rule.
- Verify the Project module card is accurate against the subject. Root routing,
  Runtime Server routing, system map, current focus, and handoff are
  intentionally still Orchestrator-owned and may remain unreconciled until
  acceptance.
- Findings do not authorize remediation.

## References

- `docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md`
- `docs/construction/records/project-persistence/reports/PP-application-001-project-brick-application.coding.md`
- `docs/construction/records/project-persistence/tasks/PP-application-acceptance-001-project-brick-application.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `docs/design/current/runtime-invariants.md`

References are audit pointers only.

## Acceptance

1. Confirm exact subject, baseline, current orchestration HEAD, and record-only
   intervening commits.
2. Lead with actionable findings and cite exact locations; explicitly state
   when none exist.
3. Review every frozen boundary item, the focused evidence, checker delta, and
   the Project card against the immutable subject.
4. Separate defects, evidence gaps, deferred persistence/composition scope,
   and future-slice design choices.
5. Return `ACCEPT` or `REMEDIATION_REQUIRED`.

## Handoff

Write and commit only the reviewing Report as:
`review(server): review project brick application module`.
Do not repair, update Project State routing/meta, mark tasks, schedule SQLite,
or continue construction.
