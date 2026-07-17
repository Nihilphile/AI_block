# HG-acceptance-001 Host Walking-Skeleton Retest — Testing Report

- work: testing
- result: completed
- subject: implementation `dd2c6c1`; orchestration baseline `17da891`
- verdict: PASS

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: both prior findings accepted as closed; walking-skeleton acceptance passed

## Work and evidence

The exact subject gate passed: HEAD was `17da891`, the starting worktree was clean, and `git diff --name-status dd2c6c1..17da891` contained only this Task file. No product, test, policy, configuration, or prior Report was modified.

Finding 1 — root Vitest ownership/private runner: **CLOSED / PASS**. Root `pnpm exec vitest --version` resolved exactly `vitest/4.1.10`; root `package.json` owns `vitest: 4.1.10`; `pnpm why vitest -r` found one version with root ownership; the root integration script uses root `pnpm exec vitest`; and `tsconfig.integration.json` has no private app `node_modules` mapping. No ActorHost-private runner or mapping is used.

Finding 2 — stale Serena Runbook boundary check: **CLOSED / PASS**. `scripts/check-workspace-boundaries.mjs` reads authoritative `docs/construction/runbook/policies/serena.md`. The retired `docs/construction/serena-lsp-worker-guide.md` is only a pointer and is not used for substantive policy. `pnpm check:boundaries` passed.

## Verification or result

- Clean-state `pnpm clean` followed by `pnpm run test:integration`: **PASS**, build and integration type-check passed; 1 file / 5 tests passed, covering the five accepted real-loopback FakeBackend scenarios.
- `pnpm check:boundaries`: **PASS**.
- Full `pnpm verify`: **PASS**. Frozen install, build/types, Contracts 9 files / 58 tests, ActorHost 4 / 34, Runtime Server 2 / 15, integration 1 / 5, boundary checks, cleanup, and final Git-clean probe all passed.
- Final worktree after verification was clean except for this new Report; the Report is the only file committed.

## Deviations and remaining risk

The Task names `ai_block-project-profile.md`; that path does not exist. The repository's clearly corresponding `ai-block-project-profile.md` was read. This did not affect acceptance evidence.

Coverage is limited to the accepted Host Gateway/FakeBackend walking skeleton and repository regression gates. Deferred persistence, reconnect recovery, heartbeat, daemon startup, Run/Package/Graph behavior, remote Host, and real Claude behavior remain unverified by design.
