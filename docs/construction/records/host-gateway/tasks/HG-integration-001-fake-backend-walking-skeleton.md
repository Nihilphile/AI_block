# HG-integration-001 FakeBackend Host Walking Skeleton

- owner: Host Gateway integration; Host Gateway remains the primary state owner
- follows: HG-transport-001
- affected modules: Runtime Server Host Gateway; ActorHost as a read-only integration participant; root test composition
- workflow: W3
- base reason: this Task integrates two deployable application boundaries over the public Host protocol and completes the Host Gateway walking-skeleton milestone
- triggered gates: Independent Test and module Review after the Coder commit, as placed by the walking-skeleton plan
- product baseline: `48e401915ebc4c20ccb2e3f5e940ef71216e5cd6`

## Objective

Add a root-level, test-only integration composition that proves Runtime Server Host Gateway and the real ActorHost WebSocket client/command processor/BackendSupervisor/FakeBackend interoperate over loopback for initialize, create, resume, busy rejection, launch failure, ACK tracking, and terminal disconnect.

## Authorities

- `docs/construction/host-gateway-walking-skeleton-plan.md`
- `docs/construction/phase-1-architecture-invariants.md`
- accepted Host Gateway and ActorHost Tasks/Reports
- Runtime Contracts Host protocol
- `docs/construction/superpowers-temporary-authorization.md`

## Write scope

The Coder may modify only:

- `tests/integration/host-walking-skeleton/**`
- `tsconfig.integration.json`
- `package.json`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/host-gateway/reports/HG-integration-001-fake-backend-walking-skeleton.coder.md`

No Runtime Server source/test/manifest, ActorHost source/test/manifest, Runtime Contracts, dependency, lockfile, application entrypoint, architecture/design, or prior construction record may change.

## Integration boundary

- `tests/integration/host-walking-skeleton/` is the only privileged cross-application test composition root. It may import the exact Runtime Server Host Gateway/infrastructure and ActorHost backend/connection source modules needed for this milestone.
- This permission never extends to product source, app-to-app imports, package exports, or a reusable shared/testkit package.
- The boundary checker must allow only the exact integration directory/files and retain all existing negative app-to-app package/relative-source probes.
- Apps remain private and have no exports.

## Frozen scenario

The test harness composes:

- one Node HTTP server bound only to `127.0.0.1` on an ephemeral port;
- real `HostGateway` and real noServer `HostGatewayWebSocketAdapter`;
- an in-memory async credential verifier mapping one synthetic token to exact Project + Actor + Host-instance identity;
- real `ActorHostWebSocketClient`, `ServerConnection`, `ActorHostCommandProcessor`, and `BackendSupervisor`;
- real deterministic `FakeBackend` controls;
- injected deterministic message IDs and canonical timestamps on both sides;
- recording Host fact sink and event-driven test waiters.

The primary success sequence is:

```text
WebSocket open
→ HostHello generation 1 / Host sequence 0
→ Server receipt ACK sequence 0 and live registration
→ Server InitializeActorHost
→ Host receipt ACK + HostReady
→ Server StartInvocation(session=create)
→ Host receipt ACK + SessionReport + InvocationResult
→ Server receipt ACKs for Host facts
→ Server StartInvocation(session=resume, prior session ID)
→ second SessionReport + InvocationResult
```

## Frozen assertions

- Upgrade uses the header credential and exact path; no token enters URL, messages, facts, diagnostics, or recorded errors.
- Host identity and authenticated identity match exactly; a mismatch fails before registration/command execution.
- Hello/command/fact ACKs remain receipt-only. Matching Host ACK clears pending Server command state but never claims backend success.
- Initialize creates no backend session or Invocation.
- First Start uses `session:create`; FakeBackend returns a deterministic session ID; second Start carries the exact same ID through `session:resume`.
- SessionReport arrives before InvocationResult when the fake exposes session first.
- A second Start while one fake execution is pending yields `HostFault` with the stable `actor_host.busy` code and does not launch another backend execution.
- Scripted launch failure yields `InvocationResult.process.status = "launch_failed"`, not HostFault.
- Explicit socket/client termination causes the Gateway to unregister the live Actor connection and no further command is deliverable.
- Package publication, completion requests, Run/Actor lifecycle state, persistence, process spawning, reconnect, heartbeat, outbox, Project activation, and Claude are not implemented or asserted.

## Determinism and cleanup

- No fixed sleeps, wall-clock deadlines, random IDs, external service, external port, or real credential.
- Event waiters must subscribe before triggering the corresponding action and have bounded test-runner timeouts only as failure guards.
- Every test closes ActorHost client sockets, Gateway adapter, HTTP server, and FakeBackend pending controls in `finally`.
- The test must be repeatable in the full suite without leaked listener/port/open-handle warnings.

## Coder preflight gate

Before editing, report:

1. exact existing constructor/factory/public module APIs needed from both apps and whether they can compose without product changes;
2. any app-private/import/boundary/TypeScript issue created by the root test composition and the narrowest test-only solution;
3. deterministic fixture IDs, timestamps, ActorLaunchSpec, create/resume InvocationSpecs, FakeBackend scripts/controls, and Host fact wait strategy;
4. exact command/fact/ACK ordering and how pending command clearance/live registration/unregistration are observed without reaching private mutable state improperly;
5. exact identity mismatch, busy, launch-failure, and disconnect test arrangements;
6. root integration test/type-check scripts and clean-state build prerequisite without dependency/lock changes;
7. expected changed files, checker rules/negative preservation, RED/GREEN plan, and root verification;
8. every missing API, owner-specific product change, implicit decision, or scope conflict. If existing APIs are insufficient, stop and recommend separate owner Tasks rather than editing product here.

Do not edit until exact `IMPLEMENTATION_AUTHORIZED` is returned.

## Acceptance

- Existing product APIs compose without production changes; otherwise this Task remains blocked pending owner-specific work.
- Focused integration tests prove all frozen scenarios over a real loopback WebSocket and deterministic FakeBackend.
- A no-emit TypeScript 7 NodeNext integration project checks the privileged test composition.
- Root `pnpm verify` runs the integration suite after app package suites and before boundaries/cleanup.
- Direct focused integration command is self-sufficient from a clean generated state through an exact build prerequisite.
- Boundary checker permits only the exact root integration composition and continues rejecting app production cross-imports/deep imports.
- No dependency or lockfile change occurs.
- Coder Report records composition APIs, event/ACK ordering, RED/GREEN evidence, root/checker changes, verification, Serena use/fallbacks, and deviations.
- Commit only authorized paths with message `test: add fake backend host walking skeleton`.
