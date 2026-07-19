# AT-rereview-001 — Reference-only ActorTemplate remediation re-review

## Recommendation

**ACCEPT the ActorTemplate module.** F-1, F-2, and F-3 are CLOSED. No new actionable finding was identified in the remediation delta.

## Finding dispositions

### F-1 — CLOSED: historical compilation enforces persisted provenance

- `validation.ts` recomputes each resolved Definition Brick digest from canonical kind/body material and rejects a mismatch before accepting the revision. When historical provenance is supplied, it compares project, brick ID, revision, kind, resolved revision UID, and digest (`apps/runtime-server/src/modules/actor/validation.ts:309-352`).
- `application.ts` reconstructs provenance for every persisted exact-ref path, verifies the stored Template revision digest, and completes both checks before compiling or saving a Snapshot (`apps/runtime-server/src/modules/actor/application.ts:195-225`, `apps/runtime-server/src/modules/actor/application.ts:446-475`). `compiler.ts` also refuses a hydrated revision whose canonical digest is invalid (`apps/runtime-server/src/modules/actor/compiler.ts:98-107`).
- The committed tester evidence exercises changed UID/content/digest and Template revision-digest drift and records zero Snapshot writes for every rejected historical compile (`AT-retest-001-reference-only-actor-template-review-remediation.testing.md`, F-1).

Consequence: an exact ref can no longer be silently rebound to different persisted Brick identity/content, and a tampered historical Template revision cannot yield a new Snapshot. No further correction is required.

### F-2 — CLOSED: deterministic validation and operation failure are distinct

- Runtime Contracts define a strict public validation-result union with either a validation report or the fixed redacted `actor_template.operation_failed` error (`packages/runtime-contracts/src/actor-template/schemas.ts:440-460`).
- Deterministic schema/reference/kind findings remain validation-report outcomes. Resolver, validator, workspace, and persistence exceptions propagate to the application boundary and are mapped to the fixed operation error (`apps/runtime-server/src/modules/actor/application.ts:100-108`, `apps/runtime-server/src/modules/actor/application.ts:478-510`).
- Mutating operations use the Unit of Work and commit only a resolved success; aborts, expected domain write failures, and exceptions roll back. Validation/provenance rejection occurs before Snapshot persistence in compile (`apps/runtime-server/src/modules/actor/application.ts:367-475`, `apps/runtime-server/src/modules/actor/application.ts:501-510`).
- The committed tester evidence covers resolver/validator/workspace/write exceptions across validate, create, revise, and compile, including public-result decoding and no-partial-write assertions (`AT-retest-001-reference-only-actor-template-review-remediation.testing.md`, F-2).

Consequence: infrastructure failure is no longer misreported as user-authored schema invalidity, and failed mutations do not commit. No further correction is required.

### F-3 — CLOSED: boundary scanning fails closed on non-literal loading

- The checker tokenizes production TypeScript with the pinned TypeScript scanner, accepts only a single string literal in direct dynamic `import()`/`require()` calls, and reports all other direct forms as `non_literal_dynamic_import` or `non_literal_require` (`scripts/check-workspace-boundaries.mjs:357-443`).
- Embedded regression probes cover identifier, concatenated, template-literal, optional-call, and extra-argument bypass forms while retaining allowed literal/static imports (`scripts/check-workspace-boundaries.mjs:460-533`). The committed retest records the boundary checker passing (`AT-retest-001-reference-only-actor-template-review-remediation.testing.md`, F-3).

Consequence: the previously demonstrated computed-specifier bypass is rejected. No further correction is required.

## New findings and risk classification

- **Actionable defects:** none.
- **Evidence gaps:** none material to this focused closure. The independent tester supplied the committed non-install matrix; this re-review did not duplicate it.
- **Acceptable implementation choice:** the compact token scanner is adequate for the currently pinned TypeScript grammar and the repository's direct import/require policy.
- **Deliberately deferred product risk:** `typescript/unstable/ast` is an unstable API, so a TypeScript upgrade requires checker compatibility review and regression execution. Real persistence/concurrency behavior remains outside this reference-only, in-memory module review.

## Subject identity and evidence

- Lease: `actor-template-reviewer-rereview-01@1`
- Immutable remediation subject: `dd9279c0efbd76f27562961f1c22961bc7dd36be`
- Tester evidence baseline: `12aedb3a2d79d82d7b0c84474cf0a3adfb851702`
- Orchestration baseline: `30ba6ac58c45b901c96313ce82e53e95e493944b`
- The range `dd9279c0efbd76f27562961f1c22961bc7dd36be..30ba6ac58c45b901c96313ce82e53e95e493944b` contains only authorized task/report bookkeeping; no product, test, checker, contract, configuration, manifest, or lockfile change appears after the remediation subject.
- Evidence consulted: the authorized lease/procedures/policies, AT-rereview Task, originating review, remediation coding report, independent retest report, ActorTemplate construction spec, phase-1 invariants, and the subject's eight directly changed production/test/checker files.

## Coverage and tool integrity

- This was a remediation-only source/evidence inspection. No test matrix was rerun and no additional diagnostic was necessary.
- Read-only inspection used local Git, PowerShell, and ripgrep. Serena was not invoked; no onboarding, memories, or `.serena` mutation occurred. No network, install, real backend, stateful probe, delegation, or Superpowers workflow was used.
- The worktree was clean at review start. Closeout stages and commits only this report; the final worktree is clean after that report commit.
