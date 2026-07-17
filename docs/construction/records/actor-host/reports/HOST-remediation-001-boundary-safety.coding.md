# HOST-remediation-001 ActorHost Boundary Safety — Coder Report

- task: `HOST-remediation-001 ActorHost Boundary Safety`
- authorization: exact `IMPLEMENTATION_AUTHORIZED` from the Orchestrator
- baseline: `5fd3fa985d50fe204dfb752dc6ed7fa2da4fd5bb`
- result: implemented; final clean-subject verification and commit handoff recorded below

## Result

Implemented the ActorHost-only remediation for authenticated identity binding, serialized immutable initialization, rejecting backend promise observability, and invocation quarantine. Runtime Contracts, Runtime Server, integration tooling, and all out-of-scope paths remain unchanged.

## Exact local failure/state semantics

Stable HostFault codes are:

- `actor_host.identity_mismatch` — trusted Project/Actor mismatch or stored launch/invocation mismatch; category `conflict`.
- `actor_host.session_observation_failed` — session promise rejection; category `backend`.
- `actor_host.completion_observation_failed` — completion promise rejection; category `backend`.
- `actor_host.adapter_stop_failed` — synchronous or asynchronous stop rejection; category `backend`.
- `actor_host.quarantined` — later Initialize/Start rejected after a terminal backend observation failure; category `backend`.

The supervisor reserves initialization before awaiting the adapter. Same full launch configuration shares one promise and calls `adapter.initialize` once. A differing Project, Actor, snapshot, or launch configuration is rejected without adapter work. Failed initialization clears the reservation and returns to `uninitialized`.

Started Invocation observation failures resolve a non-throwing internal failure promise, clear active bookkeeping, and transition the supervisor to `faulted`. Later starts are rejected without calling the adapter. No rejection is represented as a false `InvocationResult`; `stopped`, `exited`, `signaled`, and `launch_failed` are emitted only from real process facts. Session/completion overlap is first-terminal-failure-wins and emits exactly one HostFault.

Receipt ACK remains emitted before semantic Ready/Fault facts. Trusted identity is injected from `ServerConnection` into `ActorHostCommandProcessor`; Project/Actor checks occur after ACK and before supervisor/backend calls. Host instance identity remains connection-scoped.

## Changed paths

- `apps/actor-host/src/backend/fake-backend.ts`
- `apps/actor-host/src/backend/supervisor.ts`
- `apps/actor-host/src/server-connection/command-processor.ts`
- `apps/actor-host/src/server-connection/server-connection.ts`
- `apps/actor-host/test/backend/backend-supervisor.test.ts`
- `apps/actor-host/test/server-connection/command-processor.test.ts`
- `apps/actor-host/test/server-connection/server-connection.test.ts`
- this Report

No Runtime Contract schema/export, Runtime Server, root integration, or unrelated path was changed.

## Verification

- `pnpm --filter @ai-block/actor-host test`: passed, 4 files / 47 tests, including no-emit TypeScript tests.
- `pnpm test:contracts`: passed, 9 files / 58 tests and contract type checks.
- `pnpm build`: passed.
- `pnpm test:integration`: passed, 1 file / 5 tests.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed.
- Final clean-subject `pnpm verify`: passed. Contracts 9 files / 58 tests, ActorHost 4 files / 47 tests, Runtime Server 2 files / 15 tests, integration 1 file / 5 tests, build/type checks, boundaries, cleanup, and Git-clean verification all passed.

## Serena and fallback record

Used Serena non-memory project/config confirmation, symbol overviews, symbol retrieval, reference navigation, pattern search, and diagnostics. These operations identified the trusted identity flow, supervisor promise lifecycle, contract surfaces, and affected tests. Serena diagnostics reported no errors in the changed source files.

No memory APIs, onboarding, or `.serena/` inspection were used. Actual edits used `apply_patch` because the repository editing policy requires it; Serena remained the primary navigation/diagnostic layer. Ordinary PowerShell, `rg`, Git, and pnpm supplied authoritative document, diff, test, and verification evidence.

## Deviations and remaining risk

No scope or Contract deviations. Faulted Hosts deliberately require reconstruction/restart because backend-process liveness is unknown after an observation or stop rejection. Server/Run interpretation of HostFault remains outside this ActorHost Task. Independent W3 testing and focused security re-review remain required after this subject.
