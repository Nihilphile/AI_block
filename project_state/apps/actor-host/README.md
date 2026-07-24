---
module: ActorHost
implementation_state: partial
work_state: stable
source_roots:
  - apps/actor-host/src/
test_roots:
  - apps/actor-host/test/backend/
  - apps/actor-host/test/server-connection/
---

# ActorHost

## Intent

Each ActorHost is the dedicated execution container for exactly one Actor while that Actor's Project Runtime is active. Its principal responsibilities are ServerConnection and BackendSupervisor: realize Server-supplied launch/invocation specifications, prepare the static backend environment, create or resume backend sessions, supervise short-lived backend processes, and report process/session facts.

ActorHost does not own Package routing, Graph policy, Run completion or advancement, Actor wake-up decisions, Project state, or another Actor. Host startup prepares the environment; the first real Package/Invocation creates the backend session.

## Implemented today

The current Host-local slices include BackendAdapter, deterministic FakeBackend, BackendSupervisor, native ProcessRunner, the accepted narrow ClaudeCodeAdapter, ServerConnection, ActorHostCommandProcessor, and a loopback `ws` client. The supervisor enforces initialization, one active invocation, create/resume session directives, stop and quarantine behavior. Connection and command layers validate identity/generation/sequence, ACK before command facts, drive the supervisor, and redact wire diagnostics. The current source has no application startup or composition wiring.

Current evidence reports a green five-file/80-test ActorHost suite and package/type checks. This proves the bounded Host-local slices, not complete Actor lifecycle or end-to-end Runtime behavior.

## Boundary and dependencies

ActorHost imports Runtime Contracts from the package root and its own backend/server-connection modules. `ws` and native process details are isolated in their adapters. It does not import Runtime Server implementation, Runtime CLI, persistence, Graph, Run, Package routing, or another ActorHost.

The current implementation does not emit heartbeat, Package publication, or completion requests; it has no reconnect loop, replay/outbox, durable Host/session state, restart recovery, automatic reconstruction, or executable startup/adapter registry. Those are deferred behavior and composition boundaries.

## Current condition

The accepted Host-local supervisor/protocol and Claude adapter slices are stable, but the complete intended module remains partial. `shutdown_host` is acknowledged as handled without an application shutdown action. No current blocker prevents the bounded slice; startup ownership, launch-spec supply, identity/token inputs, and future Package/Run authority remain open decisions.

## Read next

- [Root state route](../../../project_state/README.md), [authority](../../../project_state/_meta/authority.md), and [system map](../../../project_state/_meta/system-map.md)
- [ActorHost source](../../../apps/actor-host/src/) and [ActorHost tests](../../../apps/actor-host/test/)
- [Runtime Contracts card](../../../project_state/packages/runtime-contracts/README.md)
- [Host Gateway card](../../../project_state/apps/runtime-server/modules/host-gateway/README.md) for the Server boundary
- [Runtime system architecture](../../../runtime-system-architecture-v0.1.md) for process/lifecycle intent
- [ClaudeCodeAdapter closeout](../../../docs/construction/records/claude-code-adapter/claude-code-adapter-v0.1-closeout.md) and [Host Gateway closeout](../../../docs/construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md) for accepted evidence

## Evidence

- Source: [`apps/actor-host/src/`](../../../apps/actor-host/src/)
- Tests: [`apps/actor-host/test/backend/`](../../../apps/actor-host/test/backend/) and [`apps/actor-host/test/server-connection/`](../../../apps/actor-host/test/server-connection/)
- Accepted evidence: [ClaudeCodeAdapter closeout](../../../docs/construction/records/claude-code-adapter/claude-code-adapter-v0.1-closeout.md)
- Boundary evidence: [Host Gateway walking-skeleton closeout](../../../docs/construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md)
