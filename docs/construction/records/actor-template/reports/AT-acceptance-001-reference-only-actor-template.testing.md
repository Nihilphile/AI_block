# AT-acceptance-001 Reference-only ActorTemplate Acceptance Report

- work: testing
- result: completed
- verdict: PASS
- implementation subject: `9dab4fd18dcec1fe70933f9f495696d07bb0ad4b`
- orchestration baseline: `7aa9a4f2678a1ec9726c342f4b9e9b730e1e0782`
- lease: `actor-template-tester-01@1`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: none

## Work and evidence

The implementation subject was treated as immutable. The range `9dab4fd..7aa9a4f` contained only the construction implementation report and acceptance task record; no product, test, configuration, dependency, or tooling changes were present. The exact subject therefore remained valid.

Fresh committed evidence covered the OpenSpec requirements and Task acceptance bullets:

- Runtime Contracts tests assert exact immutable references, strict snake_case/schema versioning, unknown-field and missing-component rejection, empty Prompt lists, Body validation, deterministic public issue vocabulary/serialization, compatibility fixtures, and additive Package/Host contracts.
- Actor foundation tests assert authored/resolved identity, missing/cross-Project/nonmatching revision non-disclosure, canonicalization, digest material, and separate first-class `model_id` versus opaque adapter config.
- Validation/compiler tests assert Prompt ordering, composite Initial Prompt retention, kind/cardinality/duplicate-ref failures, stable path/code issue ordering, safe failure envelopes, workspace escape handling, provenance, metadata-independent configuration digest, and no current launchability claim.
- Application tests assert side-effect-free validation, Project-scoped create conflict, immutable revision history, deterministic list/history/read projections, archive behavior, stale-base and archived revise rejection, rollback at namespace reservation/create/append/archive/snapshot-save failure points, no partial writes, fresh Snapshot identity, equal execution digests, and unchanged Template persistence.
- Boundary probes assert rejection of type-only, export-from, import-equals, dynamic import, require, forbidden bare imports, and relative escapes, including Actor module isolation.
- Existing Package, Host, ActorHost, ClaudeCodeAdapter, Runtime Server, and integration behavior remained green in the repository suites.

## Verification or result

All required checks passed after the repository-owned contracts build prerequisite:

- `pnpm exec vitest run --root . packages/runtime-contracts/test/actor-template/actor-template.test.ts packages/runtime-contracts/test/brick/brick.test.ts packages/runtime-contracts/test/compatibility/compatibility.test.ts apps/runtime-server/test/modules/actor/actor-foundation.test.ts apps/runtime-server/test/modules/actor/actor-validation-compiler.test.ts apps/runtime-server/test/modules/actor/actor-application.test.ts` — PASS, 6 files, 48 tests.
- `pnpm build` — PASS.
- `pnpm check:types` — PASS.
- `pnpm check:boundaries` — PASS.
- `pnpm test:contracts` — PASS, 10 files, 79 tests; contract test types PASS.
- `pnpm test:actor-host` — PASS, 5 files, 80 tests; test types PASS.
- `pnpm test:runtime-server` — PASS, 5 files, 41 tests; test types PASS.
- `pnpm test:integration` — PASS, 1 file, 5 tests; integration build and types PASS.
- `pnpm clean` — PASS.
- `pnpm check:boundaries -- --git-clean` — PASS; reported Git worktree clean.

The first focused command, run before building `@ai-block/runtime-contracts`, failed in test discovery with three Actor suites unable to resolve the unbuilt workspace package; the three contract suites still passed (27 tests). This was classified as an environment/build-order failure. Re-running after `pnpm --filter @ai-block/runtime-contracts exec tsc -b` passed all six focused files and 48 tests. No remediation was made.

The literal `pnpm verify` was not run because its first action is `pnpm install --frozen-lockfile`, prohibited by this lease. The complete non-install verify sequence was run explicitly, including build, all test suites, integration, boundary verification, clean, final boundary/git-clean, and clean-tree checks. No network, install, real backend, stateful probe, or delegation was used.

## Context and tool integrity

Only ordinary repository reads, Git inspection, pnpm/TypeScript/Vitest/boundary commands, and the authorized report write were used. Serena was not used; no memory API, onboarding, `.serena/`, Superpowers, or external capability was used. The implementation subject remained unchanged. Only this report was added for staging.

## Deviations and remaining risk

- The literal install-bearing `pnpm verify` was constrained by the explicit no-install policy; its non-install command sequence passed.
- Coverage is limited to committed unit, contract, boundary, and walking-skeleton integration tests. No real backend, persistence implementation, HTTP/API adapter, Actor launch, or stateful recovery probe was authorized or exercised.
- ActorLaunchSpec v1 and ClaudeCodeAdapter v0.1 still do not transport first-class `model_id`; the tested snapshot preserves it and correctly stops before claiming launchability.

Final worktree state before report staging: clean. Authorized final diff: this report only.
