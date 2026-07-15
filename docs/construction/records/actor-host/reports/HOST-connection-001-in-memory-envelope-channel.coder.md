# HOST-connection-001 Coder Report

- task: `HOST-connection-001 In-memory ServerConnection Envelope Channel`
- authorization: `47f859e`; Controller clarification: `0c614b9`
- implementation commit: same-as-report
- status: implemented and verified

## Contract and API inventory

The connection consumes raw `unknown` through the Runtime Contracts package-root `decodeContract(ServerToHostMessageSchema, input)` entrypoint. Strict materialization rejects non-contract values before schema validation; directional unions and all envelope fields remain owned by Runtime Contracts.

The outbound writer creates complete `HostToServerMessage` objects with:

- `protocol_version: HOST_PROTOCOL_VERSION`;
- deterministic injected `message_id`;
- optional `correlation_id` derived only from `HostOutboundIntent.causalMessageId`;
- per-direction sequence;
- configured connection generation;
- deterministic injected canonical timestamp;
- unchanged `HostToServerPayload`.

The transport port accepts complete `HostToServerMessage` objects. It performs no serialization, network I/O, or protocol mutation.

The existing command-processor sink is now typed:

```ts
interface HostOutboundPayloadSink {
  send(intent: HostOutboundIntent): HostOutboundSendResult;
}
```

`ServerConnection` owns the connection-local state and composes the production `ActorHostCommandProcessor` with itself as the outbound sink. Trusted identity is supplied through `HostIdentity` configuration and is mapped to the exact `HostHelloPayload` fields.

## Generation and sequence decisions

`connectionGeneration` is supplied once at construction. The core validates it as a positive safe integer, uses it unchanged for the live connection, and does not implement reconnect progression. The future Server Host Gateway remains the authoritative acceptor and latest-generation owner; a future reconnect controller creates a new core with the next generation.

Outbound and inbound sequences are independent and begin at zero for each core. Inbound envelopes must equal the next expected sequence exactly. Values below it are `sequence_stale`; values above it are `sequence_gap`. Both are local rejections with no ACK, HostFault, or command dispatch. Generation mismatch is likewise rejected locally before sequence acceptance.

HostHello is emitted exactly once by `start()` as outbound sequence zero, with trusted identity, configured generation, deterministic ID/timestamp, and no correlation. Initialization may be received immediately after Hello succeeds; no Hello ACK or readiness wait is implemented. A second start and all work before successful Hello are locally rejected.

## ACK, ordering, and failure behavior

- Valid non-ACK commands retain the existing processor semantics: receipt ACK first, then readiness/fault or session/result facts.
- A receipt ACK send failure returns `transport_failed` from the processor and prevents any BackendSupervisor dispatch.
- Inbound Server ACK is accepted as a connection/outbox fact and returns `not_command`; it is never ACKed or sent to BackendSupervisor.
- Decode failures, wrong direction, wrong version, unknown fields, wrong generation, stale sequence, and sequence gaps emit no wire response.
- Outbound correlation is envelope-only; payloads are never mutated with envelope fields.
- Any transport/provider/envelope-validation failure consumes the allocated outbound sequence/ID attempt, records terminal `failed` state, and returns a typed local transport failure. No retry, outbox, HostFault, Server state, or reconnect behavior is created.
- Once failed, the core accepts no inbound command and emits no further envelope.
- Session/result observers attach rejection handlers, and asynchronous send results are handled without unhandled promise rejections. A later session/result send failure has the same terminal behavior while preserving the backend fact locally.

## RED/GREEN evidence

RED evidence:

- Before the connection source existed, the focused Vitest suite failed during package/source resolution for the new ServerConnection implementation.

GREEN evidence before commit:

- `pnpm build`: passed.
- `pnpm --filter @ai-block/actor-host test`: 3 files / 24 tests passed, including no-emit static checking.
- `pnpm check:boundaries`: passed with exact source/test topology and package-root probes.

Focused tests cover deterministic Hello envelopes, causal correlation, strict inbound rejection, contiguous generation/sequence enforcement, ACK/session/result ordering, inbound ACK suppression, receipt-ACK dispatch prevention, terminal asynchronous send failure, and absence of network/timer/persistence behavior.

## Changed paths and scope audit

Changed paths are limited to:

- `apps/actor-host/src/server-connection/command-processor.ts`
- `apps/actor-host/src/server-connection/server-connection.ts`
- `apps/actor-host/test/server-connection/command-processor.test.ts`
- `apps/actor-host/test/server-connection/server-connection.test.ts`
- `scripts/check-workspace-boundaries.mjs`
- this Coder Report

Unchanged: Runtime Contracts, BackendSupervisor, FakeBackend, manifests, lockfile, `main.ts`, other applications/packages, architecture/design files, network transports, heartbeat, reconnect controller, persistence, authentication, replay, and outbox behavior.

## Serena and fallback record

Used Serena non-memory symbol navigation for the existing command processor and new ServerConnection API. Used ordinary PowerShell/Git reads and searches for authoritative task/clarification reads, Runtime Contract inspection, diffs, tests, build, boundaries, and worktree evidence. No Serena memory calls and no `.serena/` inspection were performed.

## Deviations and concerns

None. The clarification is implementable without Runtime Contract, backend, manifest, entrypoint, or architecture changes.
