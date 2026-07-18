# AT-remediation-001 Reference-only ActorTemplate Review Findings

- owner: Runtime Server Actor Module
- work: coding
- workflow: W3 review remediation
- implementation subject: `9dab4fd18dcec1fe70933f9f495696d07bb0ad4b`
- review baseline: `fbc7b30b78bc070198d19d3ae176382199155230`
- change: `build-reference-only-actor-template`

## Objective

Correct the three actionable findings in the committed module Review without expanding the reference-only ActorTemplate slice into Actor runtime, Host, Package, Run, Graph, backend launch, or persistence-adapter work.

## Pre-flight gate

Before editing, inspect the listed subject, Review report, relevant Contracts/Actor/checker code, and focused tests. Return to the Orchestrator with:

- the minimal public Contract change needed to distinguish deterministic validation failure from resolver/port operation failure;
- the exact persisted-provenance invariant and where it will be enforced for create, revise, and historical compile;
- the proposed fail-closed rule for every non-literal dynamic `import()`/`require()` form in restricted roots;
- any hidden decision, information gap, or required write-scope expansion.

Do not modify files or run the implementation phase until the Orchestrator explicitly authorizes the proposed decisions.

## Required corrections

### R-1 — Persisted Definition Brick provenance

- Historical hydration must retain the persisted resolved Project, Brick ID, revision, UID, kind, and digest rather than reducing a reference back to authored ID/revision.
- Authoritative resolution must reject a resolver result whose identity or digest differs from persisted provenance, including equal-content/different-identity and changed-content cases.
- The canonical Definition Brick digest must be recomputed and compared before accepted create, revise, and compile operations.
- Rejection must produce no ActorTemplate revision or Snapshot write.

### R-2 — Operation failure is not schema failure

- `schema_invalid` remains reserved for Contract materialization/shape failures.
- Unexpected resolver or port exceptions must use an explicit operation-level error branch consistent with the existing ActorTemplate result model; they must not appear as deterministic validation issues or `actor_template.validation_failed`.
- Public results remain redacted and stable. Resolver-throws tests must prove the non-validation outcome and absence of namespace, revision, or Snapshot writes.

### R-3 — Boundary checker fails closed

- Within restricted roots, dynamic `import()` and `require()` references that cannot be statically reduced to one string literal must be rejected.
- Regression probes must cover identifiers, concatenation, template literals, optional calls, and extra arguments, including forbidden ActorHost/Host Gateway/Run/Package targets.
- Keep the existing TypeScript 7 pinned-scanner choice unless a smaller supported traversal is demonstrably safer; do not broaden this remediation into a parser/toolchain migration.

## Authority

Read scope:

- the implementation subject and committed Review/Coder/Tester reports;
- the OpenSpec proposal, design, specification, and tasks;
- ActorTemplate Runtime Contracts, Runtime Server Actor Module, their focused tests, and the workspace boundary checker;
- directly relevant package/root manifests only when needed to understand current compilation or verification behavior.

Implementation write scope after pre-flight approval:

```text
packages/runtime-contracts/src/actor-template/
packages/runtime-contracts/test/actor-template/
apps/runtime-server/src/modules/actor/
apps/runtime-server/test/modules/actor/
scripts/check-workspace-boundaries.mjs
docs/construction/records/actor-template/reports/AT-remediation-001-reference-only-actor-template-review-findings.coding.md
```

No other product, test, Contract, configuration, dependency, lockfile, OpenSpec, Task, or construction-record edit is authorized without a scope-expansion decision from the Orchestrator.

External authority: none. No network, dependency installation, real backend invocation, stateful probe, Serena memory/onboarding, or Superpowers workflow is authorized. Serena non-memory symbol navigation/edit operations are permitted.

## Acceptance

- Focused tests reproduce all three Review findings before correction and pass afterward.
- Existing deterministic validation issue ordering and safe-detail behavior remain intact.
- Exact immutable references and compiled Snapshots preserve persisted provenance under resolver drift or corruption.
- Resolver/port failure is distinguishable from client validation failure and leaves no partial writes.
- Boundary checks reject all specified non-literal dynamic loading forms and continue accepting permitted literal imports.
- Existing ActorTemplate, Runtime Contracts, ActorHost, Runtime Server, integration, build, typecheck, and boundary verification remain green.
- No Actor, Host, Package, Run, Graph, backend process, or launchability behavior is introduced.

## Handoff

After authorization and implementation, return changed paths, commits, focused RED/GREEN evidence, repository verification, residual risks, Serena/tool integrity, and final worktree state. Commit implementation and its focused tests in coherent commits; commit the authorized coding Report last with:

```text
docs(actor): record actor template review remediation
```
