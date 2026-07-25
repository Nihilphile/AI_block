# Current Focus

## Accepted current state

Project State System v0.1 is accepted and its OpenSpec change [`establish-project-state-system`](../../openspec/changes/establish-project-state-system/) is complete but not archived. The durable acceptance summary is the [Project State System v0.1 closeout](../../docs/construction/records/project-state-system/project-state-system-v0.1-closeout.md).

The accepted scope is documentation/process-only: the sparse state tree and Runbook integration add no Runtime source, test, dependency, lockfile, product-design, or product-API change.

Runtime Design Knowledge System v0.1 has independently passed acceptance and semantic review with zero actionable findings. Its canonical entry is the [Runtime design catalog](../../docs/design/README.md), and confirmed current cross-module semantics route through the [Runtime invariant kernel](../../docs/design/current/runtime-invariants.md). This acceptance covers documentation routing and status preservation only: future files do not authorize product implementation, and the OpenSpec change remains unarchived pending a separate explicit archive action.

The active product change is [`build-project-and-definition-brick-persistence`](../../openspec/changes/build-project-and-definition-brick-persistence/). Its proposal, design, capability specification, and task plan are complete and validated. It selects the bounded persistence-first path: minimal Project bootstrap plus durable Definition Brick authoring/history/exact resolution and an adapter to the existing Actor resolver.

The Contract-first slice is accepted at implementation subject `7d3eca4`: additive root-exported Project/Definition Brick application values, aggregate identity, operation results, and stable errors are implemented with passing independent acceptance and Early Review. This Contract acceptance does not imply that the Project module, authoring behavior, SQLite persistence, or Actor resolver adapter exists.

## Current condition

- The accepted Runtime Contracts, Host Gateway, ClaudeCodeAdapter, and reference-only ActorTemplate slices remain the current implementation evidence.
- The new state cards are current summaries of those bounded slices, not evidence of end-to-end Runtime behavior.
- No Runtime module is blocked by the Project State System change. Missing composition, persistence, CLI, Package workflow, reconnect/recovery, and Graph behavior remain deliberately deferred.
- The active change has completed OpenSpec tasks `2.1` through `2.4` only. Runtime Contracts and their directly affected state card now include the accepted Project/Definition Brick application surface.
- No Project module source/test root, durable authoring behavior, SQLite adapter, migration, production resolver, dependency, lockfile, Server composition, or executable Project workflow exists yet.
- Actor creation, ActorTemplate/Snapshot production persistence, Host launch, CLI/HTTP, Package/Delivery, Run/Invocation, recovery automation, backup/export, and Graph remain explicitly outside the active slice.

## Next entry point

A new Orchestrator reads the [root state README](../README.md), [authority](./authority.md), [system map](./system-map.md), and this focus file, then loads the active persistence change and only the module cards relevant to the selected construction slice. Runtime design questions start at the [Runtime design catalog](../../docs/design/README.md).

The next construction action is Orchestrator-owned W3 preflight dispatch for the Project application/in-memory slice (`3.1` through `3.5`). No implementation Worker is authorized until its exact Task is committed, the Coder returns preflight, and the Orchestrator closes the source/test-root, ownership, transaction-port, and Project State creation choices. SQLite remains a later separately authorized slice.

## Reconciliation posture

If scoped source, Contracts, tests, or accepted evidence contradict a card, record the mismatch in handoff and escalate it to the Orchestrator. Reconcile only the directly affected card when authorized; do not broaden the current focus into a repository-wide documentation rewrite.

Planning does not create a Project/persistence card. Once authorized implementation establishes a real owned source/test boundary, the Coder may create only that directly affected module card. Testers report state mismatches without rewriting claims; Reviewers verify changed cards against the exact accepted subject. Root routing, the cross-module system map, this focus file, and accepted/deferred summaries remain Orchestrator-owned and are reconciled at acceptance.
