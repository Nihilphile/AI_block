# PP-explore-001 Persistence-first Boundary Reconnaissance

- owner: future Project/persistence boundary and current Actor Module consumer boundary
- follows: none
- affected modules: Runtime Server Actor Module; future Project/persistence boundary
- workflow: W0
- base reason: bounded read-only repository evidence will materially constrain a later W3 product proposal
- implementation/product subject: `166b1ac261c9d1a783339541ff7415581d87f7e4`
- orchestration baseline: `166b1ac261c9d1a783339541ff7415581d87f7e4`

## Objective

Determine the smallest independently acceptable persistence-first construction
slice that gives the accepted reference-only ActorTemplate/Snapshot boundary an
authoritative Project and Definition Brick persistence/authoring path, without
pulling Actor creation, Host launch, Package workflow, Run, CLI behavior,
recovery automation, or Graph into the slice.

## Scope and authority

- read scope:
  - `packages/runtime-contracts/**`
  - `apps/runtime-server/src/modules/actor/**`
  - `apps/runtime-server/test/modules/actor/**`
  - directly relevant workspace/package configuration
  - accepted ActorTemplate Contracts, Tasks, Reports, closeout, and Git evidence
  - the explicitly loaded Project State and design files
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-explore-001-persistence-first-boundary.exploring.md`
- delegated discretion:
  - trace existing repository, Unit-of-Work, Project namespace, resolver,
    validator, and Snapshot persistence ports;
  - compare bounded slice options and recommend one;
  - identify required versus avoidable Contract or public-boundary changes;
  - identify directly affected current state cards and the condition for
    creating a future Project/persistence card.
- tools/external actions: read-only local repository inspection; no external or stateful action
- delegation: none

## Frozen decisions and escalation

- This is exploration only. Do not modify Runtime source, tests, Contracts,
  configuration, dependencies, OpenSpec artifacts, Project State, or design
  documents.
- Preserve the current Package Head-plus-one-root-`BrickPrompt` baseline.
- Do not introduce Actor creation, ActorPool behavior, Host launch, Package
  workflow, Run/Invocation, CLI command behavior, recovery automation, or Graph.
- Treat `docs/design/future/project-persistence-and-brick-authoring.md` as
  future product-design input, not implementation authorization or a physical
  schema.
- Separate verified repository facts, strong inference, recommended decisions,
  and unresolved product choices.
- Report any Project State mismatch; do not edit a state card.
- Stop with a bounded escalation if the recommendation depends on an unlisted
  normative design or external fact.

## References

- `docs/NORTH_STAR.md`
- `docs/construction/handoff/current.md`
- `docs/design/future/project-persistence-and-brick-authoring.md`
- `docs/construction/records/actor-template/reference-only-actor-template-closeout.md`

References are audit pointers only. The dispatch manifest controls normative
loading.

## Acceptance

The Report must:

1. answer whether persistence-first is a coherent next slice against current
   repository evidence;
2. name the minimum domain/application behavior and persistence seams needed
   for one independently acceptable deliverable;
3. identify existing reusable ports and test patterns with concise file/symbol
   references;
4. identify any Contract/public-boundary decision that must close before an
   implementation proposal;
5. compare at least two plausible slice boundaries and recommend one with
   explicit exclusions;
6. identify the Project State maintenance consequence:
   - which existing card may change;
   - whether a new Project/persistence card is warranted at planning,
     implementation, or acceptance;
   - which root/meta surfaces remain Orchestrator-owned;
7. list only decisions that block the recommended slice.

## Handoff

Write the exploring Report at the authorized path. Name the exact repository
subject inspected. Do not commit, schedule implementation, or self-assign
follow-up work.
