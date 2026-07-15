# HOST-transport-001 WebSocket Client Research Report

- role: Researcher
- task: HOST-transport-001-websocket-client-research.md
- research date: 2026-07-16
- product implementation: none
- access date for external sources: 2026-07-16

## Recommendation

Select the maintained ws package for the first ActorHost WebSocket client and the future Runtime Server Host Gateway, with exact pins ws@8.21.1 (runtime dependency) and @types/ws@8.18.1 (development dependency). Keep perMessageDeflate: false, set an explicit finite handshakeTimeout, set an explicit maxPayload appropriate to the Host envelope limit, set followRedirects: false, and do not enable optional native addons. The existing Node 24 baseline remains the runtime pin (>=24 <25; the bounded local probe ran on Node v24.14.1).

This is one dependency, but it is justified by the security and determinism requirements: ws accepts the HTTP request options used for custom Upgrade headers, exposes handshake/payload/buffer/close controls, and provides both client and server implementations with the same protocol behavior. Node's built-in client avoids the dependency but cannot meet the required restricted-header authentication boundary or the first-version safety controls from its documented API.

## Current ActorHost boundary

The current ServerConnection owns complete-object protocol behavior: it validates HostToServerMessage and ServerToHostMessage, sequences envelopes, and calls HostTransportPort.send(message). Its receive path accepts an unknown and returns a deterministic rejection or command disposition. The future adapter should therefore implement only the transport port and socket lifecycle:

1. serialize one already-validated outbound envelope with JSON.stringify and send one WebSocket text message;
2. accept only text inbound messages, parse JSON, and pass the parsed value to ServerConnection.receive;
3. let Runtime Contracts/ServerConnection own schema validation and protocol sequencing;
4. convert parse failures, binary frames, socket errors, handshake failures, timeout, oversize, and unexpected close into the Host connection failure/reconnect boundary without treating them as valid protocol messages.

The adapter must not compose Packages, interpret Actor commands, create backend sessions, or give the LLM any Server credential. No wire behavior beyond this boundary is invented by this report.

## Evidence: Node 24 built-in WebSocket

