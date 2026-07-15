# RC-compat-002 Runtime Contracts Review Follow-up

- owner: Runtime Contracts
- follows: RC-compat-001
- affected modules: Runtime Contracts; workspace boundary checker
- workflow: W2
- base reason: this Task changes bounded verification behavior and fixtures inside the accepted Runtime Contracts module without changing its public contract
- triggered gates: none; the existing compatibility surface is not changed, and module acceptance review has already identified the exact gaps
- product baseline: `2723406`

## Objective

Close the three non-blocking verification gaps recorded by the Phase 0B Reviewer so Runtime Contracts can finish module acceptance without changing B.1-B.3 public semantics.

## Governing finding

Use `docs/construction/records/runtime-contracts/reports/RC-compat-001-runtime-contracts-hardening.reviewer.md` as the authoritative finding record. The three required closures are:

1. representative compatibility fixtures decode through the built package-root artifact, while application entrypoints remain type-only and behavior-free;
2. JCS tests include an attributed UTF-16 key-order vector required by the accepted design;
3. a package-root type probe exhaustively covers every accepted public derived type instead of only representative types.

## Write scope

The Coder may modify only:

- `packages/runtime-contracts/package.json`
- `packages/runtime-contracts/test/compatibility/**`
- `packages/runtime-contracts/test/fixtures/rfc8785/**`
- `packages/runtime-contracts/test/package/hash.test.ts`
- `packages/runtime-contracts/test/types/**`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/runtime-contracts/reports/RC-compat-002-runtime-contracts-review-follow-up.coder.md`

No Runtime Contracts source file, application source file, dependency declaration, lockfile, architecture/design/ADR, earlier Task, or earlier Report may change.

## Frozen decisions

- B.1-B.3 runtime schemas, types, exports, error semantics, hashing algorithm, and canonicalization dependency remain unchanged.
- Runtime Contracts continues to expose only its package root; no deep export is added.
- All three applications remain private, type-only, behavior-free package-root consumers.
- The built-artifact probe must exercise the package root that consumers receive, not a deep or source import.
- The UTF-16 key-order fixture must be traceable to an authoritative RFC 8785 or accepted Cyberphone source. Do not invent expected canonical output. If the exact vector cannot be established from retained authoritative evidence, report the information gap before implementation.
- The exhaustive type probe covers every accepted public derived type exported from the package root. It must not require adding runtime exports or altering public names.
- No new dependency, script framework, handwritten canonicalizer, parser, or generated versioned output is authorized.
- Serena memory is prohibited. Serena may be used only as a stateless LSP/IDE tool; Git, TypeScript, and tests remain authoritative.
- `docs/construction/superpowers-temporary-authorization.md` governs role behavior. The Coder performs Task preflight and implementation only; it does not start brainstorming, rewrite the plan, dispatch subagents, request review, or perform independent review.

## Coder preflight gate

Before editing, the Coder reports:

1. the exact files it expects to change;
2. how it will run a package-root built-artifact probe without introducing application runtime behavior;
3. the authoritative source and expected ordering for the UTF-16 vector, or a precise information gap;
4. how it will derive and audit the exhaustive public type-name set without changing the public surface;
5. RED evidence planned for each of the three findings;
6. any implicit decision or scope conflict.

The Coder waits for exact `IMPLEMENTATION_AUTHORIZED` before editing.

## Acceptance

- Each of the three Reviewer findings has a focused RED then GREEN verification record.
- Representative serialized fixtures successfully decode through the built package-root artifact.
- Application entrypoints remain unchanged, type-only, and behavior-free.
- A traceable UTF-16 key-order vector fails if ordering is incorrect and passes with the pinned canonicalization path.
- An exhaustive package-root type fixture or equivalent deterministic probe names every accepted public derived type and compiles under the pinned TypeScript 7 NodeNext setup.
- Existing exact runtime export auditing, deep-import rejection, and workspace boundary probes continue to pass.
- No `packages/runtime-contracts/src/**`, dependency, or lockfile change occurs.
- `pnpm verify` passes and leaves the worktree clean apart from the authorized Coder Report before commit.
- The Coder commits only authorized paths with message `test: close runtime contracts review gaps`.

## Follow-up acceptance

After the Coder commits, the Reviewer who raised the findings performs a bounded closure check against the three findings. It does not reopen accepted architecture or start a new full review unless remediation changes public semantics or exposes a new blocking defect.
