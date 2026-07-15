# HG-core-001 In-memory Host Gateway Core

- owner: Host Gateway
- follows: HOST-connection-001
- affected modules: Runtime Server Host Gateway; Runtime Contracts as a read-only dependency
- workflow: W3
- base reason: this Task establishes the Server side of a public cross-process Host protocol boundary and its authoritative live-connection state
- triggered gates: integrated Independent Test and module Review are placed after the Host Gateway walking-skeleton integration plan, not duplicated on this core slice
- product baseline: `5136609`

## Objective

Implement the transport-independent Runtime Server Host Gateway core: authenticate-by-context registration, HostHello validation, Actor-to-connection registry, envelope generation/sequence enforcement, symmetric receipt ACKs, pending Server-command ACK tracking, and typed Host fact delivery over injected in-memory ports.

## Authorities

- `docs/construction/host-gateway-walking-skeleton-plan.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`
- accepted Runtime Contracts Host protocol
- `docs/construction/superpowers-temporary-authorization.md`

## Write scope

The Coder may modify only:

- `apps/runtime-server/package.json`
- `apps/runtime-server/tsconfig.test.json`
- `apps/runtime-server/src/modules/host-gateway/**`
- `apps/runtime-server/test/modules/host-gateway/**`
- `package.json`
- `pnpm-lock.yaml`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/host-gateway/reports/HG-core-001-in-memory-host-gateway.coder.md`

Do not modify Runtime Server `src/main.ts`, ActorHost, Runtime Contracts, another module/package/app, architecture/design files, or prior construction records.

## Directory responsibility

```text
apps/runtime-server/
├── src/modules/host-gateway/       # Gateway state, protocol application logic, inward ports
└── test/modules/host-gateway/      # deterministic core tests
```

Do not create infrastructure, WebSocket, HTTP, persistence, generic `common/shared/core/utils`, or a public workspace package in this slice.

## Frozen boundaries

- Host Gateway is the Server authority for live Actor-to-Host connection binding, accepted generation, connection-local sequence, pending command ACK state, and Host facts received on that connection.
- Input transport context is already authenticated and contains exact `project_id`, `actor_id`, and `host_instance_id`. Token/header verification belongs to the later WebSocket infrastructure slice.
- The first Host frame must be a valid `HostHelloPayload` at `connection_generation = 1` and `sender_sequence = 0`; Hello identity must exactly match authenticated context.
- The first accepted Server frame is a receipt ACK for HostHello at Server sender sequence 0 and the same generation. Registration becomes live only if that ACK can be sent.
- One Actor has at most one live registered Host connection. Do not silently register a second connection or Host instance.
- This slice accepts only the first generation for a new authenticated Host instance. Higher-generation replacement/reconnect, old-connection termination, replay, and durable reconciliation are deferred.
- After registration, inbound Host sequence is contiguous and generation-exact. Invalid decode/direction/version/generation/sequence/duplicate Hello fails the connection locally with no ACK or Host fact delivery.
- Every valid non-ACK Host payload receives a receipt ACK first. If ACK send fails, do not deliver that Host fact to the application sink.
- A valid Host ACK is never ACKed. It removes exactly one matching pending Server command when present; unknown/duplicate ACK behavior must be surfaced in preflight and frozen before implementation.
- Server outbound commands use the existing Server-to-Host payload union, exact generation, deterministic injected ID/time, contiguous sender sequence, and optional causal correlation.
- Every non-ACK Server command is recorded in an in-memory pending-ACK registry only after successful transport send. Receipt ACK removal does not mean command execution succeeded.
- Server receipt ACK payloads are not themselves tracked as pending.
- HostReady, SessionReport, InvocationResult, HostFault, Heartbeat, PackagePublishRequest, and CompletionRequest are delivered as typed Host facts through an application sink after receipt ACK. This slice stores no Package, completes no Run, persists no session, and makes no Run/Actor state decision.
- HostHello after registration is invalid. Host identity is immutable for the connection.
- Transport failure is terminal for that connection, removes it from the live Actor registry, and creates no retry/reconnect/persistence behavior.
- Complete-object transport only. No JSON serialization, network, HTTP Upgrade, credential token, listener, timer, heartbeat schedule, SQLite, Project activation, Actor spawning, Package routing, Run Engine, Graph, or Claude behavior.
- All IDs/timestamps/transports/fact sinks are deterministic and injected in tests; no sleep, wall clock, randomness, or filesystem process.
- Runtime Contracts import only from package root.
- Add Runtime Server's own exact pinned Vitest development dependency, no-emit test tsconfig, and a clean-state pretest that builds Runtime Contracts with the exact workspace compiler command already established for ActorHost.
- Root `pnpm verify` must run Runtime Server tests and preserve all existing checks.
- Serena memory and `.serena/` inspection are prohibited. Non-memory Serena is allowed; Git/tests/diffs are authoritative.
- Temporary Superpowers role restrictions apply. The Coder performs preflight and authorized implementation only; no separate brainstorm/plan, subagents, or review.

## Coder preflight gate

Before editing, report:

1. current Runtime Server package/build/test topology, exact Host protocol payload/envelope facts, and expected changed files;
2. proposed HostGateway, pending/live connection, complete-object transport, authenticated identity, Host fact sink, ID/clock, and typed local result APIs;
3. exact state transitions from pending transport through Hello registration, live operation, failure, and removal;
4. exact inbound/outbound generation, sequence, ACK-first, pending-command ACK, correlation, and send-failure ordering;
5. handling recommendation for unknown/duplicate Host ACK, second Actor connection, identity mismatch, duplicate Hello, launch/session/result/fault facts, and transport failure;
6. whether all frozen Host payloads can be surfaced losslessly without another Server module, and every contract gap;
7. deterministic RED/GREEN test matrix, clean-state Runtime Server test command, exact manifest/lock/root/checker changes, and root verification impact;
8. every implicit decision or scope conflict, with recommendation for Controller confirmation.

Do not edit until exact `IMPLEMENTATION_AUTHORIZED` is returned.

## Required behavior coverage

Subject to preflight decisions, focused tests must prove:

- valid authenticated Hello registers one Actor connection only after ACK send and exact identity/generation/sequence checks;
- identity mismatch, wrong first payload, wrong generation/sequence, malformed/wrong-direction input, duplicate Hello, and second live Actor connection fail closed;
- Server ACK for Hello is sequence 0 and not tracked pending;
- Server initialize/start/stop/shutdown commands are exact envelopes and tracked pending only after send;
- matching Host ACK removes one pending command and does not claim execution success;
- non-ACK Host facts are ACKed before application delivery and preserve exact payload/correlation;
- ACK send failure prevents fact delivery; command send failure prevents pending registration;
- terminal transport failure unregisters the Actor connection;
- no network, token, persistence, timer, Package/Run mutation, or other module behavior exists.

## Acceptance

- Runtime Server package tests pass from clean generated state and include no-emit TypeScript checking.
- Root `pnpm verify` runs Contracts, ActorHost, Runtime Server, build, boundaries, cleanup, and Git-clean checks.
- Only exact authorized dev-dependency/lock importer changes occur.
- Runtime Server main, Runtime Contracts, ActorHost, and other modules remain unchanged.
- The Coder Report records APIs/state ownership, generation/sequence/ACK decisions, RED/GREEN evidence, manifest/lock audit, verification, Serena use/fallbacks, and deviations.
- Commit only authorized paths with message `feat: add in-memory host gateway core`.

## Controller clarification after preflight

The following module-local decisions are frozen before implementation:

- The complete-object `HostGatewayTransport.send` contract is synchronous and non-reentrant in version one: it either returns after accepting the complete Server envelope or throws, and it never synchronously calls the Gateway receive path from the same send stack. Real WebSocket delivery satisfies this. A future reentrant transport requires an explicit provisional-pending design and is not silently supported here.
- Opening an authenticated transport creates a pending connection only. Reserve both Actor and Host-instance identities while validating the first Hello; commit them to the live indexes only after the Hello receipt ACK sends successfully. Release both reservations on failure.
- Unknown or duplicate Host ACK references are nonfatal `ack_ignored` local results. The valid ACK envelope consumes the expected inbound sequence, emits no response/fact, removes no unrelated pending command, and keeps the connection live.
- A matching ACK removes exactly one pending Server command and returns a local `acknowledged` result. It never marks initialization, Invocation, Run, or execution success.
- Every Server receipt ACK uses `correlation_id = inbound.message_id`. A Server application command uses only an explicitly supplied causal message ID; otherwise its envelope correlation is absent.
- Outbound ID/timestamp/envelope construction failure and transport send failure are terminal. A failed command send creates no pending entry; the allocated outbound identity/sequence attempt is consumed only inside the now-failed connection and is never reused.
- For a valid non-ACK Host fact: validate first, send ACK, consume inbound sequence, then call the fact sink. ACK failure prevents sequence consumption and fact delivery because the connection fails. After ACK succeeds, sequence consumption is final.
- A fact-sink exception becomes typed local `fact_sink_failed`, terminally fails and unregisters the connection, and is never translated to HostFault. The already-sent receipt ACK and consumed sequence are not rolled back.
- Validate every identity field present in a post-Hello payload against authenticated connection context, including HostReady Actor and InvocationResult Project/Actor. Payloads that omit identity are wrapped with the authenticated context for fact delivery; no identity is invented inside the wire payload.
- Unknown/duplicate Hello, identity mismatch, wrong first payload, another live connection for the Actor, or reuse of the Host instance fails the new/offending connection without disturbing an existing live connection.
- Only generation 1 is accepted for this slice. Higher-generation replacement and reconnect remain deferred.
- Terminal failure unsubscribes transport failure observation, removes pending/live reservations and indexes, and discards the in-memory pending-command registry. It performs no retry, replay, persistence, or HostFault emission.
- Runtime Server test scripts mirror the established clean-state pattern exactly: `pretest` is `pnpm --filter @ai-block/runtime-contracts exec tsc -b`; tests and no-emit checking are owned by Runtime Server with exact `vitest@4.1.10` dev dependency.
- Root verification runs Runtime Server tests after ActorHost tests and before boundary checks. The boundary checker uses an explicit Runtime Server manifest/topology policy, not a broad workspace wildcard.
