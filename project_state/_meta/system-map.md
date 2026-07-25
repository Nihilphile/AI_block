# Current System Map

This is a sparse current-state map, not a literal source-tree index. The five cards below are the only initial module cards. A source directory or a design concept does not receive a card until it has a real independently hand-offable boundary.

## Current implementation topology

```text
Runtime Contracts
   ↑                 ↑
Actor Module     Host Gateway core
                         ↑
              WebSocket infrastructure adapter

ActorHost ───────┐
Runtime CLI ─────┼──> Runtime Contracts
Contract tests ──┘
```

Runtime Server currently contains independently testable Actor and Host Gateway slices plus a loopback WebSocket adapter. It has no composition root or running daemon. ActorHost has Host-local backend/protocol slices but no application startup. Runtime CLI has no executable command surface. Package is currently a Runtime Contracts boundary, not a Server workflow: one immutable Package has a Head plus exactly one Body whose value is one root `BrickPrompt`, while mutable routing state belongs to Delivery.

## Product target and Direct Actor MVP stage

The [system target and Direct Actor MVP target-stage distinction](../../docs/design/current/runtime-invariants.md#target-stage-distinctions) permits one Runtime Server to manage multiple Projects and eventually multiple active Project Runtimes while intentionally limiting Direct Actor MVP acceptance to one Project at a time. These are target versus stage, not contradictory current behavior; neither is implemented by the current Server slices, and this distinction does not create a Project card.

## State-card map

| Boundary | Current route | Current source roots | Current test roots |
|---|---|---|---|
| Runtime Contracts | [card](../packages/runtime-contracts/README.md) | [`packages/runtime-contracts/src/`](../../packages/runtime-contracts/src/) | [`packages/runtime-contracts/test/`](../../packages/runtime-contracts/test/) |
| Runtime Server Actor Module | [card](../apps/runtime-server/modules/actor/README.md) | [`apps/runtime-server/src/modules/actor/`](../../apps/runtime-server/src/modules/actor/) | [`apps/runtime-server/test/modules/actor/`](../../apps/runtime-server/test/modules/actor/) |
| Runtime Server Host Gateway | [card](../apps/runtime-server/modules/host-gateway/README.md) | Gateway core and WebSocket adapter | Gateway core and adapter tests |
| ActorHost | [card](../apps/actor-host/README.md) | [`apps/actor-host/src/`](../../apps/actor-host/src/) | [`apps/actor-host/test/`](../../apps/actor-host/test/) |
| Runtime CLI | [card](../apps/runtime-cli/README.md) | [`apps/runtime-cli/src/`](../../apps/runtime-cli/src/) | None currently exists |

The [Runtime Server route](../apps/runtime-server/README.md) groups the Actor and Host Gateway cards without owning a third domain card.

## Scope reconciliation at initial activation

The following mismatches were reconciled before card creation. “Intent” is the adjudicated Runtime target; “current evidence” is the observed current fork. Deferred scope is not a blocker unless an authorized task cannot proceed without it.

| Area | Intent versus current evidence | State consequence |
|---|---|---|
| Actor Module | Intent includes Actor, ActorPool, Trace, LaunchSpec, and Invocation composition. Current source is the accepted reference-only ActorTemplate/ActorConfigSnapshot construction core behind ports; no runtime Actor, Host launch, Run, Package input, or Graph authority exists. | Card is `reference-only`; runtime responsibilities are explicit deferred/absent scope. |
| Host Gateway | Intent includes live Host ownership, liveness, reconnect, initialization, and facts. Current accepted implementation proves HostHello binding, generation 1/sequence, receipt ACKs, pending command state, fail-closed behavior, and loopback transport; reconnect/replay, persistence, and production fact consumption are absent. | Card describes the functional bounded protocol slice and names deferred reliability/orchestration. |
| ActorHost | Intent is one-Actor execution ownership with backend/session lifecycle and Server reporting. Current source proves supervisor, FakeBackend, process/Claude adapter, connection, command processing, and WebSocket slices; startup wiring, heartbeat/reconnect, outbox, Package/completion emission, and recovery are absent. | Card is `partial` and separates Host-local behavior from deferred application lifecycle. |
| Runtime Contracts and Package | Intent makes Contracts the shared schema/value boundary and Package a future workflow-owned module. The accepted current Package is immutable Head plus exactly one root-`BrickPrompt` Body; mutable routing belongs to Delivery. Current source supplies the Contracts and hash helper, while Server has no Package module or publication/routing service. A Package-as-Brick redesign is not accepted current intent. | Package remains a Contracts-only planned/deferred workflow boundary; no Package card is created and any redesign remains unresolved. |
| Runtime CLI and Server | Intent is stateless CLI → Server API and an authoritative Server composition root. Current CLI is a type-consumer fixture and Server has no startup/composition root or API surface. | CLI is deferred; Server remains a routing node and no Server card is created. |
| Project, Run, Graph, SQLite | Designs name these as future ownership/persistence boundaries. Current source/evidence does not establish independently hand-offable implementations. | Keep them visible here as planned/deferred map entries only; create no empty cards. |

Evidence for the reconciliation includes the accepted [Runtime Contracts closeout](../../docs/construction/records/runtime-contracts/phase-0b-closeout.md), [ActorTemplate closeout](../../docs/construction/records/actor-template/reference-only-actor-template-closeout.md), [Host Gateway closeout](../../docs/construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md), and [ClaudeCodeAdapter closeout](../../docs/construction/records/claude-code-adapter/claude-code-adapter-v0.1-closeout.md), together with the scoped source/test roots named by the cards.

## Planned or deferred boundaries without cards

- Project namespace and persistence
- Package workflow and Delivery persistence/routing
- Run Engine
- Graph and GraphRun
- SQLite/persistence infrastructure
- Runtime Server composition/API root

These entries are visible for orientation only. They do not authorize implementation or imply that the boundary is blocked.
