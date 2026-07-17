# HG-acceptance-003 Wire Diagnostic Redaction Evidence

- owner: ActorHost–Host protocol security acceptance
- follows: HOST-remediation-002
- affected modules: ActorHost wire output and root walking-skeleton integration
- workflow: W2 + Independent Test + Security Review evidence
- base reason: a bounded ActorHost behavior changed, while secret-bearing cross-process diagnostics require independent threat-oriented evidence
- implementation subject: `949e742`
- repository acceptance baseline: `d73bc90`
- orchestration baseline: resolved by the dispatch after this Task is committed
- review finding baseline: `d963b8e`

## Objective

Independently prove that initialization/backend diagnostics cannot cross the Host boundary through HostFault or launch-failure payloads, and that prior lifecycle/security remediations and the walking-skeleton regression surface remain intact.

## Scope and authority

- read scope: HOST-remediation-002 Task/Report, HG-review-002, directly affected ActorHost source/tests, Runtime Contracts error payloads, root integration scenario, and Git history
- write scope: `docs/construction/records/host-gateway/reports/HG-acceptance-003-wire-diagnostic-redaction.testing.md`
- delegated discretion: bounded read-only checks required to establish whether any alternate outbound diagnostic path remains
- tools/external actions: local deterministic tests and synthetic loopback only; no real backend or external service
- delegation: none

## Constraints

- Treat implementation subject `949e742` as immutable and repository acceptance baseline `d73bc90` as the current tooling/Runbook state.
- The dispatch must name the exact Task commit as orchestration baseline. Verify `949e742..HEAD` contains only the accepted Runbook/boundary-check migration through `d73bc90` and this Task; stop if ActorHost, Runtime Server, Runtime Contracts, integration behavior, dependency, or other product/test content changed after `949e742`.
- Do not fix product/tests/configuration or modify prior records.
- Do not rely on token-pattern redaction; verify raw diagnostics are excluded from complete serialized outbound payloads.
- No Serena memory/onboarding or `.serena/` inspection, Superpowers chaining, real Claude invocation, or deferred feature expansion.
- Classify any failure as product, test, environment, acceptance ambiguity, subject mismatch, or insufficient evidence.

## Required security evidence

- Initialization, session observation, completion observation, and stop rejection with secret-bearing messages each emit the correct stable code and fixed non-sensitive message.
- Complete serialized Host envelopes contain none of the injected token, credential, workspace path, command line, stderr, or provider markers.
- Unknown HostFault code mapping uses the fixed generic fallback rather than raw text, if the committed surface exposes a deterministic test seam.
- `backend.launch_failed` preserves its code, uses the fixed message, omits `details`, and excludes the raw backend diagnostic from the full outbound result.
- ACK ordering, exactly-one terminal fault, quarantine, no false InvocationResult, and no later adapter start remain intact.

## Regression acceptance

- Focused ActorHost tests pass with the current count.
- Clean-state root integration passes all five scenarios.
- Runtime Contracts and Runtime Server remain green and unchanged in semantics.
- `pnpm check:boundaries` and full `pnpm verify` pass with cleanup.
- Final worktree is clean except the new testing Report before commit.

## References

- `docs/construction/runbook/project/worker-lease-policy.md`
- `docs/construction/runbook/worker-guides/tester/lease.md`
- `docs/construction/runbook/worker-guides/tester/procedures/focused-retest.md`
- `docs/construction/runbook/procedures/subject-identity.md`
- `docs/construction/runbook/procedures/clean-worktree.md`
- `docs/construction/runbook/templates/report.md`
- `docs/construction/runbook/orchestration/evidence-and-acceptance.md`
- `docs/construction/runbook/orchestration/specialized-gates.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `docs/construction/records/host-gateway/reports/HG-review-002-remediation-closeout.reviewing.md`
- `docs/construction/records/actor-host/reports/HOST-remediation-002-wire-diagnostic-redaction.coding.md`

## Handoff

Write and commit only `docs/construction/records/host-gateway/reports/HG-acceptance-003-wire-diagnostic-redaction.testing.md` with message `test: verify host wire redaction`. Report the implementation subject, repository acceptance baseline, exact orchestration baseline, PASS/FAIL, each security evidence item, commands/counts, coverage limits, residual risk, and clean-worktree evidence.
