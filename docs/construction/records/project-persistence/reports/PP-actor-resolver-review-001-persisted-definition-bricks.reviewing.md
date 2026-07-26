# PP-actor-resolver-review-001 Project Persistence Boundary Review Evidence

- work: reviewing
- verdict: remediation-required
- implementation subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- implementation baseline: `e1812553da9ca1e64fc3fde946e39c2b768a3407`
- integrated testing evidence: `25cb066887ed0b42d85a8e899f77dbadbc8794da`
- orchestration head: `25cb066887ed0b42d85a8e899f77dbadbc8794da`
- lease: `runtime-project-actor-resolver-reviewer-01@1`

## Decision or findings

REMEDIATION_REQUIRED.

1. **P1 — malformed Project exact-read results fail open or bypass the redacted failure.**
   [`actor-definition-brick-resolver.ts:45`](../../../../../apps/runtime-server/src/modules/project/infrastructure/actor-definition-brick-resolver.ts#L45)
   assumes that every reader result is a valid discriminated Contract result.
   A reader response of `{ revision: undefined }` satisfies the `"revision" in
   result` branch at runtime and is returned as ordinary resolver absence; a
   `null` result throws the raw `TypeError` `Cannot use 'in' operator ...`
   outside the catch. Both violate the frozen rule that every unexpected result
   or exception becomes the one fixed, redacted resolver failure, rather than
   absence or a raw exception. Actor then classifies the first case as
   `ref_not_found` at [`validation.ts:321-328`](../../../../../apps/runtime-server/src/modules/actor/validation.ts#L321), so the provider's failure
   distinction is observably lost. The concrete Project service currently
   returns a valid Contract result, but this provider accepts a structural
   reader capability and its required fail-closed behavior cannot rely on
   TypeScript alone.

   Required correction: validate and discriminate the complete runtime result
   before using it, verify a success is bound to the requested Project/Brick/
   revision, and keep result processing inside the redacting failure boundary.
   Add focused tests for malformed/mismatched success and malformed error
   results, asserting the exact static resolver failure and never ordinary
   absence.

No other actionable product defect or blocking evidence gap was found within
the unchanged accepted Contract, Project application, and SQLite boundaries.

## Decisive evidence

- Identity is intact: `e181255..2da0f00` changes only the authorized Project
  resolver provider/root export/focused test/checker plus its Project-card and
  OpenSpec records. `2da0f00..25cb066` contains only the authorization tasks,
  root focus record, and independent-testing Report; it contains no product,
  test, configuration, dependency, lockfile, or tooling drift.
- The integrated-testing Report at `25cb066` records a passing frozen install,
  focused resolver test (3/3), Runtime Server (69/69), Runtime Contracts
  (91/91), ActorHost (80/80), integration (5/5), types, build, import/boundary,
  and clean checks. This review did not duplicate that suite. A minimal
  source-level probe of the immutable subject produced `undefined` for
  `{ revision: undefined }` and the raw `TypeError` for `null`, substantiating
  the finding without mutating product state.
- Runtime Contracts remain the root-exported shared value boundary: this
  subject makes no Contract change and the provider imports only its root
  types. The Project application exact-read path still decodes its command,
  preserves not-found versus integrity precedence, and verifies stored
  revision identity/body/digest before returning a successful value
  (`application.ts:265-293`); the defect is the provider's missing runtime
  result guard.
- Project ownership and dependency direction otherwise hold. The provider is
  Project infrastructure, exposes the existing structural Actor port without
  importing Actor source, SQLite, or composition, and the checker adds the
  corresponding Project-local/root-Contracts-only policy. Actor production and
  its port are unchanged; its existing resolver validation protects Snapshot
  creation after an actual resolver throw, but cannot restore the provider's
  incorrect absence classification.
- The accepted SQLite/schema/transaction/path/security boundary is unchanged
  from the accepted `38fe697` remediation subject and its `bf25b86` re-review:
  schema-v1 ledger validation, bound statements, rollback-before-mapping,
  FIFO serialization, 250 ms cross-process timeout, safe integer decoding,
  fail-closed configuration/corruption handling, deterministic close, and
  workspace-contained path rejection are not bypassed by this adapter.
- Toolchain and exclusion discipline remain intact: the accepted evidence
  records Node `v24.18.0` and pnpm `11.10.0`; the root engine remains
  `>=24.15 <25`, `@types/node` remains `24.13.3`, no third-party SQLite
  dependency is present, and manifest/lockfile, Actor production, schema,
  Server composition, ActorTemplate/Snapshot production persistence, recovery,
  transport, Package, Run, Graph, and execution are unchanged.

## Card and reconciliation disposition

- **Project card — accurate candidate content; no separate card finding.** It
  names the provider, exact/absence/failure intent, source/test roots,
  dependency direction, and deferred composition correctly for `2da0f00`.
  Its pending independent-gate wording remains the appropriate pre-Orchestrator
  acceptance condition while this review is unresolved.
- **Runtime Contracts card — unchanged and accurate.** The shared surface is
  still root-only and contains no transport, path, SQL, or driver detail; the
  resolver addition does not change that ownership.
- **Actor card — unchanged and accurate.** Actor still owns the consumer port
  and error conversion while retaining no SQLite or production persistence
  dependency; the Project-owned provider does not require an Actor-card edit.
- **Root/meta — Orchestrator-only reconciliation.** `current-focus` still
  describes the candidate as awaiting both independent gates. It must be
  reconciled only by the Orchestrator after a corrected subject has fresh
  passing acceptance and review; this Reviewer neither edits nor treats that
  deferred root/meta step as a second product-card defect.

## Coverage limits and residual risk

- This was an integration/boundary review, not a repeat of the accepted
  application/SQLite suites. The full test/build/install evidence is the
  immutable independent-testing Report above; only the two malformed-result
  probes were run locally for the concrete P1 finding.
- The accepted synchronous SQLite/event-loop cost, bounded 250 ms contention,
  absence of cross-process stress coverage, recovery automation, Server
  composition, external adapters, and execution workflows remain explicit
  residual/deferred risks. They are not changed or accepted anew by this
  review.

## Integrity

The worktree was clean at review start. The implementation subject, baseline,
testing evidence, and current orchestration head were verified separately; the
post-subject range contains only construction records. This lease changed only
this Report and did not repair product code, Project State, OpenSpec, Tasks, or
prior evidence.
