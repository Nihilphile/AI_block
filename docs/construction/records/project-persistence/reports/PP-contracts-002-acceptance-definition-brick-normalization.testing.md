# PP-contracts-002 Acceptance of Public Definition Brick Body Normalization Testing Report

- work: testing
- result: completed
- implementation subject: `2d8eaaf54d7a1850d2b4d627331589084f9f4151`
- orchestration baseline: `87e218c6c86e20718d6946954a4411e434f8a3c4`
- lease: `runtime-contracts-tester-03@1`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: PASS. The immutable public Definition Brick Body normalization subject is accepted; no remediation is authorized or required.

## Work and evidence

- Confirmed exact immutable subject `2d8eaaf54d7a1850d2b4d627331589084f9f4151`, exact baseline `b9d419fa913fd0535b09d3e31737480023845a5d`, clean starting worktree, and orchestration HEAD `87e218c6c86e20718d6946954a4411e434f8a3c4`.
- Confirmed `2d8eaaf..87e218c` contains only the two authorized normalization acceptance/review Task records; no product, test, configuration, dependency, checker, Project State, or OpenSpec content follows the subject.
- Inspected the normalizer/digest implementation, package-root and module exports, focused fixtures, exact checker delta, Runtime Contracts card, accepted digest evidence, prior Project acceptance finding, and Actor compatibility boundary.
- Runtime Contracts has one public `normalizeDefinitionBrickBody` implementation. `computeDefinitionBrickDigest` calls it directly; no second Definition Brick normalization implementation was introduced. Actor source is unchanged in the implementation range and continues to consume only the digest helper.
- Verified exact typed results for sys prompt text, Prompt text, and nested composite Prompt content; one-leading-BOM removal; CRLF/CR-to-LF normalization; recursive order preservation; structured backend/toolset/runtime-configuration Body preservation; and input non-mutation.
- Reproduced all six frozen digest values and raw-versus-normalized digest equivalence for system prompt, prompt text, recursive composite, backend, toolset, and runtime configuration Bodies.
- Confirmed the helper is callable through `@ai-block/runtime-contracts` from the Runtime Server consumer context. The checker subject delta adds exactly one runtime-export allowlist entry, `normalizeDefinitionBrickBody`, with no type allowlist, topology, manifest, policy, probe, diagnostic, or rule change.
- The Runtime Contracts card accurately describes public normalization/digest ownership and explicitly states that this subject does not complete Project canonical-authoring remediation, establish persistence, or add Actor resolver integration.

## Verification or result

- `pnpm --filter @ai-block/runtime-contracts exec vitest run test/project-definition-brick/definition-brick-digest.test.ts` — passed: 1 file, 7 tests.
- `pnpm --filter @ai-block/runtime-contracts run test:types` — passed.
- `pnpm --filter @ai-block/runtime-contracts test` — passed: 12 files, 91 tests, including static type coverage.
- `pnpm --filter @ai-block/runtime-contracts exec tsc -b --pretty false` — passed.
- `pnpm --filter @ai-block/runtime-server exec vitest run test/modules/actor/actor-foundation.test.ts test/modules/actor/actor-validation-compiler.test.ts test/modules/actor/actor-application.test.ts` — passed: 3 files, 24 tests.
- `pnpm --filter @ai-block/runtime-server test` — passed: 6 files, 52 tests, including Runtime Server type coverage.
- `pnpm --filter @ai-block/runtime-server run test:types` — passed.
- `pnpm build` — passed.
- `pnpm check:boundaries` — passed: workspace boundaries, manifests, references, artifacts, and probes verified.
- Independent no-file-write package-root Node probe — passed: exact normalization, non-mutation, six frozen digests, and raw/normalized equivalence.
- `git diff --check b9d419fa913fd0535b09d3e31737480023845a5d..2d8eaaf54d7a1850d2b4d627331589084f9f4151`, sole-ownership/export searches, Actor-unchanged check, checker-delta review, and authorized-path review — passed.

## Context and tool integrity

- Lease `runtime-contracts-tester-03@1`, Runtime Contracts state owner, immutable subject, baseline, and testing-only authority remained intact.
- Only deterministic local Git, PowerShell, pnpm, Vitest, TypeScript, workspace checker, source inspection, and an inline no-file-write Node probe were used. No network, install, service, database, destructive action, product/test/checker/Project State/OpenSpec change, remediation, review, delegation, or Project work occurred.

## Deviations and remaining risk

- No acceptance finding, coverage blocker, or Runtime Contracts card mismatch.
- This acceptance covers the public normalization/value boundary and current Actor compatibility only. Project authoring must consume the helper and prove canonical stored/read Bodies under its separate remediation subject; persistence and Actor resolver integration remain outside this evidence.
- Final worktree state before this Report commit: only this authorized testing Report is staged; no other tracked or untracked change is present.
