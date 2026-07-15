# RC-compat-002 Runtime Contracts Review Follow-up Reviewer Report

- role: reviewer
- result: completed
- subject commit: d22410e9e386c35cdad3b3283d633102f5341151

## Verdict

PARTIALLY CLOSED.

All three original RC-compat-001 findings are closed by the remediation commit. However, the remediation introduces one bounded test-command regression: the package-local `pnpm --filter @ai-block/runtime-contracts test` command no longer runs from a clean post-`pnpm clean` state because the new package-root checks require the built `dist` artifact. The mandated root `pnpm verify` sequence still passes because it builds before testing.

## Original finding status

1. **Built package-root fixture decoding from each app consumer environment — CLOSED.**

   - `packages/runtime-contracts/test/compatibility/compatibility.test.ts` now loads six serialized fixtures and dynamically imports `@ai-block/runtime-contracts`; the source and built-root round-trip checks both pass after build.
   - `scripts/check-workspace-boundaries.mjs` runs the built package-root fixture probe inside the loop for all three app consumer environments: runtime-server, actor-host, and runtime-cli. `pnpm check:boundaries` passed.
   - The three application entrypoints were unchanged by the remediation and remain type-only, behavior-free package-root consumers. The remediation diff has no `apps/**` changes.

2. **Authoritative RFC 8785 UTF-16 key-order coverage — CLOSED.**

   - `packages/runtime-contracts/test/fixtures/rfc8785/vectors.json` now contains the RFC 8785 section 3.2.3 property-name example and its expected order; the README attributes the source.
   - `packages/runtime-contracts/test/package/hash.test.ts` asserts the exact RFC order through the pinned `canonicalize` dependency. The official source specifies the same input and order in [RFC 8785 §3.2.3](https://www.rfc-editor.org/rfc/rfc8785.html#section-3.2.3).
   - The focused hash/compatibility run passed 10/10 tests, including the UTF-16 vector assertion. No handwritten canonicalizer or public hash behavior changed.

3. **Exhaustive package-root public derived-type coverage — CLOSED.**

   - `packages/runtime-contracts/test/types/public-types.ts` imports and instantiates all 68 accepted derived type names, including `ContractDecodeResult<unknown>` and `ContractValue<unknown>`.
   - Independent read-only enumeration found 68 root `export type` names, 68 fixture names, and 68 checker names with no set differences.
   - The explicit TypeScript 7.0.2 NodeNext type compile and package-root type probes passed. No runtime export or declaration source was changed.

## Regression introduced by remediation

### Non-blocking but closure-relevant

- Location: `packages/runtime-contracts/test/compatibility/compatibility.test.ts:35` and the package `test` script in `packages/runtime-contracts/package.json`.
- Evidence: after `pnpm clean`, a direct `pnpm --filter @ai-block/runtime-contracts test` fails before the type phase because Vitest cannot resolve the package-root import `@ai-block/runtime-contracts`; the built `dist` entrypoint is absent. The same command passes after `pnpm build`, and the required root `pnpm verify` passes because its order is build, test, boundary checks, clean.
- Consequence: the package-local test command is no longer self-sufficient from a clean checkout/post-clean state, creating a developer/CI invocation-order dependency. This does not alter Runtime Contracts source, public semantics, runtime exports, or application behavior.
- Remediation direction: make the package-local test workflow establish the built-artifact precondition or keep the built-root probe in the boundary/verification path while preserving the required package-root evidence. No fix was made in this review.

## Product-scope and semantic regression check

The remediation commit changes only the authorized verification/test paths and its Coder Report. It does not modify `packages/runtime-contracts/src/**`, application source, root `package.json`, dependencies, `pnpm-lock.yaml`, prior Reports, Tasks, or designs. `packages/runtime-contracts/package.json` changes only the explicit type-test input list. The public root source exports and B.1–B.3 schema/error/hash semantics are unchanged; exact runtime export auditing remains green.

## Verification evidence

- `pnpm verify` passed: frozen install, build/declarations, 9 Runtime Contracts test files with 59 tests, explicit TypeScript 7.0.2 NodeNext type compilation, boundary/deep-import/runtime-export/built-fixture probes, cleanup, and Git-clean verification.
- Built-state targeted checks passed: compatibility/hash tests 10/10, explicit package type compilation, and `pnpm check:boundaries`.
- Independent source-set comparison found 68/68/68 matches for root derived types, exhaustive type fixture, and checker expectations.
- `git diff --check d22410e^ d22410e` passed. The remediation has no Runtime Contracts source, app source, dependency, lockfile, or root-manifest changes.

## Phase 0B acceptance disposition

The three original Reviewer findings are fully closed and no public-contract regression was introduced. Phase 0B should not be recorded as completely follow-up-free until the package-local clean-state test-command regression is dispositioned by the Controller/Coder in a separate bounded correction or explicitly accepted as an invocation-order requirement. This Reviewer performed no correction.

## Clean-worktree confirmation

Before this report, the worktree was clean. Verification cleanup left no generated or untracked product output. The only intended change is this Reviewer Report, which will be committed alone.
