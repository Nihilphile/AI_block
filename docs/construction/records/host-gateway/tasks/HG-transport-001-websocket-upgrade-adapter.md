# HG-transport-001 WebSocket Upgrade Adapter

- owner: Host Gateway infrastructure
- follows: HG-core-001
- affected modules: Runtime Server Host Gateway; Runtime Server infrastructure; Runtime Contracts as read-only dependency
- workflow: W3 + Compatibility
- base reason: this Task exposes the Server side of the public Host protocol boundary through a real authenticated HTTP Upgrade adapter
- triggered gates: Compatibility: exact ws/type dependency and Node 24 HTTP Upgrade behavior; Research already satisfied by HOST-transport-001; integrated Independent Test/Review remain placed after walking-skeleton Slice C
- product baseline: `5389694`

## Objective

Implement a loopback-only, `noServer` WebSocket Upgrade adapter that authenticates a Host-scoped bearer credential, creates a Host Gateway pending connection, and translates JSON text frames to/from the existing complete-object Host Gateway transport port.

## Authorities

- `docs/construction/host-gateway-walking-skeleton-plan.md`
- `docs/construction/records/actor-host/reports/HOST-transport-001-websocket-client-research.researcher.md`
- accepted ActorHost WebSocket adapter policy and tests
- current Host Gateway core/ports
- `docs/construction/phase-1-architecture-invariants.md`
- `runtime-system-architecture-v0.1.md`
- `docs/construction/superpowers-temporary-authorization.md`

## Write scope

The Coder may modify only:

- `apps/runtime-server/package.json`
- `apps/runtime-server/src/modules/host-gateway/ports.ts`
- `apps/runtime-server/src/infrastructure/actor-host-websocket/**`
- `apps/runtime-server/test/infrastructure/actor-host-websocket/**`
- `pnpm-lock.yaml`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/host-gateway/reports/HG-transport-001-websocket-upgrade-adapter.coder.md`

Do not modify Host Gateway core behavior/tests, Runtime Server `main.ts`, ActorHost, Runtime Contracts, root manifest, another Server module, architecture/design files, or prior records.

## Directory and composition boundary

```text
apps/runtime-server/src/
├── modules/host-gateway/ports.ts
└── infrastructure/actor-host-websocket/
    └── authenticated noServer Upgrade adapter

