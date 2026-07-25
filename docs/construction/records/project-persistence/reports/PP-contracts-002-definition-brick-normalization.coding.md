# PP-contracts-002 Coding Report

- work: coding
- result: completed
- implementation subject: same-as-report
- orchestration baseline: `b9d419f`
- lease: `runtime-contracts-coder-02@1`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested:
  - Exported the existing `normalizeDefinitionBrickBody(body: DefinitionBrickBody): DefinitionBrickBody` function without adding a second normalization implementation.
  - Kept `kind`, canonical JSON material, and serialized canonical form outside the public normalization API.
  - Kept Actor and Project consumers unchanged; Project canonical-authoring remediation remains a separate Task.

## Work and evidence

- Promoted the existing Definition Brick Body normalizer to the Runtime Contracts package root while retaining `computeDefinitionBrickDigest` as a caller of that same function.
- Preserved one-leading-BOM removal, CRLF/CR-to-LF normalization, recursive composite traversal and ordering, structured Body values, input non-mutation, canonical digest material, and all six frozen digest values.
- Extended the existing digest test file with root-import evidence for sys prompt, Prompt text, nested composite, single-BOM, structured Body preservation, and non-mutation behavior.
- Added only `normalizeDefinitionBrickBody` to the checker Runtime Contracts runtime-export allowlist; no type allowlist, topology, manifest, policy, probe, diagnostic, or rule changed.
- Reconciled only the Runtime Contracts card to describe the public normalization and digest boundary without claiming Project remediation, persistence, or Actor resolver integration.

## Verification or result

- `pnpm --filter @ai-block/runtime-contracts exec vitest run test/project-definition-brick/definition-brick-digest.test.ts` — 1 file, 7 tests passed.
- `pnpm --filter @ai-block/runtime-contracts run test:types` — passed.
- `pnpm --filter @ai-block/runtime-contracts test` — 12 files, 91 tests passed, including static type coverage.
- `pnpm --filter @ai-block/runtime-contracts exec tsc -b --pretty false` — passed.
- `pnpm --filter @ai-block/runtime-server exec vitest run test/modules/actor/actor-foundation.test.ts test/modules/actor/actor-validation-compiler.test.ts test/modules/actor/actor-application.test.ts` — 3 files, 24 tests passed.
- `pnpm --filter @ai-block/runtime-server run test:types` — passed.
- `pnpm --filter @ai-block/runtime-server test` — 6 files, 52 tests passed, including Runtime Server type coverage.
- `pnpm build` — passed.
- `pnpm check:boundaries` — passed.
- `git diff --check`, sole-normalizer/digest search, authorized-path scope review, and excluded-scope review — passed before staging.

## Context and tool integrity

- Lease `runtime-contracts-coder-02@1` remained continuous from clean baseline `b9d419f`.
- Serena project context remained non-memory; ordinary local tools supplied Git, pnpm, TypeScript, Vitest, and boundary evidence. No Serena memory, onboarding, or `.serena/` operation was used.
- No Actor, Project, OpenSpec, routing/meta state, manifest, dependency, lockfile, type allowlist, topology, or other checker behavior was changed.

## Deviations and remaining risk

- No implementation deviation. Project must consume the new helper and enforce canonical stored/read Bodies under its separately authorized remediation Task.
