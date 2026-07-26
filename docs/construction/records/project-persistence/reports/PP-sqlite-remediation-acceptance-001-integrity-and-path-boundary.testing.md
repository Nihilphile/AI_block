# PP-sqlite-remediation-acceptance-001 Integrity and Path Boundary Evidence

- work: testing
- verdict: pass
- defective subject: `2cf9b84a87b72199ba41c610864364e93cf550c4`
- remediation subject: `38fe697c12be6ce7032334cdd10897f554117dfc`
- remediation baseline: `bed9abb17d85567016048cd40ff171bfc020779b`
- orchestration head: `f47dcdf42286876432c722745e935c8aaefa643c`
- lease: `runtime-project-sqlite-tester-01@1`

## Decision or findings

PASS. Both P1 review findings from `d0d763f` are closed by the immutable
remediation subject.

1. **Revision-to-aggregate UID integrity binding — closed.** Exact and history
   queries select the stored revision `brick_uid` and require it to equal the
   validated aggregate summary UID. Focused corruption of only a revision UID
   binding, and separately only an aggregate UID, each returns
   `definition_brick_integrity_error` without inference or repair; valid exact
   and history reads still succeed before corruption.
2. **Workspace-contained database path rejection — closed.** The factory
   canonicalizes the database path and cwd root, then applies a segment-aware,
   platform-case-aware at-or-below comparison. It rejects root and descendant
   workspace candidates without creating files, accepts disposable absolute
   paths outside that root, and does not reject a sibling-prefix path.

The candidate Project card accurately remains self-verified with independent
focused retest and re-review pending; it does not overclaim acceptance.

## Decisive evidence

- Identity and scope: `bed9abb..38fe697` changes only the two authorized
  SQLite implementation files, focused SQLite test, and Project card.
  `38fe697..f47dcdf` contains only remediation evidence/review task records
  and `_meta/current-focus.md`, with no product, test, configuration,
  dependency, or tooling change. Diff checks are clean.
- Toolchain: `node --version` returned `v24.18.0`; `pnpm --version` returned
  `11.10.0`, satisfying the committed Node and pnpm floors.
- Fresh focused test after its workspace Contract build prerequisite passed
  11/11: `pnpm --filter @ai-block/runtime-contracts exec tsc -b && pnpm
  --filter @ai-block/runtime-server exec vitest run
  test/modules/project/sqlite-persistence.test.ts`.
- Relevant regressions passed: Runtime Server 66/66, Runtime Contracts 91/91,
  ActorHost 80/80, integration 5/5, root type check, root build, workspace
  boundaries, and `pnpm clean` followed by the git-clean boundary check.
- Earlier SQLite acceptance evidence remains applicable to unchanged adapter
  behavior; this retest freshly exercised both changed boundaries and the
  surrounding Runtime Server suite.

## Coverage limits and residual risk

- `pnpm verify` was not run because it starts with `pnpm install`, outside this
  lease's no-install external-action ceiling. Every non-install verification
  stage was run explicitly.
- Actor resolver integration and Server composition remain excluded. The
  accepted synchronous SQLite/event-loop and bounded cross-process contention
  trade-offs remain unchanged; cross-process behavior is not stress-tested.
- The focused runner requires built workspace Runtime Contract artifacts before
  direct execution; the prerequisite-aware focused command and package suite
  both pass.

## Integrity

Lease continuity was confirmed for `runtime-project-sqlite-tester-01@1`.
The retest began from a clean worktree. Only this report is added by this lease;
no product, test, configuration, Project State, OpenSpec, task, or prior
evidence file was modified.
