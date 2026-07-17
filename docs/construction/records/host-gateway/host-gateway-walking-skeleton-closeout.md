# Host Gateway Walking-Skeleton Closeout

- status: accepted
- closed by: Orchestrator
- architecture baseline: `6b98d44`
- final implementation subject: `949e742`
- repository acceptance baseline: `d73bc90`
- final independent evidence: `52b1bbb`
- final focused review: `66df82a`

## Accepted outcome

The first authenticated ActorHost–Runtime Server walking skeleton is accepted. One ActorHost can connect over real loopback WebSocket, register one immutable Host identity, receive initialization and invocation commands, execute through the same BackendAdapter/BackendSupervisor path intended for ClaudeCodeAdapter, and return receipt ACKs, readiness, session facts, invocation results, and stable faults through frozen Runtime Contracts.

This milestone proves the Server–Host execution boundary against deterministic FakeBackend behavior. It does not prove the Direct Actor MVP or real Claude Code behavior.

## Accepted capabilities

### ActorHost

- initialization remains separate from backend-session creation;
- first Invocation creates a session and later Invocation resumes an explicit session ID;
- one active backend Invocation is enforced;
- FakeBackend uses the production BackendAdapter/Supervisor port;
- trusted Project/Actor identity is enforced after receipt ACK and before backend work;
- same-configuration concurrent initialization coalesces to one adapter operation and conflicting initialization cannot replace immutable configuration;
- session/completion/stop promise rejection produces exactly one truthful HostFault, no false InvocationResult, and a non-running quarantined Host state;
- backend and initialization diagnostics are excluded from wire-visible payloads by fixed code/message mapping;
- `backend.launch_failed` preserves its stable code, uses a fixed message, and omits diagnostic details.

### Host Gateway and transport

- authenticated HostHello binds Project, Actor, Host instance, generation, and first sequence;
- directional generation/sequence and receipt-only ACK semantics are enforced;
- command ACK means receipt only, never execution completion;
- identity-bearing Initialize/Start commands are validated before sequence/provider/envelope/pending/send mutation;
- loopback address, exact path, bearer syntax/limits, verifier timeout, text-only JSON, compression, payload, redirect, and redaction policies are enforced;
- Gateway/provider/envelope/transport failures fail closed;
- Gateway-originated terminal failure removes logical state and terminates the physical socket exactly once without feedback recursion;
- fresh eligible registration remains possible under existing generation/Host-instance rules.

### Integration and repository boundary

- real `127.0.0.1` loopback Upgrade and WebSocket frames compose Runtime Server and ActorHost without production app-to-app imports;
- create, resume, busy, launch failure, identity mismatch, and terminal disconnect scenarios pass;
- root integration owns its own Runtime Contracts and Vitest dependencies;
- Runbook/Serena boundary checks target authoritative composable policies;
- Runtime Contracts remain the only cross-process shared package.

## Evidence

Final independent acceptance at implementation subject `949e742` and repository baseline `d73bc90` passed:

```text
Runtime Contracts   9 files / 58 tests
ActorHost           4 files / 54 tests
Runtime Server      2 files / 20 tests
Root integration    1 file  / 5 tests
```

Build, type checks, workspace boundaries, clean-state integration, full `pnpm verify`, generated-output cleanup, and Git-clean evidence passed in `52b1bbb`.

Final focused Security Review `66df82a` closed the wire-diagnostic finding and found no new actionable issue.

## Closed findings

The milestone acceptance chain closed:

1. root integration test-runner/type ownership;
2. Runbook Serena checker migration mismatch;
3. pre-backend authenticated Host identity binding;
4. swallowed session/completion/stop promise rejection and permanently active Invocation risk;
5. concurrent initialization race;
6. Gateway-terminal logical failure without physical socket termination;
7. wire-visible backend/initialization diagnostic leakage.

No accepted finding remains open.

## Deferred scope and residual risk

The following remain deliberately outside this milestone:

- real Claude Code CLI/session behavior and ClaudeCodeAdapter;
- token issuance, rotation, revocation, TLS, proxy, or remote Host;
- heartbeat, reconnect, replay, durable outbox, and Server restart recovery;
- automatic Host reconstruction after quarantined unknown process liveness;
- Project activation, Actor process spawning, SQLite persistence, Run Engine, Package publication/routing, Graph, and AgentControlTool;
- pending-Hello liveness and the broader crash-recovery matrix.

These are future construction scope, not defects against the accepted FakeBackend walking skeleton.

## Next construction boundary

The next broad sequence is focused ClaudeCodeAdapter external-behavior research and explicitly authorized controlled probes before implementation relies on undocumented CLI/session behavior.

This closeout does not itself authorize that research, a real-service probe, or product implementation. A new Task and explicit Load Manifest are required.
