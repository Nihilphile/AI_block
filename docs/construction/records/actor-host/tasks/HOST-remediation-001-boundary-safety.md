# HOST-remediation-001 ActorHost Boundary Safety

- owner: ActorHost
- follows: HG-review-001
- affected modules: ActorHost only; Runtime Contracts read-only
- workflow: W3 + Security Review + Independent Test at integrated remediation acceptance
- base reason: this Task changes authenticated cross-process execution behavior, concurrent initialization, and terminal backend-failure semantics on a public boundary
- product baseline: `e59e650`

## Objective

Correct the three ActorHost findings from HG-review-001 so no mismatched identity can reach backend work, every rejecting backend promise produces a deterministic terminal Host-visible outcome, and initialization is serialized around one immutable launch configuration.

## Remediation map

1. This Task owns the ActorHost identity, promise-failure, and initialization findings.
2. A later Host Gateway Task will own terminal socket notification for Gateway-side provider/envelope failures.
3. After both state owners are corrected, an independent Tester will exercise all four findings and the original walking-skeleton regression surface; the Reviewer will then perform a focused re-review.

## Scope and authority

- read scope: ActorHost source/tests, Runtime Contracts public Host schemas and error/status values, accepted ActorHost/Host Gateway Tasks and Reports, architecture invariants, and directly relevant Git history
- anticipated implementation scope after authorization: `apps/actor-host/src/backend/`, `apps/actor-host/src/server-connection/`, focused ActorHost tests, and the Task Report
- preflight write scope: none
- final Report path: `docs/construction/records/actor-host/reports/HOST-remediation-001-boundary-safety.coding.md`
- delegated discretion after authorization: internal private types/helpers and focused deterministic test organization that do not change public contracts
- tools/external actions: local repository tools and deterministic tests only; Serena non-memory LSP operations are allowed and encouraged where useful
- delegation: none

## Frozen decisions

- The authenticated `HostIdentity` held by ServerConnection is the trusted identity. Identity supplied inside a Server command is untrusted input and cannot replace or rebind it.
- Project/Actor identity mismatch must be detected before `BackendAdapter.initialize`, `BackendAdapter.start`, or other backend/configuration work.
- Receipt ACK remains receipt-only and is emitted before semantic rejection facts, consistent with the accepted protocol.
- ActorHost must remain bound to one immutable launch identity/configuration after the first accepted initialization.
- Concurrent initialization may invoke the adapter at most once for one accepted configuration. A conflicting identity/configuration must not invoke the adapter.
- Rejecting `session`, `completion`, or `stop()` promises must not be swallowed and must not leave BackendSupervisor in `running` or `stopping` indefinitely.
- Every started Invocation must yield a deterministic terminal Host-visible outcome through existing Contract surfaces, unless preflight proves a Contract gap and returns it for an explicit architecture decision.
- Runtime Contracts are frozen in this Task. Do not add or alter public error codes, statuses, schemas, or messages without a separate authorized Contract Task.
- No Runtime Server, Run, Package, Graph, persistence, reconnect, heartbeat, daemon, or real Claude behavior enters this slice.

## Preflight gate

Before editing, report:

1. exact trusted-identity flow from ServerConnection through command processing and the smallest enforcement point(s) for Initialize and Start;
2. existing HostFault/error/status values capable of representing Project/Actor mismatch, session rejection, completion rejection, and stop rejection, including any Contract gap;
3. current async lifecycle for `session`, `completion`, and `stop()` promises and how each rejection can deterministically return the supervisor to a non-running state;
4. a concrete initialization serialization design, including same-config concurrent calls, conflicting concurrent calls, opposite completion order, and Ready/fault emission behavior for both received commands;
5. expected source/test files within the anticipated scope;
6. focused RED/GREEN tests for all three review findings and relevant regression commands;
7. any public-contract, module-boundary, cancellation, or process-ownership decision that cannot be made locally;
8. Serena non-memory operations expected to help, with confirmation that memory/onboarding and `.serena/` remain prohibited;
9. READY or BLOCKED recommendation.

Do not edit until the Orchestrator returns exact `IMPLEMENTATION_AUTHORIZED`.

## Constraints and escalation

- Preserve unrelated changes and all accepted ACK/generation/sequence/create/resume semantics.
- Do not modify Runtime Contracts, Runtime Server, root integration tests/tooling, design, Runbook, prior Tasks, or prior Reports.
- No subagents, Superpowers workflow chaining, Serena memory/onboarding, or `.serena/` inspection.
- Escalate any need for a new public status/error, a change to receipt-ACK semantics, a Server-owned decision, or a path outside the final authorized write scope.

## References

- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `docs/construction/host-gateway-walking-skeleton-plan.md`
- `docs/construction/runbook/ai-block-project-profile.md`
- `docs/construction/runbook/work-guides/coding.md`
- `docs/construction/runbook/orchestration/specialized-gates.md`
- `docs/construction/runbook/policies/serena.md`
- `docs/construction/runbook/policies/superpowers.md`
- `docs/construction/records/host-gateway/reports/HG-review-001-host-walking-skeleton-boundary.reviewing.md`

## Acceptance after implementation authorization

- Mismatched Project or Actor initialization/start commands are ACKed as receipts, rejected before backend work, and surfaced through an approved stable Host fact.
- Same-config concurrent initialization deterministically initializes once; conflicting initialization cannot race or replace static Host configuration.
- Session, completion, and stop promise rejection each produce deterministic terminal observability and leave the supervisor non-running.
- Focused tests cover negative adapter-call counts, concurrent opposite completion ordering, emitted fact order, and terminal state.
- Existing ActorHost tests, relevant integration tests, boundary checks, and full repository verification pass.
- Only finally authorized paths and the coding Report are committed.

## Handoff

After implementation authorization, write the coding Report using current Runbook semantics and commit only authorized paths with a commit message supplied by the Orchestrator.
