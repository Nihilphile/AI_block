# Graph and Policy

> Overall status: later-stage **accepted future boundary** with **open orchestration and policy decisions**.
>
> Authority: future product-design input only, not implementation authorization. Graph follows the Direct Actor path and is not current implementation evidence.

## Read contract

- **Owner:** future Graph module for reusable topology, binding references, GraphRun evaluation, routing context, and Graph policy.
- **Inputs:** GraphTemplate revision, complete Node-to-Actor references, input Packages, Actor lease availability, and Project/Actor policy inputs.
- **Outputs:** GraphInstance, GraphRun decisions, target-node routing facts, and effective policy snapshot/reference.
- **Not owned here:** Actor or Host lifecycle, Package bodies/Delivery mutation, Run lease mechanics, backend sessions, or Host recovery.

## Inherited current constraints

- Package identity/content is immutable, Package Body is one root `BrickPrompt`, and Delivery owns mutable route state.
- Run Engine owns Actor leases and lifecycle transitions.
- ActorHost does not decide Graph routing, policy, or Run completion.
- Modules mutate only owned state and coordinate through typed interfaces.

These constraints are inherited from the [Runtime invariant kernel](../current/runtime-invariants.md) and are not redefined here.

## Target-stage position

Graph is a post-Direct-Actor stage. Advanced fan-in/fan-out, joins, delegation, dynamic replacement, queueing, and retry cannot be imported into Direct Actor MVP by implication.

## Accepted future boundaries

1. A versioned `GraphTemplate` owns reusable Nodes, Connections, and static role/topology declarations.
2. `GraphTemplate + complete Node-to-Actor references → GraphInstance`.
3. A `GraphInstance` is a reusable bound reference and does not reserve Actors.
4. `GraphInstance + input Packages → GraphRun`.
5. GraphRun requests atomic acquisition of required Actor leases through Run Engine. The first Graph stage rejects without partial start when required leases cannot be acquired; queueing is later scope.
6. Graph owns connection evaluation and orchestration decisions but does not launch Hosts, mutate Actors, rewrite Packages, or implement lease storage.
7. Routing addresses `target_node_id`; Server resolves Node → Actor → Host with complete Project/Run/source/target/Package context.
8. Effective policy is enforced by Server-side routing/Run boundaries rather than prompt text. Running GraphRun policy does not hot-update implicitly.

## Open decisions

- Whether unavailable Actor references are allowed in a reusable GraphInstance.
- Queueing, replacement, retry, partial start, and rollback when lease acquisition fails.
- Partial connection activation, dynamic Actor replacement, fan-in/fan-out, join, and delegation depth.
- Exact GraphRun failure/recovery behavior and interaction with waiting DirectRuns.
- When effective policy is snapshotted and how ProjectPolicy, ActorCapability, and GraphGrant are versioned and approved.
- Connection-evaluation transaction boundaries, duplicate Package handling, and route idempotency.
- Whether advanced activation concepts remain future features or are dropped from the first Graph stage.

These decisions remain open and require later Graph/Run specifications.

## Superseded vocabulary

The older all-in-one `GraphActivation` object is not the accepted replacement name for GraphRun and does not own the newer binding/lease model. Historical activation prose remains provenance only.
