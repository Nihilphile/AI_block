# HOST-connection-001 In-memory ServerConnection Envelope Channel

- owner: ActorHost
- follows: HOST-protocol-001
- affected modules: ActorHost; Runtime Contracts as a read-only dependency
- workflow: W2
- base reason: this Task adds bounded connection-envelope state and validation behavior inside ActorHost without adding a real network transport
- triggered gates: none
- product baseline: `bb1fb65ad586147ff0088ee08605411e7f731b19`

## Objective

Establish the transport-independent ServerConnection core that strictly decodes inbound Server envelopes, routes commands to ActorHostCommandProcessor, and wraps outbound payload intents into deterministic Host envelopes over an injected in-memory transport port.

## Architecture authorities

- `docs/construction/phase-1-architecture-invariants.md`
- `runtime-system-architecture-v0.1.md`
- `runtime-module-architecture-v0.1.md`
- accepted Runtime Contracts Host protocol
- `docs/construction/superpowers-temporary-authorization.md`

## Write scope

The Coder may modify only:

- `apps/actor-host/src/server-connection/**`
- `apps/actor-host/test/server-connection/**`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/actor-host/reports/HOST-connection-001-in-memory-envelope-channel.coder.md`

Do not modify BackendSupervisor/FakeBackend, Runtime Contracts, manifests, lockfile, `main.ts`, another app/package, architecture/design files, or prior construction records.

## Frozen boundaries

- This slice defines a transport port and deterministic in-memory test transport only. It does not use WebSocket, HTTP, ports, network, timers, reconnect loops, authentication, discovery files, or daemon process management.
- Raw inbound data is `unknown` at the ServerConnection boundary and must pass the frozen strict Runtime Contract decoder before any command processing.
- Invalid, wrong-direction, wrong-version, or structurally unknown input fails closed and never reaches ActorHostCommandProcessor or BackendSupervisor.
- ActorHostCommandProcessor remains the only component that translates decoded commands into BackendSupervisor actions and Host payload intents.
- ServerConnection envelope writing owns `protocol_version`, outbound `message_id`, `correlation_id`, `sender_sequence`, `connection_generation`, and `sent_at`.
- Outbound IDs and timestamps come from injected deterministic providers. Tests use no wall clock, randomness, sleeps, or network.
- Outbound `correlation_id` is derived only from the command processor's causal message ID intent. The payload is not mutated to duplicate correlation.
- `HostHelloPayload` identity comes from trusted Host process configuration, never LLM input or an inbound command.
- Receipt ACK, Ready/Fault, SessionReport, and InvocationResult ordering established by HOST-protocol-001 must be preserved after envelope wrapping.
- Inbound Server ACK is connection/outbox information, not a backend command and not ACKed again. Durable pending-command/outbox reconciliation is deferred.
- Heartbeat scheduling, reconnect/backoff, replay, durable inbox/outbox, authentication, liveness timeout, shutdown of a real process, and Server-side Host Gateway are out of scope.
- The Task must not guess who assigns or advances `connection_generation`. If the frozen protocol and architecture do not establish a lossless first-connection rule, preflight stops at that decision.
- Likewise, preflight must identify whether inbound sender sequence is contiguous, merely monotonic, or deferred. Do not silently create replay semantics.
- Root verification must run the new tests and preserve all existing checks.
- Serena memory and `.serena/` inspection are prohibited. Non-memory Serena LSP/IDE use is allowed; Git/tests/diffs are authoritative.
- Temporary Superpowers role restrictions apply; no separate brainstorm, plan, subagent dispatch, or review workflow.

## Coder preflight gate

Before editing, report:

1. exact envelope schemas, validation entrypoints, version rules, identifier/sequence/generation constraints, and HostHello fields already frozen;
2. whether current architecture/protocol defines who creates `connection_generation`, how Host learns it before HostHello, and how it changes on reconnect;
3. whether current protocol defines inbound sequence acceptance and duplicate/gap behavior;
4. proposed `ServerConnection`, transport-port, deterministic ID/clock, inbound handler, and outbound writer APIs, including composition with the existing command processor sink;
5. exact first-connect/HostHello flow that is representable without inventing handshake semantics;
6. fail-closed behavior for malformed, wrong-direction, wrong-version, wrong-generation, duplicate, out-of-order, and transport-send failure cases, separating what is implementable now from deferred reliability;
7. deterministic tests, expected changed files, boundary changes, and root verification impact;
8. every implicit decision, protocol gap, or scope conflict, with a recommendation for Controller confirmation.

Do not edit until exact `IMPLEMENTATION_AUTHORIZED` is returned after generation/sequence/handshake decisions are closed.

## Required behavior coverage

Only after preflight confirms representability, focused tests should prove:

- trusted Host identity produces an exact HostHello envelope through the outbound writer;
- outbound message IDs, sequence, generation, timestamps, and causal correlation are deterministic and correctly separated from payloads;
- strict valid inbound command decoding reaches the command processor once;
- malformed, wrong-direction, wrong-version, and unknown-field input reaches it zero times;
- command-processor ACK/session/result ordering is preserved in emitted Host envelopes;
- inbound ACK produces no ACK loop and no backend command;
- any generation/sequence behavior authorized after preflight is enforced deterministically;
- no network, timer, persistence, Server state, or fake-only production path is introduced.

## Acceptance

- The transport port is narrow enough for a later WebSocket client adapter without containing WebSocket details.
- The ServerConnection core owns only Host-side envelope validation/writing and connection-local facts.
- No handshake, generation, replay, ACK, or reconnect semantics are invented beyond explicit Controller clarification.
- Focused ActorHost tests and static checks pass; root `pnpm verify` preserves all earlier tests and boundaries.
- No Runtime Contract, backend, manifest, dependency, lockfile, entrypoint, or other module change occurs.
- The Coder Report records protocol facts, generation/sequence decisions, validation failure behavior, RED/GREEN evidence, verification, Serena use/fallbacks, and deviations.
- Commit only authorized paths with message `feat: add actor host envelope channel`.

## Controller clarification after preflight

The following first-connection and connection-local rules are frozen for implementation:

- `connection_generation` is a Host connection-attempt generation scoped to one immutable `host_instance_id`. ActorHost starts at generation `1` for that Host process instance and increments once for each new logical transport connection. It never changes during a live connection.
- The future Server Host Gateway remains authoritative for accepting a generation and storing the latest accepted generation. It rejects stale/reused generations. A newly authorized `host_instance_id` starts its own generation at `1`.
- This slice receives one already selected positive generation in `ServerConnection` construction. It does not implement the reconnect controller that increments it.
- The same accepted generation appears on both directions for that logical connection. Structurally valid inbound envelopes with another generation are locally rejected, never ACKed, and never dispatched.
- Sender sequence is independent per direction and per connection generation. The first envelope in each direction has `sender_sequence = 0`; every subsequent envelope is exactly previous plus one.
- Inbound sequence must be contiguous. A duplicate/stale sequence below the next expected value and a gap above it are both local protocol rejections with no ACK and no command dispatch. Replay/idempotent re-ACK across reconnect remains deferred and must use a new accepted connection context later.
- Outbound sequence is allocated together with message ID and timestamp immediately before transport send. If transport send fails, that allocation is considered consumed and the connection enters terminal local `failed` state; it never reuses the message ID or sequence.
- HostHello is the first outbound frame at sequence `0`, carries the configured generation and trusted Host identity, has no causal correlation, and is sent once when the connection core starts.
- HostHello does not wait for an ACK before the Host can receive initialization. Host readiness is represented only by the later `InitializeActorHost → HostReady` flow. A Server ACK for HostHello is ordinary connection/outbox information and receives no ACK loop.
- Before HostHello is sent successfully, inbound messages and ordinary outbound intents are locally rejected. A second start/Hello attempt is locally rejected.
- Decode failure, wrong direction, wrong version, unknown field, wrong generation, stale/duplicate sequence, and sequence gap return distinct Host-local dispositions where locally distinguishable. They emit no HostFault and no ACK. Protocol-version mismatch remains a generic strict decoder failure because the frozen decoder has no stable dedicated result.
- `HostOutboundPayloadSink.send` is refined to return a typed local send result instead of relying on an uncaught transport exception. ServerConnection catches transport failure, records terminal failure, and returns the failure.
- If the receipt ACK for a command cannot be enqueued/sent, ActorHostCommandProcessor returns a local transport-failed disposition and must not invoke BackendSupervisor for that command.
- A later asynchronous session/result send failure records the same terminal connection failure without manufacturing HostFault, retry, outbox, Server state, or an unhandled promise rejection. The backend fact remains Host-local and recovery is deferred.
- Once terminally failed, the connection core accepts no inbound command and emits no further envelope. A future reconnect controller creates a new connection core with the next generation.
- The in-memory transport port accepts complete validated `HostToServerMessage` objects. Serialization to text/binary belongs to the later WebSocket adapter.
- Deterministic providers supply Host message IDs and canonical timestamps. Tests assert exact IDs/timestamps/sequences and never use wall-clock time or randomness.
