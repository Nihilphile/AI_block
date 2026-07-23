## Why

AI_block has durable product designs, construction records, and source-level truth, but no compact current-state layer that routes a newly arriving Orchestrator or Worker to the exact module context it needs. The resulting broad source and history exploration wastes context and makes current implementation, deferred scope, and active blockers harder to distinguish.

This change establishes a small, versioned Project State System before the next Runtime construction slice begins.

## What Changes

- Add a root `project_state/` current-state read model with sparse module mapping rather than a literal source-tree mirror.
- Add root routing, authority, system-map, and current-focus documents.
- Add one default README state card for each initially implemented or independently hand-offable module: Runtime Contracts, Runtime Server Actor Module, Runtime Server Host Gateway, ActorHost, and Runtime CLI.
- Define concise card metadata and required sections that separate intent, actual implementation, boundaries, current condition, read-next links, and evidence.
- Add runbook rules for bounded `load:` dispatch, state-card reconciliation, role ownership, review, and future optional facet splitting.
- Preserve source/tests as executable truth, construction records as evidence/history, and OpenSpec as future-work planning; this change creates no Runtime product behavior.

## Capabilities

### New Capabilities

- `project-state-system`: Provides progressively disclosed, current module-state orientation and its maintenance rules for project handoff and Worker dispatch.

### Modified Capabilities

None.

## Impact

- Affects repository documentation layout under `project_state/` and `docs/construction/`.
- Affects construction runbook dispatch, handoff, review, and closeout procedures.
- Does not alter Runtime Contracts, Server/Host/CLI runtime behavior, dependencies, lockfiles, product API, or existing historical evidence.
