# HG-review-003 Wire Redaction Closeout — Reviewing Report

- work: reviewing
- result: completed
- lease: `host-boundary-reviewer-01@1`

## Actionable findings

None. No new actionable finding was introduced by the focused correction.

## Prior finding disposition

**HG-review-002 Medium — backend and initialization diagnostics copied into wire-visible HostFaults: CLOSED.**

- `BackendSupervisor` now discards caught adapter rejection values and creates fixed lifecycle messages for initialization, session observation, completion observation, and stop failure (`apps/actor-host/src/backend/supervisor.ts:175-186`, `:189-218`, `:257-274`, and `:298-307`).
- `ActorHostCommandProcessor.emit()` applies `redactOutboundPayload()` immediately before the only accepted command-processor outbound sink (`apps/actor-host/src/server-connection/command-processor.ts:152-205`). HostFault errors are rebuilt with stable fields and a fixed message; optional `details` and any raw message are omitted. This protects direct/future HostFault construction through the current command path rather than depending only on individual supervisor branches.
- `fixedHostFaultMessage()` maps all known lifecycle codes and falls back to `ActorHost operation failed.` for unknown codes (`apps/actor-host/src/server-connection/command-processor.ts:220-265`).
- `backend.launch_failed` keeps its stable process error code while rebuilding the error with `Backend process launch failed.` and omitting diagnostic `details` (`apps/actor-host/src/server-connection/command-processor.ts:174-190`).

The focused evidence injects secret-bearing values into initialization, session, completion, stop, unknown lifecycle, and launch-failure paths; checks the complete serialized outbound intents/envelopes; and verifies fixed messages, preserved codes, ACK/fault ordering, quarantine, and no false result (`HG-acceptance-003-wire-diagnostic-redaction.testing.md`).

## Seven focus assessment

1. **Initialization/session/completion/stop leakage:** closed. Caught adapter diagnostics are discarded in the supervisor, and the final HostFault mapping removes dynamic messages and `details` before serialization. No alternate outbound field receives the injected diagnostic in the independent evidence.
2. **Unknown lifecycle codes:** closed. The stable `actor_host.<code>` code remains available while the default message is fixed and generic. The focused command-processor test covers an unexpected future code with a secret-bearing message.
3. **`backend.launch_failed`:** closed. The process error code remains `backend.launch_failed`; its message is fixed and `details` are removed at the outbound boundary. The integration assertion confirms the same wire shape.
4. **Bypass resistance:** closed for currently accepted paths. Backend adapters return through `BackendSupervisor`; the command processor is the accepted backend-fact emitter, and its `emit()` method applies redaction before passing payloads to `ServerConnection`. No adapter or alternate ActorHost source in the reviewed subject sends HostFault or launch-failure payloads directly.
5. **Preserved lifecycle/security behavior:** no regression found in the affected surface. The correction changes diagnostic values and outbound error projection only. Independent evidence retains ACK-before-fact ordering, exactly-one fault, quarantine/no-overlap behavior, no false InvocationResult on lifecycle rejection, identity binding, concurrent initialization, and Gateway terminal cleanup. Unchanged behavior accepted in HG-review-002 is not re-reviewed here.
6. **Contracts and channels:** closed. `git diff --name-only 865b6a8..949e742 -- packages/runtime-contracts` is empty. No Contract schema, cross-process union, logger, telemetry, persistence, or alternate diagnostic channel changed. The launch-failure projection remains within the existing `InvocationResult` error shape.
7. **Evidence sufficiency:** sufficient and non-blocking. Independent baseline `52b1bbb` tested the exact implementation subject and covered secret-bearing markers across the required paths, including complete serialized payload inspection. Synthetic-marker coverage and the absence of a real Claude adapter are accepted scope limitations, not evidence blockers or residual findings.

## Security and trust-boundary assessment

The final diagnostic-leakage finding is closed. The stable error code, category, retryability, schema version, and applicable correlation ID remain available, while dynamic backend diagnostics are removed before the Host envelope is handed to transport. Future adapters cannot bypass the mapping through the current supervisor-to-command-processor path. No new cross-process diagnostic channel was introduced.

## Evidence, residual risk, and scope

Subject identity passed: the starting branch was `main`, the worktree was clean, HEAD was `ec7df0112c513ec1aa63432fd6aef9536e49b8fb`, and `949e742..ec7df01` contained only the accepted Runbook/boundary-check migration, HG-acceptance-003 Task/Report, and this review Task. Repository acceptance baseline `d73bc90` and independent evidence baseline `52b1bbb` both refer to the exact implementation subject `949e742`.

Deferred residual risks remain for token issuance/rotation/revocation, pending-Hello liveness, reconnect/replay/outbox, heartbeat, persistence/recovery, daemon composition, remote Hosts, Run/Package/Graph behavior, and real Claude execution. These remain outside this bounded closeout and are not findings against the reviewed redaction correction.

## Reviewed subjects and recommendation

- implementation subject: `949e7426efc58d16b829af617ba947f31a407355`
- implementation comparison: `865b6a84a8da70f670895354d35befaa80ae6409..949e7426efc58d16b829af617ba947f31a407355`
- repository acceptance baseline: `d73bc907ab7f82f0891119b2a4394209aed9de12`
- independent evidence baseline: `52b1bbb25c63fd065cd5bcc4b5a105d370d0e582`
- orchestration HEAD / baseline: `ec7df0112c513ec1aa63432fd6aef9536e49b8fb`

**Verdict: PASS for Host walking-skeleton milestone closeout.** The HG-review-002 diagnostic-leakage finding is closed, no new actionable finding remains, evidence is sufficient for the bounded correction, and the milestone may close subject to the stated deferred risks.

No product, test, configuration, Contract, Task, prior Report, or Runbook file was modified by this review; only this Report is authorized for commit.
