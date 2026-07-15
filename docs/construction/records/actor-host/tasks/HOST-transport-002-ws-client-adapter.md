# HOST-transport-002 WebSocket Client Adapter

- owner: ActorHost
- follows: HOST-transport-001
- affected modules: ActorHost; Runtime Contracts as a read-only dependency
- workflow: W2 + Compatibility
- base reason: this Task adds one bounded real transport adapter inside ActorHost
- triggered gates: Compatibility: adds exact runtime/type dependencies and validates Node 24, ESM, TypeScript 7 NodeNext, and loopback WebSocket behavior; Research satisfied by HOST-transport-001
- product baseline: `783f4a2`

## Objective

Implement the first real ActorHost WebSocket client adapter behind the existing transport-independent ServerConnection port, with explicit authentication and safety limits and deterministic fake-socket plus loopback tests.

## Authorities

- `docs/construction/records/actor-host/reports/HOST-transport-001-websocket-client-research.researcher.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `runtime-system-architecture-v0.1.md`
- current ServerConnection and command-processor behavior
- `docs/construction/superpowers-temporary-authorization.md`

## Write scope

The Coder may modify only:

- `apps/actor-host/package.json`
- `apps/actor-host/src/server-connection/**`
- `apps/actor-host/test/server-connection/**`
- `pnpm-lock.yaml`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/actor-host/reports/HOST-transport-002-ws-client-adapter.coder.md`

Do not modify Runtime Contracts, BackendSupervisor/FakeBackend, root manifest, `main.ts`, another app/package, architecture/design files, earlier Task/Reports, or Server product code.

## Frozen dependency and endpoint policy

- Add exact `ws@8.21.1` as an ActorHost runtime dependency.
- Add exact `@types/ws@8.18.1` as an ActorHost development dependency.
- Do not add optional native addons or another transport/serialization dependency.
- First-version endpoint is exactly `ws://127.0.0.1:<configured-port>/actor-hosts/connect` with a valid explicit port. Reject credentials, query parameters, fragments, alternate paths, non-loopback hosts, `wss`, and redirects in this slice.
- `followRedirects: false` and `perMessageDeflate: false` are explicit.
- Handshake timeout is 5,000 ms.
- Maximum inbound WebSocket payload is 4 MiB measured in bytes.
- Maximum application outbound buffered amount is 8 MiB measured in UTF-8 bytes plus current socket `bufferedAmount`.
- Wire format is one complete Runtime Contract envelope per WebSocket text message encoded as UTF-8 JSON. Binary messages are rejected.

## Frozen credential boundary

- Use `Authorization: Bearer <opaque-host-token>` on the HTTP Upgrade request.
- The adapter receives the token through private trusted Host process configuration. It never derives it from an LLM, Package, prompt, URL, inbound frame, or persisted protocol payload.
- Reject an empty token, CR/LF, or a token too large for the bounded local header policy. Preflight recommends a concrete maximum before implementation.
- Never include the token in URL/query, payload, error message, thrown error, test snapshot, diagnostic object, or log output.
- The token is intended to be scoped by the future Server to Project + Actor + Host instance. Issuance, expiry, rotation, revocation, persistence, and Server validation are deferred and must not be invented by this adapter.

## Frozen adapter boundary

- `ws` types and events remain inside the concrete adapter. Existing ServerConnection/Backend/command APIs do not expose `ws` classes.
- Outbound: accept a complete validated `HostToServerMessage`, serialize with JSON text, enforce the byte/buffer limit, and send exactly one text frame.
- Inbound: accept text only, parse JSON once, and deliver parsed `unknown` to `ServerConnection.receive`, which remains the sole Runtime Contract/schema/generation/sequence decoder.
- Malformed JSON, binary data, oversize input, unexpected response, handshake timeout, socket error, unexpected close, send-before-open, send-after-close, buffered-limit breach, or asynchronous send failure crosses the existing Host connection-failure boundary. It does not become HostFault, InvocationResult, Package, or Server state.
- The adapter must give ServerConnection a deterministic terminal failure signal for asynchronous socket/send failure. It must not rely on an unhandled callback/Promise error or silently continue accepting commands.
- Opening a socket and starting ServerConnection/HostHello are distinct but composed in an exact order: successful WebSocket open first, then connection core start sends HostHello.
- No automatic reconnect, backoff, heartbeat/ping ownership, durable queue/outbox, ACK replay, token refresh, graceful Project deactivation, or real Server Host Gateway is implemented.
- No production listener is added. Loopback `WebSocketServer` exists only inside tests and binds `127.0.0.1` on an ephemeral port.
- Unit tests use an injected socket factory/event surface and no network or wall-clock sleeps. Loopback integration tests are bounded transport evidence and use no external service or real credential.
- Root `pnpm verify` must include all tests/static checks and leave no listener or generated output.
- Serena memory and `.serena/` inspection are prohibited. Non-memory Serena is allowed; Git/tests/diffs remain authoritative.
- Temporary Superpowers role limits apply; no separate brainstorm/plan, subagent dispatch, or review workflow.

## Coder preflight gate

Before editing, report:

1. exact `ws` constructor/events/options/type APIs at the pinned versions as they affect this adapter;
2. the current `HostTransportPort` and ServerConnection failure API, and the minimum API refinement required for open, inbound delivery, close/error, and asynchronous send failure;
3. proposed concrete adapter/config/socket-factory APIs without leaking `ws` types into the existing core;
4. exact state machine from created → connecting → open → failed/closed, and how HostHello starts once;
5. byte accounting, outbound buffer checks, token validation/redaction, JSON/text/binary behavior, and every error mapping;
6. whether `ws` exposes each frozen safety option exactly as assumed; identify any unsupported option rather than emulating undocumented behavior;
7. deterministic fake-socket and bounded loopback test matrix, cleanup guarantees, expected changed files, dependency/lock delta, and root verification;
8. every implicit decision, external mismatch, or scope conflict, with a recommendation for Controller confirmation.

Do not edit until exact `IMPLEMENTATION_AUTHORIZED` is returned.

## Acceptance

- Exact dependency pins install reproducibly and TypeScript 7 NodeNext compiles the ESM adapter.
- Fake-socket tests cover open/Hello ordering, exact headers/options, text serialization/parsing, binary/malformed rejection, byte/buffer limits, close/error/async send failures, terminal failure propagation, and secret redaction without sleeps.
- Bounded loopback tests prove the Upgrade Authorization header arrives, URL contains no credential/query, compression is not negotiated, valid text envelopes round-trip, binary/malformed input fails closed, and resources always close.
- Existing generation, sequence, ACK, session/result, and terminal failure behavior remains green.
- No reconnect, heartbeat, Server Gateway, Runtime Contract, backend, entrypoint, or other module behavior is added.
- Root `pnpm verify` passes and cleans generated output/listeners.
- The Coder Report records API refinements, state/error model, exact option evidence, RED/GREEN tests, dependency/lock audit, verification, Serena use/fallbacks, and deviations.
- Commit only authorized paths with message `feat: add actor host websocket transport`.
