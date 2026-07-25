# Current Focus

## Accepted current state

Project State System v0.1 is accepted and its OpenSpec change [`establish-project-state-system`](../../openspec/changes/establish-project-state-system/) is complete but not archived. The durable acceptance summary is the [Project State System v0.1 closeout](../../docs/construction/records/project-state-system/project-state-system-v0.1-closeout.md).

The accepted scope is documentation/process-only: the sparse state tree and Runbook integration add no Runtime source, test, dependency, lockfile, product-design, or product-API change.

Runtime Design Knowledge System v0.1 has independently passed acceptance and semantic review with zero actionable findings. Its canonical entry is the [Runtime design catalog](../../docs/design/README.md), and confirmed current cross-module semantics route through the [Runtime invariant kernel](../../docs/design/current/runtime-invariants.md). This acceptance covers documentation routing and status preservation only: future files do not authorize product implementation, and the OpenSpec change remains unarchived pending a separate explicit archive action.

## Current condition

- The accepted Runtime Contracts, Host Gateway, ClaudeCodeAdapter, and reference-only ActorTemplate slices remain the current implementation evidence.
- The new state cards are current summaries of those bounded slices, not evidence of end-to-end Runtime behavior.
- No Runtime module is blocked by the Project State System change. Missing composition, persistence, CLI, Package workflow, reconnect/recovery, and Graph behavior remain deliberately deferred.

## Next entry point

A new Orchestrator reads the [root state README](../README.md), [authority](./authority.md), [system map](./system-map.md), and this focus file, then loads only cards relevant to the selected decision. Runtime design questions start at the [Runtime design catalog](../../docs/design/README.md). The next Runtime construction slice remains an Orchestrator decision; this current view does not select or authorize it.

## Reconciliation posture

If scoped source, Contracts, tests, or accepted evidence contradict a card, record the mismatch in handoff and escalate it to the Orchestrator. Reconcile only the directly affected card when authorized; do not broaden the current focus into a repository-wide documentation rewrite.
