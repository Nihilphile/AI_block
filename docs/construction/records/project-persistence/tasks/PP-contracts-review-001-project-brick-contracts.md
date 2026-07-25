# PP-contracts-review-001 Project and Definition Brick Contract Review

- owner: Runtime Contracts public boundary
- follows: PP-contracts-acceptance-001
- affected modules: Runtime Contracts; future Project/persistence consumer
- workflow: W3 Early Review
- base reason: the additive Contract boundary is about to be consumed by a new state owner, so semantic drift found later would cause substantial rework
- implementation/product subject: `7d3eca44f2b89011f9c979e1a6f6d3bad9018008`
- orchestration baseline: task-record commit (self)

## Objective

Independently review the committed Project/Definition Brick Contract boundary
for product semantics, ownership, additive compatibility, strict failure
behavior, exclusion discipline, maintainability, and accurate Project State
representation before Project module implementation begins.

## Scope and authority

- read scope:
  - implementation subject `7d3eca44f2b89011f9c979e1a6f6d3bad9018008`
  - comparison baseline `705f9eb`
  - committed Contract source/tests, Runtime Contracts card, Task/coding/testing
    Reports, active OpenSpec artifacts, accepted current/future design context,
    and directly relevant Actor consumer interface
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-contracts-review-001-project-brick-contracts.reviewing.md`
- delegated discretion:
  - identify precise semantic, boundary, compatibility, failure, evidence,
    maintainability, or state-card findings;
  - recommend acceptance or bounded remediation.
- tools/external actions: read-only repository/Git inspection and minimal local substantiation only; no install, network, service, product write, or destructive action
- delegation: none

## Frozen decisions and escalation

- Review only. Do not modify Runtime, tests, Contracts, checker, Project State,
  OpenSpec, configuration, dependencies, manifests, lockfiles, Tasks, or prior
  Reports.
- Treat preference differences as non-findings unless tied to a violated
  requirement or concrete future-consumer risk.
- Verify, in particular:
  - globally unique aggregate UID versus human ID/revision UID/digest;
  - unchanged exact `DefinitionBrickRevision` compatibility;
  - Project-local typed Brick namespace and immutable kind;
  - strict root-exported command/result/error surface;
  - absence of persistence/transport/driver/execution semantics;
  - adequacy of negative/public-type evidence;
  - Runtime Contracts card accuracy without persistence overclaim.
- Findings do not authorize repair.

## References

- `docs/construction/records/project-persistence/tasks/PP-contracts-001-project-brick-contracts.md`
- `docs/construction/records/project-persistence/reports/PP-contracts-001-project-brick-contracts.coding.md`
- `docs/construction/records/project-persistence/tasks/PP-contracts-acceptance-001-project-brick-contracts.md`
- `openspec/changes/build-project-and-definition-brick-persistence/proposal.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

1. Confirm implementation subject, comparison baseline, current orchestration
   HEAD, and that intervening commits contain only allowed construction records.
2. Lead with actionable findings ordered by consequence; if none, say so
   explicitly.
3. Review every frozen semantic/boundary item and the changed state card against
   the committed source/tests and accepted design.
4. Separate defects, evidence gaps, deliberately deferred product scope, and
   later Project-module decisions.
5. Return `ACCEPT` or `REMEDIATION_REQUIRED` for use by the Orchestrator.

## Handoff

Write and commit only the reviewing Report as:
`review(contracts): review project and brick contracts`.
Do not implement fixes, mark OpenSpec tasks, schedule remediation, or continue
into the Project module.
