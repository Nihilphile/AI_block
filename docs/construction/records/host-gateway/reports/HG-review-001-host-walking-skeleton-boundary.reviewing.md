# HG-review-001 Host Walking-Skeleton Boundary — Reviewing Report

- work: reviewing
- result: completed
- subject: `dd2c6c151b26e836bffb4af9aa1968c9df173aa5`

## Verdict

**FAIL — do not close the milestone yet.** The accepted integrated evidence is green for the exercised scenarios, but the review found two high-severity boundary/liveness defects and two medium-severity maintainability/failure-disconnect defects that make the boundary unsafe to consume for ClaudeCodeAdapter work.

## Findings by severity

### High

1. **Authenticated Host identity is not bound to initialization or invocation before backend execution.**

   - **Location/evidence:** `apps/actor-host/src/server-connection/server-connection.ts:28-32` holds the trusted Project/Actor/Host identity, but `apps/actor-host/src/server-connection/command-processor.ts:75-90` forwards any contract-valid `launch_spec` to the supervisor without comparing its `project_id` or `actor_id` to that identity. `apps/actor-host/src/backend/supervisor.ts:80-105` accepts the first launch spec without an external identity check; `:115-117` only checks a start invocation against that potentially mismatched stored launch spec. The Server-side post-fact checks in `apps/runtime-server/src/modules/host-gateway/host-gateway.ts:280-289` occur only when facts are returned.
   - **Consequence:** A correctly authenticated connection for Actor A can be driven by a misbound Server command to initialize and execute an Actor B launch spec. The result may be rejected later, but backend/configuration work has already occurred in the wrong Host identity and the Host can become bound to the wrong static snapshot.
   - **Required correction:** Bind the trusted `HostIdentity` into the command/supervisor boundary and reject mismatched `InitializeActorHost` and `StartInvocation` payloads before calling the backend. Preserve receipt-only ACK, then emit a stable HostFault (or the explicitly approved fail-closed connection disposition); add tests proving no adapter initialization/start occurs for Project/Actor mismatches. The Gateway command path should also validate identity-bearing command payloads where their contracts provide those fields.

2. **Backend promise failures are swallowed and can leave an invocation permanently active.**

   - **Location/evidence:** `apps/actor-host/src/backend/adapter.ts:22-26` exposes rejecting-capable `session`, `completion`, and `stop()` promises. In `apps/actor-host/src/backend/supervisor.ts:146-169`, the result chain awaits `session` without a rejection path and calls `finish()` only after successful completion; `:200-203` explicitly discards an asynchronous `stop()` rejection. `apps/actor-host/src/server-connection/command-processor.ts:104-121` attaches no-op rejection handlers to both session and result observers.
   - **Consequence:** A ClaudeCodeAdapter session-discovery, process-completion, or stop failure can produce neither a terminal InvocationResult nor a HostFault, while the supervisor remains `running` or `stopping`. The Host then stays busy indefinitely and the Server has no fact from which to fail or release the corresponding invocation.
   - **Required correction:** Define and enforce a non-throwing failure mapping at the adapter/supervisor boundary, or catch every session/completion/stop rejection and convert it to an existing stable Host-local failure/InvocationResult while always returning the supervisor to a terminal non-running state. Remove no-op swallowing and add deterministic tests for rejecting session, completion, and stop promises before ClaudeCodeAdapter is introduced.

### Medium

3. **Initialization is not serialized across concurrent commands.**

   - **Location/evidence:** `apps/actor-host/src/backend/supervisor.ts:80-105` checks `launchSpec` only before the awaited `adapter.initialize()`. There is no `initializing` state or in-flight promise. `apps/actor-host/src/server-connection/command-processor.ts:75-90` starts each initialization asynchronously, so two valid InitializeActorHost messages can enter this window concurrently. Existing tests at `apps/actor-host/test/backend/backend-supervisor.test.ts:192-201` cover only sequential idempotence.
   - **Consequence:** Two adapter initializations can run at once; with different snapshots or identities, whichever completion writes `launchSpec` last determines the Host’s static backend configuration. This violates immutable Host initialization and makes duplicate/reordered Server commands nondeterministic before the future adapter owns real tools and workspace setup.
   - **Required correction:** Reserve initialization identity/configuration before awaiting adapter setup and serialize it with an explicit in-flight state/promise. Same-identity concurrent requests must resolve deterministically; a different identity/snapshot must be rejected without invoking the adapter. Add a concurrent-initialize test, including opposite completion order.