Node documents the global WebSocket as a browser-compatible client. It was added in v21.0.0/v20.10.0 and became non-experimental in v22.0.0; the Node 24 documentation carries that non-experimental status. The supported WHATWG surface is URL plus optional subprotocols, event handlers (open, message, error, close), send, close, readyState, bufferedAmount, binaryType, and protocol. Source: [Node.js v24 Global objects, WebSocket](https://nodejs.org/download/release/latest-v24.x/docs/api/globals.html#class-websocket) (accessed 2026-07-16).

The built-in client has no documented equivalent of ws's third options argument, http.request options, headers, handshakeTimeout, maxPayload, maxBufferedChunks, maxFragments, followRedirects, or perMessageDeflate control. A bounded local probe on Node v24.14.1 confirmed the global and ready-state constants (0/1/2/3); it did not use credentials or a listener outside loopback. Passing an object as the second argument is not evidence of support: the documented argument is the subprotocol list, and undocumented extra arguments/options must not be relied on.

Consequences:

- A bearer in the URL query is the only obvious built-in-only application channel, but it leaks into access logs, proxy logs, diagnostics, copied URLs, and redirect history. It is rejected for this task.
- A bearer in the first application message is not handshake authentication, permits an unauthenticated socket, and exposes a credential-bearing protocol message to replay/logging paths. It is rejected for the first version.
- A WebSocket subprotocol is negotiated in Sec-WebSocket-Protocol, but it is a protocol selector, not a good bearer channel; it is visible in handshake metadata and has interoperability/semantic coupling. It is not recommended for the credential.
- A custom Authorization or dedicated restricted header on the HTTP Upgrade is the required channel. The built-in client cannot provide it through its documented API.

The built-in client also does not expose a documented payload-size, handshake-deadline, redirect, compression, or queued-send policy. bufferedAmount is observational, not a bounded queue. Those omissions are material for a long-lived Host connection.

## Evidence: ws comparison

The official ws README describes a Node client and server, reports Autobahn client/server coverage, and shows ESM imports (import WebSocket, { WebSocketServer } from 'ws'). Source: [websockets/ws README](https://github.com/websockets/ws) (accessed 2026-07-16).

The official API documents new WebSocket(address[, protocols][, options]). Its client options include any http.request/https.request option, so a future adapter can provide a dedicated restricted Upgrade header without putting the credential in the URL. It also documents finishRequest for last-minute header customization and redirect handling. Source: [ws API documentation](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket) (accessed 2026-07-16).

The same API documents client/server symmetry through WebSocketServer, handleUpgrade, connection, message, open, error, close, and server-side inspection of the HTTP request. This matches the future Server Host Gateway better than the client-only built-in surface. The adapter should still use the common lowest-level event semantics, not expose ws types through the Host port.

Safety and behavior relevant to this task:

- perMessageDeflate is enabled by default on the ws client and disabled by default on its server; the official README warns of performance/memory overhead. Set it to false on the client and future server unless a later decision explicitly requires compression.
- maxPayload defaults to 100 MiB and is configurable on client/server. Set a smaller explicit limit based on the Host envelope policy; do not inherit the 100 MiB default.
- handshakeTimeout is configurable; set a finite explicit value and map expiry to a failed connection attempt.
- maxBufferedChunks, maxFragments, and bufferedAmount support observable/bounded behavior. The adapter should reject or fail closed when its own queued outbound byte budget is exceeded rather than allowing unbounded application buffering.
- followRedirects defaults to false. Keep it false so a credential cannot be forwarded to an unintended origin.
- closeTimeout allows bounded graceful close; terminate() is the forced-close path for timeout/failure.
- message provides data plus isBinary; text is naturally handled as UTF-8, while binary must be rejected by this JSON-only adapter. error, unexpected-response, close, and the documented error codes provide failure signals. A close event is not by itself a successful protocol completion.
- ws documents WS_NO_BUFFER_UTIL and WS_NO_UTF_8_VALIDATE; do not enable optional native addons for this first version. Keeping UTF-8 validation enabled is the safer default.

Sources: [ws client/server API and options](https://github.com/websockets/ws/blob/master/doc/ws.md) and [ws compression guidance](https://github.com/websockets/ws#websocket-compression) (accessed 2026-07-16).

## Exact versions and TypeScript/ESM policy

Bounded read-only npm metadata probes on 2026-07-16 returned:

| Package | Exact version | Role | Evidence |
| --- | ---: | --- | --- |
| ws | 8.21.1 | runtime dependency | npm latest dist-tag |
| @types/ws | 8.18.1 | development-only type dependency | npm latest dist-tag |
| @types/node | existing 24.13.3 | existing Node/DOM types | repository manifest |
| typescript | existing 7.0.2 | existing compiler | repository manifest |

Sources: [ws npm metadata](https://registry.npmjs.org/ws/latest), [@types/ws npm metadata](https://registry.npmjs.org/@types/ws/latest), and [DefinitelyTyped package guidance](https://github.com/DefinitelyTyped/DefinitelyTyped#how-do-types-packages-relate-to-versions-of-the-corresponding-library) (accessed 2026-07-16). The probes did not install packages or alter the repository.

ws@8.21.1 declares Node >=10.0.0, exports ESM through ./wrapper.mjs and CommonJS through ./index.js, and does not ship its own types field. Therefore an ESM package with type: module can use the documented default ESM import, while TypeScript needs @types/ws. @types/ws@8.18.1 supplies index.d.ts and depends on @types/node; the repository already pins @types/node for Node 24. The metadata does not prove every TypeScript 7 feature, so the subsequent implementation Task must run the repository's TypeScript 7 NodeNext type check against the exact pins before acceptance.

## Credential recommendation

Use a per-ActorHost restricted credential in an HTTP Upgrade header, preferably a dedicated header name or Authorization: Bearer <host-scoped-token> after the Controller chooses the exact contract. Construct the socket with a ws option that sets the header, never include it in the URL, never log the options/URL with the secret, and keep it in the connection adapter's private configuration. The Server Gateway must authenticate that header before accepting the connection and must not send the Server token to the LLM or backend process.

Redirects remain disabled. TLS policy, certificate validation, token rotation/expiry, header name, and whether the credential is a bearer or another proof are unresolved Controller decisions, not adapter inventions.

## Deterministic test strategy

Unit tests should use a fake socket factory and fake ws-shaped event source/sink. Cover JSON serialization, text-only acceptance, binary rejection, malformed JSON, schema rejection delegation, send-before-open, send-after-close, send queue byte bound, open/error/close transitions, handshake timeout, oversize failure, forced termination, and redaction/no-secret logging. These tests need no network.

Loopback integration tests may bind only 127.0.0.1 on an ephemeral port with a local WebSocketServer. Assert the Upgrade header is received, the query string has no credential, compression is not negotiated, text envelopes round-trip, binary is rejected, malformed/oversize inputs fail closed, handshake timeout/401-like unexpected response is deterministic, and close/terminate behavior is bounded. Do not use external services or credentials.

Defer real Runtime Server behavior until Host Gateway work: authoritative authentication/authorization, generation assignment, heartbeat policy, ACK reconciliation, reconnect/backoff, duplicate/stale connection handling, token rotation, TLS/proxy deployment policy, and Server-side close codes. The loopback test is transport evidence, not proof of those Server decisions.

## Residual Controller decisions

1. Confirm ws@8.21.1 plus @types/ws@8.18.1 as exact pins and whether optional dependencies are prohibited by policy.
2. Choose the exact Upgrade authentication header and credential proof format.
3. Define credential issuance, scope (Actor/Project/Host instance), expiry, rotation, revocation, and process-memory handling.
4. Define the WebSocket endpoint URL/path and whether ws/wss only is permitted; decide TLS certificate and proxy policy.
5. Set the concrete handshake timeout, maximum envelope bytes, maximum outbound queued bytes, maximum fragments/buffered chunks, graceful close timeout, reconnect/backoff, and jitter limits.
6. Decide the Host heartbeat/ping ownership and whether application heartbeats are distinct from WebSocket ping/pong.
7. Decide the Server close-code/error mapping and whether authentication failures are retryable.
8. Define the Host Gateway's connection-generation and ACK/replay behavior across reconnects.
9. Confirm that the wire contract is JSON text only, with no binary envelope or compression in the first version.
10. Confirm the implementation's TypeScript 7 NodeNext import/type-check acceptance and the exact package manifest placement.

## Decision summary

Primary recommendation: use ws@8.21.1 with @types/ws@8.18.1, explicit safety limits, perMessageDeflate: false, redirects disabled, and a restricted HTTP Upgrade credential. Rejected alternative: Node 24 built-in WebSocket; it is attractive for zero dependency cost and WHATWG symmetry, but its documented client API lacks the required custom-header authentication and deterministic transport safety controls. No product implementation was performed.
