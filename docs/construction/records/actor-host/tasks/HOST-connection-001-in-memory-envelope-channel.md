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
