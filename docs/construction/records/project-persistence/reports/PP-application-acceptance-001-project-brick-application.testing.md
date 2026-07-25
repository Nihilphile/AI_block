# PP-application-acceptance-001 Project and Definition Brick Application Testing Report

- work: testing
- result: failed
- implementation subject: `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`
- orchestration baseline: `c8547ce3117f5d2ff79a702bac309c6296e47dda`
- lease: `runtime-project-tester-01@1`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: FAIL with one acceptance-blocking product finding and its associated test/OpenSpec/state-card evidence findings. No remediation is authorized under this lease.

## Work and evidence

- Confirmed the exact immutable subject `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`, exact baseline `ac409aba3b55c794b81fd7152267dbd038cf835b`, clean starting worktree, and orchestration HEAD `c8547ce3117f5d2ff79a702bac309c6296e47dda`.
- Confirmed `a1fb21d..c8547ce` contains only the authorized application acceptance/review Task records; no product, test, configuration, dependency, checker, OpenSpec, or Project State content follows the immutable subject.
- Independently inspected Project application source, ports, stable errors, values, deterministic in-memory adapters/tests, exact checker delta, module card, OpenSpec specification/tasks, and current Runtime invariants.
- Verified source/test evidence for explicit Project create/read and missing behavior; Project isolation and shared cross-kind namespace ownership; no-upsert create; immutable kind/revisions; optimistic conflicts; equal-content fresh revision identity; idempotent archive without ID release; deterministic list/history; archived exact reads; strict stored shape/identity/digest checks; stable error mapping; and snapshot-based rollback of Project, namespace, aggregate, and revision state.
- Verified every public Contract import is from `@ai-block/runtime-contracts`, Project uses the root-exported `computeDefinitionBrickDigest` helper, and no Actor or duplicate Definition Brick digest implementation exists in the Project module.
- Verified the checker delta is confined to the exact Project source/test topology and Project production-import policy. Its regression fixture permits Runtime Contracts and same-module relative imports and rejects both a forbidden external package and `../actor/index.js` relative escape.
- Verified only OpenSpec tasks `3.1` through `3.5` changed in the implementation range and no persistence, SQLite, Server composition, transport, CLI, Host, Package, Run, recovery, backup, Graph, dependency, manifest, or lockfile scope entered the subject.

## Verification or result

- `pnpm --filter @ai-block/runtime-server exec vitest run test/modules/project/project-application.test.ts` — passed: 1 file, 8 tests.
- `pnpm --filter @ai-block/runtime-server run test:types` — passed.
- `pnpm --filter @ai-block/runtime-server test` — passed: 6 files, 52 tests, including Runtime Server type coverage.
- `pnpm build` — passed.
- `pnpm check:boundaries` — passed: workspace boundaries, manifests, references, artifacts, and probes verified.
- `git diff --check ac409aba3b55c794b81fd7152267dbd038cf835b..a1fb21ddd44f81aec9754e1f62fb1bf22544835b` — passed.
- Import, excluded-scope, digest-ownership, checker-delta, authorized-path, and OpenSpec-checkbox searches — passed except for the classified completion mismatch below.
- Independent no-file-write production probe: creating a `sys_prompt` Body with `"\uFEFFone\r\ntwo\rthree"` returned and stored that exact non-normalized text, while the accepted canonical Body is `"one\ntwo\nthree"`.

### Classified findings

1. **Product failure — acceptance blocking: Definition Brick authoring does not return or persist the canonical Body.** `canonicalDefinitionBrickBody` only strict-decodes the kind-specific schema and returns the decoded input unchanged. `computeDefinitionBrickDigest` normalizes one leading BOM and CRLF/CR only inside private digest material, after which `newRevision` stores the unchanged decoded Body. The independent production probe reproduced this for create; revise follows the same path. The result violates the accepted strict-create requirement that authoring canonicalize and atomically persist/return the typed Body, and the canonical-content requirement that authoring use the accepted Body normalization—not only its digest. Because integrity reads recompute the digest using the same internal normalization, they accept the non-canonical stored Body rather than failing closed.
2. **Test/evidence failure — associated:** the focused equal-content test submits a BOM/CRLF create followed by a normalized revise and asserts only equal digests. It never asserts the created/revised returned Body or stored Body, so all 8 focused tests pass while missing the product failure.
3. **OpenSpec/state-card mismatch — associated:** OpenSpec task `3.3` is marked complete even though its canonical Body requirement is not implemented. The Project card broadly claims strict Definition Brick create is implemented; under the accepted specification, that claim is incomplete until returned/stored Body normalization is true. The card's persistence/composition exclusions are otherwise accurate.

## Context and tool integrity

- The new lease `runtime-project-tester-01@1`, Project Module state owner, immutable subject, and testing-only authority remained intact.
- Only deterministic local Git, PowerShell, pnpm, Vitest, TypeScript, workspace checker, source inspection, and an inline no-file-write Node production probe were used. No network, install, service, database, destructive action, product/test/checker/OpenSpec/Project State/Task change, remediation, review, delegation, or continuation into persistence occurred.

## Deviations and remaining risk

- No authority deviation. The immutable subject was not changed.
- Beyond the canonical Body finding, no additional failure was found in the tested application-only boundary. Production persistence, SQLite, restart behavior, external composition, and Actor resolver integration remain intentionally outside this subject and were not evidenced.
- Final worktree state before this Report commit: only this authorized testing Report is staged; no other tracked or untracked change is present.
