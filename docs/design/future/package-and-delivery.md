# Package and Delivery

> Overall status: mixed—**inherited current baseline**, **accepted future boundaries**, **proposed migration**, and **open decisions**.
>
> Authority: future product-design input only, not implementation authorization. Current Package semantics remain governed by Runtime Contracts and the [Runtime invariant kernel](../current/runtime-invariants.md).

## Read contract

- **Owner:** future Package workflow and Delivery state on the Runtime Server.
- **Inputs:** caller content, Project/source identity, provenance, recipients or Run context, and publication requests.
- **Outputs:** immutable Package references, publication results, Delivery facts, inbox/read views, and acknowledgement state.
- **Not owned here:** Graph route decisions, Actor lease management, Actor prompt composition, Host transport/recovery, or Run completion.

## Inherited current baseline

The following is confirmed current at the Contract/value boundary:

```text
Package = immutable Head + exactly one Body
Body    = exactly one root BrickPrompt
Delivery owns mutable routing and acknowledgement state
```

- Composite content is represented inside the root `BrickPrompt`, not as multiple Package bodies.
- Package Body is ordinary model input and cannot become `BrickSysPrompt` or a System Instruction.
- Package identity and content remain immutable; route progress does not mutate the Package.

This baseline is not re-opened by this file.

## Accepted future boundaries

The following direction is accepted-future, not current workflow evidence:

1. The Package owner provides create/get/publish operations, immutable storage, provenance/lineage, and stable `PackageRef` values.
2. Publication is idempotent for its accepted key and creates or advances Delivery state without mutating Package identity.
3. Delivery owns recipient/Run routing context, state, acknowledgement, and related mutable facts.
4. Read/inbox operations enforce Project and recipient authorization.
5. Host-originated publication and completion requests cross a restricted typed Server bridge; ActorHost never chooses recipients, Graph routes, or Run advancement.
6. Run and Graph consume Package/Delivery facts through typed interfaces rather than writing Package-owned state.

## Proposed migration: Package-as-Brick

**Status: proposed only.**

A Package-as-Brick redesign has not displaced the current Head-plus-one-Body Contract. It would require:

- an explicitly accepted Runtime Contracts change;
- compatibility and coexistence rules;
- updates to fixtures and every affected consumer;
- persisted-record migration and rollback semantics; and
- a separately authorized owning change.

Until those prerequisites are accepted, Package-as-Brick is neither a current Brick kind nor a prerequisite for Package, Actor, or persistence work.

## Open decisions

- Delivery retry, acknowledgement, deduplication, and inbox delivery guarantees.
- Package versioning, archive/revocation, retention, garbage collection, and lineage pruning.
- Cross-Project export/import and visibility rules.
- Prompt disclosure/render modes such as body, summary, full, or reference-only.
- Publication transaction boundaries and error mapping.

No choice above is selected by this reorganization.
