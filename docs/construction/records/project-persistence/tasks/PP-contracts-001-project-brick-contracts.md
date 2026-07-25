# PP-contracts-001 Project and Definition Brick Application Contracts

- owner: Runtime Contracts
- follows: PP-explore-001, PP-research-001
- affected modules: Runtime Contracts; future Project/persistence consumer
- workflow: W3 + Compatibility + Early Review
- base reason: this slice adds a shared cross-module application boundary that the new Project module will consume
- implementation/product subject: `822f030`
- orchestration baseline: task-record commit (self)

## Objective

Add the strict, additive Runtime Contract surface required for explicit Project
create/read and Definition Brick create/revise/archive/read/list/history/exact
revision operations, including stable application errors, without adding
persistence, transport, CLI, file, Actor lifecycle, or execution behavior.

## Scope and authority

- read scope:
  - `packages/runtime-contracts/**`
  - root and package TypeScript/test configuration needed to verify the Contract
    boundary
  - directly relevant Actor Contract consumers and tests for compatibility
  - the explicitly loaded OpenSpec artifacts and accepted evidence
- implementation write scope:
  - `packages/runtime-contracts/src/**`
  - `packages/runtime-contracts/test/**`
  - `packages/runtime-contracts/package.json`
  - `project_state/packages/runtime-contracts/README.md`
  - checkbox state for OpenSpec tasks `1.1` through `2.4` only
  - `docs/construction/records/project-persistence/reports/PP-contracts-001-project-brick-contracts.coding.md`
- delegated discretion:
  - choose internal Contract file organization and schema composition;
  - reuse existing identity, time, Brick Body, digest, exact-reference, and
    validation helpers;
  - select additive result-envelope composition consistent with current package
    conventions;
  - reconcile only the directly affected Runtime Contracts card when its
    implemented surface/evidence changes.
- tools/external actions: local repository inspection and deterministic local verification only; no install, network, service, database, or destructive action
- delegation: none

## Frozen decisions and escalation

- Preflight dispatch authorizes no edits.
- The Contract change is additive and root-exported. Do not rename, remove, or
  reinterpret an existing Contract.
- Include only:
  - minimal Project record plus explicit create/read commands/results;
  - Definition Brick aggregate summary;
  - create, revise, archive, aggregate read/list, history, and exact-revision
    commands/results;
  - stable errors for missing Project, duplicate/missing Brick or revision,
    revision conflict, archived Brick, invalid candidate, integrity failure,
    unsupported schema, and persistence failure.
- Reuse the accepted Definition Brick revision, Body, exact-reference, digest,
  identity, and time values. Do not add a competing Brick representation.
- Add one Server-generated globally unique Definition Brick aggregate UID that
  remains distinct from the Project-local human-readable `brick_id`, immutable
  revision UID, and content digest. Do not collapse aggregate identity into
  `project_id + brick_id`.
- Do not add HTTP status, route, CLI, argv, filesystem, SQL, migration,
  `node:sqlite`, database-path, driver-error, retry, recovery, or backup fields.
- Do not add Project activation, alias, deletion, permissions, workspace-root,
  Actor, ActorPool, Host, Package, Run, or Graph behavior.
- Do not edit the Actor card, Project State root/meta files, design documents,
  North Star, another module, dependencies, manifests, or lockfiles.
- If strict operation shapes require a new product semantic not settled by the
  loaded specification, stop with the exact choice and affected requirement.
- Project State responsibility:
  - Coder may update only the Runtime Contracts card in the implementation
    handoff when its statements become stale;
  - Tester reports card mismatch without rewriting claims;
  - Reviewer verifies the changed card against the exact subject;
  - Orchestrator retains root/map/focus and cross-module summaries.

## References

- `openspec/changes/build-project-and-definition-brick-persistence/proposal.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `openspec/changes/build-project-and-definition-brick-persistence/tasks.md`
- `docs/construction/records/project-persistence/reports/PP-explore-001-persistence-first-boundary.exploring.md`
- `docs/construction/records/project-persistence/reports/PP-research-001-node24-sqlite-substrate.researching.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

1. Preflight returns the exact proposed public values, operation/result shapes,
   stable error representation, internal file plan, compatibility impact,
   write surface, verification commands, Project State consequence, and a
   `READY` or `BLOCKED` recommendation.
2. After separate implementation authorization, OpenSpec tasks `2.1` through
   `2.4` are implemented with strict positive and negative Contract tests.
3. Existing root exports and consumers remain compatible; all new consumers
   import from `@ai-block/runtime-contracts` without deep imports.
4. No transport, persistence, dependency, lockfile, application-module, or
   execution behavior enters the Contract slice.
5. Targeted Contract tests, package type/build checks, relevant consumer type
   evidence, workspace-boundary checks, and diff/no-scope checks pass.
6. The Runtime Contracts state card accurately describes the implemented
   surface and does not imply Project persistence exists.
7. The implementation and coding Report are committed together under:
   `feat(contracts): add project and brick authoring contracts`.

## Handoff

For preflight, return the required analysis and stop without editing or writing
the final Report. After explicit implementation authorization, write the coding
Report at the authorized path, update only the allowed OpenSpec checkboxes and
directly affected card, stage only authorized paths, commit, and stop. Do not
schedule testing, review, Project implementation, or another phase.
