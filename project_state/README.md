# Project State

`project_state/` is AI_block's sparse, versioned current-state read model. It routes an Orchestrator or Worker to a bounded module context; it is not a Runtime product specification, executable proof, construction history, or future-work plan.

## New-reader route

1. Read [authority](./_meta/authority.md) to identify which repository source governs each question.
2. Read the [system map](./_meta/system-map.md) for current boundaries, dependency direction, and planned/deferred areas.
3. Read [current focus](./_meta/current-focus.md) for active construction scope, named blockers, and the next entry point.
4. Load one target card below before opening its local source and tests.

## Initial module cards

| Module | State card | Source boundary |
|---|---|---|
| Runtime Contracts | [packages/runtime-contracts](./packages/runtime-contracts/README.md) | `packages/runtime-contracts/` |
| Runtime Server Actor Module | [apps/runtime-server/modules/actor](./apps/runtime-server/modules/actor/README.md) | `apps/runtime-server/src/modules/actor/` |
| Runtime Server Host Gateway | [apps/runtime-server/modules/host-gateway](./apps/runtime-server/modules/host-gateway/README.md) | Gateway core plus its WebSocket infrastructure adapter |
| ActorHost | [apps/actor-host](./apps/actor-host/README.md) | `apps/actor-host/` |
| Runtime CLI | [apps/runtime-cli](./apps/runtime-cli/README.md) | `apps/runtime-cli/` |

The [Runtime Server route](./apps/runtime-server/README.md) is only a routing node for its two cards; it is not a third Server module card.

## Bounded dispatch

A task dispatch names `project_state/README.md`, the target module card, and the task/procedure. Add a neighboring card only when the task crosses a declared boundary. The card reduces repository archaeology; it never removes the requirement to inspect scoped source, Contracts, tests, and accepted evidence.

## Maintenance

Cards are overwrite-style current views. Reconcile the directly affected card when behavior, ownership, dependency direction, Contract/protocol surface, lifecycle, persistence/recovery semantics, current condition, or source/test entry points change. A stale card is reported and escalated to the Orchestrator; it is not treated as proof. Cross-module map, focus, and accepted/deferred summaries remain Orchestrator-owned.

This initial activation is documentation/process-only. It creates no Runtime behavior, dependency, lockfile, source, or test changes. Project, Package, Run, Graph, and SQLite remain visible in the system map without empty cards.
