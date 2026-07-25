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

A product dispatch declares one bounded state context. Existing-module work
names this root and one exact target card. New-module preflight names this root,
the nearest parent route, and the intended card path; after READY and before
implementation authorization, the Orchestrator creates the initial
`planned`/`active` card. Add a neighboring card only when the task crosses a
declared boundary.

Cards reduce repository archaeology; they never remove the requirement to
inspect scoped source, Contracts, tests, and accepted evidence. Workers may
follow those investigative links inside Task read scope, but doing so does not
load new instructions or enlarge authority.

## Maintenance

Cards are overwrite-style current views. The Orchestrator creates an initial
card only for an implementation-ready boundary and owns its Intent, stable
ownership/dependency boundary, exclusions, and accepted/deferred condition. An
authorized Coder reconciles actual implementation, roots, local dependencies,
condition, and evidence on the directly affected card. Testers report
mismatches; Reviewers verify candidate cards. Root/parent routing, cross-module
map, focus, and acceptance summaries remain Orchestrator-owned.

This initial activation is documentation/process-only. It creates no Runtime behavior, dependency, lockfile, source, or test changes. Project, Package, Run, Graph, and SQLite remain visible in the system map without empty cards.
