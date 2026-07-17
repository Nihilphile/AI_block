# HG-review-002 Host Boundary Remediation Closeout — Reviewing Report

- work: reviewing
- result: completed
- subject: `865b6a8`

## Findings by severity

### Medium

1. **Backend and initialization diagnostics are copied into wire-visible HostFaults.**

   - **Location/evidence:** `apps/actor-host/src/backend/supervisor.ts:181-185`, `:211-216`, `:262-266`, and `:302-306` derive `SupervisorLifecycleError.message` from the caught `Error.message`. `apps/actor-host/src/server-connection/command-processor.ts:94-99` and `:179-192` place those messages directly in `ContractErrorEnvelope.message`, and `:140-142` emits the failure over the Host transport.
   - **Consequence:** A future ClaudeCodeAdapter can reject with stderr, command-line, workspace, provider, or credential-bearing diagnostics. Those values would cross the authenticated Host boundary in `HostFault`, despite the remediation acceptance requiring no internal diagnostic or credential leakage. The current FakeBackend strings are benign and the Tester did not exercise a secret-bearing backend error payload.
   - **Required correction:** Keep stable wire error codes and map the wire `message` to fixed, non-sensitive text per failure class. Retain any diagnostic only in a separately controlled, secret-safe local record if needed. Add focused tests that reject with a secret-bearing `Error.message` for initialization/session/completion/stop and assert that the emitted HostFault does not contain it.

## Original HG-review-001 finding dispositions

1. **High — authenticated Host identity not bound before backend work: CLOSED.**

   `ServerConnection` now passes its trusted identity into `ActorHostCommandProcessor` (`apps/actor-host/src/server-connection/server-connection.ts:90-94`). The processor rejects mismatched Initialize and Start payloads after the receipt ACK and before supervisor/backend calls (`apps/actor-host/src/server-connection/command-processor.ts:77-110`). The Gateway independently rejects mismatched identity-bearing commands before envelope allocation or transport send (`apps/runtime-server/src/modules/host-gateway/host-gateway.ts:213-217` and `:316-327`). The focused evidence records zero adapter work and a usable connection after rejection.

2. **High — backend promise failures could leave an invocation active: CLOSED.**

   `BackendSupervisor` converts session, completion, and stop rejection into one internal failure promise, clears the active invocation, and enters `faulted` quarantine (`apps/actor-host/src/backend/supervisor.ts:175-237` and `:240-277`, `:322-329`). The command processor emits one HostFault and no false InvocationResult (`apps/actor-host/src/server-connection/command-processor.ts:123-142`). The `active.settled` guard and shared failure promise make simultaneous session/completion rejection first-terminal-failure-wins. Quarantine truthfully represents unknown process liveness: no later backend start is permitted, and reconstruction/restart remains deferred by design.

3. **Medium — concurrent initialization was not serialized: CLOSED.**

   Initialization now reserves the complete launch configuration before awaiting adapter work and returns the same in-flight promise for an identical configuration (`apps/actor-host/src/backend/supervisor.ts:104-125`). Conflicting identity or configuration is rejected before adapter invocation (`:111-116`), and a failed reservation is cleared without installing `launchSpec` (`:298-319`). The Tester’s limitation—no separate adapter promises completed in opposite orders—is acceptable, not a blocking evidence gap: the one-promise design makes a competing completion order unrepresentable, while the source and tests prove one adapter call, shared resolution, and no conflicting overwrite.

4. **Medium — Gateway provider/envelope failure could leave the physical WebSocket open: CLOSED.**

   Gateway core failure now removes observers and logical indexes before invoking the private transport terminal operation (`apps/runtime-server/src/modules/host-gateway/host-gateway.ts:175-192`). Transport-originated failures use the separate `transport` origin and do not echo back into the transport. The real WebSocket transport latches failure notification and socket termination (`apps/runtime-server/src/infrastructure/actor-host-websocket/host-gateway-websocket-adapter.ts:97-107` and `:216-238`), so core-to-transport termination does not recurse; `socketTerminationRequested`, `failureNotified`, and `closed` prevent duplicate termination/finalization. The focused loopback evidence observed one close event, logical unregister, fresh registration, and termination-operation exceptions without leaked state.

