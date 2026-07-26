# PP-sqlite-review-001 Versioned Project SQLite Persistence Review Evidence

- work: reviewing
- verdict: remediation-required
- implementation subject: `2cf9b84a87b72199ba41c610864364e93cf550c4`
- implementation baseline: `d83b90c0386e433fcc47adeabc79215c212074f1`
- orchestration head: `df5ef461e3c7a8c3ddc665fa76fe4aef4204de7a`
- lease: `runtime-project-sqlite-reviewer-01@1`

## Decision or findings

REMEDIATION REQUIRED. Do not consume this SQLite adapter from the Actor
resolver until the following fail-closed integrity and configuration-boundary
defects are corrected and independently rechecked.

1. **[P1] Stored revision-to-aggregate UID binding is not verified.** The v1
   schema persists `definition_brick_revisions.brick_uid` as the aggregate
   binding, and inserts it from the aggregate summary
   (`migrations/v1.ts`, `persistence.ts:264-273`). However, both revision read
   queries omit that column (`persistence.ts:174-183`), and the stored-revision
   decoder therefore verifies only Project ID, Brick ID, kind, and revision
   (`values.ts:72-89`). A corrupted row with foreign keys bypassed and its
   `brick_uid` changed to a different valid-looking or nonexistent value will
   be returned as an apparently valid revision. This violates the frozen
   fail-closed identity-binding requirement and the OpenSpec corrupted-record
   requirement. Select the stored aggregate UID and require it to equal the
   validated summary UID for exact and history reads; add focused corruption
   coverage for both a changed revision UID binding and a changed aggregate UID
   binding.

2. **[P1] The factory accepts database files inside the workspace/Project
   repository.** `canonicalDatabasePath` rejects only empty, `:memory:`,
   relative, missing-parent, and non-file/directory cases
   (`configuration.ts:18-42`). It has no repository/workspace or cwd-target
   check, so the current absolute workspace path
   `F:\\AI_project\\AI_block\\project.sqlite` has an existing real parent and
   is accepted/created. The frozen configuration decision explicitly requires
   rejection of cwd/default and Project-repository-derived paths. This permits
   Server-owned state to be written into an arbitrary Project workspace,
   contrary to the durable-state ownership boundary. Preserve the exact
   `{ databasePath: string }` factory input while adding a bounded, testable
   rejection of the workspace/repository target and cover that absolute-path
   case.

## Decisive evidence

- Subject identity is intact: `d83b90c..2cf9b84` changes only the authorized
  SQLite implementation/test, Node engine floor, workspace checker, OpenSpec
  task checkboxes, and Project card. `2cf9b84..df5ef46` contains only the
  acceptance/review construction records and current-focus update; it contains
  no product, test, configuration, dependency, or tooling change.
- The candidate uses a Project-owned, prepared-statement adapter with
  `BEGIN IMMEDIATE`, rollback-before-error mapping, path-keyed FIFO
  serialization, schema-v1 validation, and bounded `250` ms SQLite timeout
  (`persistence.ts:424-452`, `configuration.ts:46-98`, `migrations/v1.ts`).
  These reviewed portions are directionally consistent with the frozen
  transaction, ownership, security, and synchronous-runtime bounds.
- The independent testing report at the current orchestration head records a
  clean 8/8 focused adapter suite and all stated regression checks passing.
  This review did not duplicate that suite. Its integrity case mutates JSON,
  canonical form, digest, kind, revision ID, and integer data, but not either
  persisted `brick_uid` binding (`sqlite-persistence.test.ts:407-460`). Its
  invalid-path case likewise omits an absolute workspace/repository target
  (`sqlite-persistence.test.ts:103-116`).
- Current local compatibility facts remain `node v24.18.0` and `pnpm 11.10.0`;
  the candidate has no whitespace errors under `git diff --check`.

## Coverage limits and residual risk

- This is an early semantic/boundary review, not a duplicate independent test
  run. The two findings are established from the immutable subject's persisted
  schema, queries, and validation path; focused remediation evidence is still
  required.
- Actor resolver integration, Server composition, transport, recovery
  automation, and cross-process stress testing remain intentionally outside
  this SQLite subject. The accepted synchronous SQLite/event-loop and 250 ms
  contention trade-off remains a residual design risk after remediation.

## Integrity

Lease continuity is confirmed for `runtime-project-sqlite-reviewer-01@1`.
The review began with a clean worktree and the candidate is immutable. The
working tree remains limited to this review report; no product, test,
configuration, Project State, OpenSpec, task, or prior-evidence file was
modified.
