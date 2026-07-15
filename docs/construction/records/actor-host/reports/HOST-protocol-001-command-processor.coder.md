# HOST-protocol-001 Coder Report

- task: `HOST-protocol-001 ActorHost Command Processor`
- authorization: `16bf3c5`; Controller clarification: `d0183f9`
- implementation commit: same-as-report
- status: implemented and verified

## Contract inventory and ownership

The processor consumes the full decoded `ServerToHostMessage` from the Runtime Contracts package root. The relevant Server-to-Host payload union is:

- `InitializeActorHostPayload`: `kind: "initialize_actor_host"`, `launch_spec: ActorLaunchSpec`;
- `StartInvocationPayload`: `kind: "start_invocation"`, `invocation_spec: InvocationSpec`;
- `StopInvocationPayload`: `kind: "stop_invocation"`, `invocation_id: InvocationId`, `reason: string`;
- `ShutdownHostPayload`: `kind: "shutdown_host"`, `reason: string`;
- `AckPayload`: `kind: "ack"`, `acknowledged_message_id: HostMessageId`.

The emitted payload type is the existing `HostToServerPayload` union. This slice uses `HostReadyPayload` (`actor_id`), `SessionReportPayload` (`invocation_id`, `session_id`), `InvocationResultPayload` (`result: InvocationResult`), `HostFaultPayload` (`invocation_id?`, `error`), and `AckPayload` (`acknowledged_message_id`). No package publication, completion request, heartbeat, or hello behavior is added.

`ActorLaunchSpec`, `InvocationSpec`, `SessionDirective` (`create` or `resume` with `session_id`), `InvocationResult`, and its process facts remain Runtime Contracts facts. The processor does not add Run state, Package routing, session persistence, or server authority.

The future ServerConnection envelope writer owns `protocol_version`, outbound `message_id`, `correlation_id`, `sender_sequence`, `connection_generation`, and `sent_at`. The processor emits no completed envelope. It owns only the causal intent needed to connect a payload to the initiating inbound `message_id`.

## Internal API and state ownership

The new transport-independent port is:

```ts
interface HostOutboundIntent {
  readonly payload: HostToServerPayload;
  readonly causalMessageId?: HostMessageId;
}

interface HostOutboundPayloadSink {
  send(intent: HostOutboundIntent): void;
}
```

`ActorHostCommandProcessor` accepts a `BackendSupervisor` and the synchronous outbound sink. Its `process(message: ServerToHostMessage)` returns the typed local disposition `{ kind: "handled" }` for commands or `{ kind: "not_command" }` for an inbound ACK. Initialization dispatch is promise-based; accepted execution retains the supervisor's separate session and result promises.

The processor owns no lifecycle state. `BackendSupervisor` remains the sole owner of initialization, active Invocation, stop, session, and final process facts. The processor only translates those facts into existing Host payloads and preserves causal intent.

## ACK, error, and deterministic ordering decisions

- Every non-ACK command emits its receipt ACK synchronously before any readiness, fault, session, or result payload, including a command rejected by the supervisor.
- An inbound Server ACK is not acknowledged and is not sent to the backend; `process()` returns `not_command` with no outbound intent.
- Successful and same-snapshot idempotent initialization emit `ACK`, then `HostReadyPayload`. Supervisor rejection or an initialization exception emits `ACK`, then `HostFaultPayload`.
- Accepted start emits `ACK` immediately, then attaches the session observer before the result observer. A discovered session emits `SessionReportPayload`; final settlement emits `InvocationResultPayload`. The current supervisor exposes the session before its final result, so tests assert that fact order without sleeps.
- Create and resume directives are passed unchanged to `BackendSupervisor`, which passes them to the production `FakeBackend`/adapter boundary.
- Launch failure emits `ACK`, then `InvocationResultPayload` with `process.status: "launch_failed"`; it is never a `HostFault`.
- Accepted stop emits only its receipt ACK immediately; the active invocation's normal final `InvocationResult` remains observed from its start handle. A stop rejection emits `ACK`, then `HostFaultPayload` with the target Invocation ID.
- Concurrent start, uninitialized start, no-active stop, mismatched stop, adapter mismatch, identity mismatch, and other supervisor lifecycle rejections use `actor_host.<local_discriminant>` error codes. Existing `HostFaultPayload` is used without setting `ContractErrorEnvelope.correlation_id`; causal message identity stays on the outbound intent. Backend initialization/stop failures use the existing `backend` category; local lifecycle conflicts use `conflict`.
- Shutdown is receipt-only: `ACK` and no shutdown completion claim, process termination, daemon ownership mutation, or Server lifecycle state.

## RED/GREEN evidence

RED evidence:

- Before the processor source existed, the focused Vitest command failed during module resolution for `src/server-connection/command-processor.js`.

GREEN evidence before commit:

- `pnpm build`: passed.
- `pnpm --filter @ai-block/actor-host test`: 2 files / 15 tests passed, including the no-emit test project.
- `pnpm check:boundaries`: passed with the exact ActorHost source/test topology and package-root boundary probes.

Final root evidence:

- First post-commit `pnpm verify` passed: frozen install, clean-diff gate, build, Runtime Contracts 9 files / 58 tests plus static checks, ActorHost 2 files / 15 tests plus no-emit static check, boundaries, cleanup, Git-clean verification, and final diff cleanliness.

## Changed paths and scope audit

Changed paths are limited to:

- `apps/actor-host/src/server-connection/command-processor.ts`
- `apps/actor-host/test/server-connection/command-processor.test.ts`
- `scripts/check-workspace-boundaries.mjs`
- this Coder Report

No backend implementation or test, Runtime Contracts, manifest, lockfile, `main.ts`, network transport, outbox, heartbeat, reconnect, package/completion tool, Server lifecycle, or other module path was changed.

## Serena and fallback record

Used Serena non-memory navigation for project activation, authority/task reads, file discovery, symbol overview, file reads, and pattern search. Used ordinary PowerShell/Git reads for authoritative diffs, worktree state, package/build topology, tests, and verification. No Serena memory calls and no `.serena/` inspection were performed.

## Deviations and concerns

None. The frozen Runtime Contracts and existing `BackendSupervisor` expose all required representable behaviors for this slice. The only root integration change is the exact ActorHost source/test topology allowlist update.
