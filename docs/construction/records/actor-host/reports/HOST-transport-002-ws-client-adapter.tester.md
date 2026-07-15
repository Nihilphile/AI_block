# HOST-transport-002 WebSocket Client Adapter — Independent Tester Report

- role: Independent Tester
- task: `HOST-transport-002-ws-client-adapter.md`
- product subject commit: `9ba8b58cfebd93e26e345f6bffbebdc1a0176aa5`
- acceptance-gate record commit: `8ce7cbc`
- test date: 2026-07-16
- verdict: PASS

## Environment and boundaries

- OS/shell: Windows PowerShell
- Node: `v24.14.1`
- pnpm: `11.10.0`
- Product code, tests, manifests, lockfile, Task, designs, and prior Reports were not modified.
- No external service, real credential, Serena memory, `.serena/` inspection, subagent, review, or plan workflow was used.
- Loopback verification used only `127.0.0.1` with ephemeral ports and synthetic fixture tokens.

## Acceptance matrix

1. **PASS — dependencies and compile.** `apps/actor-host/package.json` and the lockfile pin exactly `ws@8.21.1` and `@types/ws@8.18.1`; the product diff adds only the authorized importer/package/snapshot entries and optional native addons are absent. `pnpm build` passed under Node 24/ESM/TypeScript 7 NodeNext. ActorHost test typecheck also passed after the build.

2. **PASS — endpoint.** Fake-socket evidence asserts the exact URL `ws://127.0.0.1:43123/actor-hosts/connect`; production construction has no alternate host/path/scheme/query/fragment or credential URL channel.

3. **PASS — Upgrade authorization and token policy.** Fake and loopback tests assert `Authorization: Bearer <synthetic-token>` arrives on Upgrade, the request URL has no query, and invalid empty, whitespace, CR/LF, Unicode, oversized, and invalid-padding tokens are rejected without token echo. Source and test diagnostics contain only deliberate synthetic fixture values.

4. **PASS — transport safety limits.** Exact options are asserted: `perMessageDeflate: false`, `followRedirects: false`, `handshakeTimeout: 5000`, and `maxPayload: 4 MiB`. Inbound application accounting rejects strictly over 4 MiB; outbound accounting uses UTF-8 byte length plus `bufferedAmount`, accepts equality at 8 MiB, and rejects the next over-limit send.

5. **PASS — JSON/protocol failure boundary.** Fake and bounded loopback tests reject binary, malformed JSON, and oversized input before core delivery. Core generation, decode/direction, stale-sequence, and gap rejection are terminal; valid ACK/not-command handling remains accepted. No command dispatch occurs after rejected input in the existing ServerConnection tests.

6. **PASS — lifecycle and Hello.** Tests prove `open` precedes exactly one HostHello, repeated connect is rejected, connect returns a typed result, and explicit close is distinct from unexpected socket failure.

7. **PASS — failure propagation.** Existing ServerConnection tests cover synchronous send failure, and the adapter tests cover asynchronous `send` callback failure, socket error/close duplication, send-before-open, send-after-close, and terminal state. ServerConnection is notified once, subsequent dispatch is prevented, and no HostFault or unhandled rejection was observed during the passing suites.

8. **PASS — bounded loopback cleanup.** Loopback tests bind `127.0.0.1` on port `0`, terminate remaining clients in `finally`, await client close, and await `WebSocketServer.close()`. No fixed sleeps or external listeners are used.

9. **PASS — regression and root verification.** `pnpm test:contracts`: 9 files / 58 tests passed. `pnpm --filter @ai-block/actor-host test`: 4 files / 34 tests passed, including test typecheck, after `pnpm build`. `pnpm check:boundaries` passed. The complete `pnpm verify` passed, including frozen install, build, contract tests, ActorHost tests, boundaries, cleanup, and final Git-clean checks.

10. **PASS — scope.** Product commit paths are limited to the authorized ActorHost package/source/tests, lockfile, boundary checker, and Coder Report. No reconnect, heartbeat, outbox, Server Gateway, `main.ts`, Runtime Contract, backend, or other scope was added. The subsequent acceptance-gate commit changes only construction records; no such change was made by this test.

## Exact verification commands and evidence

```text
node --version
pnpm --version
pnpm install --frozen-lockfile --offline
pnpm build
pnpm --filter @ai-block/actor-host test
pnpm test:contracts
pnpm check:boundaries
pnpm verify
pnpm clean
pnpm check:boundaries -- --git-clean
git diff --check
```

Observed successful results include Node `v24.14.1`, pnpm `11.10.0`, ActorHost `34 passed`, Runtime Contracts `58 passed`, boundary PASS, and `PASS: Git worktree clean; no nonignored tracked or untracked paths remain`.

An initial direct ActorHost test before building workspace dependencies failed at module resolution for `@ai-block/runtime-contracts`; this is a build-order precondition, not a product failure. Re-running the same command after `pnpm build` passed. Root `pnpm verify` performs the required build first and passed.

## Findings by severity

- No blocking, high, medium, or low-severity product findings.

## Residual risks

- This verifies the adapter and bounded loopback behavior only; Server-side authentication/authorization, TLS/proxy policy, token issuance/rotation/revocation, reconnect, heartbeat, and Host Gateway behavior remain deferred by the Task.
- No external network or production listener was exercised, by explicit acceptance boundary.
- The no-unhandled-rejection conclusion is based on the passing deterministic suites and exercised callback paths; the test suite does not install a separate process-level `unhandledRejection` trap.

## Clean-worktree confirmation

After verification and `pnpm clean`, `pnpm check:boundaries -- --git-clean` reported a clean Git worktree. `git diff --check` passed. The only intended new file at report time is this Tester Report, to be committed with the required message.
