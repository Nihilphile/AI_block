# HG-acceptance-001 Host Walking-Skeleton Retest

- owner: Host Gateway walking-skeleton acceptance
- follows: HG-boundary-001
- affected modules: ActorHost, Host Gateway, root integration composition, acceptance tooling
- workflow: W3 integrated Independent Test
- base reason: the public Server–Host boundary requires independent integrated evidence after remediation of the prior acceptance findings
- product baseline: `dd2c6c1`

## Objective

Independently determine whether both prior acceptance findings are closed and whether the complete Host Gateway/FakeBackend walking-skeleton milestone passes at the exact committed subject.

## Scope and authority

- read scope: accepted Host walking-skeleton design, Tasks/Reports, relevant product and integration surfaces, root tooling, Git history, and generated verification evidence
- write scope: `docs/construction/records/host-gateway/reports/HG-acceptance-001-host-walking-skeleton-retest.testing.md`
- delegated discretion: select additional read-only focused checks when needed to classify an observed failure
- tools/external actions: local deterministic install/build/test/type/boundary/Git commands only; loopback integration with synthetic credentials is authorized
- delegation: none

## Constraints and escalation

- Test exact subject `dd2c6c1`; stop on subject mismatch or a dirty starting worktree.
- Treat subject product, test, configuration, policy, and tooling files as immutable.
- Do not fix failures or modify existing Tasks/Reports.
- Distinguish product, test, environment, acceptance ambiguity, subject mismatch, and insufficient evidence.
- No real Claude invocation, external service, persistent external state, Serena memory/onboarding, or `.serena/` inspection.
- Superpowers workflow chaining is prohibited.

## References

- `docs/construction/runbook/ai-block-project-profile.md`
- `docs/construction/runbook/work-guides/testing.md`
- `docs/construction/runbook/orchestration/evidence-and-acceptance.md`
- `docs/construction/host-gateway-walking-skeleton-plan.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `docs/construction/records/host-gateway/reports/HG-integration-001-fake-backend-walking-skeleton.tester.md`
- `docs/construction/records/host-gateway/reports/HG-integration-002-root-test-dependency-ownership.tester.md`
- `docs/construction/records/host-gateway/reports/HG-boundary-001-runbook-serena-checker.coding.md`

## Acceptance

- Root owns and resolves Vitest `4.1.10` without a private app runner or `node_modules` mapping.
- The boundary checker validates the authoritative Runbook Serena policy, not substantive content in the retired pointer.
- Clean-state root integration passes all five accepted real-loopback FakeBackend scenarios.
- `pnpm check:boundaries` passes.
- Full `pnpm verify` passes with current suite counts and cleanup.
- The Report gives an explicit PASS/FAIL verdict, exact subject, disposition of both prior findings, coverage limits, and residual risk.

## Handoff

Write and commit only `docs/construction/records/host-gateway/reports/HG-acceptance-001-host-walking-skeleton-retest.testing.md` with commit message `test: accept host walking skeleton evidence`. Return verdict, exact tested subject, Report commit, material evidence, and remaining risk.
