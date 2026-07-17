# HG-remediation-001 Terminal Transport and Command Identity — Coder Report

- task: `HG-remediation-001 Terminal Transport and Command Identity`
- role: coding
- authorization: exact `IMPLEMENTATION_AUTHORIZED` from the Orchestrator
- baseline: `d9ecccf14d4e9ec20ff7a32177f8db6ae37b7f62`
- subject commit: same-as-report
- result: implemented; final clean-subject verification passed

## Result

Implemented the Gateway-side remediation without changing Runtime Contracts, ActorHost, root integration tooling, or any path outside the authorized scope.

### Internal result and transport semantics

- `InitializeActorHost.launch_spec.project_id` / `actor_id` and `StartInvocation.invocation_spec.project_id` / `actor_id` are checked against the authenticated connection identity before outbound sequence, ID/time providers, envelope validation, pending registration, or transport send.
- Mismatch returns the internal `rejected / identity_mismatch` result, keeps the connection live, and permits a later valid command. Stop and shutdown retain their existing identity-free semantics.
- `HostGatewayTransport` now has a Gateway-to-transport terminal operation using `HostTransportFailure`; `onFailure` remains transport-to-Gateway. The real WebSocket transport implements both directions.
- Core-originated terminal failures unsubscribe the Gateway observer, clear pending commands, remove registry indexes, and request physical transport termination. Transport-originated failures perform logical cleanup without echoing termination back to the transport.
- Transport notification, socket termination, and close finalization use one-shot latches. Listener exceptions are isolated, termination-operation exceptions cannot reopen logical state, and no failure detail or credential crosses the WebSocket.
- The injected envelope validator is additive: mandatory Runtime Contract validation always runs first, so the seam cannot bypass production validation.

## Changed paths

- `apps/runtime-server/src/modules/host-gateway/ports.ts`
- `apps/runtime-server/src/modules/host-gateway/host-gateway.ts`
- `apps/runtime-server/src/infrastructure/actor-host-websocket/host-gateway-websocket-adapter.ts`
- `apps/runtime-server/test/modules/host-gateway/host-gateway.test.ts`
- `apps/runtime-server/test/infrastructure/actor-host-websocket/host-gateway-websocket-adapter.test.ts`
- this Report

No Runtime Contract, ActorHost, root integration, persistence, reconnect-generation, or unrelated path changed.

## Tests and verification

Pre-commit gates passed:

- `pnpm --filter @ai-block/runtime-server test`: 2 files / 20 tests passed, including no-emit TypeScript checking.
- `pnpm test:contracts`: 9 files / 58 tests passed plus contract type checks.
- `pnpm build`: passed.
- `pnpm test:integration`: 1 file / 5 tests passed, including integration type checking.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed.
- `pnpm verify`: passed on the clean subject commit, including frozen install, build, Contracts 9 files / 58 tests, ActorHost 4 files / 47 tests, Runtime Server 2 files / 20 tests, integration 1 file / 5 tests, boundary checks, cleanup, and Git-clean verification.

Focused coverage includes both mismatched command kinds, zero outbound allocation mutation, ID/timestamp/provider failures, injected envelope validation failure, terminal notification exceptions, real loopback socket closure exactly once, logical unregister, fresh registration, and credential/error redaction.

## Serena and fallback record

Used Serena non-memory `initial_instructions`, project activation/config confirmation, symbol overviews, symbol retrieval, declaration/reference/implementation navigation, and diagnostics. Used `apply_patch` for scoped edits and ordinary PowerShell/Git/pnpm commands for tests, build, integration, boundaries, diff, and clean-subject verification.

No memory APIs, onboarding, or `.serena/` inspection were used.

## Deviations and remaining risk

No product or Contract deviations. The internal terminal operation is optional at the type boundary only to preserve an unchanged legacy complete-object integration test double outside the authorized write scope; the real WebSocket transport and focused transport implement it, and Gateway cleanup remains complete if an implementation is absent or throws.

Existing deferred generation replacement, replay/outbox, heartbeat, persistence recovery, remote Host, Run/Package/Graph behavior, and real Claude behavior remain outside this Task.
