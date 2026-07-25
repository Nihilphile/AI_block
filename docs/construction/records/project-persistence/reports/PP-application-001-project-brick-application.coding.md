# PP-application-001 Project and Definition Brick Application Coding Report

- work: coding
- result: completed
- implementation subject: same-as-report
- orchestration baseline: `ac409aba3b55c794b81fd7152267dbd038cf835b`
- lease: `runtime-project-coder-01@1`

## Decisions

- Implemented one Runtime Server Project Module with its own Project and
  Definition Brick repositories, identity/clock/digest dependencies, and one
  Unit-of-Work port.
- Kept the public application vocabulary equal to the accepted root-exported
  Runtime Contracts. Commands are strictly decoded before persistence,
  identity, or clock work begins.
- Used the sole Runtime Contracts `computeDefinitionBrickDigest` helper through
  a module dependency. No Actor implementation or competing canonicalization
  or digest algorithm was introduced.
- Kept Project-local Brick namespace ownership inside the Definition Brick
  repository. All Brick kinds share that namespace, and archive never releases
  an ID.
- Mapped explicit repository outcomes to stable Contract errors and mapped
  unexpected port/UoW failures only after rollback to `persistence_failure`.
  Stored shape, identity binding, history, and digest failures map separately
  to `definition_brick_integrity_error`.

## Work and evidence

- Added explicit Project create/read and strict Definition Brick create,
  revise, archive, aggregate read/list, complete history, and exact-revision
  application operations.
- Create produces revision 1 with Server-owned aggregate and revision
  identities. Revise enforces immutable kind and optimistic `base_revision`,
  creates a fresh revision identity even for equal canonical content, and does
  not deduplicate equal digests.
- Archive is idempotent, preserves namespace ownership and immutable history,
  prevents revise, and leaves archived exact revisions resolvable.
- Lists sort by `brick_id`; histories validate completeness and sort by
  ascending positive revision.
- Deterministic in-memory adapters clone state at UoW entry and restore Project,
  namespace, aggregate, and revision state after injected Project create,
  Brick reservation/create, revision append, and archive failures.
- Added focused tests for strict command validation, Project create/read and
  absence, Project isolation, duplicate create, kind immutability, stale revise,
  equal-content provenance, archive/idempotency/no-ID-release, deterministic
  list/history, exact archived reads, missing aggregate/revision, corruption,
  stable error mapping, and full rollback.
- Extended only the authorized checker surface: exact Project source/test
  topology plus a Project production-import policy allowing Runtime Contracts
  and same-module relative imports, with focused allow/deny regression
  evidence.
- Created only the new Project module state card. It describes the
  application/in-memory boundary and explicitly defers production persistence,
  SQLite, Server composition, external adapters, Actor resolver integration,
  and execution.
- Marked only OpenSpec tasks 3.1 through 3.5 complete.

## Verification or result

- `pnpm --filter @ai-block/runtime-server exec vitest run test/modules/project/project-application.test.ts`
  — passed: 1 file, 8 tests.
- `pnpm --filter @ai-block/runtime-server run test:types` — passed.
- `pnpm --filter @ai-block/runtime-server test` — passed: 6 files, 52 tests,
  including Runtime Server type coverage.
- `pnpm build` — passed.
- `pnpm check:boundaries` — passed: workspace boundaries, manifests,
  references, artifacts, and probes verified.
- `git diff --check ac409aba3b55c794b81fd7152267dbd038cf835b` —
  passed before the Report was written.
- Forbidden-import and digest ownership searches found no Project import of
  Actor, SQLite, transport, CLI, Host, Package, Run, or Graph implementation;
  Project consumes the sole Contracts digest helper.

## Context and tool integrity

- Lease continuity remained `runtime-project-coder-01@1` for the new Runtime
  Server Project Module. Implementation began from exact clean HEAD
  `ac409aba3b55c794b81fd7152267dbd038cf835b`.
- Used only deterministic local repository inspection, OpenSpec, Serena
  non-memory reads, TypeScript, Vitest, workspace build, boundary, Git diff, and
  scope checks. No network, install, service, database, destructive action, or
  delegation occurred.
- No Serena memory, onboarding, or `.serena/` operation was used.

## Deviations and remaining risk

- Implementation deviation: none.
- No SQLite, schema/migration, database path, manifest, tsconfig, dependency,
  lockfile, Server composition, Actor/Host, Package, Run, recovery, backup,
  Graph, external adapter, or Actor resolver integration was added.
- Production persistence and restart behavior remain deliberately deferred.
  The in-memory adapters are deterministic application evidence only.
- Independent testing and review remain required before acceptance.
- Root Project State routing, Runtime Server routing, system map, current
  focus, handoff, Runtime Contracts/Actor cards, and neighboring cards were not
  modified.
