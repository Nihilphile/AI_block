# Host Gateway Walking Skeleton Construction Plan

> Scope: sequential W3 construction from the accepted ActorHost transport to a deterministic Server-Host-FakeBackend integration.

## 1. Outcome

The milestone proves one authenticated ActorHost can connect to Runtime Server, register one Actor identity, receive initialize/start commands, execute through FakeBackend, and return ACK/session/process facts through the frozen Host protocol.

It does not yet prove Project activation, Actor process spawning, ActorTemplate compilation, Package publication, Run Engine, SQLite persistence, reconnect recovery, heartbeat, or Claude Code.

## 2. Ownership and directory boundaries

```text
apps/runtime-server/
├── src/modules/host-gateway/
│   ├── Host connection/registry/application state
│   └── transport and credential ports
├── src/infrastructure/actor-host-websocket/
│   └── loopback HTTP Upgrade and ws adapter
└── test/
    ├── modules/host-gateway/
    ├── infrastructure/actor-host-websocket/
    └── integration/host-walking-skeleton/
```

- Host Gateway Module owns expected Host identity, live Actor-to-connection registry, accepted generation, directional sequence state, pending command ACK state, and Host facts received from a connection.
- The WebSocket infrastructure adapter owns loopback listener/Upgrade mechanics, header extraction, frame serialization, ws limits, and socket cleanup. It depends inward on Host Gateway ports.
- ActorHost remains a separate process boundary in product architecture, but the deterministic integration test may compose both sides in one test process over a real loopback socket.
- Runtime Contracts remain the only cross-process shared package.
- Runtime Server `main.ts` remains behavior-free until a later composition-root/daemon Task explicitly authorizes startup behavior.

## 3. Sequential slices

### Slice A — Host Gateway core

Implement an in-memory Host Gateway connection/registry core with injected complete-object transport and deterministic ID/time providers.

Prove:

- an already authenticated connection context is bound to Project + Actor + Host instance;
- HostHello must be the first Host frame at generation 1 / sequence 0 and match authenticated identity exactly;
- Server accepts only a newer generation for a known Host instance and remains authoritative for the latest accepted generation;
- Server outbound sequence begins at 0 for each accepted generation;
- receipt ACK is symmetric and receipt-only for non-ACK Host messages;
- Server commands are wrapped, correlated, tracked as pending until Host ACK, and never interpreted as completed execution;
- Ready, SessionReport, InvocationResult, HostFault, Heartbeat, Package publication request, and completion request are surfaced as typed Host facts without mutating another module's state;
- malformed/directional/version/generation/sequence failures fail closed.

No network, credential token parsing, persistence, timers, reconnect loop, or other Server module is introduced.

### Slice B — loopback WebSocket Gateway adapter

Add the exact pinned `ws` server dependency/type policy already researched and used by ActorHost. Implement loopback HTTP Upgrade handling and a credential verifier port.

Prove:

- only `127.0.0.1` and `/actor-hosts/connect` are accepted;
- `Authorization: Bearer` is extracted before Upgrade and resolved to a restricted authenticated Host identity;
- missing/invalid credentials are rejected without token logging or opening a Host Gateway connection;
- compression is disabled, payload limits match ActorHost, binary/malformed/protocol-invalid frames fail closed, and sockets/listeners clean up;
- infrastructure translates JSON text frames only and does not own Host registry/protocol decisions.

Token issuance, persistence, rotation, revocation, TLS, proxies, and remote Host remain deferred. Tests use an injected in-memory verifier with synthetic tokens.

### Slice C — FakeBackend walking-skeleton integration

Compose the real loopback Gateway adapter, ActorHost WebSocket client, ActorHost command processor, BackendSupervisor, and FakeBackend in a deterministic integration fixture.

Prove the exact sequence:

```text
Host connect + HostHello
→ Server receipt ACK
→ Server InitializeActorHost
→ Host receipt ACK + HostReady
→ Server StartInvocation(session=create)
→ Host receipt ACK + SessionReport + InvocationResult
→ Server receipt ACKs for Host facts
```

Then prove one resume Invocation uses the explicit existing session ID. Also prove identity mismatch, busy ActorHost, launch failure, and terminal disconnect are observed without inventing Run Engine decisions.

## 4. Version-one connection rules

- ActorHost proposes generation per immutable Host instance: first 1, incrementing on each logical reconnect.
- Host Gateway authoritatively accepts and records generation. The first skeleton supports generation 1; later reconnect support may accept a strictly larger generation and terminate the older connection.
- Sequence is contiguous per direction/per generation and starts at 0.
- ACK is receipt-only and never execution acceptance or completion.
- HostHello registration is successful only after authenticated identity, Hello identity, generation, and first sequence all match.
- Higher-generation replacement, durable outbox/replay, heartbeat/liveness, and Server restart recovery remain reliability-phase behavior unless a slice explicitly authorizes them.

## 5. Workflow and acceptance placement

- Classification: W3 because this milestone establishes a public cross-process boundary and coordinates Runtime Server with ActorHost.
- Work remains sequential; each Task has one Coder preflight and explicit authorization where its decisions are not mechanical.
- Use a new persistent Runtime Server Coder for Gateway slices. Reuse the ActorHost Coder only if an integration finding requires an ActorHost-owned change.
- Independent Tester runs after Slice C over the integrated milestone, not after every core slice.
- Reviewer runs once after integrated testing and reviews the Host Gateway/ActorHost walking-skeleton boundary as a whole.
- Real Claude behavior is not part of this milestone; any undocumented backend behavior is researched later through focused ClaudeCodeAdapter probes.
