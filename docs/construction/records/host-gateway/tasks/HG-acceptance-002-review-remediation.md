# HG-acceptance-002 Review Remediation Evidence

- owner: ActorHost–Host Gateway milestone acceptance
- follows: HOST-remediation-001 and HG-remediation-001
- affected modules: ActorHost, Host Gateway, loopback WebSocket adapter, root integration composition
- workflow: W3 Independent Test + Security Review evidence
- base reason: the remediation changes authenticated execution, concurrency, process-failure liveness, and physical trust-boundary cleanup
- implementation subject: `865b6a8`
- review finding baseline: `e59e650`

## Objective

Independently verify that all four HG-review-001 findings are closed at the exact implementation subject and that the accepted Host walking-skeleton behavior and repository regression surface remain green.

## Scope and authority

- read scope: both remediation Tasks/Reports, HG-review-001, relevant ActorHost/Host Gateway source and tests, Runtime Contracts, root integration composition, and Git history needed to identify the exact subject
- write scope: `docs/construction/records/host-gateway/reports/HG-acceptance-002-review-remediation.testing.md`
- delegated discretion: run additional bounded read-only/focused checks needed to classify evidence for an original finding
- tools/external actions: local deterministic tests and synthetic loopback WebSocket only; no real Claude or external service
- delegation: none

## Constraints and escalation

- Treat implementation subject `865b6a8` as immutable. The later orchestration Task commit may differ only by this Task file and must be named separately in the Report.
- Do not fix product/test/configuration defects or modify prior records.
- Test observable behavior and negative side effects, not implementation style.
- No Serena memory/onboarding or `.serena/` inspection; Serena is unnecessary unless bounded navigation is needed.
- No Superpowers workflow chaining, external state, persistence/reconnect expansion, or real backend probe.
- Classify failures as product, test, environment, acceptance ambiguity, subject mismatch, or insufficient evidence.

## Required finding evidence

1. ActorHost rejects mismatched Initialize and Start identity after receipt ACK but before backend initialize/start; stable HostFault is emitted and no adapter work occurs.
2. Gateway rejects mismatched identity-bearing Initialize and Start before sequence/provider/envelope/pending/send mutation while keeping the valid connection usable.
3. Same-config concurrent initialization invokes the adapter once; conflicting concurrent initialization cannot replace configuration or invoke the adapter, including opposite completion order.
4. Session, completion, and stop promise rejection each emits exactly one terminal HostFault, no false InvocationResult, clears active invocation state, enters non-running quarantine/faulted state, and prevents later adapter start.
5. Gateway-originated provider/generated-envelope/equivalent terminal failure removes logical state and closes the physical socket exactly once; transport/core double-failure remains idempotent and an eligible fresh connection can register under existing rules.
6. Failure paths leak no bearer token, credential, or internal diagnostic over the WebSocket.

## Regression acceptance

- Focused ActorHost and Runtime Server remediation suites pass.
- Clean-state root integration passes all five accepted FakeBackend walking-skeleton scenarios.
- Runtime Contracts remain unchanged and their tests pass.
- `pnpm check:boundaries` passes.
- Full `pnpm verify` passes with current test counts and cleanup.
- Final worktree is clean except the new testing Report before commit.

## References

- `docs/construction/runbook/ai-block-project-profile.md`
- `docs/construction/runbook/work-guides/testing.md`
- `docs/construction/runbook/orchestration/evidence-and-acceptance.md`
- `docs/construction/runbook/orchestration/specialized-gates.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `docs/construction/host-gateway-walking-skeleton-plan.md`
- `docs/construction/records/host-gateway/reports/HG-review-001-host-walking-skeleton-boundary.reviewing.md`
- `docs/construction/records/actor-host/reports/HOST-remediation-001-boundary-safety.coding.md`
- `docs/construction/records/host-gateway/reports/HG-remediation-001-terminal-transport-and-command-identity.coding.md`

## Handoff

Write and commit only `docs/construction/records/host-gateway/reports/HG-acceptance-002-review-remediation.testing.md` with message `test: verify host boundary remediation`. Report exact implementation subject and orchestration baseline, explicit PASS/FAIL, disposition of each original finding, commands/counts, coverage limits, residual risk, and clean-worktree evidence.
