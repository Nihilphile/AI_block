# PP-debug-001 Package-root Boundary Probe Diagnosis

- owner: workspace boundary-check tooling
- follows: PP-contracts-001
- affected modules: construction tooling; Runtime workspace package roots
- workflow: W0 diagnosis
- base reason: an unchanged repository-level probe blocks Contract Task acceptance after all scoped Contract checks pass
- implementation/product subject: uncommitted PP-contracts-001 delta rooted at `7486406`
- orchestration baseline: task-record commit (self)

## Objective

Diagnose why `pnpm check:boundaries` reports empty-output package-root
runtime/export probe failures for Runtime Server, ActorHost, and Runtime CLI
after the authorized Runtime Contracts topology manifest update, and identify
whether the cause belongs to the PP-contracts-001 delta, the current local
environment/generated state, or pre-existing boundary-check tooling.

## Scope and authority

- read scope:
  - `scripts/check-workspace-boundaries.mjs`
  - root and application package manifests, exports, TypeScript configuration,
    and directly relevant generated-output layout
  - the current PP-contracts-001 diff and its accepted baseline through Git
  - local Node/pnpm executable and environment facts required to reproduce the
    probe
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-debug-001-package-root-boundary-probe.debugging.md`
- delegated discretion:
  - reproduce the exact failing command and the individual generated probes;
  - inspect child-process status/error/signal behavior that the current checker
    may omit;
  - compare current paths/configuration with the accepted baseline without
    modifying or reverting the shared working tree;
  - identify the smallest credible repair surface and owning state boundary.
- tools/external actions: local read-only commands and disposable OS temporary files only; no install, network, package mutation, Git checkout/reset/stash/worktree mutation, or repository cleanup
- delegation: none

## Frozen decisions and escalation

- Diagnosis only. Do not edit Runtime, tests, Contracts, checker, manifests,
  configuration, dependencies, lockfiles, Project State, OpenSpec, Task, or the
  preserved PP-contracts-001 implementation.
- Do not mark OpenSpec tasks, write a repair, stage, commit, or schedule work.
- Treat the Contract Coder's successful 84/84 Contract suite, build, Contract
  type check, and Runtime Server consumer type check as prior evidence, not as
  proof of the package-root probe.
- Separate:
  - the checker topology manifest update directly required by new Contract
    paths;
  - the remaining three app probe failures;
  - any unrelated environment/generated-output condition.
- Stop if diagnosis would require installing packages, changing source, or
  mutating the shared working tree.

## References

- `docs/construction/records/project-persistence/tasks/PP-contracts-001-project-brick-contracts.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `docs/construction/runbook/procedures/subject-identity.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

The Report must:

1. reproduce or precisely explain the three failing package-root probes;
2. expose the decisive child-process error/signal/module-resolution evidence
   hidden by empty stdout/stderr;
3. determine whether the PP-contracts-001 diff caused the failure;
4. identify the owning boundary and smallest credible repair surface;
5. state whether Contract implementation is safe to retain;
6. state whether repair needs a separate Task and which later acceptance checks
   must be rerun.

## Handoff

Write the debugging Report at the authorized path and return the diagnosis.
Do not repair, commit, or authorize the Contract Coder to continue.
