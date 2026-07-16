# HG-integration-001 FakeBackend Host Walking Skeleton — Coder Report

- role: coder
- result: implemented
- subject commit: same-as-report

## Result and scope

Implemented the root-only FakeBackend walking-skeleton composition over a real `127.0.0.1` ephemeral loopback WebSocket. Runtime execution imports the built JavaScript artifacts from the ignored Runtime Server and ActorHost `dist` trees after the root build prerequisite. No Runtime Server source/test, ActorHost source/test, Runtime Contracts, application entrypoint, dependency, or lockfile path changed.

## Public APIs and state ownership

The test composes existing public APIs only:

- Runtime Server `HostGateway({ factSink, messageIds, timestamps })`, `openConnection(identity, transport)`, `sendCommand(actorId, payload)`, `connectionForActor(actorId)`, and the accepted connection's public `receive(input)`/`state()`.
- Runtime Server `HostGatewayWebSocketAdapter({ gateway, verifier })`, `attach(server)`, and `shutdown()`.
- ActorHost `ActorHostWebSocketClient({ port, hostToken, identity, connectionGeneration, messageIds, timestamps, supervisor })`, `connect()`, `close()`, `state()`, and its public `connection`.
- ActorHost `BackendSupervisor.initialize()`, `start()`, `stop()`, and `snapshot()`.
- ActorHost `FakeBackend` public `initializeCalls`, `startCalls`, `sessionBindings`, `complete()`, and deterministic scripted launch/pending steps.

Host Gateway remains the state owner for pending/live registration, protocol sequences, and pending command receipts. ActorHost `BackendSupervisor` remains the execution owner. The test injects a public `HostFactSink` recorder and deterministic ID/timestamp providers. It decorates only public `HostGateway.openConnection()` and each accepted public connection's `receive()`; wrappers delegate unchanged and never inspect or mutate private registries, pending maps, sequence fields, or transport internals.

## Wire, ACK, and fact ordering

- The real client sends the exact `/actor-hosts/connect` WebSocket upgrade with the synthetic bearer header. The verifier records the opaque token only for the test assertion; observed envelopes, facts, results, and transport failures contain no token.
- The HostHello is generation `1`, sender sequence `0`, and exact authenticated Project/Actor/Host-instance identity. The Server receipt ACK is observed before the public `hello_registered` result, and live registration is asserted only through `connectionForActor()`.
- Initialize is sent through `sendCommand()`. The Host receipt ACK is recorded as the public `acknowledged` result with the exact command message ID, then `HostReady` is delivered. The FakeBackend records one initialization and no session or backend start.
- Each StartInvocation installs ACK, SessionReport, and InvocationResult waiters before the command trigger. The matching public ACK result is asserted before the first session fact; the supervisor remains `running` after that ACK, proving receipt tracking does not claim execution success. The session fact precedes the result fact.
- The first invocation uses `session: { mode: "create" }`; deterministic FakeBackend completion yields the fixed session ID. The second invocation uses `session: { mode: "resume", session_id }`, and both `startCalls` and `sessionBindings` assert exact continuity.
- The Gateway emits receipt ACKs for every Host fact. The test verifies each recorded public fact has a corresponding complete Server ACK envelope.
- Busy produces `HostFault` code `actor_host.busy` with no second FakeBackend start. Scripted launch failure produces `InvocationResult.process.status = "launch_failed"` and no `HostFault`.
- Identity mismatch terminates before registration or initialization. Explicit client termination produces exactly one observed transport failure, removes the live connection through the public `connectionForActor()` query, and makes later `sendCommand()` return `not_live` without a new envelope.

## Deterministic harness and cleanup

One test-local harness factory creates the HTTP server with no production request route, attaches the noServer adapter, listens on `127.0.0.1:0`, and then constructs the real client. Every event waiter is installed before its corresponding trigger, removes itself on resolution, and has no timer; Vitest's per-test timeout is only the bounded failure guard. FakeBackend completion/stop controls replace sleeps and polling.

Harness cleanup is idempotent and safe after partial setup. It stops any active public Supervisor invocation first, explicitly closes the ActorHost client, awaits adapter shutdown, awaits HTTP server close, and removes remaining event listeners. The five scenarios use fresh deterministic scripts for success, identity mismatch, busy, launch failure, and disconnect, with no fixed port, random ID, external credential, external service, or fixed delay.

## Root scripts, TypeScript, and boundary audit

Added only the authorized root integration surface:

- `test:integration:build`: existing root `pnpm build` prerequisite;
- `test:integration:types`: separate no-emit TypeScript 7 NodeNext check;
- `test:integration:focused`: the pinned ActorHost Vitest `4.1.10` runner with repository root set explicitly;
- `test:integration`: build, no-emit check, then focused run.

`tsconfig.integration.json` is not part of the production solution references. Its package-root Runtime Contracts type import resolves to the built declaration artifact, and its Vitest type mapping resolves to the already pinned ActorHost runner without adding a dependency. Root `verify` runs `test:integration` after Runtime Server tests and before boundary checks/cleanup; the direct aggregate command is self-sufficient from generated artifacts.

The boundary checker now permits exactly `tests/integration/host-walking-skeleton/host-walking-skeleton.test.ts` and the exact integration TypeScript project. Existing application topology, manifests, package-root Runtime Contracts policy, and all negative deep-import/app-to-app package/source probes remain unchanged. No dependency or lockfile mutation occurred.

## RED/GREEN and verification

- RED: the first integration no-emit check exposed that the root has no Runtime Contracts or Vitest workspace symlink because neither is a root dependency (`TS2307` for both package imports). The separate integration `tsconfig` mappings resolved those artifacts without changing dependency state.
- GREEN: `pnpm run test:integration` passed the build prerequisite, no-emit TypeScript check, one Vitest file, and all 5 integration tests.
- `pnpm check:types` passed.
- `pnpm test:contracts` passed 9 files / 58 tests plus its type check.
- `pnpm test:actor-host` passed 4 files / 34 tests plus its type check.
- `pnpm test:runtime-server` passed 2 files / 15 tests plus its type check.
- `pnpm check:boundaries` passed with the exact integration exception and retained negative probes.
- Final clean-subject `pnpm verify` passed at the subject commit.

## Serena and concerns

Used non-memory Serena for project activation and source/topology navigation. Used `apply_patch` for all authorized edits and ordinary PowerShell/Git commands for focused RED/GREEN, builds, tests, boundary checks, and audits. No Serena memory calls, `.serena` inspection, dependency addition, lock mutation, subagents, review request, or workflow chaining was used; the required frozen install completed with the lockfile unchanged.

Concerns: none.
