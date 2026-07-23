## Context

AI_block's design documents, OpenSpec changes, construction records, and source/tests each serve a different purpose, but none provides a compact answer to “what is true for this module today?” A new Orchestrator or Worker therefore tends to reload too much history or search broad source areas before it can identify a bounded read/write scope.

The durable policy is defined in `docs/construction/project-state-system-design-v0.1.md`. This change implements only its first activation: a sparse root `project_state/` tree, five module state cards, and runbook integration. The repository currently has no `project_state/` directory. The existing reference-only ActorTemplate change is complete and remains historical implementation evidence, not an active work plan.

## Goals / Non-Goals

**Goals:**

- Make current architecture, module ownership, implemented reality, deferred scope, and active blockers discoverable through bounded reads.
- Create one self-contained default README state card for each initial module boundary.
- Preserve explicit authority boundaries: state cards route readers; source/tests, accepted designs, OpenSpec, and evidence retain their existing authority.
- Make state reconciliation a normal scoped construction responsibility rather than an informal best effort.
- Keep initial adoption small enough to verify against current accepted evidence without a repository-wide documentation rewrite.

**Non-Goals:**

- Do not implement Runtime persistence, Project/Brick authoring, Actor behavior, Graph, or any product feature.
- Do not convert construction records into current-state documentation or rewrite their history.
- Do not generate source summaries, introduce a documentation database, or add runtime/build dependencies.
- Do not pre-create cards for planned modules, split every source directory, or require every future change to update unrelated state files.
- Do not define final HTTP, CLI, or Runtime product interfaces.

## Decisions

### 1. Use a root-level sparse state tree

Create `project_state/` at repository root with a structure that follows stable architecture boundaries, not a literal source-tree copy.

The tree starts with root/meta routing files and five initial cards only. It maps existing source roots such as `apps/runtime-server/src/modules/actor/` to an understandable state location, but test folders and utility directories do not independently create cards.

**Why:** This makes the tree directly discoverable beside `apps/` and `packages/`, while sparse mapping prevents high-maintenance micro-documentation.

**Alternative considered:** Place state documents under `docs/construction/`. Rejected because those documents would be visually grouped with process evidence rather than treated as a current-source map.

### 2. One default README per module

Each initial module has one `README.md` state card with a small front matter block and the standard sections: Intent, Implemented today, Boundary and dependencies, Current condition, Read next, and Evidence.

**Why:** Intent, reality, and current gaps are normally needed together. A single default card avoids three mandatory reads for every task.

**Alternative considered:** Split design, implementation, and blockers into separate files from day one. Rejected because they are not independent loading decisions and would raise navigation cost without reducing tokens.

### 3. Split only on independent reading decisions

No facet files are created in this change. Future `interfaces.md`, `lifecycle.md`, or `persistence.md` files are allowed only when a topic is routinely loaded independently or the default card stops being a compact orientation layer. The README remains the entry point and supplies the load map.

**Why:** File count does not determine context cost: bounded batch reads can load several small files in one tool call, while one large document can inject far more irrelevant context. The optimization target is independent load selection, not minimizing file count.

### 4. Treat cards as overwrite-style current views

Cards describe the accepted current implementation, not a timeline. When an implementation approach changes, the affected card is rewritten and links to the historical OpenSpec/record evidence. Historical rationale stays in Git and construction records.

**Why:** This preserves context density and prevents a second changelog from drifting away from the evidence trail.

### 5. Split maintenance responsibility by role

- Orchestrator owns root routing, cross-module map, current focus, and accepted/deferred summary.
- Coder updates only directly affected module cards when a scoped change alters card statements.
- Tester reports observed state mismatches but does not rewrite implementation claims.
- Reviewer verifies that affected cards match the accepted implementation and evidence.

**Why:** The Writer closest to a module can update local reality, while the Orchestrator retains cross-module coherence and the Reviewer supplies the anti-drift gate.

### 6. Dispatch state explicitly through `load:` sets

Runbook task dispatches name the root and target module state card that a Worker must read before local source. The task writer adds direct-neighbor cards only when the task crosses a declared boundary.

**Why:** This turns progressive disclosure into a repeatable orchestration action rather than an informal suggestion.

## Risks / Trade-offs

- [State-card drift] → Cards include source/test roots and evidence links; every behavior/boundary/condition change triggers scoped reconciliation and Reviewer verification.
- [Duplicate authority] → Root authority document states that cards are summaries; source/tests, formal designs, OpenSpec, and evidence retain precedence.
- [Over-documentation] → Initial scope is limited to five cards; planned modules and utility folders remain in the system map only.
- [Under-documentation] → Default cards require both design intent and actual implementation, plus a `Read next` route to local evidence.
- [Excessive dispatch context] → One module README is the default. Additional facets and neighbor cards are loaded only for an independent task need.
- [Stale global focus] → `current-focus.md` is Orchestrator-owned and records only active work, real blockers, and the next decision; it is not a roadmap archive.

## Migration Plan

1. Add the durable Project State System design document and this construction change.
2. Create the sparse root/meta tree and five initial module cards from accepted designs, closeouts, and current source roots.
3. Add a runbook policy, load-manifest convention, and role procedures for state reads, writes, reconciliation, and review.
4. Validate that every card has the required sections, safe links, and matching scoped source/evidence references.
5. Treat future Runtime work as the first real consumer: each approved task declares its state load set and updates only affected cards when required.

Rollback is documentation-only: remove `project_state/` and the related runbook references in one reversible change. No runtime data, protocol, or user state is migrated.

## Open Questions

- Whether a future lightweight lint should validate state-card front matter and required headings; this change uses review plus manual validation only.
- Whether state cards should carry a machine-readable last-reconciled commit once the repository has enough stable acceptance cadence to make it valuable.
- The threshold for first facet splitting is intentionally behavioral rather than a fixed line count; initial usage will provide evidence.
