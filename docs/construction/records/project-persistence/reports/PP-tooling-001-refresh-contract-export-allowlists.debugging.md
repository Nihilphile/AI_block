# PP-tooling-001 Debugging Report

- work: debugging
- result: completed
- implementation subject: uncommitted PP-contracts-001 delta rooted at `cc9ee77d21718e16ac703c6d7828bf559d54f456`
- orchestration baseline: `4ee37da8de9c0c72c1d3bc16c29c78e1bb116b2c`
- lease: `workspace-boundary-debugger-01@1`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: added only the accepted Project/Definition Brick public root names to the two existing checker allowlists.

## Work and evidence

- Confirmed `HEAD` is `4ee37da8de9c0c72c1d3bc16c29c78e1bb116b2c` and the dirty worktree preserves the PP-contracts-001 Contract delta plus the already-authorized checker topology/type-test-list delta.
- Updated only `expectedRuntimeExports` and `expectedPublicTypeExports` in `scripts/check-workspace-boundaries.mjs`.
- The runtime list now includes all 26 diagnosed new runtime exports, including the initially missed but accepted `ArchiveDefinitionBrickCommandSchema` and `ArchiveDefinitionBrickResultSchema`. The public-type list includes the matching 25 accepted types; the runtime-only error-code constant has no type counterpart.
- No probe code, process validation, checker diagnostics/rules, topology manifests, Contracts, tests, manifests, Project State, dependencies, or lockfiles changed.

## Verification or result

- Pre-repair reproduction: `pnpm check:boundaries` failed the three package-root runtime/export probes, each with normal status `1` and empty output.
- Post-repair: `pnpm check:boundaries` passed: `PASS: workspace boundaries, manifests, references, artifacts, and probes verified`.
- Runtime root comparison from the Runtime Server consumer resolution context: expected `134`, actual `134`, missing `[]`, extra `[]`.
- `git diff --check` passed.
- Review of the checker diff confirms that the new repair hunks are confined to the two exact allowlists; the pre-existing topology/type-test-list hunks are preserved unchanged.

## Context and tool integrity

Lease continuity was confirmed for `workspace-boundary-debugger-01@1`. Serena initial instructions and activation were already established under the lease; focused file reads plus local Git/Node/pnpm operations were used. No Serena memory API, onboarding, or `.serena/` access occurred. No network, installation, dependency mutation, destructive action, Git-history action, source/test/product change, or OpenSpec action occurred.

## Deviations and remaining risk

None. The prior failure was a stale exact allowlist rather than a package-root resolution defect. The preserved Contract implementation remains unmodified and the deterministic boundary reproduction now passes.
