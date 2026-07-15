# HOST-transport-002 Coder Report

- task: `HOST-transport-002 WebSocket Client Adapter`
- authorization: `d8ad633`; Controller clarification: `7c06363`
- implementation commit: same-as-report
- status: implemented and verified

## Transport API and ownership

`HostTransportPort` remains transport-independent and accepts complete `HostToServerMessage` objects. It now also exposes an idempotent failure subscription:

```ts
interface HostTransportPort {
  send(message: HostToServerMessage): void;
  onFailure(listener: (failure: HostTransportFailure) => void): () => void;
}
```

`ServerConnection` subscribes before transport use. Synchronous send errors remain handled through its existing send path; asynchronous socket errors, `ws.send` callback errors, pre-open failures, and unexpected close failures move the core to terminal `failed` exactly once. No `ws` type, EventEmitter, RawData, ready-state constant, socket, HostFault, InvocationResult, or Server state crosses the core boundary.

`ActorHostWebSocketClient.connect()` returns a typed awaitable result and resolves success only after WebSocket `open` followed by successful `ServerConnection.start()` and HostHello transmission. The client owns `created → connecting → open → failed/closed`, explicit close is terminal `closed` without transport-fault notification, and unexpected or protocol failures are terminal `failed`. There is no reconnect, heartbeat, outbox, or graceful Project deactivation behavior.

The concrete production factory is the only production code importing `ws`. The injected `HostSocketFactory` and `HostSocket` abstractions use project-owned ws-free event/data types.

## Endpoint, credential, and safety policy

- The client accepts only a valid explicit port and constructs `ws://127.0.0.1:<port>/actor-hosts/connect`; credentials, query strings, fragments, alternate paths, non-loopback hosts, and `wss` are therefore not representable.
- Tokens are 1–4096 UTF-8 bytes and must match the frozen ASCII Bearer-safe alphabet with optional trailing `=` padding. Invalid tokens produce generic typed errors without echoing the token.
- Upgrade authentication is `Authorization: Bearer <token>` and never enters the URL, payload, error, thrown error, log, snapshot, or diagnostic output.
- The client uses only typed/documented options: `followRedirects: false`, `perMessageDeflate: false`, `handshakeTimeout: 5000`, and `maxPayload: 4 MiB`.
- Outbound JSON is serialized once as UTF-8 text and sent as exactly one `{ binary: false, compress: false }` frame. `textBytes + socket.bufferedAmount` must be at most 8 MiB; equality is allowed and there is no application queue.
- Inbound binary, malformed JSON, and application-observed payloads over 4 MiB fail before core delivery. Any core decode, direction, version, generation, stale-sequence, or gap rejection terminates the real socket and records typed local protocol failure. A valid ACK/`not_command` remains accepted.
- Successful ws send callbacks can supply `null` at runtime; only non-null callback errors are treated as asynchronous failures.

## Test evidence

The fake-socket suite covers exact URL/header/options, open-before-Hello ordering, one Hello, typed lifecycle/config failures, malformed/binary/oversize input, core rejection termination, boundary-equal and over-limit output, send-before-open/after-close, unexpected response/redirect, socket error/close, synchronous send failure, asynchronous send failure, explicit close, duplicate failure suppression, and token redaction.

The loopback suite binds only `127.0.0.1` on an ephemeral port. It proves Upgrade header delivery, no credential/query, no compression negotiation, valid text round-trip, malformed/binary fail-closed behavior, and `finally` cleanup that terminates clients before awaiting `WebSocketServer.close()`.

RED evidence was provided by the first focused run catching an invalid TypeScript literal annotation and the expected unbuilt Runtime Contracts package entry. After correction, GREEN evidence was:

- `pnpm build`: passed;
- `pnpm --filter @ai-block/actor-host test`: 4 files / 34 tests passed, including `tsc --project tsconfig.test.json --noEmit`;
- `pnpm check:boundaries`: passed.

Final root verification was run after the exact commit and passed: frozen install, build, Runtime Contracts tests/static checks, ActorHost tests/no-emit check, boundary checks, cleanup, and final Git cleanliness checks.

## Changed paths and dependency audit

Changed paths are limited to:

- `apps/actor-host/package.json`
- `apps/actor-host/src/server-connection/server-connection.ts`
- `apps/actor-host/src/server-connection/ws-client.ts`
- `apps/actor-host/test/server-connection/server-connection.test.ts`
- `apps/actor-host/test/server-connection/ws-client.test.ts`
- `pnpm-lock.yaml`
- `scripts/check-workspace-boundaries.mjs`
- this Coder Report

The manifest adds only runtime `ws: 8.21.1` and development `@types/ws: 8.18.1`. The lockfile contains only the corresponding ActorHost importer entries, exact package resolutions/snapshots, and the existing `@types/node` resolution used by `@types/ws`. No optional native addon, transport dependency, Runtime Contract, backend, entrypoint, root manifest, main.ts, or other module changed.

## Serena and fallback record

Used Serena non-memory project instructions, symbol overviews, and code navigation for the existing ServerConnection and command-processor boundaries. Used ordinary PowerShell/Git reads for authoritative task/clarification reads, package and lockfile audit, diffs, tests, build, and verification. No Serena memory calls and no `.serena/` inspection were performed.

## Deviations and concerns

None. The pinned ws runtime and `@types/ws` surface represented the frozen options without casts or undocumented workarounds.
