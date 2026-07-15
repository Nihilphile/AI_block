# HOST-protocol-001 ActorHost Command Processor

- owner: ActorHost
- follows: HOST-backend-001
- affected modules: ActorHost; Runtime Contracts as a read-only dependency
- workflow: W2
- base reason: this Task adds bounded protocol-command behavior inside ActorHost without establishing a transport or public workspace boundary
- triggered gates: none
- product baseline: `0775e43326066cd20184936e3867391f1c91f14f`

## Objective

Add a transport-independent ActorHost command processor that consumes already decoded Server-to-Host commands, drives BackendSupervisor, and emits Host-to-Server protocol payloads through a narrow outbound sink.

## Architecture authorities

- `docs/construction/phase-1-architecture-invariants.md`
- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`
- accepted Runtime Contracts Host protocol
- `docs/construction/superpowers-temporary-authorization.md`

## Write scope

The Coder may modify only:

- `apps/actor-host/src/server-connection/**`
- `apps/actor-host/test/server-connection/**`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/actor-host/reports/HOST-protocol-001-command-processor.coder.md`

Do not modify BackendAdapter, BackendSupervisor, FakeBackend, Runtime Contracts, manifests, lockfile, `main.ts`, another application/package, architecture/design files, or prior construction records.

## Directory responsibility

```text
apps/actor-host/
├── src/backend/             # existing backend port and lifecycle
├── src/server-connection/   # protocol command processing and outbound payload port
├── test/backend/
└── test/server-connection/
```

Do not create generic `common`, `shared`, `core`, `utils`, `events`, or catch-all directories. This slice does not add a network transport.

## Frozen boundaries

- Input is an already validated/decoded Runtime Contracts Server-to-Host message or payload. Raw `unknown` JSON parsing belongs to the future concrete ServerConnection transport boundary.
- The command processor may inspect inbound identity/correlation metadata needed by protocol semantics, but it does not own WebSocket connection generation, sequence acceptance, replay windows, authentication, heartbeat, reconnect, or persistence.
- Outbound communication uses an injected Host-to-Server payload sink. The processor does not allocate outbound `message_id`, sequence, generation, or `sent_at`; a future ServerConnection envelope writer owns those fields.
- The processor drives BackendSupervisor but never calls BackendAdapter or FakeBackend directly.
- Session discovery must be forwarded before process completion when the backend exposes it first.
- Process/session reports are facts. The processor does not decide Server Run/ActorInvocation state, persist Actor session state, route Packages, release leases, or wake Actors.
- ACK meaning must remain exactly what the frozen Host protocol defines. Do not silently reinterpret a delivery ACK as successful execution or vice versa.
- Expected Host-local lifecycle rejections must be mapped only through an existing suitable protocol payload. If Runtime Contracts lack a lossless mapping, stop and return the contract gap; do not invent an unversioned wire payload or misuse an unrelated error shape.
- Ordering for multiple asynchronous facts from one accepted command must be deterministic without wall-clock sleeps.
- Duplicate/replayed command idempotency, reconnect reconciliation, durable outbox, heartbeat, authentication, and network framing are explicitly deferred unless the frozen protocol makes a minimal behavior unavoidable.
- Package publication request handling, completion request handling, AgentControlTool, and Graph/Run routing are out of scope.
- Shutdown may be handled only to the extent the current protocol and current Host-local components can represent it without terminating a real process or implementing daemon ownership.
- Tests use BackendSupervisor with FakeBackend through their production interfaces; no fake-only command-processor path is allowed.
- Root `pnpm verify` must automatically discover and run the new ActorHost tests and retain all Phase 0B and backend checks.
- Serena memory and `.serena/` inspection are prohibited. Non-memory Serena LSP/IDE functions are allowed; Git, TypeScript, tests, and diffs remain authoritative.
- The temporary Superpowers policy applies: the Coder performs Task preflight and authorized implementation only, with no independent brainstorm, plan, subagent dispatch, or review workflow.

## Coder preflight gate

Before editing, report:

1. the exact current Server-to-Host and Host-to-Server unions/payloads relevant to initialize, start, stop, shutdown, ACK, session, process result/facts, and protocol errors;
2. which fields belong to the future transport envelope versus this processor;
3. the proposed command-processor API and outbound sink API;
4. exact handling and outbound ordering for initialize, start/create, start/resume, launch failure, completion, cancellation/stop, local rejection, and shutdown;
5. ACK semantics in the frozen contracts and whether ACK is receipt-, acceptance-, or completion-level;
6. any protocol gap where existing contracts cannot represent a required Host response without semantic loss;
7. deterministic async test-control strategy, expected changed files, and root verification impact;
8. every implicit decision or scope conflict, with a recommendation for Controller confirmation.

Do not edit until the Controller returns exact `IMPLEMENTATION_AUTHORIZED` after closing protocol decisions.

## Required behavior coverage

Subject to preflight confirmation that the frozen contracts can represent the behavior, focused tests should prove:

- initialize reaches BackendSupervisor without starting a session and emits only contract-authorized acknowledgement/readiness facts;
- accepted start returns promptly while session and final result are emitted asynchronously in their actual order;
- create and resume preserve the InvocationSpec session directive;
- launch failure is emitted distinctly from a started process's later non-success completion;
- stop targets the active Invocation and does not affect a mismatched Invocation;
- a concurrent start/local rejection never starts a second backend execution;
- asynchronous output contains no transport-owned envelope fields;
- no Server lifecycle state, Package routing, network, filesystem process, or timing sleep is introduced.

## Acceptance

- The processor and outbound sink are narrow, transport-independent, and compatible with a later WebSocket ServerConnection.
- All required representable command paths have focused deterministic tests and no unversioned wire shape is invented.
- Existing backend tests remain green and the processor uses only BackendSupervisor.
- Root `pnpm verify` passes with Runtime Contracts, BackendSupervisor, command-processor tests, build/type checks, boundaries, cleanup, and Git-clean verification.
- No Runtime Contracts, backend implementation, manifest, dependency, lockfile, entrypoint, or other module change occurs.
- The Coder Report records contract inventory, ACK/error decisions, async ordering, RED/GREEN evidence, verification, Serena non-memory use/fallbacks, and deviations.
- Commit only authorized paths with message `feat: add actor host command processor`.

## Controller clarification after preflight

The following protocol decisions are frozen before implementation:

- ACK is receipt-level only. Every non-ACK Server-to-Host command emits its ACK first, including commands later rejected by Host-local lifecycle checks. ACK never means accepted execution, successful launch, process completion, or Run completion.
- An inbound Server ACK is not itself ACKed and is not a backend command. This slice returns/records a typed `not_command` or equivalent local disposition without outbound payload; durable ACK reconciliation remains with the future ServerConnection/outbox.
- `ActorHostCommandProcessor.process(message)` consumes the full decoded directional message so it can retain the inbound `message_id`. It may be asynchronous for initialization dispatch, but accepted backend execution continues through separately observed session/result promises.
- The outbound port emits an intent containing `HostToServerPayload` plus an optional causal inbound message ID. This is not a completed Host envelope. The future ServerConnection envelope writer alone converts that intent into outbound `correlation_id` and allocates `protocol_version`, outbound `message_id`, `sender_sequence`, `connection_generation`, and `sent_at`.
- Every payload caused by initialize, start, stop, or shutdown carries the initiating inbound message ID as causal intent metadata. ACK also retains the inbound ID in `acknowledged_message_id` as required by the frozen payload.
- The outbound sink is a synchronous enqueue/recording boundary so ACK-first and same-turn ordering are deterministic. Network backpressure and durable outbox behavior are deferred.
- Initialize order is ACK, then `HostReadyPayload` on both successful and same-snapshot idempotent initialization; otherwise ACK, then `HostFaultPayload`.
- Accepted start order is ACK, then actual session/result observation. Attach the session observer before the result observer. Emit `SessionReportPayload` when a session ID is discovered and `InvocationResultPayload` when the final result settles. If the backend genuinely settles them in a different order, report actual facts rather than inventing timing.
- Launch failure is ACK then `InvocationResultPayload` with `process.status = "launch_failed"`; it is not a HostFault.
- Start/stop lifecycle rejection is ACK then HostFault. Accepted stop is ACK followed later by the active Invocation's normal final result.
- Shutdown is ACK-only in this slice and does not claim shutdown completion, terminate a process, or mutate daemon ownership.
- Host-local supervisor rejections map losslessly to stable dotted wire error codes using the `actor_host.` namespace and the existing local discriminant, including `actor_host.not_initialized`, `actor_host.busy`, `actor_host.no_active_invocation`, `actor_host.invocation_mismatch`, `actor_host.already_initialized`, and `actor_host.adapter_mismatch` where applicable. Initialization exceptions use `actor_host.initialization_failed`. Do not add or change a Runtime Contract payload.
- HostFault includes the target Invocation ID where the frozen payload permits it. Active-versus-target diagnostic values may be inert error details when already available, but must not expose a new authority claim.
- `ContractErrorEnvelope.correlation_id` remains unset for these command rejections; command causality is carried by the outbound intent and later Host envelope correlation, avoiding two competing correlation channels.
- Tests attach observers and use FakeBackend controls without sleeps. They assert ACK-first, causal intent preservation, session-before-result when session is exposed first, actual-order preservation otherwise, no ACK loop for inbound ACK, and absence of envelope-owned fields from payloads/intents.
