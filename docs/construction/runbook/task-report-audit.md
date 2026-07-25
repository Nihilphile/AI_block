---
kind: policy
scope: on-demand
audience: orchestrator-and-workers
authority: constraint-only
---

# Authority and Evidence Records

## Purpose

Construction records preserve only authority or evidence that must survive the
current conversation. They are interfaces, not a second project-management
system, and a Task/Report pair is never created by default.

Every delegated assignment has:

```text
composition manifest
+ authority input
+ declared output mode
+ concise handoff
```

## Authority input

Use `authority_mode: inline` for bounded W0/W1 work whose outcome, write scope,
constraints, and verification are exact and do not cross a public boundary,
state owner, context lease, or external state.

Use `authority_mode: task` with a committed Task for:

- W2/W3 product construction;
- a new state owner or public Contract;
- work requiring independent testing/review;
- authority that must survive context, Worker, or phase changes;
- external, destructive, costly, or stateful action;
- any ambiguity where later readers must know exactly what was authorized.

Reusable instructions remain in loaded Runbook Bricks. A Task or inline delta
contains only Task-specific subject, scope, decisions, acceptance, and output
instruction.

## Output modes

Every dispatch declares one primary `output_mode`.

### `reply`

Use for preflight, load/scope requests, bounded status, non-binding exploration,
or other results that do not need repository durability.

### `commit`

Use when source, tests, Project State, or another authorized deliverable is the
natural durable result. The commit body records only the Task/delta identity,
baseline, concise verification, material deviation, and residual risk. Do not
add a coding Report that restates the diff, state card, or commit evidence.

### `file`

Use when the Worker's unique contribution has no better durable home or will
authorize later work. Typical examples are independent testing/review,
decision-bearing research/exploration, and root-cause diagnosis.

A file Report is delta-only: exact subject, verdict or decision, decisive
evidence, findings/deviations, coverage limit, and residual risk. It does not
repeat the Task objective, reusable policy, full command logs, or current facts
already summarized by Project State.

## Selection test

Before requiring a record, ask:

1. Will another Worker or future Orchestrator consume this information?
2. Is it absent from source, tests, Project State, Task, and Git metadata?
3. Would losing it weaken authority, acceptance, or a later decision?

If all answers are no, keep it in the reply. File count and workflow level
alone do not justify an artifact.

## Naming and layout

Durable Tasks and file Reports remain under:

```text
docs/construction/records/<module>/
├── tasks/<task-id>-<slug>.md
└── reports/<task-id>-<slug>.<work-type>.md
```

Task IDs use `<MODULE>-<subarea>-<number>`. Historical suffixes and existing
Task/Report pairs remain valid.

## Ownership

- The Orchestrator owns durable Tasks and inline authorization deltas.
- A Worker may read but not rewrite its authority input.
- A Worker writes only authorized deliverables and its declared file Report.
- Objective, authority, public semantics, acceptance, or external-action
  changes require an explicit authorization delta or replacement Task.
- Testers and Reviewers retain independent ownership of their evidence.

## Task content

A durable Task records identity, state owner, workflow/gates, exact subject,
objective, read/write/external authority, Task-specific frozen decisions,
escalation conditions, observable acceptance, and output mode.

## Git use

- Product-writing Workers normally commit source/tests/direct state-card
  updates with structured commit evidence and no separate coding Report.
- State-only reconciliation uses the state diff and commit as its durable
  result.
- Testing/review Reports name the exact implementation subject and later
  orchestration baseline separately.
- Workers stage only explicit authorized paths and their declared output.
- Cancelled or blocked durable Tasks retain a brief status only when later
  readers need it.
