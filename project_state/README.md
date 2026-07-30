# Project State

`project_state/` is AI_block's sparse, versioned current-state read model. It routes an Orchestrator or Worker to a bounded module context; it is not a Runtime product specification, executable proof, construction history, or future-work plan.

## New-reader route

1. Read [authority](./_meta/authority.md) to identify which repository source governs each question.
2. Read the [system map](./_meta/system-map.md) for current boundaries, dependency direction, and planned/deferred areas.
3. Read [current focus](./_meta/current-focus.md) for the current product frontier,
   accepted conditions that shape it, and the next product entry point.
4. Load one target card below before opening its local source and tests.

## Current module cards

| Module | State card | Source boundary |
|---|---|---|
| Runtime Contracts | [packages/runtime-contracts](./packages/runtime-contracts/README.md) | `packages/runtime-contracts/` |
| Runtime Server Actor Module | [apps/runtime-server/modules/actor](./apps/runtime-server/modules/actor/README.md) | `apps/runtime-server/src/modules/actor/` |
| Runtime Server Host Gateway | [apps/runtime-server/modules/host-gateway](./apps/runtime-server/modules/host-gateway/README.md) | Gateway core plus its WebSocket infrastructure adapter |
| Runtime Server Project Module | [apps/runtime-server/modules/project](./apps/runtime-server/modules/project/README.md) | `apps/runtime-server/src/modules/project/` |
| ActorHost | [apps/actor-host](./apps/actor-host/README.md) | `apps/actor-host/` |
| Runtime CLI | [apps/runtime-cli](./apps/runtime-cli/README.md) | `apps/runtime-cli/` |

The [Runtime Server route](./apps/runtime-server/README.md) is a routing node
for its three independently owned module cards; it is not a separate Server
domain card.

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

Project State never records a construction timeline. In particular, root/meta
views and module cards do not retain completed Worker leases, task progress,
commit chains, command history, handoff instructions, or an old-versus-new
narrative. Git, OpenSpec, construction records, and an intentionally active
handoff retain those concerns when they are needed.

The Project State System itself is documentation/process-only and creates no
Runtime behavior, dependency, lockfile, source, or test changes. Package, Run,
and Graph remain visible in the system map without speculative empty cards.
The accepted Project-owned SQLite adapter is routed through the existing
Project Module card rather than a separate infrastructure card. The same card
routes the accepted Project-owned provider for the existing Actor exact
Definition Brick resolver port.
