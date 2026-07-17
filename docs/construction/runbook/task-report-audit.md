---
kind: policy
scope: on-demand
audience: orchestrator-and-workers
authority: constraint-only
---

# Task and Report Audit

## Purpose

Every delegated construction assignment leaves a small Git-tracked authorization/evidence trail:

- the Orchestrator owns the Task;
- each Worker owns the Report for work it performed;
- the dispatch Load Manifest selects reusable context without duplicating it into the Task;
- records preserve Task-specific decisions, work/evidence, deviations, and risk.

These are interfaces, not a second project-management system.

## Naming and layout

Task IDs use `<MODULE>-<subarea>-<number>`. Real records remain under:

```text
docs/construction/records/<module>/
├── tasks/<task-id>-<slug>.md
└── reports/<task-id>-<slug>.<work-type>.md
```

Historical `.coder.md`, `.tester.md`, `.reviewer.md`, and similar suffixes remain valid.

## Ownership

- The Orchestrator writes and commits the Task before authorized product work begins.
- A Worker may read but not rewrite the Task.
- A Worker writes only authorized product/evidence paths and its own Report.
- Objective, authority, public semantics, acceptance, or external-action changes require an explicit authorization delta or a new Task.
- Reports contain no secrets, raw transcripts, or large logs.

## Context composition

- Task `References` are audit pointers, not auto-load directives.
- The Orchestrator dispatches the Task plus exact role/procedure/policy/design Bricks.
- Reusable instructions stay in the Runbook and are not copied into every Task.
- Task-specific baseline, scope, semantics, error codes, decisions, acceptance, and commit instructions stay in the Task/delta.

## Task content

A Task records identity, state owner, workflow/gates, exact subject, objective, read/write/external authority, frozen decisions, escalation conditions, audit references, observable acceptance, and handoff.

## Report content

A Report records lease/subject identity, uncertainty and decisions, work/evidence, exact verification/result, material tool/context integrity, deviations, and remaining risk.

The Orchestrator classifies reported decisions as accepted, acceptable alternative, correction required, or out of authority. This calibrates only the same lease/module/decision category.

## Git use

- Product-writing Workers commit authorized implementation and their Report together when practical.
- Testing/review Reports name the exact implementation subject and later orchestration baseline separately.
- Workers stage only explicit authorized paths and their Report.
- Cancelled or blocked Tasks remain with a brief status explanation.
