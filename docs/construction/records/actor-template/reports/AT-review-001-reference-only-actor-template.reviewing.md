# AT-review-001 Reference-only ActorTemplate Module Review

- work: reviewing
- result: completed
- implementation subject: `9dab4fd18dcec1fe70933f9f495696d07bb0ad4b`
- evidence baseline: `65c4cf095c1dde06d5be71c91065b99076e06279`
- orchestration baseline: `8eff4af8bc05471419f4663b523ca2579b2f4bec`
- lease: `actor-template-reviewer-01@1`

## Recommendation

Remediation required before module acceptance. Three actionable findings remain: historical snapshot hydration does not enforce persisted Brick provenance, unexpected resolver failures are reported as client schema failures, and the boundary checker accepts non-literal dynamic module references. The accepted archive/CAS/UoW behavior, side-effect scope, model separation, and current deferred launch boundary are otherwise consistent with the design.

## Findings

### F-1 — High: historical compilation discards persisted Brick identity and digest

- Evidence: `application.ts:167-189` reconstructs a stored revision from authored `id + revision` references and drops each stored `resolved.uid/digest`. `application.ts:409-427` then re-resolves those references. `values.ts:43-61` checks only Project, Brick ID, and numeric revision; it does not compare a stored UID/digest or recompute the Definition Brick digest. `compiler.ts:187-203` records the newly resolved identity/content in the snapshot. `computeDefinitionBrickDigest` exists at `values.ts:183-187` but is not used by authoritative validation.
- Consequence: if a resolver/storage adapter returns changed content, a different revision UID, or a stale digest for the same human-readable exact ref, compiling an old ActorTemplate revision can silently produce a different snapshot and configuration digest. This breaks reproducibility and makes the persisted Template provenance diverge from the snapshot; equal execution content must not permit cross-provenance entity reuse.
- Required correction: retain the persisted resolved UID/digest through historical hydration and require the resolver result to match them, or resolve by the persisted UID. Validate the complete revision and recompute/compare its canonical Definition Brick digest before create, revise, and compile. Add a test with equal-content/different-identity and changed-content responses from the resolver, asserting rejection and no snapshot write.

### F-2 — High: resolver/port failures are mapped to `schema_invalid`

- Evidence: `application.ts:138-145` creates a validation report containing `schema_invalid` at `/`; `application.ts:436-441` catches every exception from authoritative validation and returns that report. The unguarded resolver call is at `validation.ts:295-306`, so a resolver outage or unexpected port exception follows the same path as malformed client input. The public `validate` method at `application.ts:283-285` has no separate operation-error channel.
- Consequence: infrastructure or adapter failures are exposed as `actor_template.validation_failed`, causing clients to “fix” valid manifests and preventing reliable distinction between schema rejection and unavailable/internal failure. This violates the design’s separation of deterministic validation issues from operation-level errors and weakens safe public result semantics.
- Required correction: reserve `schema_invalid` for contract materialization/shape failures. Propagate a typed internal/unavailable outcome from resolver and other port failures to the operation-level error path (or add an explicit error branch to validation), while retaining redacted deterministic mapping for actual validator findings. Add a resolver-throws check that proves no ID/template/snapshot write and a non-validation error result.

### F-3 — Medium: boundary checker has literal-only bypasses

- Evidence: `scripts/check-workspace-boundaries.mjs:357-397` token-scans only string literals; its dynamic-import and `require` branches require an immediate literal and closing parenthesis. The regression probes at `scripts/check-workspace-boundaries.mjs:470-482` cover only literal forms. The coding report explicitly records that computed/non-literal specifiers are outside scope at `AT-module-001-reference-only-actor-template.coding.md:49`.
- Consequence: code such as `import("@ai-block/" + name)`, `import(specifier)`, `require(packageName)`, or equivalent optional/extra-argument forms can introduce a forbidden Actor/Contracts dependency while `pnpm check:boundaries` passes. This leaves the module-isolation invariant dependent on reviewer awareness rather than the claimed checker gate.
- Required correction: either reject all non-literal dynamic/require module references in restricted roots or use a supported AST traversal that classifies every import form and fails closed when the specifier cannot be checked. Add probes for concatenation, template literals, identifiers, optional calls, and extra arguments, including forbidden ActorHost/Host Gateway/Run/Package paths.

