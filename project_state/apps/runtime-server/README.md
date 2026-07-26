# Runtime Server Route

This is a routing node for the Runtime Server deployable grouping, not a
separate domain state card. The current Server source contains three separately
owned cards:

- [Runtime Server Actor Module](./modules/actor/README.md)
- [Runtime Server Host Gateway](./modules/host-gateway/README.md)
- [Runtime Server Project Module](./modules/project/README.md)

All three consume [Runtime Contracts](../../packages/runtime-contracts/README.md).
The Project Module owns an accepted uncomposed file-backed SQLite adapter and a
provider structurally compatible with the Actor Module's existing exact
Definition Brick resolver port. The Server still has no composition root,
daemon lifecycle, API surface, or production persistence wiring at the Server
root; those are deferred boundaries in the
[system map](../../_meta/system-map.md), not claims of an implemented Server
composition module.

Before a Server task, read the [root state route](../../README.md), the
applicable module card, the Task/procedure, and then the scoped source/tests.
Add another module card only when the Task crosses its declared boundary.
