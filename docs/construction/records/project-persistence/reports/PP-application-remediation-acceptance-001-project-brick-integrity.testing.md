# PP-application-remediation-acceptance-001 Project Brick Integrity Focused Retest Evidence

- work: testing
- verdict: pass
- implementation subject: `0b0d0bfd3139c9a9344cf9233da2578725b55608`
- orchestration baseline: `9c9ceb5bf382f323d8153bb6a54cff4527fb6089`
- lease: `project-boundary-tester-01@1`

## Decision or findings

PASS. Both original acceptance-blocking findings are closed on the immutable remediation subject.

1. Create and revise validate the kind-specific Body then consume the sole root-exported Runtime Contracts `normalizeDefinitionBrickBody` helper. Focused evidence proves canonical return and repository persistence for `sys_prompt`, including one leading BOM and CRLF/CR normalization, and recursive canonicalization of nested Prompt text without composite reordering. Read integrity rejects a stored noncanonical Body even when the shared digest recomputes to the stored value.
2. Exact-revision reads now classify a missing claimed-history revision as `definition_brick_integrity_error`, preserve a request beyond the valid aggregate head as ordinary `definition_brick_revision_not_found`, and reject a returned revision beyond the aggregate head as an integrity error.

The candidate Project card matches these corrections and still states that independent testing and review are pending. The accepted Contracts normalization evidence remains applicable because this subject consumes its root export without changing Contracts code, schemas, digest bytes, or dependencies.

## Decisive evidence

- Subject identity: implementation baseline `90c6149e925dd2f9c5cc510550c291e5675707cf`; immutable product subject `0b0d0bfd3139c9a9344cf9233da2578725b55608`; current orchestration HEAD `9c9ceb5bf382f323d8153bb6a54cff4527fb6089`. The post-subject range contains only the two authorized acceptance/review Task records; no product, test, configuration, dependency, tooling, or Project State content intervenes.
- Subject diff is limited to the two Project implementation files, focused Project test, and candidate Project card. It has no manifest or lockfile change, passes `git diff --check`, and Project production imports remain Runtime Contracts plus same-module relative imports. The normalizer remains root-exported by Runtime Contracts; Project neither deep-imports nor duplicates it.
- `pnpm --filter @ai-block/runtime-server exec vitest run test/modules/project/project-application.test.ts` — passed: 1 file, 11 tests.
- `pnpm --filter @ai-block/runtime-server run test:types` — passed.
- `pnpm --filter @ai-block/runtime-server test` — passed: 6 files, 55 tests, including Contract type coverage.
- `pnpm --filter @ai-block/runtime-contracts exec vitest run test/project-definition-brick/definition-brick-digest.test.ts` — passed: 1 file, 7 tests.
- `pnpm --filter @ai-block/runtime-contracts test` — passed: 12 files, 91 tests, including types.
- `pnpm build` — passed.
- `pnpm check:boundaries` — passed: workspace boundaries, manifests, references, artifacts, and probes verified.

## Coverage limits and residual risk

- This focused retest covers the bounded application-only remediation. Production persistence, SQLite/schema/migrations, restart recovery, external adapters, Server composition, Actor resolver integration, and execution workflows remain deferred and unevidenced by design.
- No new finding, bypass, or nearby regression was observed within the required Project, Runtime Server, Runtime Contracts, build, and boundary surfaces.

## Integrity

Lease `project-boundary-tester-01@1` and testing-only authority remained continuous. Known user-owned dirty Runbook, Project State policy/root/authority/design, and OpenSpec paths were preserved and do not overlap this Report. Only this declared Report is staged for the testing commit; the immutable product/test/card subject was not modified.
