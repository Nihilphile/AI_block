# Runtime Server Route

This is a routing node for the Runtime Server deployable grouping, not a third domain state card. The current Server source contains two separately owned cards:

- [Runtime Server Actor Module](./modules/actor/README.md)
- [Runtime Server Host Gateway](./modules/host-gateway/README.md)

Both consume [Runtime Contracts](../../packages/runtime-contracts/README.md). The Server currently has no composition root, daemon lifecycle, API surface, or production persistence wiring; those are deferred boundaries in the [system map](../../_meta/system-map.md), not claims of an implemented Server module.

Before a Server task, read the [root state route](../../README.md), the applicable module card, the task/procedure, and then the scoped source/tests. Add the other module card only when the task crosses their declared boundary.
