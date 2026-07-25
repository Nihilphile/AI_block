# PP-debug-001 Debugging Report

- work: debugging
- result: completed
- implementation subject: uncommitted PP-contracts-001 delta rooted at `cc9ee77d21718e16ac703c6d7828bf559d54f456`
- orchestration baseline: `cc9ee77d21718e16ac703c6d7828bf559d54f456`
- lease: `workspace-boundary-debugger-01@1`

## Decisions

- uncertainty found: no material product uncertainty; one record-level subject-root discrepancy was resolved below.
- implicit decisions found: yes — the exact root-export allowlists in the boundary checker must advance with an additive public Contract surface.
- decisions made or escalation requested:
  - Retain the PP-contracts-001 implementation unchanged.
  - Create a separate, tooling-owned repair Task for `scripts/check-workspace-boundaries.mjs`; this diagnosis has no repair authority.

## Work and evidence

### Subject identity and worktree

- `HEAD` is `cc9ee77d21718e16ac703c6d7828bf559d54f456` (`docs: authorize boundary probe diagnosis`).
- The dirty paths are the coherent Runtime Contracts Project/Definition Brick delta (five modified Contract source/manifest/type-test files, three new Contract source/test files, and the Runtime Contracts state-card update) plus `scripts/check-workspace-boundaries.mjs`. No unrelated dirty path was found. `git diff --check` returned success.
- The task record names `7486406` as its implementation-subject root while the dispatch accepts `cc9ee77`. `git diff --name-status 7486406..cc9ee77` contains only the added PP-debug-001 task record, with no product, test, configuration, dependency, or tooling content. The accepted uncommitted implementation subject therefore remains semantically the same; this Report uses the dispatch's `cc9ee77` identity.

### Reproduction

`pnpm check:boundaries` reproducibly exits `1` and reports exactly three failures:

- Runtime Server package-root runtime/export probe
- ActorHost package-root runtime/export probe
- Runtime CLI package-root runtime/export probe

The type-root probes and built-compatibility probes do not report failures. The checker reports `status=1` with blank stdout/stderr for each failing `root.mjs` child.

### Decisive child-process and resolution evidence

This is not a launch, signal, or module-resolution failure:

- The checker's `validateProcess` distinguishes launch errors and signals before its status/output branch. Its observed `unexpected process status or output; status=1` branch therefore establishes (by the checker's own control flow) a normal child exit rather than a launch error or signal.
- From each app directory, `import.meta.resolve("@ai-block/runtime-contracts")` resolves to `file:///F:/AI_project/AI_block/packages/runtime-contracts/dist/index.js`.
- From each app directory, a direct root-package ESM import succeeds with exit `0` and no stderr.
- The generated `root.mjs` itself executes `process.exit(1)` when the sorted root-export keys differ from its `expectedRuntimeExports` list. It deliberately emits no output in that branch, which explains the apparent empty-output failure.

The checker expects 108 runtime exports, whereas the resolved package exposes 134. It has no missing expected exports and has these 26 additional exports:

`ArchiveDefinitionBrickCommandSchema`, `ArchiveDefinitionBrickResultSchema`, `CreateDefinitionBrickCommandSchema`, `CreateDefinitionBrickResultSchema`, `CreateProjectCommandSchema`, `CreateProjectResultSchema`, `DefinitionBrickBodySchema`, `DefinitionBrickIdSchema`, `DefinitionBrickStatusSchema`, `DefinitionBrickSummarySchema`, `ListDefinitionBrickHistoryCommandSchema`, `ListDefinitionBrickHistoryResultSchema`, `ListDefinitionBricksCommandSchema`, `ListDefinitionBricksResultSchema`, `PROJECT_DEFINITION_BRICK_ERROR_CODES`, `ProjectDefinitionBrickErrorCodeSchema`, `ProjectDefinitionBrickErrorSchema`, `ProjectRecordSchema`, `ReadDefinitionBrickCommandSchema`, `ReadDefinitionBrickResultSchema`, `ReadExactDefinitionBrickRevisionCommandSchema`, `ReadExactDefinitionBrickRevisionResultSchema`, `ReadProjectCommandSchema`, `ReadProjectResultSchema`, `ReviseDefinitionBrickCommandSchema`, and `ReviseDefinitionBrickResultSchema`.

The current PP-contracts-001 checker-manifest update correctly adds the new directory/test topology and the package type-test entry. It does not update `expectedRuntimeExports`; `expectedPublicTypeExports` is likewise stale, so the currently passing type-root probe does not exercise the new public types.

## Verification or result

- `git rev-parse HEAD` -> `cc9ee77d21718e16ac703c6d7828bf559d54f456`
- `git status --short` -> only the preserved PP-contracts-001 Contract/state-card/checker paths described above
- `git diff --check` -> exit `0`
- `pnpm check:boundaries` -> exit `1`, precisely the three empty-output runtime/export probe failures
- Direct root ESM import and `import.meta.resolve` from Runtime Server, ActorHost, and Runtime CLI -> exit `0`; all resolve to the Contract package's `dist/index.js`
- Checker-list comparison from the Runtime Server resolution context -> expected `108`, actual `134`, missing `[]`, extras exactly as listed above

## Context and tool integrity

The lease ID, epoch, role, accepted subject, and write boundary were retained throughout. Serena initial instructions and project activation were used; focused Serena reads/searches and local Git/Node/pnpm reproduction supplied the evidence. No Serena memory API, onboarding, or `.serena/` access was used. No dependency installation, network action, repository cleanup, Git mutation, source/test/checker/configuration repair, staging, commit, or OpenSpec mutation occurred. The sole repository write is this authorized Report.

## Deviations and remaining risk

- Root cause: a tooling-owned stale exact-export allowlist in `scripts/check-workspace-boundaries.mjs`, exposed by the additive PP-contracts-001 public root exports. The Contract delta triggered the checker mismatch, but is not defective on the tested package-root resolution boundary.
- Smallest credible repair surface: update `expectedRuntimeExports` and the paired `expectedPublicTypeExports` in that checker to include the accepted Project/Definition Brick public root surface. No application manifest, TypeScript configuration, generated output, Contract source, or Contract test repair is indicated.
- The Contract implementation is safe to retain: all three application contexts resolve and import the package root, and the only failed child branch is the stale exact-list comparison.
- A separate repair Task is required because this Task authorizes diagnosis and the checker belongs to workspace boundary-check tooling. After that repair, rerun `pnpm check:boundaries` as the mandatory acceptance check. The PP-contracts-001 Contract suite, build, Contract type check, and Runtime Server consumer type check remain prior evidence; rerun them only if the repair Task expands beyond the two checker allowlists or the acceptance authority requires a full final sweep.
