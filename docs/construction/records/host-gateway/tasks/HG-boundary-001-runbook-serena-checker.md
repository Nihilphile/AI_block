# HG-boundary-001 Align Serena Boundary Check with Runbook

- owner: root construction acceptance tooling
- follows: HG-integration-002
- affected modules: boundary checker only
- workflow: W1
- base reason: the stale check is a narrow, reversible documentation-path correction with exact scope and deterministic verification
- product baseline: `f9c92b92831f06027a62f481e22250bfa767c9a5`

## Objective

Make the repository boundary checker validate the authoritative Serena policy under `docs/construction/runbook/` instead of requiring substantive content in the retired compatibility entry point.

## Scope and authority

- read scope: `scripts/check-workspace-boundaries.mjs`, the Runbook Serena policy, the retired Serena entry point, the HG-integration-002 Tester Report, root scripts, and directly relevant Git history
- write scope: `scripts/check-workspace-boundaries.mjs` and `docs/construction/records/host-gateway/reports/HG-boundary-001-runbook-serena-checker.coding.md`
- delegated discretion: choose the smallest assertion update that preserves the existing Serena policy guarantees and checker style
- tools/external actions: local repository tools and deterministic pnpm checks only; no network service or external-state mutation
- delegation: none

## Constraints and escalation

- Treat `docs/construction/runbook/policies/serena.md` as the authoritative policy.
- The retired `docs/construction/serena-lsp-worker-guide.md` remains a compatibility pointer and must not be expanded back into a second policy copy.
- Preserve the no-memory rule, Git/tests authority, Serena non-memory operation boundary, and documented Windows/fallback guidance in the effective check.
- Do not weaken, remove, or rewrite unrelated workspace, package, integration, or boundary checks.
- Do not modify product code, tests, manifests, lockfile, TypeScript configuration, Runbook files, legacy entry points, prior Tasks, or prior Reports.
- No Serena memory, onboarding, or `.serena/` inspection. Do not chain Superpowers workflows.
- Escalate if the fix requires changing policy semantics, another acceptance rule, a dependency, or any path outside the exact write scope.

## References

- `docs/construction/runbook/ai-block-project-profile.md`
- `docs/construction/runbook/work-guides/coding.md`
- `docs/construction/runbook/policies/serena.md`
- `docs/construction/runbook/policies/superpowers.md`
- `docs/construction/runbook/templates/report.md`
- `docs/construction/records/host-gateway/reports/HG-integration-002-root-test-dependency-ownership.tester.md`

## Acceptance

- The checker reads and validates `docs/construction/runbook/policies/serena.md` for the effective Serena policy guarantees.
- It no longer expects the retired pointer file to duplicate those guarantees.
- `pnpm check:boundaries` passes.
- Full `pnpm verify` passes with the existing suite counts and leaves a clean generated-output state.
- Only the authorized checker and coding Report are changed by the Worker.

## Handoff

Write `docs/construction/records/host-gateway/reports/HG-boundary-001-runbook-serena-checker.coding.md` using the current Report semantics. Report W1 uncertainty and implicit-decision findings, exact assertions changed, verification, deviations, remaining risk, and the committed subject. Commit only authorized paths with message `test: align Serena boundary check with runbook`.
