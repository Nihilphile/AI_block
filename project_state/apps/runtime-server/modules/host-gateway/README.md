---
module: Runtime Server Host Gateway
implementation_state: functional
work_state: stable
source_roots:
  - apps/runtime-server/src/modules/host-gateway/
  - apps/runtime-server/src/infrastructure/actor-host-websocket/
test_roots:
  - apps/runtime-server/test/modules/host-gateway/
  - apps/runtime-server/test/infrastructure/actor-host-websocket/
---

# Runtime Server Host Gateway

## Intent

Host Gateway is the Server-side owner of live ActorHost connections, Actor-to-Host binding/registry, connection generation and liveness state, pending Host command/ACK state, and desired Host initialization state. It authenticates and reconciles Hosts and transports Server commands and Host reports. It does not compile ActorTemplate, contain backend-specific process logic, decide Graph routing, or decide when a Run advances.

## Implemented today

The accepted bounded slice contains a Host Gateway core and a loopback WebSocket infrastructure adapter. The core opens pending connections, binds authenticated identity after a valid first HostHello, enforces generation 1 and contiguous directional sequence, sends receipt ACKs, tracks successful non-ACK commands, delivers valid facts to an injected sink, and fails closed on protocol, identity, provider, send, or sink errors. The adapter handles the exact loopback upgrade path, bearer verification port, JSON/text framing, payload limits, and terminal cleanup.

The fact sink is an injected port. Current source does not provide a production consumer for Package publication, completion, invocation-result, or other Host facts, and no Server composition root attaches the adapter.

## Boundary and dependencies

The Gateway depends on Runtime Contracts and local port types. The WebSocket adapter depends inward on the Gateway and Node/`ws` transport mechanics. The boundary does not own credential issuance/rotation, ActorTemplate compilation, Package persistence/publication, Delivery state, Run decisions, Graph routing, ActorHost implementation, or Server startup.

The current protocol slice is deliberately not a reliability subsystem: higher-generation replacement, heartbeat, reconnect/replay, durable outbox, restart recovery, pending-Hello liveness, and automatic Host reconstruction remain deferred.

## Current condition

The walking-skeleton and WebSocket adapter evidence is accepted with no open accepted finding. The functional core is stable within its tested protocol boundary. Its deferred fact consumers and reliability/application wiring are not blockers for this card; they require separately authorized ownership and Contract decisions.

## Read next

- [Root state route](../../../../../project_state/README.md), [authority](../../../../../project_state/_meta/authority.md), and [system map](../../../../../project_state/_meta/system-map.md)
- [Gateway source](../../../../../apps/runtime-server/src/modules/host-gateway/) and [Gateway tests](../../../../../apps/runtime-server/test/modules/host-gateway/)
- [WebSocket adapter source](../../../../../apps/runtime-server/src/infrastructure/actor-host-websocket/) and [adapter tests](../../../../../apps/runtime-server/test/infrastructure/actor-host-websocket/)
- [Runtime Contracts card](../../../../../project_state/packages/runtime-contracts/README.md) and [ActorHost card](../../../../../project_state/apps/actor-host/README.md) for a cross-boundary task
- [Runtime module architecture](../../../../../runtime-module-architecture-v0.1.md) for intended ownership
- [Host Gateway closeout](../../../../../docs/construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md) for accepted evidence

## Evidence

- Source: [`apps/runtime-server/src/modules/host-gateway/`](../../../../../apps/runtime-server/src/modules/host-gateway/) and [`apps/runtime-server/src/infrastructure/actor-host-websocket/`](../../../../../apps/runtime-server/src/infrastructure/actor-host-websocket/)
- Tests: [`apps/runtime-server/test/modules/host-gateway/`](../../../../../apps/runtime-server/test/modules/host-gateway/) and [`apps/runtime-server/test/infrastructure/actor-host-websocket/`](../../../../../apps/runtime-server/test/infrastructure/actor-host-websocket/)
- Accepted evidence: [Host Gateway walking-skeleton closeout](../../../../../docs/construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md)
- Neighbor evidence: [ClaudeCodeAdapter closeout](../../../../../docs/construction/records/claude-code-adapter/claude-code-adapter-v0.1-closeout.md)
