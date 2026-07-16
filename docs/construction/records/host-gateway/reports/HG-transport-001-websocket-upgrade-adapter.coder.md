# HG-transport-001 WebSocket Upgrade Adapter — Coder Report

- role: coder
- result: implemented
- subject commit: same-as-report

## Result

Implemented the loopback-only authenticated `ws@8.21.1` `noServer` Upgrade adapter for the Runtime Server Host Gateway. The implementation is limited to the authorized Task paths and leaves Runtime Server `main.ts`, ActorHost, Runtime Contracts, Host Gateway core behavior/tests, and deferred modules unchanged.

## API and ownership

- `HostCredentialVerifier` was added to the Host Gateway inward ports. It receives only an opaque parsed bearer token and asynchronously returns either `{ kind: "accepted", identity }` or `{ kind: "rejected", reason: "invalid" | "unavailable" }`.
- `HostGatewayWebSocketAdapter({ gateway, verifier })` owns only the injected HTTP server `upgrade` listener. `attach(server)` returns a typed `{ kind: "attached", detach }` result; duplicate or reattach attempts return `{ kind: "rejected", reason: "already_attached" }`, and post-shutdown attachment returns `{ kind: "rejected", reason: "shutdown" }`. Detach and `shutdown()` are idempotent.
- `handleUpgrade(request, socket, head)` is public for composition-root attachment/testing. No production listener, request handler, non-Upgrade route, or daemon startup was added.
- `shutdown()` detaches the listener, aborts pending verification without an HTTP response, fails active Gateway transports exactly once, terminates sockets, waits for close, and closes the noServer `WebSocketServer`.
- Host Gateway remains the only Runtime Contract/state authority. The adapter only converts one valid JSON text frame to an `unknown` object for `connection.receive()` and serializes complete server messages once.

## Upgrade/authentication policy

The adapter first requires `request.socket.localAddress === "127.0.0.1"` and the exact target `/actor-hosts/connect` with no query. It then parses exactly `Authorization: Bearer <token>` using the ActorHost-safe ASCII grammar and 1–4096-byte token limit. Invalid syntax, arrays, whitespace, Unicode, controls, extra padding, and overlong tokens are rejected before verifier invocation. The token is never placed in a URL, payload, error response, close reason, log, or Gateway identity.

| Condition | Response | Body/close behavior |
| --- | --- | --- |
| Non-loopback request socket or wrong/query path | `404 Not Found` | Empty body, `Content-Length: 0`, `Connection: close`, then raw socket close |
| Missing or malformed Authorization | `401 Unauthorized` | Same empty response and close |
| Verifier `invalid` | `401 Unauthorized` | Same empty response and close |
| Verifier `unavailable`, throw, or 4000 ms deadline | `503 Service Unavailable` | Same empty response and close |
| Synchronous pre-101 `handleUpgrade` failure | `500 Internal Server Error` | Same empty response and close |
| Raw request/socket abort or close during verification | no response | Destroy/close with no `handleUpgrade` call |
| Failure after Upgrade starts | no HTTP response | Terminate/destroy accepted WebSocket |

Verifier settlement has one latch. Every outcome clears the 4000 ms timer and removes request/socket abort listeners. Late verifier fulfillment/rejection is attached and ignored without an unhandled rejection. The deadline is below ActorHost's 5000 ms handshake timeout.

Ordinary non-Upgrade HTTP requests, including the reserved path, remain owned by the future HTTP composition root; this adapter installs no request listener or 426 response.

## WebSocket/wire/state policy

The typed pinned server options are exactly:

```ts
{
  noServer: true,
  path: "/actor-hosts/connect",
  clientTracking: true,
  perMessageDeflate: false,
  maxPayload: 4 * 1024 * 1024,
  skipUTF8Validation: false,
}
```

Inbound frames must be text, valid UTF-8, no larger than the 4 MiB `maxPayload`, and valid JSON. Binary, malformed JSON, UTF-8/size failure, and any Host Gateway rejection terminate the connection. Outbound messages are complete objects serialized once and sent as one text frame with `{ binary: false, compress: false }`; `Buffer.byteLength(frame, "utf8") + socket.bufferedAmount` may equal but may not exceed 8 MiB.

The transport port remains synchronous/non-reentrant. A synchronous serialization/readiness/size/send failure throws through the core send operation and also latches transport failure; a later `ws.send` callback error latches the same failure channel. Socket error, unexpected close, and adapter shutdown use the same transport-failure channel at most once.

After Upgrade, the adapter creates one transport and opens one generation-1 Gateway connection. The Gateway keeps the connection pending until a valid Hello is receipt-ACKed and committed live. The adapter does not interpret ACKs or facts: `acknowledged`, `ack_ignored`, `hello_registered`, and `fact_delivered` results keep the socket live; a rejection or a result observed with `connection.state() === "failed"` marks core terminal and terminates the socket without sending a second transport failure. Gateway transport failure removes pending/live state through the existing core callback.

## Tests and verification performed

- Focused RED first failed because the authorized adapter module did not yet exist; existing Host Gateway tests passed.
- Focused adapter suite: 7 tests passed, covering exact rejection/redaction, malformed and overlong credentials, loopback-address gating, verifier exception/deadline/disconnect races, exact 4000 ms deadline with late fulfillment, attach/detach/reattach/shutdown idempotency, real ephemeral loopback Upgrade with no URL token/query and compression disabled, Hello ACK/live registration, outbound text, binary termination, and Host Gateway core-rejection termination without a protocol error.
- Runtime Server package suite: 2 test files, 15 tests passed; package TypeScript test compilation passed.
- `pnpm --filter @ai-block/runtime-server run test:types` passed under TypeScript 7.0.2.
- `pnpm install --frozen-lockfile` passed with the Runtime Server importer additions only: runtime `ws: 8.21.1`, development `@types/ws: 8.18.1`; existing lockfile package/snapshot entries were reused. No optional native addon or unrelated dependency was added.
- `pnpm build` passed.
- `pnpm check:boundaries` passed after build; the checker now verifies the authorized Runtime Server infrastructure/test topology and exact manifest pins.

## Serena and scope audit

Only non-memory Serena navigation was used for repository topology and source navigation. No Serena memory, `.serena` inspection, subagents, review request, workflow chaining, dependency installation beyond the frozen install check, or unauthorized path was used. No concerns or deviations remain.
