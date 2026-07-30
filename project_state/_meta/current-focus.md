# Current Focus

## Current product frontier

The current frontier is the transition from durable Project-owned Definition
Brick resolution and immutable Actor configuration to a runtime Actor identity.

The accepted current product can:

- author and persist Project-local Definition Bricks with exact revision
  history;
- resolve an exact persisted Definition Brick revision through the
  Project-owned provider required by the Actor Module;
- validate and compile typed Definition Bricks and ActorTemplates into an
  immutable, self-contained `ActorConfigSnapshot`.

The Actor Module does not yet provide production persistence for
ActorTemplate/Snapshot state and does not create a runtime Actor.

## Conditions shaping the frontier

- Actor identity remains separate from a backend process or model session.
- Static Snapshot configuration remains separate from dynamic Package and Run
  input.
- `model_id` is preserved by the Snapshot, but its first-class Host launch
  transport is not yet settled.
- Host Gateway and ActorHost have accepted bounded protocol/backend slices, but
  neither is attached to a Runtime Server composition root.
- Direct Actor execution must be established before Graph construction.

## Next product entry point

Decide the smallest Direct Actor boundary after `ActorConfigSnapshot`.
The leading boundary is immutable Actor creation from an accepted exact
Snapshot, with Host launch controlled as a separate subsequent boundary.

That decision must settle Actor ownership, identity and persistence semantics,
Contract impact, atomicity, and explicit exclusions before product
construction is authorized.

## Deferred beyond this frontier

Server composition, Host launch and recovery, ActorPool/Trace behavior,
backend-session persistence, Package/Delivery workflow, Run/Invocation,
Graph execution, external authoring adapters, backup/import/export, and
cross-family units of work remain deferred.
