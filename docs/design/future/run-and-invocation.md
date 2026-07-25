# Run and Invocation

> Overall status: **accepted future boundary** with **open state, failure, and recovery decisions**.
>
> Authority: future product-design input only, not implementation authorization. It does not describe current Runtime behavior.

## Read contract

- **Owner:** future Run Engine on the Runtime Server.
- **Inputs:** accepted Actor references, immutable input Packages, DirectRun or GraphRun context, and Host/Package facts.
- **Outputs:** Run and Invocation records, Actor lease transitions, wake-up/cancellation commands, and lifecycle decisions.
- **Not owned here:** Actor identity/session storage, Package/Delivery mutation, Graph topology/policy, Host wire protocol, or backend process mechanics.

## Inherited current constraints

- Package content remains one immutable Head plus exactly one Body containing one root `BrickPrompt`; Delivery owns mutable routing state.
- Snapshot-fixed execution configuration remains separate from dynamic Package/Run input.
- ActorHost reports process/session facts and does not own Run completion or wake-up decisions.
- Host command ACK means receipt rather than execution completion.

These constraints are inherited from the [Runtime invariant kernel](../current/runtime-invariants.md) and are not redefined here.

## Target-stage position

DirectRun is the first end-to-end workflow boundary. Graph follows only after the Direct Actor path is proven. This sequencing is a target-stage distinction, not a claim that either workflow is current.

## Accepted future boundaries

1. A DirectRun coordinates one Actor, one input Package, one Actor lease, and one or more closed Invocation records.
2. Run Engine owns Run/Invocation transitions, Actor leases, waiting conditions, wake-up, cancellation, completion, and failure decisions.
3. Run Engine coordinates Actor, Package, and Host through typed interfaces and does not write their owned state directly.
4. An Invocation is a closed execution record. A later wake-up creates a new Invocation that may resume the Actor's stored backend session rather than reopening the previous Invocation.
5. A waiting Actor remains leased to its current Run and is not returned to unrelated work merely because no backend process is active.
6. ActorHost reports process/session facts and semantic requests; Server-side Run authority decides lifecycle outcomes.
7. GraphRun later consumes the same Run/Invocation interface without moving Graph topology or policy ownership into Run Engine.

## Open decisions

- Exact Run and Invocation state machines, including whether `suspended` is a first-class state.
- Completion criteria when semantic completion requests and process facts disagree.
- Retry, failure, wait, rebind, and lease-release behavior for Actor, Host, backend, Package, timeout, and Server failures.
- Wake-up transaction boundaries, duplicate Package delivery, correlation IDs, and idempotency keys.
- Cancellation deadlines, timeout policy, and graceful versus forced termination.
- Session continuity when resume is unavailable, unsafe, or associated with a replaced Actor/Host.
- Queueing and fairness policy when an Actor lease cannot be acquired.

These decisions must remain open until a dedicated state-machine and recovery design is accepted.

## Superseded vocabulary

The older all-in-one `GraphActivation` model does not govern Run ownership. The accepted future vocabulary separates DirectRun from `GraphTemplate` → `GraphInstance` → `GraphRun`.
