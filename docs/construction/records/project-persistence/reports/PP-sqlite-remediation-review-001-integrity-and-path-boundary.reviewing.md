# PP-sqlite-remediation-review-001 SQLite Integrity and Path Boundary Review Evidence

- work: reviewing
- verdict: accept
- defective subject: `2cf9b84a87b72199ba41c610864364e93cf550c4`
- remediation subject: `38fe697c12be6ce7032334cdd10897f554117dfc`
- remediation baseline: `bed9abb17d85567016048cd40ff171bfc020779b`
- orchestration head: `4c0c5d9b9ebbd9d60036bcc6d302771cfb9d7cac`
- lease: `runtime-project-sqlite-reviewer-01@1`

## Decision or findings

ACCEPT. The focused remediation closes both prior P1 findings, and this
re-review found no correction-specific defect or candidate-card mismatch.

1. **Revision-to-aggregate UID integrity binding — closed.** Both revision
   queries now select `brick_uid` (`persistence.ts:179-190`), and row decoding
   requires it to equal the summary UID before a Contract value can reach the
   application layer (`persistence.ts:84-102`). Exact and history paths obtain
   the aggregate UID and apply the same comparison (`persistence.ts:304-333`),
   so a mismatch becomes the existing fail-closed Project integrity result.
   Focused tests independently corrupt only the revision binding and only the
   aggregate binding, then prove exact and history reads return
   `definition_brick_integrity_error` (`sqlite-persistence.test.ts:516-580`).

2. **Workspace-contained database path rejection — closed.** Configuration
   canonicalizes the database target and the real cwd/workspace root, then
   uses `path.relative` with segment-aware, Windows case-aware handling to
   reject only paths equal to or below that root
   (`configuration.ts:18-30`, `configuration.ts:46-64`). The focused test
   proves root and descendant candidates are rejected without creating files,
   while a sibling-prefix path remains usable
   (`sqlite-persistence.test.ts:160-210`).

## Decisive evidence

- Subject identity is intact. The authorized remediation commit changes only
  `configuration.ts`, `persistence.ts`, the focused SQLite test, and the
  Project card relative to `bed9abb`; schema v1/DDL, APIs, dependencies,
  engine/checker, and excluded modules are unchanged. The
  `38fe697..4c0c5d9` range contains only the focused-testing report/task and
  current-focus record; it contains no product, test, configuration,
  dependency, or tooling change.
- The Project card accurately describes both corrections and continues to mark
  the remediation candidate as self-verified with independent focused retest
  and re-review pending at the subject (`project_state/apps/runtime-server/modules/project/README.md:53-57,81-87`).
- Independent focused evidence at `4c0c5d9` records the prerequisite-aware
  SQLite suite passing 11/11, plus Runtime Server 66/66, Runtime Contracts
  91/91, ActorHost 80/80, integration 5/5, type/build/boundary checks, and
  clean diff checks. This re-review did not duplicate the independent suite.
- Current local toolchain facts remain `node v24.18.0` and `pnpm 11.10.0`;
  both the remediation delta and the review starting worktree are clean.

## Coverage limits and residual risk

- This was a focused re-review of the two remediated P1 findings and their
  direct behavior, not a repeat of unchanged persistence acceptance. The
  Tester did not run `pnpm verify` because its install step exceeds the lease;
  every non-install verification stage was run explicitly, so this is an
  acceptable stated limitation rather than a blocking evidence gap.
- Actor resolver integration, Server composition, recovery automation, and
  cross-process stress testing remain excluded. The accepted synchronous
  SQLite/event-loop and bounded 250 ms contention trade-offs remain residual
  design risks.

## Integrity

Semantic continuity is confirmed for `runtime-project-sqlite-reviewer-01@1`.
The prior review evidence is `d0d763f`; the defective, remediation, focused
test, and current-head identities above were separately verified. The
worktree began clean and is limited to this review report; no product, test,
configuration, Project State, OpenSpec, task, or prior-evidence file was
modified by this lease.