## Classification of remaining review points

### Evidence gaps and limits

- No concrete persistence, namespace, workspace, resolver, validator, HTTP, or API adapters exist in this slice. The in-memory adapter verifies rollback by state cloning (`in-memory-adapters.ts:250-266`) and read-time archive projection (`:189-204`), but it does not establish database isolation or concurrent transaction behavior.
- The committed acceptance matrix was not duplicated. I reviewed its focused tests and reports; no real backend, stateful recovery probe, Actor launch, Package routing, Run, Graph, or Claude process was exercised under this lease.
- Repository-port scope assumptions are not independently tested for cross-project/mismatched `ActorTemplateRevisionView` data; such data should be rejected at the application boundary rather than trusted silently.

### Acceptable implementation choices

- Archive status is projected at read time while revision content remains immutable; the test adapter returns historical views with the current archive status without mutating stored revisions.
- Namespace reservation, revision CAS, append/archive, and snapshot save are all inside the UoW callback, and expected-domain aborts throw so the UoW can roll back. Create is not an upsert.
- Snapshots receive fresh identity even when configuration digests are equal. `model_id` remains first-class in the snapshot and is not injected into opaque adapter config.
- ActorTemplate operations expose only namespace, Brick resolution, validator, workspace, Template, and snapshot ports. No Actor, Host, Run, Package, Delivery, Graph, backend process, or launch side effect is reachable from the reviewed module.

### Deliberately deferred product risk

- ActorLaunchSpec v1 and ClaudeCodeAdapter v0.1 still cannot transport first-class `model_id`; preserving it and stopping before launchability is correct for this change.
- Initial Prompt retention stops before InvocationComposer/session creation. Public Brick authoring, persistence implementation, Actor lifecycle, Package migration, delegation, Graph, and recovery remain outside scope.
- `typescript/unstable/ast` is used by the checker at `scripts/check-workspace-boundaries.mjs:14`, with the toolchain pinned to TypeScript `7.0.2` by the committed manifests. This is a maintainability/upgrade compatibility risk, not a separate defect in the pinned subject; an upgrade must include scanner compatibility probes or a stable parser migration. The application error type also uses `not_found` while the existing wire error contract uses `not-found`; there is no current HTTP/API adapter, so this remains deferred compatibility work rather than a current wire defect.

## Work and evidence consulted

- Lease policies: worker lease policy, reviewer lease, Serena safety, and Superpowers boundary.
- Review procedure: module review, subject identity, clean worktree, Serena operations, and report template.
- Task/design: `AT-review-001-reference-only-actor-template.md`, Phase 1 architecture invariants, OpenSpec proposal/design/spec/tasks.
- Evidence: committed coder and tester reports, Runtime Contracts ActorTemplate schemas/tests, Actor Module `values.ts`, `ports.ts`, `validation.ts`, `compiler.ts`, `application.ts`, Actor foundation/validation/application tests, in-memory adapters, the boundary checker, and directly relevant package/root manifests.

## Subject identity and tool integrity

- `9dab4fd18dcec1fe70933f9f495696d07bb0ad4b` was treated as immutable. The range `9dab4fd..8eff4af` contains only construction reports/task records, review authorization, and OpenSpec task bookkeeping; no product, test, configuration, dependency, or tooling content changed after the subject. No `SUBJECT_MISMATCH` condition was found.
- Serena was not used. No memory API, onboarding, `.serena` access, network, install, real backend, stateful probe, delegation, Superpowers, or external capability was used.
- Checks performed: Git subject/range inspection, tracked/untracked status inspection, and `git diff --check`; the committed independent test matrix was not rerun.

## Final worktree state

Before this report was written, the worktree was clean. The only authorized change in this review is this report; it must be the only staged path and the only commit content.