4. **Gateway envelope-provider failures can leave the WebSocket physically open after the Gateway is terminal.**

   - **Location/evidence:** `apps/runtime-server/src/modules/host-gateway/host-gateway.ts:308-315` handles message-ID/timestamp provider failure by entering `transportFailure()`; `:338-341` marks the Gateway connection failed and removes its indexes, but does not notify the transport. `apps/runtime-server/src/infrastructure/actor-host-websocket/host-gateway-websocket-adapter.ts:79-102` only learns of terminal transport failure through `HostGatewayTransport.onFailure`, which is triggered for WebSocket send/socket failures, not Gateway-side provider or generated-envelope-validation failures. The Gateway listener is also unsubscribed during `failConnection()`.
   - **Consequence:** `sendCommand()` can return a terminal failure and `connectionForActor()` can stop finding the connection while the authenticated WebSocket remains open. The Host receives no disconnect signal, the old socket can consume resources, and reconnect/cleanup behavior becomes dependent on an application caller remembering an out-of-band close.
   - **Required correction:** Make every terminal Gateway connection failure—including provider and generated-envelope failures—signal the adapter’s transport-failure channel, or add an equivalent public terminal callback that the adapter consumes to terminate the socket exactly once. Add an injected failing-provider test covering Gateway state, socket termination, and new-connection availability.

## Review assessment

### Security and trust boundary

The loopback and credential boundary is substantially aligned with the accepted design: the WebSocket adapter requires local address `127.0.0.1`, the exact `/actor-hosts/connect` target, strict bearer-token syntax/size, pre-Upgrade verification, generic rejection responses, no token URL channel, and no token propagation past the verifier. HostHello identity is checked against the authenticated context, and malformed, wrong-direction, generation, sequence, ACK, binary, JSON, and transport failures are fail-closed on the real WebSocket path.

The missing pre-execution Project/Actor binding in Finding 1 is nevertheless a material trust-boundary defect. Post-execution fact rejection does not prevent cross-identity backend work, so the security review cannot pass as-is.

### Protocol and state ownership

The reviewed code keeps Server Gateway registry/sequence/pending-ACK state in Host Gateway, Host-local backend/process state in BackendSupervisor, and transport framing in the two WebSocket adapters. The directional protocol, HostHello generation/sequence rules, receipt-only ACK behavior, explicit create/resume directive, and one-active-invocation rule are otherwise compatible with the accepted Host protocol. No direct ActorHost-to-ActorHost path or cross-module state mutation was found.

### Scope compliance

The product subject contains no unauthorized Run Engine, Package routing/publication, Graph, persistence, daemon startup, remote Host, heartbeat/reconnect recovery, or real Claude behavior. FakeBackend exercises the same `BackendAdapter`/`BackendSupervisor` path intended for ClaudeCodeAdapter. `dd2c6c1..19b21e3` was independently verified to contain only the retest/review construction records; no later product, configuration, or test change was included in this review.

### Evidence gaps and residual risk

The accepted evidence baseline `7c00d50` demonstrates the five real-loopback FakeBackend scenarios and full repository verification, but it does not exercise the four findings above: mismatched command identity, concurrent initialization, rejecting backend promises, or Gateway provider failure. The real Claude executable/session behavior, token issuance/rotation/revocation, TLS/remote hosts, pending-Hello liveness, heartbeat, reconnect/replay/outbox, persistence/recovery, Project activation, Run/Package/Graph behavior, and daemon composition remain deliberately deferred by the milestone plan. These are residual scope risks, not additional findings against this walking skeleton.

## Reviewed subject and recommendation

- implementation subject: `dd2c6c151b26e836bffb4af9aa1968c9df173aa5`
- comparison baseline: `6b98d4446ca6a71a7d73729c83908a045fc6338f`
- reviewed implementation range: `6b98d44..dd2c6c1`
- accepted independent testing evidence baseline: `7c00d50d7ece5198b1212ae7b508db9d354b4fb0`
- expected/current orchestration HEAD: `19b21e3b459e46c9e7c4bb55794c1da8bb8d9cb7`

Recommendation: **do not accept or close the milestone yet.** Correct the two high-severity findings and the two medium-severity connection/concurrency findings, then obtain focused independent evidence for those cases and rerun the W3 closeout gate. No product or test remediation was performed by this review.
