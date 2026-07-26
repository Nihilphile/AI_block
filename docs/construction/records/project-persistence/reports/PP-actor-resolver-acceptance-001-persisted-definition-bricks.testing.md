# PP-actor-resolver-acceptance-001 Persisted Definition Bricks Evidence

- work: testing
- verdict: pass
- implementation subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- orchestration baseline: `e1812553da9ca1e64fc3fde946e39c2b768a3407`
- orchestration head: `c3e46056dccd80b9dbed61c3f4ff7c436d8a5ced`
- lease: `runtime-project-actor-resolver-tester-01@1`

## Decision or findings

PASS. The immutable Project-owned provider integrates with the existing Actor
resolver port without changing Actor production source, Runtime Contracts,
SQLite schema/configuration, dependencies, or Server composition. It delegates
the exact Project/Brick/revision reference unchanged, maps only the three
specified Project not-found errors to ordinary resolver absence, and turns
integrity, persistence, and unexpected failures into the fixed redacted
resolver error. The focused cross-module test proves structural assignment to
the Actor port, revision-1 selection after revision 2 exists, Project
isolation, archived-history resolution, restart behavior, Snapshot
UID/digest provenance, and fail-closed corruption with no Snapshot created.

## Decisive evidence

- Identity and scope: `e181255..2da0f00` changes only the authorized Project
  resolver provider/root export/focused test/checker plus its Project-card and
  OpenSpec records. It contains no Actor production change, Runtime Contracts,
  schema, dependency, lockfile, toolchain, or composition change.
  `2da0f00..c3e4605` contains only the acceptance/review task records and
  current-focus orchestration record; no product, test, configuration,
  dependency, or tooling drift occurred.
- Toolchain and clean install: Node `v24.18.0` and pnpm `11.10.0` satisfy the
  pinned ranges. One authorized `pnpm install --frozen-lockfile` completed
  successfully with the frozen lockfile unchanged.
- Fresh focused evidence passed 3/3 after its Runtime Contracts build
  prerequisite: `pnpm --filter @ai-block/runtime-contracts exec tsc -b` and
  `pnpm --filter @ai-block/runtime-server exec vitest run
  test/modules/project/actor-definition-brick-resolver.test.ts`.
- Integrated regressions passed: Runtime Server 69/69, Runtime Contracts
  91/91, ActorHost 80/80, and integration 5/5. Root `pnpm check:types`,
  workspace boundary/import probes, `pnpm clean`, and
  `pnpm check:boundaries -- --git-clean` all passed. The final nonignored
  worktree was clean before this report was added.

## Coverage limits and residual risk

- `pnpm verify` was not invoked because its first stage would repeat the
  frozen-lockfile installation, exceeding this lease's single-install ceiling;
  every remaining verify stage was run explicitly after the one authorized
  install.
- This acceptance does not add Server composition, ActorTemplate/Snapshot
  persistence, recovery automation, or cross-process SQLite stress coverage.
  The accepted synchronous SQLite/event-loop and bounded contention trade-offs
  remain residual risks outside this integration slice.

## Integrity

Lease continuity is confirmed for `runtime-project-actor-resolver-tester-01@1`.
Testing began from a clean worktree, preserved the immutable product subject,
and modified only this report. No product, test, configuration, Project State,
OpenSpec, task, or prior evidence was changed by this lease.
