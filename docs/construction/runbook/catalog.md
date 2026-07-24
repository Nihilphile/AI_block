---
kind: catalog
scope: orchestrator
audience: orchestrator
authority: none
---

# Construction Brick Catalog

This is an Orchestrator catalog, not a Worker auto-load manifest. Select exact files for each lease and dispatch.

## Project and orchestration

| Brick | Scope | Purpose |
|---|---|---|
| `project/orchestrator-profile.md` | orchestrator | AI_block delivery, model selection, sequencing, and context policy |
| `project/worker-lease-policy.md` | lease | Common Worker authority ceiling and lease behavior |
| `orchestration/workflow-levels.md` | orchestrator | W0-W3 base classification |
| `orchestration/specialized-gates.md` | orchestrator / dispatch when active | Binary gate triggers and added controls |
| `orchestration/worker-context-leases.md` | orchestrator | Lease creation, reuse, continuity, reset, and retirement |
| `orchestration/evidence-and-acceptance.md` | orchestrator / evidence dispatch | Evidence ownership and module acceptance |
| `task-report-audit.md` | orchestrator / handoff | Task and Report record authority |

## Project State System

| Brick | Scope | Purpose |
|---|---|---|
| `project_state/README.md` | orchestrator / dispatch | Root current-state route and bounded module-card selection |
| `project_state/_meta/authority.md` | orchestrator / on-demand | Authority separation and stale-card reconciliation rule |
| `project_state/_meta/system-map.md` | orchestrator / on-demand | Sparse current architecture, dependency direction, and planned/deferred boundaries |
| `project_state/_meta/current-focus.md` | orchestrator / on-demand | Active focus, named blockers with unblock paths, and next entry point |
| `docs/construction/project-state-system-design-v0.1.md` | orchestrator / design context | Semantics and maintenance rules for the current-state system |

State cards are dispatch-scoped target context, not a directory-wide load. Select one exact card for the target module; add direct neighbors only for a declared cross-module boundary.

## Role-specific Bricks

| Role | Lease Brick | Dispatch procedures |
|---|---|---|
| Coder | `worker-guides/coder/lease.md` | `preflight.md`, `implementation.md`, `handoff.md` |
| Debugger | `worker-guides/debugger/lease.md` | `diagnosis.md`, `repair.md` |
| Tester | `worker-guides/tester/lease.md` | `acceptance.md`, `focused-retest.md` |
| Reviewer | `worker-guides/reviewer/lease.md` | `module-review.md`, `focused-rereview.md` |
| Researcher | `worker-guides/researcher/lease.md` | `decision-brief.md` |
| Explorer | `worker-guides/explorer/lease.md` | `repository-question.md` |

All procedure paths are relative to that role's `procedures/` directory.

## Shared procedures

| Brick | Scope | Purpose |
|---|---|---|
| `procedures/subject-identity.md` | dispatch | Separate implementation subject from later orchestration records |
| `procedures/scope-escalation.md` | dispatch | Stop and request exact scope expansion without unauthorized edits |
| `procedures/clean-worktree.md` | dispatch | Preserve unrelated work and provide clean-state evidence |
| `procedures/controlled-probe.md` | dispatch | Execute explicitly authorized stateful or real-service probes within fixed budgets and cleanup boundaries |

## Policies

| Brick | Scope | Purpose |
|---|---|---|
| `policies/serena-safety.md` | lease | Mandatory no-memory and authority ceiling |
| `policies/serena-operations.md` | dispatch | Serena non-memory LSP/IDE working method |
| `policies/superpowers-boundary.md` | lease | Prevent automatic workflow takeover or self-dispatch |
| `policies/superpowers-methods.md` | dispatch | Use one explicitly authorized capability within the assigned work |

## Templates

| Brick | Scope | Purpose |
|---|---|---|
| `templates/load-manifest.md` | orchestrator | Lease and dispatch composition shape |
| `templates/task.md` | orchestrator | Task authority record |
| `templates/report.md` | handoff | Worker evidence record |

## Selection rules

- Load one role lease Brick when a lease is established; do not load a role directory.
- Load one procedure for the current phase unless the Task genuinely combines work types.
- Load a specialized gate only when its trigger is true.
- Load operation policy only when the tool/method will be used.
- Load templates only while producing that artifact.
- Load the root Project State README and exact target module card for every task dispatch; add neighbor cards only for declared boundary crossings.
- Do not treat this catalog as authority or as an instruction to read every listed file.
