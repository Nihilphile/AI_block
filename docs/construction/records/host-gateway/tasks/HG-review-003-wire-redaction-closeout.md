# HG-review-003 Wire Redaction Closeout

- owner: ActorHost–Host public security boundary
- follows: HG-acceptance-003
- affected modules: ActorHost wire diagnostic mapping and root walking-skeleton launch-failure expectation
- workflow: W2 focused re-review + Security Review
- base reason: this is a bounded correction to one wire-visible security finding on an already reviewed public boundary
- implementation subject: `949e742`
- implementation comparison: `865b6a8..949e742`
- repository acceptance baseline: `d73bc90`
- independent evidence baseline: `52b1bbb`
- orchestration baseline: resolved by dispatch after this Task commit

## Objective

Determine whether HOST-remediation-002 closes the final HG-review-002 diagnostic-leakage finding without weakening stable error semantics, lifecycle truth, prior security remediations, Runtime Contracts, or phase scope; recommend final Host walking-skeleton milestone closeout.

## Scope and authority

- read scope: the implementation comparison, directly affected ActorHost source/tests and integration assertion, HG-review-002, HOST-remediation-002 Task/Report, HG-acceptance-003 evidence, Runtime Contract error shape, and relevant Git history
- write scope: `docs/construction/records/host-gateway/reports/HG-review-003-wire-redaction-closeout.reviewing.md`
- delegated discretion: bounded read-only checks needed to substantiate a concrete finding; do not re-review unchanged accepted material
- tools/external actions: local read-only repository/navigation/Git commands and minimal non-mutating checks only
- delegation: none

## Review focus

1. Initialization/session/completion/stop diagnostics cannot reach any serialized HostFault message or alternate outbound field.
2. Unknown lifecycle codes fail to a fixed generic message rather than raw diagnostic text.
3. `backend.launch_failed` retains its stable code while fixing message text and removing diagnostic details.
4. Mapping occurs at a boundary future adapters cannot bypass through currently accepted payload paths.
5. ACK ordering, exactly-one fault, quarantine, no-false-result behavior, identity binding, concurrent initialization, and Gateway terminal cleanup remain intact.
6. Runtime Contracts and cross-process schemas remain unchanged; no logger, telemetry, persistence, or new diagnostic channel was introduced.
7. Independent secret-bearing evidence is sufficient for the original finding and any residual limitation is classified.

## Constraints

- Review exact implementation subject `949e742` and comparison `865b6a8..949e742`.
- The dispatch must name the exact Task commit as orchestration baseline and verify later changes contain only the accepted Runbook/boundary-check migration, HG-acceptance-003 Task/Report, and this Task.
- Do not modify product, tests, configuration, Tasks, prior Reports, design, or Runbook policy.
- Do not duplicate the independent test campaign except for a minimal check needed to substantiate a finding.
- Preference differences and deferred recovery/Claude behavior are not findings.
- No Serena memory/onboarding, `.serena/` inspection, Superpowers chaining, external service, or real Claude invocation.

## References

- `docs/construction/runbook/project/worker-lease-policy.md`
- `docs/construction/runbook/worker-guides/reviewer/lease.md`
- `docs/construction/runbook/worker-guides/reviewer/procedures/focused-rereview.md`
- `docs/construction/runbook/procedures/subject-identity.md`
- `docs/construction/runbook/procedures/clean-worktree.md`
- `docs/construction/runbook/templates/report.md`
- `docs/construction/records/host-gateway/reports/HG-review-002-remediation-closeout.reviewing.md`
- `docs/construction/records/actor-host/reports/HOST-remediation-002-wire-diagnostic-redaction.coding.md`
- `docs/construction/records/host-gateway/reports/HG-acceptance-003-wire-diagnostic-redaction.testing.md`

## Acceptance

- The final diagnostic-leakage finding receives an explicit open/closed disposition with precise evidence.
- Any new actionable finding leads by severity; if none exists, state none.
- Security, Contract, lifecycle, prior-finding, evidence-gap, and phase-scope impact are explicit.
- Report names exact implementation/comparison/repository/evidence/orchestration subjects.
- Report gives an unambiguous milestone closeout recommendation.
- Only the reviewing Report is committed.

## Handoff

Write and commit only `docs/construction/records/host-gateway/reports/HG-review-003-wire-redaction-closeout.reviewing.md` with message `review: close host wire redaction`. Return verdict, finding disposition, any new finding, evidence sufficiency, exact subjects, Report commit, residual risk, and milestone recommendation.
