# HG-integration-002 Testing Report

- work: testing
- result: failed
- subject: `0c5290ff7300ba828e257b63cb54bb0540a8a00a`

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: prior root integration ownership blocker is closed; reject the exact subject because the required boundary and aggregate verification commands fail on a later Runbook-migration mismatch

## Work and evidence

The starting worktree was clean and `HEAD` was exactly `0c5290f` (`docs: migrate construction runbook`). The ownership correction under test is `415b1c2` (`test: own root integration dependencies`). Testing used Windows PowerShell, Node `v24.14.1`, pnpm `11.10.0`, and standard service speed. Serena and Superpowers workflow chaining were not used.

Prior blocker disposition: **CLOSED**.

- Root `pnpm exec vitest --version` exits 0 and reports exactly `vitest/4.1.10`.
- `pnpm why vitest -r` reports one version, `4.1.10`, owned by root `ai-block@0.0.0` in addition to ActorHost, Runtime Contracts, and Runtime Server. `pnpm list --depth 0` reports root development ownership of `@ai-block/runtime-contracts@link:packages/runtime-contracts` and `vitest@4.1.10`.
- Root `package.json` invokes `pnpm exec vitest run --root . ...`; `tsconfig.integration.json` has no path mappings. Focused searches found no ActorHost-filtered Vitest command, app-private Vitest reference, or `apps/*/node_modules` path in the integration script/config/checker/test surface.
- The `415b1c2` delta changes only the authorized root `package.json`, `pnpm-lock.yaml`, `tsconfig.integration.json`, boundary checker, and Coder Report. The lock delta adds only the root workspace link and existing exact Vitest resolution. `git diff --name-status d6f21f0..0c5290f -- apps packages tests/integration pnpm-workspace.yaml tsconfig.json tsconfig.base.json` is empty: the integration test and product/app sources, tests, and manifests remain unchanged. Changes after `415b1c2` through the exact subject are Runbook/document migration only.

## Verification or result

Overall verdict: **FAIL**. The ownership correction and integrated behavior pass, but mandatory repository acceptance does not.

| Check | Result | Evidence |
|---|---|---|
| Exact subject and clean start | PASS | Full subject `0c5290ff7300ba828e257b63cb54bb0540a8a00a`; initial `git status --short --branch` showed only `## main`. |
| Root version and dependency ownership | PASS | Root Vitest `4.1.10`; root and package-local owners present; normal root package-manager resolution used. |
| `pnpm install --frozen-lockfile` | PASS | All 5 workspace projects already up to date; completed with pnpm `11.10.0`. |
| `pnpm clean` then `pnpm run test:integration` | PASS | Build and no-emit type check passed; root Vitest ran 1 file / all 5 scenarios passed. |
| `pnpm check:boundaries` | FAIL — test/acceptance-tooling defect | Exit 1: current retired `docs/construction/serena-lsp-worker-guide.md` is missing checker-required topics `stateless`, `Git/tests-authoritative`, `Windows`, and `fallback`. Commit `0c5290f` replaced that guide with a nine-line pointer to the new Runbook policy but did not update the unchanged checker at lines 535–537. This failure is outside the `415b1c2` ownership correction and is not a Host Gateway product-behavior failure. |
| `pnpm verify` | FAIL at boundaries | Frozen install, build/types, Contracts 9 files / 58 tests, ActorHost 4 / 34, Runtime Server 2 / 15, and integration 1 / 5 all passed. The command then exited 1 on the same four Serena-guide boundary errors before its built-in clean/Git-clean tail. |
| Manual post-failure cleanup and status | PASS | `pnpm clean` completed; known `dist` directories are empty and no `*.tsbuildinfo` remains. Worktree was clean before this Report. |

Failure classification: **test failure** (stale boundary-check expectation after the later Runbook migration). No product, test, configuration, manifest, lockfile, source, Task, prior Report, Runbook, or design fix was attempted.

## Deviations and remaining risk

- Required `pnpm check:boundaries` and full `pnpm verify` do not pass at the exact subject, so HG-integration-002 cannot receive an overall PASS despite closure of its original ownership blocker and green Host Gateway regression suites.
- Coverage remains bounded to root dependency/type ownership, the five accepted FakeBackend walking-skeleton scenarios, current package suites, type/build checks, Git history, and boundary probes. Deferred persistence, reconnect, heartbeat, daemon, Run/Package/Graph, and Claude behavior remain outside this acceptance.
- The only intended tracked change is this Tester Report; it must be the only file committed.
