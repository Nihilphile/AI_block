# RC-test-001 Restore Clean-state Package Tests

- owner: Runtime Contracts
- follows: RC-compat-002
- affected modules: Runtime Contracts; workspace boundary checker
- workflow: W2
- base reason: this Task corrects a bounded verification-workflow regression inside Runtime Contracts while preserving the accepted public contract
- triggered gates: none
- product baseline: `9f2bbf8`

## Objective

Restore `@ai-block/runtime-contracts` package-local tests so they run from a clean post-`pnpm clean` state, without weakening the accepted built package-root fixture and exhaustive type evidence.

## Governing finding

Use `docs/construction/records/runtime-contracts/reports/RC-compat-002-runtime-contracts-review-follow-up.reviewer.md` as the authoritative regression record.

## Required verification layering

- Package-local tests are source-level and self-sufficient from a clean state; they must not require a pre-existing `dist` directory.
- Built package-root runtime fixture decoding remains in the post-build workspace boundary/acceptance probes for all three app consumer environments.
- Exhaustive package-root coverage of all 68 accepted public derived types remains in a deterministic post-build probe.
- Do not solve the regression by adding an unconditional redundant build to every package-local test invocation unless the Controller explicitly revises this decision.

## Write scope

The Coder may modify only:

- `packages/runtime-contracts/package.json`
- `packages/runtime-contracts/test/compatibility/compatibility.test.ts`
- `packages/runtime-contracts/test/types/public-types.ts`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/runtime-contracts/reports/RC-test-001-clean-state-package-test.coder.md`

No Runtime Contracts source, fixture data, application source, dependency, lockfile, design, ADR, prior Task, or prior Report may change.

## Frozen decisions

- Do not alter B.1-B.3 schemas, types, exports, errors, hashing, or canonicalization.
- Keep the shared compatibility fixture data and RFC 8785 vector unchanged.
- Keep applications type-only and behavior-free.
- The built package-root and exhaustive public-type checks must still fail if the built root omits or misdeclares an accepted export.
- Serena memory and `.serena/` inspection are prohibited; non-memory Serena LSP/IDE use is allowed.
- `docs/construction/superpowers-temporary-authorization.md` applies. Do not start an independent brainstorm, plan, review, or subagent workflow.

## Coder preflight gate

Before editing, report:

1. the exact expected changed files;
2. which current clean-state failures occur after Vitest and whether both runtime-root and type-root checks depend on `dist`;
3. how source-level package tests and post-build package-root probes will be separated;
4. how the 68-name exhaustive type audit remains authoritative after the separation;
5. focused RED/GREEN and final verification commands;
6. any scope conflict or missing decision.

Wait for exact `IMPLEMENTATION_AUTHORIZED` before editing.

## Acceptance

- From a clean generated state, `pnpm --filter @ai-block/runtime-contracts test` passes without a pre-existing `dist` directory.
- The package-local test command does not create a persistent `dist` precondition as a side effect.
- After build, all three app consumer environments still decode representative fixtures through `@ai-block/runtime-contracts` package-root exports.
- The exhaustive post-build probe still covers exactly all 68 accepted public derived types.
- `pnpm verify` passes, including runtime export, deep-import, cross-workspace, clean, and Git-clean checks.
- No public source, app source, fixture data, dependency, or lockfile change occurs.
- The Coder commits only authorized paths with message `test: restore clean runtime contracts tests`.

## Closure check

The Reviewer performs one bounded check of this regression only. No full module review or independent Tester is required unless the correction changes public semantics or reveals a new product defect.
