# Runtime Design Knowledge System

> Authority: design routing and status catalog only.
>
> This file does not independently define Runtime behavior. It routes readers to the authority appropriate to their question.

## Read by question

| Question | Canonical route | Authority |
|---|---|---|
| What long-term product outcome and trade-off direction guides AI_block? | [AI_block North Star](../NORTH_STAR.md) | Directional product authority only; not current behavior or implementation authorization |
| Which cross-module Runtime semantics are confirmed now? | [Current Runtime invariants](./current/runtime-invariants.md) | Confirmed current design kernel, bounded by Contracts and accepted evidence |
| What is the intended direction for a future product boundary? | [Focused future designs](#focused-future-designs) | Status-preserving future design input; not implementation authorization |
| What did an original root design say in full? | [Preserved Runtime history](#preserved-runtime-history) | Historical provenance only |
| What is implemented in a particular module now? | [Project State](../../project_state/README.md) | Root-level navigation and concise current-state summary only |
| What does the product actually support? | Runtime Contracts, scoped source, and tests | Executable truth |
| What work is accepted or authorized? | Accepted OpenSpec specifications and active changes | Normative only within their accepted scope |

## Authority order

1. Explicit current authorization controls the immediate write scope.
2. The [AI_block North Star](../NORTH_STAR.md) governs long-term product direction and product-level trade-offs without defining Runtime semantics or authorizing work.
3. Accepted OpenSpec specifications and approved product designs govern product intent within their scope.
4. Runtime Contracts, source, and tests govern actual supported values and executable behavior.
5. [Current Runtime invariants](./current/runtime-invariants.md) reconcile only confirmed cross-module semantics and explicit target-stage distinctions.
6. [Project State](../../project_state/README.md) summarizes current module orientation and routes to evidence; it does not override the authorities above.
7. Construction records, closeouts, Reports, Plans, Tasks, and Git preserve verification and history.
8. Historical designs and root compatibility shims do not gain current authority from their age or path.

## Status taxonomy

| Status | Meaning |
|---|---|
| **Confirmed current** | Accepted evidence or the current Contract boundary establishes the rule at the stated scope. |
| **Target-stage distinction** | Separates a current slice, Direct Actor stage, later reliability/Graph stage, or broader target; it is not an implementation claim. |
| **Accepted future boundary** | Intended future ownership, direction, or sequencing; not current behavior or implementation authorization. |
| **Product design draft** | Coherent future product input whose details still require acceptance and narrowing. |
| **Proposed** | Candidate change that has not displaced the accepted baseline. |
| **Open** | Unresolved decision preserved without selection. |
| **Superseded** | Historical formulation replaced by an explicit newer decision. |
| **Historical source** | Complete preserved provenance, not a canonical current decision surface. |
| **Compatibility route** | Path-preserving shim with no independent design semantics. |

## Current design

- [Runtime invariants](./current/runtime-invariants.md) admits only confirmed current cross-module semantics and explicit target-stage distinctions.
- Implementation absences and module condition belong in [Project State](../../project_state/README.md), not in the invariant kernel.
- Draft, proposed, accepted-future, and open material belongs in the focused future designs below.

## Focused future designs

Exactly five focused files own future design questions:

| File | Owned question | Overall status |
|---|---|---|
| [Project persistence and Brick authoring](./future/project-persistence-and-brick-authoring.md) | Project prerequisite, typed namespaces, persistence, and Definition Brick authoring | Product design draft |
| [Package and Delivery](./future/package-and-delivery.md) | Immutable Package baseline, Package workflow, Delivery, provenance, and retention seams | Mixed: inherited current baseline, accepted future boundaries, proposed/open choices |
| [Run and Invocation](./future/run-and-invocation.md) | DirectRun, leases, Invocation lifecycle, waiting, completion, and failure seams | Accepted future boundary with open state/recovery decisions |
| [Actor/Host lifecycle and recovery](./future/actor-host-lifecycle-and-recovery.md) | Actor creation, launch, `model_id`, Host lifecycle, liveness, and recovery | Accepted future boundary with open launch/recovery decisions |
| [Graph and policy](./future/graph-and-policy.md) | GraphTemplate, GraphInstance, GraphRun, routing context, and policy | Later-stage accepted future boundary with open orchestration decisions |

There is no separate Project-and-Actor design and no separate model-selection design. Actor creation, Host launch, and `model_id` seams stay together in the Actor/Host file; Project semantics appear in the persistence file only where persistence and authoring require them.

## Preserved Runtime history

These files are byte-identical copies of the six former root bodies. They retain original wording, links, embedded paths, status language, and chronology:

- [runtime-module-architecture-v0.1.md](./history/runtime/runtime-module-architecture-v0.1.md)
- [runtime-module-concept-v0.2.md](./history/runtime/runtime-module-concept-v0.2.md)
- [runtime-object-module-v0.3.md](./history/runtime/runtime-object-module-v0.3.md)
- [runtime-system-architecture-v0.1.md](./history/runtime/runtime-system-architecture-v0.1.md)
- [runtime-actor-template-and-brick-design-v0.1.md](./history/runtime/runtime-actor-template-and-brick-design-v0.1.md)
- [runtime-project-persistence-and-definition-brick-authoring-design-v0.1.md](./history/runtime/runtime-project-persistence-and-definition-brick-authoring-design-v0.1.md)

Historical text is not promoted merely because it is preserved. A statement becomes current or accepted-future only when the canonical current/future layer carries it forward with an explicit status.

## Compatibility and link policy

The six original root filenames remain as non-authoritative compatibility shims. Each sends current readers here and historical readers to its exact preserved body.

Current Project State links and the [Phase 1 construction anchor](../construction/phase-1-architecture-invariants.md) use canonical design routes. Completed OpenSpec changes and historical Tasks, Plans, Reports, closeouts, and embedded paths remain unchanged and continue to work through the root shims.

## Scope boundary

The Runtime Design Knowledge System migration did not create a product North Star. A later, separately authorized decision created the [AI_block North Star](../NORTH_STAR.md), which remains a directional product document rather than a source of current Runtime semantics or implementation authorization.

This knowledge system does not move `project_state/`, authorize future implementation, alter Runtime semantics, or change Runtime source, tests, Contracts, dependencies, lockfiles, product APIs, executable behavior, or configuration.
