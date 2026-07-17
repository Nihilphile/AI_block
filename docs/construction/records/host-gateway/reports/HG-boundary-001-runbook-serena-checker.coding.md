# HG-boundary-001 Align Serena Boundary Check with Runbook — Coding Report

- work: coding
- result: completed
- subject: same-as-report

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: W1 micro-preflight found that the retired guide's historical assertion literals are not present verbatim in the authoritative policy. The checker now asserts the policy's current wording for the mandatory no-memory rule, Git/tests authority, allowed non-memory capability boundary, Windows guidance, and fallback guidance. No escalation was needed because this is a narrow assertion-source correction within the delegated discretion.

## Work and evidence

Updated `scripts/check-workspace-boundaries.mjs` so `checkDocumentation()` reads `docs/construction/runbook/policies/serena.md` and reports missing Runbook policy topics. The retired `docs/construction/serena-lsp-worker-guide.md` is no longer inspected for substantive content. Unrelated workspace, package, integration, probe, and boundary assertions were preserved.

Changed assertion surface:

- `The no-memory policy is mandatory.`
- `Git diff, TypeScript, tests, boundary probes, and the final worktree remain authoritative.`
- `## Allowed non-memory capabilities`
- `Windows paths may be returned with backslashes;`
- `fallbacks`

## Verification or result

- `git diff --check`: passed.
- `pnpm build`: passed.
- `pnpm check:boundaries`: passed after the build generated the required artifacts and probes completed successfully.
- `pnpm verify`: passed with frozen install, build, Contracts 9 files / 58 tests, ActorHost 4 / 34, Runtime Server 2 / 15, integration 1 / 5, boundary checks, cleanup, and final Git-clean verification.

## Deviations and remaining risk

- The first pre-build `pnpm check:boundaries` invocation failed only on the existing generated-artifact/probe precondition; the normal build followed and the boundary check passed.
- No policy, retired pointer, product code, tests, manifests, lockfile, Tasks, or prior Reports were changed.
- Remaining risk is limited to the checker matching the current authoritative policy wording; future policy wording changes should update these explicit assertions in the same Task-scoped manner.

Committed subject: `test: align Serena boundary check with runbook`
