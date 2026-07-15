# RC-compat-001 Runtime Contracts Module Reviewer Report

- role: reviewer
- result: completed
- subject commit: b81f8e3a0a747993957afd9f4cc755dc777a7a45

## Verdict

ACCEPT WITH FOLLOW-UP.

No blocking finding prevents Phase 0B Runtime Contracts acceptance. The implementation matches the accepted B.1–B.3 wire contracts and phase boundary, and the remaining findings are bounded verification/maintainability gaps for follow-up.

## Exact subject commits

- clarified pre-B.1 baseline: `a08111d`
- B.1 product/report: `c37a676`
- B.2 product/report: `a579d81`
- B.3 product/report: `20238a041a3f6cdfc0a1a7f9a0c4baaa52816027`
- B.4 product/report: `b81f8e3a0a747993957afd9f4cc755dc777a7a45`
- independent Tester evidence: `6860384071fffd2d999d42c917fde0f2ba20a75b`

`5f4d0cd` was excluded from the product subject and used only as the governing Reviewer-role policy.

## Review coverage

Reviewed the complete `a08111d..b81f8e3a0a747993957afd9f4cc755dc777a7a45` diff, including B.1 validation/identity/error behavior, B.2 recursive Brick and Package/hash behavior, B.3 Actor/Host directional schemas, B.4 consumers/fixtures/checker/docs, package manifests/lockfile, root exports, and all Phase 0B construction Tasks/Reports. Compared implementation behavior with ADR-0002, the approved design and plan, and the Tester report. No Serena memory was inspected or used.

The review specifically checked strict inert-JSON materialization, unknown-field rejection, stable error normalization, recursive copy/freeze behavior, timestamp/ID/version rules, RFC 8785/SHA-256 hash material, recursive prompt and Package invariants, Actor/Host directionality and ACK/correlation shapes, TypeBox/Ajv/TypeScript 7 integration, root-only exports, package boundaries, compatibility fixtures, checker behavior, documentation, and exclusion of persistence/transport/process/Run/Graph/Claude behavior.

## Findings

### Non-blocking

1. **Compatibility fixtures do not exercise the package-root artifact.**

   - Location: `packages/runtime-contracts/test/compatibility/compatibility.test.ts:10,25-29`; app fixtures are only type-only consumers in `apps/*/src/main.ts`.
   - Evidence: the compatibility test imports `../../src/index.js`, while the three application fixtures import the package root only for types and do not decode the serialized fixture values. The checker separately probes package-root types/runtime exports, but it does not run the fixture values through the package root for each app.
   - Consequence: the suite proves source-level schema round trips and package-root export resolution separately, but not the accepted design's stronger compatibility claim that representative JSON fixtures decode through the published root entry point used by each application. A future declaration/build/export mismatch could evade this specific check.
   - Remediation direction: add a follow-up compatibility probe/test that loads the built package root and decodes the representative fixtures through that root; keep application consumers behavior-free and type-only as required.

2. **JCS fixture coverage omits the required UTF-16 key-order case.**

   - Location: `packages/runtime-contracts/test/fixtures/rfc8785/vectors.json:1-10` and `packages/runtime-contracts/test/package/hash.test.ts:48-56,126-143`.
   - Evidence: the committed attributed fixture contains one numeric/literal Cyberphone sample, and the test adds a `-0` check. The accepted design's verification strategy calls for a curated vector set including number and UTF-16 key-order cases; the property test varies safe text and object insertion order but does not generate or assert Unicode key ordering.
   - Consequence: a regression in canonicalization of non-BMP/UTF-16-ordered object keys would not be caught by the current independent suite, despite key ordering being part of the package identity contract.
   - Remediation direction: add a small attributed RFC/Cyberphone-compatible UTF-16 key-order vector and a focused assertion, without replacing the pinned `canonicalize` wrapper or adding a handwritten canonicalizer.

3. **The boundary checker does not audit the complete generated declaration export surface.**

   - Location: `scripts/check-workspace-boundaries.mjs:70-144,546-549`; the type probes use only `ActorLaunchSpec`, `HostToServerMessage`, and `Package`.
   - Evidence: the checker compares the exact runtime key list and compiles three representative type imports, but it has no exact audit of every public derived type declared in `dist/index.d.ts`. The package test files also primarily import schemas and only a subset of derived types.
   - Consequence: omission or accidental alteration of a less frequently used public TypeBox-derived type could remain undetected while runtime exports and the representative consumer probes remain green.
   - Remediation direction: add a small generated-declaration/type-surface probe or an exhaustive root type fixture covering every accepted public type name; keep runtime exports and type exports independently checked.

### Blocking

None.

## Verification evidence

- `pnpm verify` passed at the review state: frozen install, TypeScript build/declarations, 9 Contract test files with 57 tests, explicit TypeScript 7.0.2 NodeNext test compile, boundary/export/deep-import/cross-workspace probes, clean, and Git-clean checks.
- Independently inspected the full product diff and all public source/test files; `git diff --check a08111d..b81f8e3` passed.
- Independently rebuilt and probed the emitted Runtime Contracts entrypoint for recursive unknown-field rejection, calendar-invalid timestamp rejection, accessor/cycle materialization failures, Package decoding, and the exact 73 runtime exports; generated output was removed with `pnpm clean`.
- Confirmed no product diff after B.4 changed B.1–B.3 source semantics, dependency versions, or lockfile policy; confirmed no `dist`, `node_modules`, or `.serena` path is in the product subject.

## Residual risks and later-phase exclusions

The follow-ups above are verification-strengthening items, not evidence of a currently observed valid-input contract failure. The in-process `unknown` decoder retains the approved Proxy trust caveat. Raw JSON parsing/duplicate-key handling, transport framing/authentication/retry/replay/reconnect behavior, persistence/migrations, adapter-specific configuration validation, Package publication/routing/idempotency, Delivery transitions, Run state, Graph schemas/evaluation, payload quotas/recursion policy, and compatibility negotiation beyond exact `1.0.0` remain correctly deferred to later phases.

## Clean-worktree confirmation

Before creating this report, the worktree was clean. After verification and report preparation, the only intended worktree change is this Reviewer Report; no product file was edited. The report will be committed alone.