## Seven focus assessment

1. **Trusted identity:** closed at both ActorHost defense-in-depth and Gateway pre-send layers; no alternate identity authority was introduced.
2. **Promise failure/liveness:** faulted quarantine is truthful for unknown process liveness, prevents overlapping starts, and emits one terminal HostFault. The diagnostic-redaction finding above remains open.
3. **Initialization/concurrency:** one immutable reservation and one adapter promise are used; conflicting requests cannot overwrite it. The opposite-order limitation is an acceptable consequence of this design.
4. **Gateway terminal cleanup:** real core-to-transport failure is one-shot, non-recursive, and physically closes the socket; logical indexes and listeners are cleaned.
5. **Contract/boundary impact:** `git diff --name-only dd2c6c1..865b6a8 -- packages/runtime-contracts` is empty. The added `identity_mismatch` result, optional `fail` transport operation, and envelope-validator seam are confined to Runtime Server application source under `apps/runtime-server`; they are not Runtime Contracts or a new shared cross-process schema. HostFaults continue using the existing envelope/payload contracts.
6. **Protocol and phase scope:** independent regression evidence passed for ACK/sequence/generation, create/resume, loopback behavior, and the five walking-skeleton scenarios. No Run Engine, Package, Graph, persistence, daemon, reconnect/replay, heartbeat, remote Host, or real Claude behavior entered the remediation.
7. **Evidence limitation:** the missing opposite-completion-order construction is not insufficient evidence because conflicting calls do not create a second adapter operation. The new diagnostic-redaction issue is a product defect, with a corresponding focused evidence gap for secret-bearing errors.

## Security and trust-boundary assessment

The four original security/liveness findings are closed on the reviewed subject. Host identity is checked before execution and command send; Gateway terminal failures do not send diagnostics over the WebSocket; and loopback, credential, Hello, sequence, and physical cleanup behavior remains aligned with the accepted design.

The closeout cannot pass while ActorHost backend/initialization error messages are forwarded verbatim in HostFaults. Stable codes and faulted quarantine are correct, but the message field remains an unredacted diagnostic channel across the public boundary.

## Evidence and residual risk

Independent evidence baseline `7179c86` passed the exact implementation subject with ActorHost 47 tests, Runtime Server 20 tests, Contracts 58 tests, integration 5 tests, boundary checks, and full verification. It substantively closes all four original findings. It does not test secret-bearing backend Error messages; source inspection establishes that gap as the new product finding above.

Deferred residual risks remain for token issuance/rotation/revocation, pending-Hello liveness, reconnect/replay/outbox, heartbeat, persistence/recovery, daemon composition, remote Hosts, Run/Package/Graph behavior, and real Claude execution. Faulted quarantine intentionally requires later reconstruction/restart because process liveness is unknown; that is deferred recovery scope, not a defect in this walking skeleton.

## Reviewed subjects and recommendation

- implementation subject: `865b6a8`
- comparison range: `dd2c6c1..865b6a8`
- independent evidence baseline: `7179c869435e34dd9e3b536ee98ae2d75a12fa10`
- expected/current orchestration HEAD: `9ef24f96da1917202c46ee986a5feb4d97fbd01c`
- verified `865b6a8..9ef24f9`: only `HG-acceptance-002` Task/Report and this review Task

**Verdict: FAIL for milestone closeout.** All four original findings are closed, but the new medium-severity HostFault diagnostic-redaction finding remains actionable. Correct it, add the focused secret-bearing-error evidence, and repeat the focused W3 review/acceptance decision. No product, test, configuration, design, Task, or prior Report was modified by this review.
