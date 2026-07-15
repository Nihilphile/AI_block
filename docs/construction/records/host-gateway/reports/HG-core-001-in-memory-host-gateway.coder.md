# HG-core-001 Coder Report

- role: coder
- result: implemented
- subject commit: same-as-report

## APIs and state ownership

Implemented `HostGateway` with package-root Runtime Contracts imports only. The module-local API provides:

- `AuthenticatedHostContext` for already-authenticated `projectId`, `actorId`, and `hostInstanceId`;
- synchronous, non-reentrant `HostGatewayTransport` complete-object `send` and terminal failure observation;
- injected `HostMessageIdProvider` and `HostTimestampProvider`;
- typed `HostFactSink` delivery using a lossless envelope/payload wrapper;
- `sendCommand(actorId, payload, causalMessageId?)` and per-connection `receive(input)` local result unions.

`HostGateway` owns pending/live Actor and Host-instance indexes. Each connection owns connection-local inbound/outbound sequence counters and the in-memory pending Server-command ACK registry. Terminal failure unsubscribes transport observation, removes both reservation/index entries, and discards pending command state.

## Protocol and ordering decisions

- Only generation `1` is accepted.
- Opening reserves Actor and Host-instance identities as pending; the first frame must be exact HostHello at sequence `0` and exact authenticated identity.
- The Hello receipt ACK is Server sequence `0`, generation `1`, has `acknowledged_message_id` and matching `correlation_id`, and is never pending. The connection becomes live only after transport send succeeds.
- Server commands use the existing Server-to-Host union, injected envelope ID/time, contiguous sequence, optional explicit causal correlation, and pending registration only after successful send.
- Matching Host ACKs remove exactly one pending command and return local `acknowledged`; they never report execution success.
- Unknown/duplicate ACKs consume the valid inbound sequence and return nonfatal local `ack_ignored` without response or fact delivery.
- Valid non-ACK facts are validated, receipt-ACKed first, then consume inbound sequence, then reach the sink. ACK failure prevents sequence consumption and delivery.
- Sink failure is terminal `fact_sink_failed`; the sent ACK and consumed sequence are not rolled back and no HostFault is emitted.
- Post-Hello identity fields are checked against authenticated context. Omitted wire identities are represented only by the local fact wrapper.
- No retry, replay, reconnect replacement, persistence, timer, network, token, Package, Run, Graph, or other module behavior was added.

## TDD and verification evidence

- RED: the first focused Runtime Server test run reached Vitest `4.1.10` and failed because the authorized Gateway source module did not yet exist.
- GREEN: `pnpm --filter @ai-block/runtime-server test` passed one test file with 8 tests and then passed the no-emit TypeScript check.
- `pnpm build` passed.
- `pnpm check:boundaries` passed with the explicit Runtime Server manifest, source/test topology, TypeScript test project, package-root, and forbidden-boundary checks.
- Final `pnpm verify` is run at the clean subject commit because the repository's verification script intentionally begins with a clean-diff gate.

## Manifest, lock, and root audit

- Runtime Server now has the exact clean-state `pretest`, `test`, and `test:types` scripts and pinned `vitest: 4.1.10` development dependency.
- `apps/runtime-server/tsconfig.test.json` mirrors ActorHost's no-emit test project.
- The lockfile adds only the Runtime Server Vitest importer entry using the existing exact Vitest resolution.
- Root verification now runs `test:runtime-server` after ActorHost tests and before boundary checks.
- The boundary checker adds an explicit Runtime Server manifest/topology/test-tsconfig policy; no wildcard workspace allowance was added.

## Serena and fallback record

Used non-memory Serena for project activation, file discovery, source/task navigation, complete Host contract inspection, symbol overviews, and pattern searches. Used `apply_patch` for authorized edits and ordinary PowerShell/Git commands for focused RED/GREEN runs, build, boundary verification, diff checks, and topology audit. No Serena memory calls and no `.serena/` inspection were performed.

## Deviations and concerns

None.