apps/runtime-server/test/infrastructure/actor-host-websocket/
└── fake verifier/socket and bounded loopback tests
```

- The adapter attaches to an injected Node HTTP server's `upgrade` boundary or exposes a handler that a future composition root attaches.
- It must use `WebSocketServer({ noServer: true })`; it does not create the production Runtime Server listener or choose the daemon port.
- Tests may create one ephemeral `127.0.0.1` HTTP server and must close it deterministically.

## Frozen dependency and transport policy

- Add exact `ws@8.21.1` Runtime Server runtime dependency and exact `@types/ws@8.18.1` development dependency.
- Do not add optional native addons or another HTTP/WebSocket/serialization/auth dependency.
- Accept Upgrade only for the exact request target `/actor-hosts/connect` with no query/fragment and only through a loopback-bound injected server. The adapter rejects alternate paths and does not implement redirects.
- WebSocket format is JSON text only. `perMessageDeflate: false`; maximum aggregate inbound payload 4 MiB; maximum outbound UTF-8 frame bytes plus socket `bufferedAmount` 8 MiB; equality allowed.
- Binary, malformed JSON, oversize, schema/direction/version/generation/sequence/core rejection, asynchronous send failure, socket error, and unexpected close terminally fail the connection and notify Host Gateway transport failure exactly once.
- Infrastructure never constructs or interprets Runtime Contract payloads beyond JSON text/object translation; Host Gateway core remains the only protocol/state authority.

## Frozen authentication boundary

- Parse exactly `Authorization: Bearer <token>` from the HTTP Upgrade request before calling `handleUpgrade`.
- Token grammar/size exactly matches ActorHost: 1–4096 bytes, Bearer-safe ASCII alphabet with optional trailing `=` padding; no whitespace, Unicode, controls, CR/LF, or other syntax.
- Add a Host Gateway inward `HostCredentialVerifier` port that receives only the opaque token and returns an authenticated `project_id`, `actor_id`, and `host_instance_id` context or a typed rejection.
- Verifier may be asynchronous because future Server state lookup is not an infrastructure concern. The adapter must handle socket closure/failure while verification is pending without leaking or double-upgrading.
- Synthetic in-memory verifier exists only in tests. Token issuance, hash/storage, expiry, rotation, revocation, Project desired state, Actor process ownership, and persistent credential repository are deferred.
- Missing/malformed/rejected credential, wrong path, or non-Upgrade request is rejected before WebSocket acceptance with a minimal HTTP error response and closed socket. Exact status mapping is closed after preflight.
- Never put token in URL, payload, error, exception, diagnostic, log, close reason, test snapshot, or Host Gateway context. Do not pass it past the verifier.

## Frozen adapter lifecycle

- After successful verification and Upgrade, create one complete-object transport and call Host Gateway open/pending connection with the authenticated context.
- The socket is not registered live until Host Gateway receives and ACKs valid HostHello according to HG-core-001.
- Host Gateway local rejection results terminally close/terminate the socket; infrastructure does not emit HostFault.
- Outbound complete Server messages serialize once to one text frame with explicit `{ binary: false, compress: false }` behavior where supported.
- Transport send is synchronous/non-reentrant at the module port. Async `ws.send` callback failure notifies the failure listener later.
- Explicit test/server shutdown closes sockets without manufacturing protocol facts. Unexpected close is terminal transport failure.
- No reconnect, heartbeat/ping scheduler, durable outbox, ACK retry, connection replacement, higher generation, TLS/proxy, remote host, Package/Run handling, or Server daemon startup.
- Root verification automatically runs the new tests and leaves no listener/socket/generated output.
- Serena memory and `.serena/` inspection prohibited; non-memory Serena allowed; Git/tests/diffs authoritative.
- Temporary Superpowers role restrictions apply.

## Coder preflight gate

Before editing, report:

1. exact Node HTTP Upgrade and pinned `ws` noServer APIs/types/options/events required;
2. current Host Gateway open/transport/failure/result APIs and minimum inward-port addition for async credential verification;
3. proposed Upgrade adapter, verifier, ws-free transport, request/socket lifecycle, and attach/detach APIs;
4. precise status/closure behavior for wrong path, missing/malformed/rejected credential, verifier exception, client disconnect during verification, handleUpgrade failure, core registration rejection, protocol failure, send failure, and explicit shutdown;
5. byte/buffer/text/binary/JSON behavior and secret redaction boundary;
6. deterministic fake-verifier/unit and bounded loopback integration tests, including cleanup without sleeps;
7. exact changed files, dependency/lock importer delta, TypeScript/root/boundary effects;
8. every implicit decision, external mismatch, or scope conflict with Controller recommendation.

Do not edit until exact `IMPLEMENTATION_AUTHORIZED` is returned.

## Acceptance

- Exact dependencies install and compile under Node 24/TS7 NodeNext; no native addon is added.
- Unit tests prove pre-Upgrade auth/path rejection, async verifier races, token redaction, ws options, text/binary/JSON/limit behavior, core-rejection termination, send/error/close failure idempotency, and attach/detach cleanup.
- Loopback tests use one ephemeral `127.0.0.1` HTTP server and the real ActorHost-compatible ws client shape to prove successful Upgrade auth, no URL token/query, no compression, Hello registration, strict rejection, and complete cleanup.
- Existing Host Gateway core, ActorHost, and Runtime Contracts tests remain green.
- Runtime Server main and every deferred module/lifecycle concern remain unchanged.
- Root `pnpm verify` passes and leaves the worktree clean.
- Coder Report records APIs/statuses/error boundaries, exact options, tests, dependency/lock audit, verification, Serena use/fallbacks, and deviations.
- Commit only authorized paths with message `feat: add host gateway websocket adapter`.

## Controller clarification after preflight

The following HTTP, timeout, and failure rules are frozen before implementation:

- Wrong Upgrade path returns `404 Not Found`; missing/malformed Authorization and verifier `invalid` return `401 Unauthorized`; verifier `unavailable`, verifier exception, and verifier deadline return `503 Service Unavailable`; a synchronous pre-101 `handleUpgrade` failure returns `500 Internal Server Error`.
- Every pre-Upgrade HTTP rejection has an empty body, `Content-Length: 0`, `Connection: close`, no `WWW-Authenticate`, no diagnostic detail, and then closes the raw socket. Never echo token, verifier reason, stack, identity, or internal error.
- If the raw socket/request disconnects or aborts during verification, write no response and never call `handleUpgrade`. If failure occurs after Upgrade has begun, no HTTP response is attempted; terminate/destroy the accepted socket.
- Ordinary non-Upgrade HTTP requests, including an ordinary request to the reserved path, remain the future HTTP composition root's responsibility. This adapter owns only the injected server's `upgrade` listener; it does not add a request handler or 426 route.
- Credential verification deadline is 4,000 ms, intentionally below the ActorHost client's 5,000 ms handshake timeout so the Server can deterministically return 503 first.
- Verification uses one idempotent settlement latch. The 4-second timer is cleared on every completion and may be `unref`ed; request/socket abort/error/close listeners are removed. Late verifier fulfillment/rejection is observed and ignored without unhandled rejection. Tests use fake timers/event promises, never real waits.
- `attach(server)` installs only one Upgrade listener and returns an idempotent detach operation. Reattach/double attach is a typed local rejection. `shutdown()` stops new upgrades, settles pending verification, terminates active sockets, unregisters Gateway connections through the transport-failure channel, closes the noServer WebSocketServer, and is idempotent.
- Maintain separate idempotent latches for adapter terminal socket state and transport failure notification. Independent socket/send/close failures notify Host Gateway at most once.
- When `HostGatewayConnection.receive()` returns a rejection or a result whose core already terminally failed/unregistered the connection, adapter terminates the socket only and does not send a second failure notification. Valid registered/fact/acknowledged/ack_ignored results keep the socket live.
- Check `request.socket.localAddress === "127.0.0.1"` before authentication/Upgrade. Other local-address forms, IPv6 loopback, proxies, and remote hosts are deferred and rejected in this slice.
- Use only typed pinned server options: `noServer: true`, exact path, `clientTracking: true`, `perMessageDeflate: false`, `maxPayload: 4 MiB`, and UTF-8 validation enabled. Do not cast in type-missing ws options.
