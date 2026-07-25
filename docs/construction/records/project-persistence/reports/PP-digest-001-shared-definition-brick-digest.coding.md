# PP-digest-001 Coding Report

- work: coding
- result: completed
- implementation subject: same-as-report
- orchestration baseline: `045472b`
- lease: `runtime-contracts-coder-02@1`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested:
  - Made `computeDefinitionBrickDigest(kind, body)` the sole public and implementation owner of Definition Brick digest computation in Runtime Contracts.
  - Kept canonical material construction private and removed the Actor-local material type, builder, and digest wrapper.
  - Preserved Actor-local canonical text/JSON helpers for Template revision and configuration digests.

## Work and evidence

- Added the root-exported Runtime Contracts digest helper with one-leading-BOM removal, CRLF/CR-to-LF normalization for recursive prompt content, canonical JSON material serialization, lower-case SHA-256 output, and fail-closed handling for non-canonical JSON values.
- Added focused Contract evidence covering all six frozen digests, recursive prompt ordering, structured property ordering, one-leading-BOM behavior, and invalid JSON values.
- Rewired Actor validation and compilation to import the Contract helper directly while preserving exact revision validation, Snapshot provenance, and existing Actor behavior.
- Updated only the Runtime Contracts topology/runtime export/test-type mirrors in the workspace boundary checker.
- Reconciled the Runtime Contracts and Actor state cards without claiming Project persistence, authoring workflow, SQLite, or new resolver integration.
- Frozen digest evidence:
  - system prompt: `sha256:5c09277d759228b5bf32b7eb11c52a8e7b47c2521b731f2c53f6824056f741a1`
  - prompt text: `sha256:ae7f883a82c738788f1efa3251acaeb8470979b622034efab7bfa3204ced9a44`
  - recursive composite: `sha256:6eb137a3ec5995d0d2134071e1db949dbf092f3d223ba40ff5d27f801c578fca`
  - backend: `sha256:1ec2819267b4a20306628c672a4b8e4624471a611c6ac666e92f097d01f1cdf0`
  - toolset: `sha256:21da4a4b528ecacad92e8c368a5cbbc4392bd57cddf247af0521dae90f82c39a`
  - runtime configuration: `sha256:f5239756d71f18a498793fcf58ad9f0fbaaf77ccb5fdb4b82edde685d0492a29`

## Verification or result

- `pnpm --filter @ai-block/runtime-contracts exec vitest run test/project-definition-brick/definition-brick-digest.test.ts` — 1 file, 5 tests passed.
- `pnpm --filter @ai-block/runtime-contracts run test:types` — passed.
- `pnpm --filter @ai-block/runtime-contracts exec tsc -b --pretty false` — passed.
- `pnpm --filter @ai-block/runtime-server exec vitest run test/modules/actor/actor-foundation.test.ts test/modules/actor/actor-validation-compiler.test.ts test/modules/actor/actor-application.test.ts` — 3 files, 24 tests passed.
- `pnpm --filter @ai-block/runtime-contracts test` — 12 files, 89 tests passed, including static test-type coverage.
- `pnpm --filter @ai-block/runtime-server test` — 5 files, 44 tests passed, including Runtime Server type coverage.
- `pnpm --filter @ai-block/runtime-server run test:types` — passed.
- `pnpm build` — passed.
- `pnpm check:boundaries` — passed.
- `git diff --check`, sole-implementation search, and authorized-path scope review — passed before staging.

## Context and tool integrity

- Lease `runtime-contracts-coder-02@1` remained continuous from baseline `045472b`.
- Serena was retained for non-memory project context; ordinary local tools supplied Git, pnpm, TypeScript, Vitest, and boundary evidence. No Serena memory, onboarding, or `.serena/` operation was used.
- No OpenSpec task state was changed and no testing or review work was dispatched.

## Deviations and remaining risk

- No implementation deviation. Project persistence, authoring workflow, SQLite, and any production resolver/storage integration remain outside this Task.
