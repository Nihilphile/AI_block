# PP-application-001 Project and Definition Brick Application Module

- owner: Runtime Server Project Module
- follows: PP-contracts-review-001
- affected modules: new Runtime Server Project Module; Runtime Contracts consumer; potential Actor digest consumer boundary
- workflow: W3
- base reason: this slice establishes a new state owner and application boundary that later SQLite and Actor resolver slices will consume
- implementation/product subject: `9daf5a0`
- orchestration baseline: task-record commit (self)

## Objective

Implement an independently acceptable Runtime Server Project application module
with explicit Project create/read and Definition Brick
create/revise/archive/read/list/history/exact-revision behavior behind
repository and transaction ports, plus deterministic in-memory evidence, while
excluding SQLite and every execution workflow.

## Scope and authority

- read scope:
  - `packages/runtime-contracts/**`
  - `apps/runtime-server/src/modules/actor/**` and its tests only for accepted
    resolver, canonicalization/digest, repository, error, and Unit-of-Work
    patterns
  - `apps/runtime-server/**` configuration needed to plan the new module
  - active OpenSpec artifacts and accepted construction evidence
- implementation write scope:
  - `apps/runtime-server/src/modules/project/**`
  - `apps/runtime-server/test/modules/project/**`
  - `project_state/apps/runtime-server/modules/project/README.md`
  - checkbox state for OpenSpec tasks `3.1` through `3.5` only
  - `docs/construction/records/project-persistence/reports/PP-application-001-project-brick-application.coding.md`
- delegated discretion:
  - choose internal Project module source/test organization;
  - define inward repository, transaction, identity, clock, canonicalization,
    digest, and validation ports consistent with the accepted Contracts;
  - implement deterministic in-memory adapters for module evidence;
  - create only the new directly affected Project module card after real
    source/test ownership exists.
- tools/external actions: local repository inspection and deterministic local verification only; no install, network, service, database, destructive, or Git-history action
- delegation: none

## Frozen decisions and escalation

- Preflight dispatch authorizes no edits.
- One Runtime Server Project module owns the minimal Project prerequisite and
  Definition Brick aggregate/revision authoring for this slice.
- Use the accepted root-exported Project/Definition Brick Runtime Contracts;
  do not create competing public command/result/error shapes.
- Preserve:
  - Server-generated Project and Brick aggregate identities;
  - Project-local `brick_id` namespace shared by all Definition Brick kinds;
  - immutable kind and immutable positive revisions;
  - strict create with no upsert;
  - optimistic `base_revision` conflict;
  - fresh revision identity even for equal canonical content;
  - idempotent archive without ID release or history deletion;
  - deterministic list by `brick_id` and history by ascending revision;
  - archived exact-revision resolution.
- Application validation and reads must fail closed on invalid Contract shape,
  identity binding, canonicalization, or digest integrity.
- Do not import Actor implementation details into the Project module. If the
  accepted Definition Brick canonicalization/digest algorithm cannot be reused
  without changing Runtime Contracts, Actor source, or another path, stop with
  the exact boundary decision and required scope; do not duplicate the
  algorithm.
- Do not add SQLite, `node:sqlite`, schema/migrations, database paths, package
  dependencies, lockfiles, Server startup/composition, HTTP/CLI/file import,
  Project activation/deletion/alias/workspace roots, ActorTemplate/Snapshot
  persistence, Actor creation, Host, Package, Run, recovery, backup, or Graph.
- Project State responsibility:
  - Coder may create only
    `project_state/apps/runtime-server/modules/project/README.md` after the
    source/test boundary exists;
  - Coder must not edit the root state README, Runtime Server routing node,
    system map, current focus, Runtime Contracts card, Actor card, or any
    neighboring card;
  - Tester reports mismatches without editing claims;
  - Reviewer verifies the new card against the exact subject;
  - Orchestrator updates routing/meta/accepted-deferred summaries only at
    acceptance.
- Use scope escalation for any manifest, configuration, dependency, existing
  module, Contract, checker, or additional Project State path.

## References

- `openspec/changes/build-project-and-definition-brick-persistence/proposal.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `openspec/changes/build-project-and-definition-brick-persistence/tasks.md`
- `docs/construction/records/project-persistence/reports/PP-explore-001-persistence-first-boundary.exploring.md`
- `docs/construction/records/project-persistence/reports/PP-contracts-review-001-project-brick-contracts.reviewing.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

1. Preflight returns the exact module/file plan, aggregate/value model,
   operation flow, port and transaction boundaries, error mapping,
   canonicalization/digest reuse path, in-memory rollback strategy, tests,
   verification, Project State consequence, and `READY` or `BLOCKED`.
2. After separate implementation authorization, OpenSpec tasks `3.1` through
   `3.5` are implemented without SQLite or an external adapter.
3. Focused tests cover Project create/read; missing Project; strict Brick
   create; Project isolation; duplicate create; immutable kind; revise
   conflict; equal-content provenance; archive/idempotency/no-ID-release;
   deterministic list/history; exact archived resolution; validation and
   integrity failure; and full Unit-of-Work rollback.
4. The module depends inward on Runtime Contracts and its own ports; it does not
   import Actor, SQLite, transport, CLI, Host, Package, Run, or Graph
   implementation.
5. Targeted Project tests, Runtime Server suite/type checks, workspace build,
   boundary checks, and diff/no-excluded-scope checks pass.
6. The new Project state card accurately describes only the implemented
   application/in-memory boundary and explicitly defers production persistence,
   Server composition, execution, and external adapters.
7. The implementation and coding Report are committed together under:
   `feat(server): add project brick application module`.

## Handoff

For preflight, return the required analysis and stop without editing or writing
the final Report. After explicit implementation authorization, write the coding
Report, update only OpenSpec tasks `3.1`–`3.5`, create only the authorized new
module card, stage only authorized paths, commit with the exact message, and
stop. Do not schedule SQLite, testing, review, routing/meta state reconciliation,
or another construction phase.
