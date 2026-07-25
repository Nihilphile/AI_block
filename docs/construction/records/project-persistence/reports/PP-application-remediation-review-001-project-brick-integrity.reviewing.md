# PP-application-remediation-review-001 Project Brick Integrity Focused Re-review Evidence

- work: reviewing
- verdict: accept
- implementation subject: `0b0d0bfd3139c9a9344cf9233da2578725b55608`
- orchestration baseline: `90c6149e925dd2f9c5cc510550c291e5675707cf`
- lease: `project-boundary-reviewer-01@1`

## Decision or findings

ACCEPT. No actionable finding or blocking evidence gap remains.

1. **Closed — canonical Body ownership and equality.** The changed Project boundary validates the kind-specific Body and consumes only the root-exported Runtime Contracts `normalizeDefinitionBrickBody` helper. Create and revise therefore return and persist the normalized Body. Revision reads re-normalize the decoded stored Body and fail closed if it is not equal to its canonical form, before accepting its digest.
2. **Closed — exact-revision coherence classification.** A missing revision within the aggregate's claimed range now returns `definition_brick_integrity_error`; a requested revision beyond a valid head remains `definition_brick_revision_not_found`; and a returned revision beyond the aggregate head is rejected as an integrity error.

No correction defect was identified. The focused-retest Report's application-only/deferred persistence limitations are an acceptable consequence of the bounded subject, not a defect or evidence gap.

## Decisive evidence

- Remediation diff from `90c6149e925dd2f9c5cc510550c291e5675707cf` to `0b0d0bfd3139c9a9344cf9233da2578725b55608` is limited to the two Project implementation files, focused Project test, and directly affected Project card; `git diff --check` passes. No Contract, dependency, port, UoW, manifest, configuration, checker, OpenSpec, or root/meta Project State content changed.
- `apps/runtime-server/src/modules/project/values.ts` imports the accepted normalizer from `@ai-block/runtime-contracts`; it does not duplicate or deep-import it. `application.ts` uses the canonical result for authoring and enforces canonical stored revision Bodies before digest verification. The same revision integrity path serves history and exact-revision reads.
- Focused tests assert canonical create/revise return and persistence, recursive prompt normalization without reordering, rejection of a noncanonical stored Body whose normalized digest still matches, missing in-range history, ordinary future absence, and a returned beyond-head revision.
- Independent focused retest committed at `2fa365da3475451ce53a3ebe7b7112d562c1035e` reports PASS for both findings and records passing focused Project tests (11), Runtime Server suite/types, Runtime Contracts digest/full suite, workspace build, and boundary checks.
- The directly affected Project card accurately describes canonical authoring/read validation and exact-revision failure classification, while preserving the pending independent-review condition and deferred-scope exclusions.

## Coverage limits and residual risk

Production persistence, SQLite/schema/migrations, restart recovery, external adapters, Server composition, Actor resolver integration, and execution workflows remain intentionally deferred. No residual risk was introduced within the remediation comparison.

## Integrity

Lease continuity confirmed as `project-boundary-reviewer-01@1`. Implementation baseline is `90c6149e925dd2f9c5cc510550c291e5675707cf`; immutable implementation subject is `0b0d0bfd3139c9a9344cf9233da2578725b55608`; orchestration HEAD before this Report is `2fa365da3475451ce53a3ebe7b7112d562c1035e`. The post-subject range contains only the two authorized evidence Task files and focused-retest Report. Known user-owned dirty Runbook, Project State policy/root/authority/design, and OpenSpec paths are preserved and do not overlap this Report; only this Report is staged for the review commit.
