# HG-integration-001 FakeBackend Host Walking Skeleton — Tester Report

- role: independent integrated Tester
- verdict: FAIL
- scope: Host Gateway walking-skeleton milestone; product commits `5389694`, `48e401915ebc4c20ccb2e3f5e940ef71216e5cd6`, and `fb6bc2a13154510411923303e45d118e80ae892c`
- tested: 2026-07-16, Windows PowerShell, Node `v24.14.1`, pnpm `11.10.0`, TypeScript `7.0.2`, Vitest `4.1.10`

## Acceptance matrix

| Item | Result | Exact evidence |
|---|---|---|
| 1. Fresh direct integration command is self-sufficient and all five scenarios pass | PASS for observed behavior; boundary caveat in item 9 | `pnpm clean` then `pnpm run test:integration`: root build, no-emit integration types, 1 file / 5 tests passed. Three repeated `pnpm run test:integration:focused` runs each passed 1 file / 5 tests with no listener, open-handle, or warning output. |
| 2. Full verification and required counts | PASS | `pnpm verify` passed: Contracts 9 files / 58 tests; ActorHost 4 files / 34 tests; Runtime Server 2 files / 15 tests; integration 1 file / 5 tests; type checks; boundaries; clean; final Git-clean probe. |
| 3. Real wire sequence | PASS | The five integration tests exercised real `127.0.0.1` ephemeral WebSocket Upgrade, HostHello/receipt ACK, Initialize/ACK/HostReady, create Start/ACK/SessionReport/InvocationResult, resume with the exact session ID, and Server ACKs for Host facts. |
| 4. Busy, launch failure, identity mismatch, disconnect | PASS | Busy emitted `actor_host.busy` with one backend start; launch failure was `InvocationResult.process.status = launch_failed` with no HostFault; identity mismatch did not register or initialize; disconnect unregistered and later `sendCommand` returned `not_live`. |
| 5. ACK receipt-only semantics | PASS | Integration assertions observed command ACK before facts while `BackendSupervisor.snapshot().state` remained `running`; public `acknowledged` result was used for pending clearance, not execution completion. |
| 6. Credential/path/loopback/compression/text/size/token policy | PASS | Focused integration and Runtime Server transport tests passed. Source/tests show exact `/actor-hosts/connect`, `127.0.0.1`, bearer grammar and 4 KiB token limit, compression disabled, text-only frames, 4 MiB inbound and 8 MiB outbound-buffer limits, and no synthetic token in observed messages/facts/failures. |
| 7. Event-driven waits and cleanup | PASS | Integration waiters are event-driven with bounded Vitest guards; harness cleanup handles partial setup and closes fake execution, client, adapter, HTTP server, and listeners. Three repeated focused runs left no warnings. |
| 8. Product boundary and negative probes | PASS | `pnpm check:boundaries` passed, including exact root integration exception and retained negative app-to-app/deep-import probes. `git show --stat fb6bc2a` shows no dependency or lockfile change. |
| 9. Root integration dependency/type-resolution ownership | FAIL — BLOCKING | The accepted clarification requires the repository/root integration runner and forbids an undeclared private-app test dependency. `pnpm exec vitest --version` from the repository root fails (`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`, command not found); only `pnpm --filter @ai-block/actor-host exec vitest --version` succeeds. Root `package.json` has no Vitest dependency, while `pnpm why vitest -r` reports ownership by private `@ai-block/actor-host`, `@ai-block/runtime-contracts`, and `@ai-block/runtime-server`. The focused script explicitly invokes `--filter @ai-block/actor-host exec vitest`, and `tsconfig.integration.json` maps `vitest` types to `./apps/actor-host/node_modules/vitest/dist/index.d.ts`. This makes clean reproducibility and package-manager ownership dependent on ActorHost's private installation, contrary to the Task clarification. The boundary checker codifies this path, but passing that checker does not resolve the ownership violation. No fix was made. |
| 10. Scope and phase invariants | PASS | No Run/Package/Graph/persistence/reconnect/heartbeat/daemon/Claude work was observed in the scoped commits or tests. No product app-to-app export/dependency was added. |

## Findings by severity

### BLOCKING

1. Integration test execution is not owned by the repository root as required. The direct aggregate command passes only because it delegates to ActorHost's private Vitest runner. The corresponding type mapping also reaches into ActorHost's private `node_modules`. A clean installation that does not materialize that private-app path cannot satisfy the root integration ownership contract, even though the current workspace installation passes.

## Verification commands and results

Executed from `F:/AI_project/AI_block`:

```text
pnpm clean
pnpm run test:integration
pnpm run test:integration:focused     # repeated three times
pnpm verify
pnpm exec vitest --version             # expected root-owner probe; failed, exit 1
pnpm --filter @ai-block/actor-host exec vitest --version
pnpm why vitest -r
```

`pnpm verify` completed successfully and ended with:

```text
PASS: workspace boundaries, manifests, references, artifacts, and probes verified
PASS: Git worktree clean; no nonignored tracked or untracked paths remain
```

The three repeated focused runs showed 5/5 tests each and no open-handle/listener warnings. Loopback listeners used only `127.0.0.1` with ephemeral port `0`; credentials were synthetic.

## Residual risks

- The green integration suite verifies the current installed workspace topology, not root-owned dependency resolution. The ownership mismatch must be resolved by the responsible implementation/controller before the milestone can be accepted.
- No assertion was made for deferred production behavior explicitly excluded by the plan: persistence, reconnect recovery, heartbeat, outbox, daemon startup, Project activation, package publication, Run Engine, or Claude.

## Clean-worktree and write-scope confirmation

Before this report was created, the worktree was clean. During verification, only ignored generated artifacts were created and `pnpm verify` cleaned them. No product, test, config, manifest, lockfile, Task, or prior Report was edited. The only intended tracked change is this Tester Report; it is the only file to be committed.
