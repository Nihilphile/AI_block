# AT-remediation-001 Reference-only ActorTemplate Review Findings Coding Report

- work: coding
- result: completed
- implementation subject: `9dab4fd18dcec1fe70933f9f495696d07bb0ad4b`
- review baseline: `fbc7b30b78bc070198d19d3ae176382199155230`
- orchestration baseline: `63fe1ff5c2b44e1fb5eaebc573d2ec8b0ae15dd4`
- implementation commit: `dd9279c`
- lease: `actor-template-coder-remediation-01@1`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: used the stable redacted `actor_template.operation_failed` internal result branch for unexpected resolver, validator, workspace, persistence, identity, and integrity failures; preserved `ref_not_found` for ordinary exact-reference misses; enforced canonical Definition Brick and historical Template revision digest/provenance checks; made restricted-root non-literal dynamic loading fail closed.

## Work and evidence

The review remediation covered only the authorized ActorTemplate Contract, Actor Module, focused-test, and boundary-checker paths.

- R-1: authoritative validation recomputes Definition Brick digests and compares persisted Project, Brick ID, authored revision, expected kind, resolved revision UID, and resolved digest. Historical compilation verifies the stored Template revision digest before Snapshot persistence.
- R-2: validation results now include a strict public operation-error branch. Resolver, validator, workspace, and port exceptions no longer become schema findings; application operations return the fixed redacted internal failure envelope and avoid partial writes.
- R-3: the existing TypeScript 7 scanner rejects identifier, concatenated, template-literal, optional-call, extra-argument, and otherwise non-literal `import()`/`require()` forms in restricted roots. The checks remain in-memory and use no temporary fixtures.

Changed implementation paths:

- `packages/runtime-contracts/src/actor-template/schemas.ts`
- `packages/runtime-contracts/test/actor-template/actor-template.test.ts`
- `apps/runtime-server/src/modules/actor/application.ts`
- `apps/runtime-server/src/modules/actor/compiler.ts`
- `apps/runtime-server/src/modules/actor/validation.ts`
- `apps/runtime-server/test/modules/actor/actor-application.test.ts`
- `apps/runtime-server/test/modules/actor/actor-validation-compiler.test.ts`
- `scripts/check-workspace-boundaries.mjs`

The authorized coding Report is the only remaining path in this remediation and is committed separately last.

## Verification or result

Focused RED was established before implementation:

- Contracts ActorTemplate tests: 1 of 21 failed on the missing operation-error result branch.
- Actor validation/application tests: 3 failures in 17 tests for resolver exception classification, create-time digest corruption, and historical UID drift.
- Boundary checker self-test: non-literal dynamic `import()`/`require()` forms were not yet rejected.

Focused and proportional GREEN passed:

- Contracts ActorTemplate focused tests — 21/21 passed.
- Runtime Server Actor validation/application focused tests — 18/18 passed.
- `pnpm test:contracts` — 10 files, 79 tests passed.
- `pnpm test:actor-host` — 5 files, 80 tests passed.
- `pnpm test:runtime-server` — 5 files, 45 tests passed, including test typecheck.
- `pnpm test:integration` — 1 file, 5 tests passed.
- `pnpm build` passed.
- `pnpm check:types` passed.
- `pnpm check:boundaries` passed.
- `git diff --check` passed before implementation commit.

`pnpm verify` was not run because its repository script performs a frozen-lockfile install, while this remediation explicitly forbids installation and network activity. No dependency, manifest, or lockfile change was made.

## Context and tool integrity

Lease continuity was confirmed for `actor-template-coder-remediation-01@1`; the implementation subject and orchestration baseline were preserved. Serena MCP non-memory tools were not exposed in this session, so bounded file and symbol inspection used `rg`/PowerShell instead. No Serena onboarding, memories, memory checks/writes, or `.serena` changes were used. No network, install, delegation, Speed tier, or Superpowers workflow was used. Existing commits and unrelated work were preserved.

The implementation commit staged exactly the eight authorized implementation/test/checker paths. The report is staged and committed separately as the final remediation commit.

## Deviations and remaining risk

- Deviation: `pnpm verify` remains unexecuted for the explicit install/network prohibition; its constituent non-install checks passed individually.
- The boundary checker intentionally fails closed for unclassifiable dynamic loading, using the pinned TypeScript 7 scanner and stable rule categories. Future TypeScript scanner changes may require maintenance.
- No real persistence adapter, backend process, Host launch, or external runtime behavior was exercised; those remain outside this remediation scope.

Subject identity evidence accepted from the lease: the range from `9dab4fd` to orchestration baseline `63fe1ff` contains construction records/OpenSpec bookkeeping only; prerequisite Runtime Contracts subjects `193c794` and `5b0b9a2` were not owned implementation commits.
