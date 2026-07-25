# PP-application-remediation-001 Project Brick Canonical Body and Exact-Revision Integrity

- owner: Runtime Server Project Module
- follows: PP-application-review-001
- affected modules: Runtime Server Project Module; possible Runtime Contracts normalization owner
- workflow: W3 remediation
- base reason: independent acceptance and Early Review found two bounded fail-closed defects in a new state owner that later persistence and resolver work would consume
- implementation/product subject: `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`
- finding baseline: `032dc3b`
- orchestration baseline: task-record commit (self)

## Objective

Close exactly the two accepted findings: authoring and reads must use and
enforce the accepted canonical Definition Brick Body, and exact-revision reads
must distinguish ordinary future absence from corruption inside the aggregate's
claimed immutable history.

## Scope and authority

- preflight read scope:
  - Project source/tests/module card
  - Runtime Contracts Definition Brick schemas, digest implementation, root
    exports, tests, and state card only as needed to identify the single
    canonical-Body owner
  - PP-application implementation/testing/review Tasks and Reports
  - active OpenSpec design/spec/tasks and current runtime invariants
- provisional implementation write scope after separate authorization:
  - `apps/runtime-server/src/modules/project/application.ts`
  - `apps/runtime-server/src/modules/project/values.ts`
  - `apps/runtime-server/test/modules/project/project-application.test.ts`
  - `project_state/apps/runtime-server/modules/project/README.md`
  - `docs/construction/records/project-persistence/reports/PP-application-remediation-001-project-brick-integrity.coding.md`
- delegated discretion:
  - choose the smallest Project-internal correction for exact-revision
    coherence and error classification;
  - design focused deterministic evidence for canonical returned/stored/read
    Bodies and exact-revision corruption.
- tools/external actions: deterministic local inspection and verification only;
  no install, network, service, database, destructive, or Git-history action
- delegation: none

## Frozen decisions and escalation

- Preflight dispatch authorizes no edits.
- Do not duplicate the accepted Runtime Contracts Definition Brick
  normalization algorithm in Project source.
- Preflight must determine whether the accepted canonical Body can be obtained
  from the current public Runtime Contracts surface. If not, return `BLOCKED`
  with the exact minimal Contract/checker/test/card scope needed for a
  single-owner public normalization boundary; do not implement around it.
- Canonical authoring must return and persist the normalized Body, including one
  leading BOM removal and CRLF/CR to LF normalization for every nested accepted
  text-bearing Body.
- Read integrity must reject a stored non-canonical Body even when recomputing
  its digest would produce the stored digest.
- For exact-revision reads:
  - a requested revision greater than a valid aggregate's
    `current_revision` is ordinary `definition_brick_revision_not_found`;
  - a repository miss for a requested revision within
    `1..current_revision` is `definition_brick_integrity_error`;
  - a returned revision greater than `current_revision`, or otherwise
    inconsistent with the aggregate/request, is
    `definition_brick_integrity_error`.
- Add focused evidence for create and revise returned/persisted canonical Body,
  nested prompt normalization, non-canonical stored Body corruption, missing
  in-range history, future revision absence, and beyond-current returned
  revision corruption.
- Do not change public command/result/error schemas, digest bytes, aggregate
  semantics, repository ports, UoW behavior, checker rules, manifests,
  dependencies, lockfiles, SQLite, Server composition, or another module.
- OpenSpec tasks `3.1`–`3.5` remain the application slice; do not mark any
  additional task or edit the specification/design.
- Project State responsibility:
  - Coder may update only the directly affected Project module card after the
    remediation is real;
  - Coder must not edit root routing, Runtime Server routing, system map,
    current focus, handoff, Contracts/Actor cards, or neighboring cards unless
    a later separate Contract Task explicitly grants its own directly affected
    card;
  - Tester and Reviewer never edit state;
  - Orchestrator reconciles routing/meta only after re-acceptance.

## References

- `docs/construction/records/project-persistence/reports/PP-application-acceptance-001-project-brick-application.testing.md`
- `docs/construction/records/project-persistence/reports/PP-application-review-001-project-brick-application.reviewing.md`
- `docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`

References are audit pointers only.

## Acceptance

1. Preflight returns exact root cause, ownership decision, file/test plan,
   Contract/checker consequence, verification commands, Project State
   consequence, and `READY` or `BLOCKED`.
2. After separate implementation authorization, both findings and only their
   associated evidence/card claims are corrected.
3. Focused Project tests, Runtime Server types/full suite, relevant Contract
   compatibility tests if the Contract surface changes, workspace build,
   boundary checks, and diff/scope checks pass.
4. Independent focused re-test and Early Review accept an immutable remediation
   subject before Project State routing/meta reconciliation.

## Handoff

For preflight, return the required analysis and stop without editing or writing
the coding Report. Do not begin remediation, change OpenSpec, update Project
State, or schedule persistence.
