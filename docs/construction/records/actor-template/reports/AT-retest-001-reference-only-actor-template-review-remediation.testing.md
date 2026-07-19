# AT-retest-001 Reference-only ActorTemplate Review Remediation Retest

- work: testing
- result: completed
- verdict: PASS
- remediation subject: `dd9279c0efbd76f27562961f1c22961bc7dd36be`
- coding evidence baseline: `c9a0438d9f9937ddb0441db1a6f80b29158022ef`
- orchestration baseline: `79072255d57d047c287c9516a9a4448da019bd27`
- lease: `actor-template-tester-retest-01@1`

## Finding disposition and mapped evidence

### F-1 — PASS: persisted Definition Brick provenance is enforced

- `validation.ts` recomputes the canonical Definition Brick digest and rejects mismatch. Historical validation compares persisted Project, Brick ID, revision, kind, revision UID, and digest against the newly resolved revision.
- `application.ts` retains persisted resolved provenance while hydrating a historical revision and verifies the stored Template revision digest before compilation and Snapshot persistence.
- Fresh application tests rejected create/revise resolver digest corruption without Template writes; rejected equal-content/different-UID, changed-content-with-valid-new-digest, and Template revision-digest drift without Snapshot writes; and retained the accepted fresh-Snapshot behavior.
- The exact Project/ID/revision/kind/digest comparisons share the same fail-closed persisted-provenance branch inspected in source. UID drift, changed content/digest, and Template digest drift were exercised dynamically.

### F-2 — PASS: unexpected port failures are operation failures

- Runtime Contracts expose a strict redacted `actor_template.operation_failed` result branch while `schema_invalid` remains in the deterministic validation issue vocabulary.
- `application.ts` maps unexpected authoritative-validation and unit-of-work exceptions to the fixed operation error rather than `actor_template.validation_failed`.
- Fresh tests covered resolver exceptions for validate/create/historical compile, backend-validator exceptions, workspace-resolver exceptions, and write-port failures. Assertions proved the stable redacted error and no namespace reservation, Template/revision write, or Snapshot write as applicable.
- Existing malformed-candidate tests remained green and continued to return deterministic `actor_template.validation_failed`, preserving the validation/operation distinction.

### F-3 — PASS: restricted dynamic loading fails closed

- The checker classifies every dynamic `import()` or `require()` call that is not exactly one string literal as `non_literal_dynamic_import` or `non_literal_require`.
- Its in-memory regression probes cover identifiers, concatenation, template literals, optional calls, and extra arguments, alongside forbidden literal imports/require, type-only imports, export-from, import-equals, bare imports, and relative escapes. Permitted literal Contract/local forms remain accepted.
- Fresh `pnpm check:boundaries` passed, proving the checker and its self-tests accepted the current restricted roots while rejecting the probe violations.

The earlier independent acceptance evidence remains applicable: the remediation commit is limited to the reviewed Contract/Actor/tests/checker paths, introduces no Actor, Host, Package, Run, Graph, backend process, or launch behavior, and all named nearby regression suites remained green.

## Commands and results

- `pnpm --filter @ai-block/runtime-contracts exec tsc -b` — PASS; focused-test prerequisite only.
- `pnpm exec vitest run --root . packages/runtime-contracts/test/actor-template/actor-template.test.ts apps/runtime-server/test/modules/actor/actor-validation-compiler.test.ts apps/runtime-server/test/modules/actor/actor-application.test.ts` — PASS, 3 files / 39 tests.
- `pnpm check:boundaries` — PASS; workspace boundaries and probes verified.
- `pnpm build` — PASS.
- `pnpm check:types` — PASS.
- `pnpm test:contracts` — PASS, 10 files / 79 tests; contract test typecheck passed.
- `pnpm test:actor-host` — PASS, 5 files / 80 tests; test typecheck passed.
- `pnpm test:runtime-server` — PASS, 5 files / 45 tests; test typecheck passed.
- `pnpm test:integration` — PASS, 1 file / 5 tests; integration build and typecheck passed.
- `pnpm clean` — PASS.
- `pnpm check:boundaries -- --git-clean` — PASS; no nonignored tracked or untracked paths remained before report creation.

`pnpm verify` was not run because it invokes `pnpm install --frozen-lockfile`, which this lease forbids. The Task-specified proportional non-install checks were run directly. No failure required classification.

## Subject and tool integrity

The starting worktree was clean at `79072255d57d047c287c9516a9a4448da019bd27`. The range `dd9279c..c9a0438` adds only the remediation coding report, and `c9a0438..7907225` adds only the retest Task, so no `SUBJECT_MISMATCH` exists. The remediation subject changed exactly the eight authorized Contract, Actor Module, focused-test, and checker paths and was treated as immutable.

Serena was not used. No onboarding, memory API, `.serena/` access, network, install, real backend, stateful probe, delegation, or Superpowers workflow was used. Repository-owned scripts created only ignored build/test output, which `pnpm clean` removed.

## Coverage limits and residual risk

- No real persistence adapter, concurrent database transaction, backend process, Host launch, HTTP/API adapter, or stateful recovery path was authorized or exercised.
- Individual persisted Project/ID/revision/kind/digest mismatch fields were not each fault-injected as separate tests; the shared all-field comparison branch was inspected, while UID, changed content/digest, create/revise digest corruption, and Template revision-digest drift were executed.
- The boundary checker remains coupled to the pinned TypeScript scanner and will require renewed probes if that toolchain changes.

Final authorized change: this report only. Final worktree status is to be confirmed after its report-only commit.
