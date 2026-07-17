# HG-remediation-001 Terminal Transport and Command Identity

- owner: Runtime Server Host Gateway and its WebSocket infrastructure adapter
- follows: HOST-remediation-001
- affected modules: Runtime Server Host Gateway core and actor-host WebSocket adapter
- workflow: W3 + Security Review + Independent Test at integrated remediation acceptance
- base reason: this Task changes authenticated command routing and terminal failure propagation across the Gateway core/transport boundary
- product baseline: `4bc57ca`

## Objective

Correct the remaining HG-review-001 Gateway finding by ensuring every Gateway-terminal provider/envelope failure terminates the physical WebSocket, and add Server-side pre-send validation for identity-bearing Host commands so a command cannot be routed to a mismatched authenticated Host.

## Remediation map

1. `HOST-remediation-001` corrected ActorHost identity, promise-failure, and initialization behavior.
2. This Task corrects Gateway-side command identity defense and terminal socket propagation.
3. An independent Tester will then exercise all four original review findings and regressions, followed by focused re-review.

## Scope and authority

- read scope: Host Gateway core/ports/tests, actor-host WebSocket adapter/tests, Runtime Contracts Host command schemas, accepted milestone/remediation evidence, and directly relevant Git history
- anticipated implementation scope after authorization: `apps/runtime-server/src/modules/host-gateway/`, `apps/runtime-server/src/infrastructure/actor-host-websocket/`, their focused tests, and the Task Report
- preflight write scope: none
- final Report path: `docs/construction/records/host-gateway/reports/HG-remediation-001-terminal-transport-and-command-identity.coding.md`
- delegated discretion after authorization: private/internal transport callback shape and idempotent cleanup helpers that preserve the accepted public Host protocol
- tools/external actions: local repository tools and deterministic loopback tests only; Serena non-memory LSP operations are allowed and encouraged
- delegation: none

## Frozen decisions

- A live Gateway connection is bound to the authenticated Project/Actor/Host identity accepted at HostHello.
- Before sending an identity-bearing `InitializeActorHost` or `StartInvocation`, Gateway validates the command Project/Actor identity against the bound connection.
- A mismatched outbound command is rejected before message-ID/timestamp allocation, sequence advance, pending-ACK registration, or transport send. It does not terminate an otherwise valid Host connection.
- Commands without Project/Actor identity fields are not assigned invented identity semantics.
- ActorHost remains the defense-in-depth enforcement point implemented by `HOST-remediation-001`.
- Every terminal Gateway connection failure caused by ID/time provider failure, generated-envelope validation failure, or equivalent Gateway-side terminal condition must notify/command the transport adapter to terminate the physical socket exactly once.
- Gateway registry removal, pending state cleanup, listener cleanup, and transport termination must remain idempotent under racing socket/Gateway failures.
- After terminal cleanup, a fresh authenticated connection for the same Actor/Host identity must be able to register according to existing generation rules; no reconnect/replay reliability feature is added.
- Receipt ACK, generation/sequence, pending command ACK, and accepted protocol schemas remain unchanged.
- Runtime Contracts are frozen; no public schema/error/status change is authorized.
- No ActorHost, Run, Package, Graph, persistence, heartbeat, reconnect/outbox, daemon, remote Host, or Claude behavior enters this slice.

## Preflight gate

Before editing, report:

1. current outbound command path, bound identity source, and exact identity-bearing fields available on Initialize and Start commands;
2. smallest pre-send validation point and existing local failure type/code suitable for mismatch without Contract changes;
3. current Gateway transport port and failure direction, including why provider/generated-envelope failure cannot currently close the socket;
4. a concrete idempotent terminal-notification design covering Gateway-initiated failure, socket-initiated failure, send failure, callback failure, listener unsubscribe, and double-failure races;
5. how sequence/pending state and new-connection availability behave after each failure class;
6. expected source/test files within anticipated scope;
7. focused RED/GREEN tests for command identity mismatch and injected provider/envelope failures over core and real loopback adapter surfaces;
8. any Contract, security, reconnect-generation, or ownership decision that cannot be made locally;
9. Serena non-memory operations expected to help and confirmation that memory/onboarding and `.serena/` remain prohibited;
10. READY or BLOCKED recommendation.

Do not edit until the Orchestrator returns exact `IMPLEMENTATION_AUTHORIZED`.

## Constraints and escalation

- Preserve all unrelated changes and accepted protocol/transport behavior.
- Do not modify ActorHost, Runtime Contracts, root integration tooling/tests, design, Runbook, prior Tasks, or prior Reports.
- No subagents, Superpowers workflow chaining, Serena memory/onboarding, or `.serena/` inspection.
- Escalate any need for a public Contract change, a generation/reconnect policy change, connection termination on mere command mismatch, or a path outside the final authorized write scope.

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
- `docs/construction/records/actor-host/reports/HOST-remediation-001-boundary-safety.coding.md`

## Acceptance after implementation authorization

- Mismatched Initialize/Start command identity cannot allocate an envelope, mutate sequence/pending state, or reach transport send.
- Gateway-side provider/generated-envelope terminal failure removes the logical connection and terminates the physical socket exactly once.
- Socket/send/Gateway failure races remain idempotent and do not leak registry/listeners.
- A fresh eligible connection can register after terminal cleanup under existing generation rules.
- Focused core and real-loopback tests prove failure state, socket closure, no secret leakage, and no regression to accepted protocol behavior.
- Runtime Server tests, root integration, boundary checks, and full repository verification pass.
- Only finally authorized paths and the coding Report are committed.

## Handoff

After implementation authorization, write the coding Report using current Runbook semantics and commit only authorized paths with a commit message supplied by the Orchestrator.
