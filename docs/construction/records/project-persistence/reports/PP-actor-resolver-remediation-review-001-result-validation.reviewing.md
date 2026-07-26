# PP-actor-resolver-remediation-review-001 Resolver Result Validation Re-review Evidence

- work: reviewing
- verdict: accept
- defective subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- remediation subject: `021c00504d87eaedaf6faa09e9e32a989926eb2c`
- remediation baseline: `81629c1acb986bc591d2a31a53f7641ed144377a`
- original review: `2679a77d78e2895b199b09f1665bfdbcd9c2054c`
- focused testing evidence: `f78565639e3c61b3da649f65dd0366ad8b9c096d`
- orchestration head: `f78565639e3c61b3da649f65dd0366ad8b9c096d`
- lease: `runtime-project-actor-resolver-reviewer-01@1`

## Decision or findings

ACCEPT. The sole prior P1 is **closed**. No correction-specific defect,
blocking evidence gap, subject mismatch, or Project-card mismatch remains.

The provider now treats its structural reader as a runtime trust boundary. It
strictly decodes the complete root-exported exact-read result, returns absence
only for the three complete whitelisted not-found results, verifies successful
aggregate/revision Project, Brick, kind, and requested revision binding, and
runs reader invocation plus every result operation inside the static redaction
boundary. Thus null, malformed/ambiguous result shapes, mismatched successes,
non-absence errors, and arbitrary reader throws cannot return absence or leak a
raw error.

The narrow `revision as DefinitionBrickRevision` adaptation is acceptable. The
decoder has already materialized, strictly validated, and deeply frozen the
value; the cast only bridges `ContractValue<T>`'s readonly TypeScript view to
the pre-existing mutable port type. It does not widen or replace the returned
runtime value and introduces no Runtime Contract or Actor-port change.

## Decisive evidence

- Identity and scope are exact. `81629c1..021c005` contains only the authorized
  resolver adapter, its focused test, and the Project card. Contracts, Actor,
  Project application/SQLite/schema, checker, dependencies, lockfile, and
  excluded surfaces are unchanged. `021c005..f785656` contains only
  authorization/root-focus records and the focused-testing Report; no later
  product, test, configuration, dependency, or tooling content exists.
- At [`actor-definition-brick-resolver.ts:39-64`](../../../../../apps/runtime-server/src/modules/project/infrastructure/actor-definition-brick-resolver.ts#L39),
  `decodeContract(ReadExactDefinitionBrickRevisionResultSchema, result)` rejects
  null, incomplete, extra, and malformed results before discrimination. The
  success branch binds aggregate and revision identity/kind to the request;
  the error branch is reachable only after full Contract validation and maps
  exactly `project_not_found`, `definition_brick_not_found`, and
  `definition_brick_revision_not_found` to absence. The enclosing catch emits
  only `Persisted Definition Brick resolution failed.`
- The focused test at
  [`actor-definition-brick-resolver.test.ts:198-256`](../../../../../apps/runtime-server/test/modules/project/actor-definition-brick-resolver.test.ts#L198)
  covers valid exact success; all three valid absence outcomes; null; undefined
  revision; malformed and ambiguous errors; mismatched Project, Brick, kind,
  and revision successes; and a raw reader throw. Invalid cases assert the
  exact static failure. The focused independent evidence at `f785656` passed
  4/4, with Runtime Server 70/70, Runtime Contracts 91/91, ActorHost 80/80,
  integration 5/5, type/build/boundary/import checks, and final clean checks.
- The Project card accurately records the validated structural-reader boundary
  and retains the correct remediation-candidate condition while focused
  evidence/re-review complete. No Runtime Contracts or Actor card update is
  warranted: neither public surface nor Actor production dependency changed.

## Coverage limits and residual risk

- This focused re-review did not repeat the independent suite or clean-install.
  That is an acceptable consequence of the narrow three-path remediation: the
  fresh focused/regression evidence is recorded at `f785656`, and dependency,
  lockfile, toolchain, checker, Contract, and Actor surfaces are unchanged.
- The previously accepted synchronous SQLite/event-loop cost, bounded 250 ms
  cross-process contention, lack of cross-process stress coverage, recovery
  automation, Server composition, external adapters, and execution workflows
  remain deferred residual risks, not defects introduced by this correction.

## Integrity

Semantic continuity is confirmed for `runtime-project-actor-resolver-reviewer-01@1`;
technical compaction is immaterial to the separately verified subjects above.
The worktree was clean at review start. This lease changed only this Report and
did not repair product code, reconcile state, edit OpenSpec/Tasks, or alter
prior evidence.
