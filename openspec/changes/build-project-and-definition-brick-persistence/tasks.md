## 1. W3 preflight and boundary freeze

- [x] 1.1 Record the exact implementation baseline, clean-worktree evidence, W3 construction map, slice order, subject identity, and Task/Report paths before product writes begin.
- [x] 1.2 Close implementation choices for the Project module source/test roots, schema/migration layout, explicit database-path input, nonzero busy timeout, same-process write serialization, and Node `>=24.15 <25` enforcement without authorizing excluded modules.
- [ ] 1.3 Verify built-in `node:sqlite` and selected options against the pinned Node/type baseline; confirm no third-party SQLite runtime dependency is required and record the Compatibility-gate evidence.

## 2. Shared Runtime Contract surface

- [x] 2.1 Add strict root-exported schemas for the minimal Project record and Project create/read commands and results.
- [x] 2.2 Add strict root-exported schemas for Definition Brick aggregate summaries and create, revise, archive, aggregate read/list, history, and exact-revision operations.
- [x] 2.3 Add stable typed Project/Definition Brick application error categories while keeping HTTP, CLI, file, SQL, and driver details outside Runtime Contracts.
- [x] 2.4 Add Contract tests for valid round trips, strict rejection, Project/Brick identity and revision constraints, immutable kind, application errors, and root-only consumer imports.

## 3. Project and Definition Brick application boundary

- [x] 3.1 Create the Runtime Server Project module with Project/Brick values, errors, repository ports, transaction port, identity/clock/digest dependencies, and application interfaces that depend inward on Runtime Contracts.
- [x] 3.2 Implement explicit Project create/read behavior without Project activation, implicit resource creation, aliasing, deletion, or workspace-root mutation.
- [x] 3.3 Implement strict Definition Brick create and immutable revision behavior with Project-local typed namespace ownership, canonical Body/digest, and no upsert or content deduplication.
- [x] 3.4 Implement optimistic revise, idempotent archive, aggregate read/list, deterministic history, exact revision read, and archived historical resolution.
- [x] 3.5 Add deterministic in-memory repository/transaction adapters and focused application tests for success, validation failure, rollback, stale revision, archive, Project isolation, equal-content provenance, and error mapping.

## 4. Versioned `node:sqlite` persistence

- [ ] 4.1 Enforce the Node `>=24.15 <25` runtime floor and add the file-backed `node:sqlite` adapter configuration with explicit absolute path, foreign keys, defensive mode, disabled extensions, safe integer behavior, and bounded lock timeout.
- [ ] 4.2 Implement schema version 1 bootstrap for the migration ledger, Projects, Definition Brick aggregates, and immutable revisions with required primary, foreign-key, uniqueness, lifecycle, revision, and integrity constraints.
- [ ] 4.3 Implement prepared repositories and explicit transaction handling for Project create/read and Brick create/revise/archive/read/list/history/exact resolution, including rollback-before-mapping for all failures.
- [ ] 4.4 Implement startup schema validation and fail-closed handling for unsupported versions, failed initialization/migration, invalid configuration, lock/constraint failures, persistence failures, and corrupt Contract/digest records.
- [ ] 4.5 Add SQLite adapter tests for clean bootstrap, close/reopen durability, prepared values, rollback, concurrent stale-base conflict, archive/history, Project isolation, lock timeout, constraints, migration failure, unsupported schema, and integrity corruption.

## 5. Actor resolver integration

- [ ] 5.1 Add an adapter compatible with the existing Actor `DefinitionBrickResolverPort` that returns exact persisted revisions or ordinary absence without changing Actor resolver semantics.
- [ ] 5.2 Add focused cross-module tests proving exact Project/ID/revision resolution, archived historical resolution, no latest-revision substitution, Snapshot provenance compatibility, and fail-closed integrity behavior.
- [ ] 5.3 Verify dependency direction and workspace boundaries: Actor and Project application code do not import SQLite details, consumers use Runtime Contracts from the package root, and no excluded Server composition or execution workflow is introduced.

## 6. Project State reconciliation

- [ ] 6.1 Once real Project module source/test ownership exists, create its single default Project State card with accurate intent, implemented behavior, boundaries, current condition, read routes, and evidence; do not create future facets.
- [ ] 6.2 Reconcile the Runtime Contracts card for the implemented shared surface and reconcile the Actor card only if its production dependency, implemented behavior, condition, or evidence route actually changes.
- [ ] 6.3 Have testing report any state-card mismatch without editing implementation claims, and have review verify every changed card against the exact committed implementation subject.

## 7. Verification, independent acceptance, and review

- [ ] 7.1 Run targeted Contract, Project module, SQLite adapter, and Actor resolver tests plus relevant build, type, workspace-boundary, clean-install, restart, and no-excluded-scope checks; record exact self-verification.
- [ ] 7.2 Commit the integrated implementation subject and perform independent testing of the full Project-create → Brick-author → restart → exact Actor-resolve path, including required failure, concurrency, integrity, and compatibility evidence.
- [ ] 7.3 Perform independent module/boundary review of Contracts, ownership, transactions, schema/migration, security configuration, synchronous-runtime bounds, error mapping, state cards, and exclusion discipline.
- [ ] 7.4 Apply only authorized bounded remediation, then run focused retest and re-review against the new exact subject until no acceptance-blocking finding remains.

## 8. Orchestrator acceptance and closeout

- [ ] 8.1 Reconcile Orchestrator-owned `project_state/README.md`, `_meta/system-map.md`, `_meta/current-focus.md`, and accepted/deferred summaries only after the implementation and evidence are accepted.
- [ ] 8.2 Record the accepted subject, evidence, residual risks, Node/SQLite compatibility policy, exact implemented/deferred scope, Project State result, and recovery limitations in a durable closeout.
- [ ] 8.3 Refresh `docs/construction/handoff/current.md` with the accepted repository subject, active Worker/lease state, administrative queue, and next undecided product boundary; keep OpenSpec archiving as a separate explicit action.
