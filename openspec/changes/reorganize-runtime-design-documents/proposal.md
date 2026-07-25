## Why

AI_block's Runtime designs currently live as several large root-level documents whose authority, implementation status, overlap, and supersession relationships are difficult for a new Orchestrator to resolve without broad reading. With the Project State System now providing current implementation orientation, the remaining design knowledge needs a distinct lifecycle for current cross-module invariants, focused future designs, and intact historical sources.

## What Changes

- Add a `docs/design/` entry and authority catalog that routes readers by independent design question rather than by document chronology.
- Extract a compact current Runtime invariant set for accepted cross-module semantics that must not depend on Project State summaries alone.
- Reconcile unimplemented design material into focused future-design documents while preserving `accepted`, `draft`, `proposed`, and `open` status instead of promoting uncertain decisions.
- Preserve the complete original Runtime design documents under a design-history area with explicit provenance and supersession context.
- Replace highly referenced root design paths with compatibility shims, and update current Project State, Runbook, and active design links to canonical locations without rewriting historical Task, Report, or closeout evidence.
- Keep `project_state/` at repository root as the operational current-state read model.
- Exclude creation of a product North Star from this change.

## Capabilities

### New Capabilities

- `runtime-design-knowledge-system`: Defines canonical routing, authority/status metadata, current-invariant ownership, focused future-design extraction, intact history preservation, and compatibility behavior for Runtime design documents.

### Modified Capabilities

None.

## Impact

- Affects documentation layout under `docs/design/`, selected root-level Runtime design entry paths, Project State links, construction navigation, and this OpenSpec change.
- Preserves historical evidence paths through compatibility shims rather than bulk-editing immutable construction records.
- Does not change Runtime source, tests, Contracts, dependencies, lockfiles, product API, executable behavior, or the root location and authority model of `project_state/`.
