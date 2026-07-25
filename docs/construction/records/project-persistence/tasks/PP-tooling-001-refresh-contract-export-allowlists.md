# PP-tooling-001 Refresh Runtime Contract Export Allowlists

- owner: workspace boundary-check tooling
- follows: PP-debug-001
- affected modules: construction tooling; Runtime Contracts public-root verification
- workflow: W1
- base reason: the exact two-list correction is fully specified, reversible, and directly verified by the failing deterministic boundary command
- implementation/product subject: uncommitted PP-contracts-001 delta rooted at `cc9ee77`
- orchestration baseline: task-record commit (self)

## Objective

Update the workspace boundary checker's exact Runtime Contracts runtime and
public-type export allowlists to include the accepted additive
Project/Definition Brick Contract surface, without changing probe behavior,
boundary rules, package manifests, or product code.

## Scope and authority

- read scope:
  - `scripts/check-workspace-boundaries.mjs`
  - the PP-debug-001 diagnosis Report
  - the current Runtime Contracts root exports and public-type coverage needed
    to enumerate the exact accepted names
- write scope:
  - `scripts/check-workspace-boundaries.mjs`
  - `docs/construction/records/project-persistence/reports/PP-tooling-001-refresh-contract-export-allowlists.debugging.md`
- delegated discretion:
  - place the exact accepted names into the existing sorted/runtime and
    public-type allowlist structures;
  - apply formatting consistent with the existing checker.
- tools/external actions: deterministic local boundary command and diff checks only; no install, network, service, destructive, or Git-history action
- delegation: none

## Frozen decisions and escalation

- Change only `expectedRuntimeExports` and `expectedPublicTypeExports`.
- Add only the accepted Project/Definition Brick runtime/type root exports
  established by PP-contracts-001.
- Do not alter generated probe code, process validation, topology manifests,
  boundary rules, diagnostics, package manifests, Runtime Contracts, tests,
  Project State, OpenSpec, dependencies, or lockfiles.
- Preserve the Contract Coder's uncommitted implementation and the already
  authorized topology/test-list checker update.
- Stop if any additional checker path or behavior must change.

## References

- `docs/construction/records/project-persistence/reports/PP-debug-001-package-root-boundary-probe.debugging.md`
- `docs/construction/records/project-persistence/tasks/PP-contracts-001-project-brick-contracts.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

1. The runtime allowlist contains every and only the accepted public runtime
   export after the additive Contract slice.
2. The public-type allowlist covers all accepted Project/Definition Brick
   public type exports.
3. `pnpm check:boundaries` passes with the preserved Contract implementation.
4. `git diff --check` passes and the repair diff changes no checker behavior
   outside the two allowlists.
5. The repair and debugging Report are committed together as:
   `fix(tooling): refresh contract export allowlists`.

## Handoff

Write the debugging Report, stage only the authorized checker path and Report,
commit with the exact message, and stop. Do not authorize the Contract Coder,
mark OpenSpec tasks, or continue product construction.
