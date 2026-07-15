# HOST-transport-001 WebSocket Client Research

- owner: ActorHost
- follows: HOST-connection-001
- affected modules: future ActorHost transport; future Runtime Server Host Gateway
- workflow: W0 + Research
- base reason: this is a read-only external compatibility investigation required before selecting the real local WebSocket transport
- triggered gates: Research: Node 24 and candidate WebSocket library behavior is external, versioned, and not frozen by current project evidence
- product baseline: `1413bcc5a061667d188d3bed6a9a6a47b3251ae2`

## Objective

Recommend the exact first-version ActorHost WebSocket client approach and dependency/version policy using authoritative evidence and bounded local probes, without modifying product code or dependencies.

## Research questions

1. On the pinned Node 24 runtime, what is the stability and exact supported API of the built-in WHATWG-compatible `WebSocket` client?
2. Can the built-in client attach a user-scoped local authentication credential through an HTTP Upgrade header? If not, what credential channels are available and what are their security/operational trade-offs?
3. What are the relevant open/message/error/close/send/close semantics, text-versus-binary behavior, buffering behavior, and failure signals for a deterministic ActorHost adapter?
4. Does the built-in client expose controls needed to disable or bound compression, payload size, handshake timeout, and other first-version safety concerns?
5. Compare the built-in client with the current maintained `ws` release for:
   - custom headers/authentication;
   - ESM and Node 24 compatibility;
   - TypeScript 7/NodeNext type support and whether a separate `@types/ws` package is required;
   - client/server symmetry for the future Runtime Server endpoint;
   - compression defaults and payload/handshake limits;
   - error/close and abort behavior;
   - dependency and maintenance cost.
6. Identify exact versions that should be pinned if `ws` and/or `@types/ws` are recommended. Use package/release metadata current at research time and distinguish runtime from development dependencies.
7. Recommend how ActorHost should carry its restricted credential without URL query leakage and without giving the LLM the Server token.
8. Recommend the narrow adapter boundary between the existing complete-object Host transport port and WebSocket text frames, including JSON parse/serialization ownership and fail-closed behavior.
9. Define a deterministic test strategy: unit tests without network, bounded loopback integration tests, and which real-server behavior should wait for Host Gateway work.
10. List every unresolved product decision that must return to the Controller before implementation.

## Evidence rules

- Prefer Node.js official documentation/source, WHATWG specification where needed, the official `ws` repository/release/package metadata, and official DefinitelyTyped/package metadata.
- Do not rely on tutorials, blog posts, or unsourced recollection for the recommendation.
- Record access date, exact versions, relevant API limitations, and direct source links in the Report.
- Small read-only `node` probes and temporary files outside versioned paths are allowed. Do not install or add a dependency to the repository, edit manifests/lockfile, or leave generated files.
- Do not run a real external WebSocket service, expose a non-loopback listener, or use credentials.
- No Serena memory or `.serena/` inspection. This research does not need product source mutation.
- The temporary Superpowers policy applies. Do not start implementation, write a product plan, dispatch subagents, or request review.

## Write scope

The Researcher may write only:

- `docs/construction/records/actor-host/reports/HOST-transport-001-websocket-client-research.researcher.md`

Commit only that Report with message `research: evaluate actor host websocket client`.

## Acceptance

- The Report gives one primary recommendation and explains why the rejected option is insufficient or unnecessarily heavy.
- Authentication-header capability and credential leakage are explicitly resolved.
- Exact dependency/type versions and Node 24/ESM/TS7 evidence are recorded if a library is selected.
- Adapter ownership, safe defaults, error mapping, and deterministic tests are specific enough for a subsequent construction Task.
- Unknowns are labeled; no product behavior is invented from missing documentation.
- Repository product files, manifests, lockfile, and worktree remain unchanged apart from the committed Researcher Report.
