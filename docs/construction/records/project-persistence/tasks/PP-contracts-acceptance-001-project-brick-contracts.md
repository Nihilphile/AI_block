# PP-contracts-acceptance-001 Project and Definition Brick Contract Acceptance

- owner: Runtime Contracts
- follows: PP-contracts-001, PP-tooling-001
- affected modules: Runtime Contracts; future Project/persistence consumer
- workflow: W3 Independent Test + Compatibility
- base reason: the committed public Contract slice must receive independent evidence before the Project module consumes it
- implementation/product subject: `7d3eca44f2b89011f9c979e1a6f6d3bad9018008`
- orchestration baseline: task-record commit (self)

## Objective

Independently verify that the committed Project/Definition Brick application
Contracts are strict, additive, root-exported, compatible with existing Actor
consumers, bounded away from persistence/transport behavior, and accurately
represented by the Runtime Contracts Project State card.

## Scope and authority

- read scope:
  - implementation subject `7d3eca44f2b89011f9c979e1a6f6d3bad9018008`
  - baseline `705f9eb`
  - `packages/runtime-contracts/**`
  - directly relevant Runtime Server consumer type evidence
  - `scripts/check-workspace-boundaries.mjs`
  - loaded Task, coding/debugging Reports, OpenSpec artifacts, and state card
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-contracts-acceptance-001-project-brick-contracts.testing.md`
- delegated discretion:
  - select focused negative/compatibility checks inside the accepted Contract
    boundary;
  - classify product, test, environment, subject, state-card, or evidence
    failures.
- tools/external actions: deterministic local read/test/type/build/boundary commands only; no install, network, service, database, destructive, or product-write action
- delegation: none

## Frozen decisions and escalation

- The implementation subject is immutable. Do not modify or fix Runtime,
  tests, Contracts, checker, Project State, OpenSpec, configuration,
  dependencies, manifests, or lockfiles.
- Verify the new aggregate UID remains distinct from Project-local `brick_id`,
  revision UID, and digest; the existing `DefinitionBrickRevision` shape must
  remain compatible.
- Verify strict schemas and stable errors add no HTTP, CLI, file, SQL, driver,
  retry-policy, persistence-detail, Actor lifecycle, or execution behavior.
- Testers report state-card mismatches but do not edit the card.
- Stop with subject mismatch if product/test/configuration/tooling content after
  `7d3eca4` is not limited to authorized construction records.

## References

- `docs/construction/records/project-persistence/tasks/PP-contracts-001-project-brick-contracts.md`
- `docs/construction/records/project-persistence/reports/PP-contracts-001-project-brick-contracts.coding.md`
- `docs/construction/records/project-persistence/reports/PP-debug-001-package-root-boundary-probe.debugging.md`
- `docs/construction/records/project-persistence/reports/PP-tooling-001-refresh-contract-export-allowlists.debugging.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

1. Confirm exact subject identity and a clean immutable start.
2. Map the Contract Task acceptance items and applicable OpenSpec scenarios to
   fresh independent evidence.
3. Run focused Contract tests, the full Contract suite, Contract build/type,
   Runtime Server consumer type, workspace build, and boundary checks.
4. Inspect negative tests and public root/type exports sufficiently to verify
   strict rejection and absence of excluded semantics.
5. Verify the Runtime Contracts card against the committed subject and report
   any mismatch without editing it.
6. Return PASS or exact classified findings, coverage limits, residual risk,
   and final worktree state.

## Handoff

Write and commit only the testing Report as:
`test(contracts): accept project and brick contracts`.
Do not remediate, mark OpenSpec tasks, schedule review, or transfer the verdict
to another subject.
