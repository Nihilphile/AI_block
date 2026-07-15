# Construction Task and Report Audit

> Scope: construction records only. This document does not define product design workflow or workflow thickness levels.

## 1. Purpose

Every delegated construction task leaves a small, Git-tracked pair of records:

- the Controller writes the Task before work begins;
- each participating Worker writes its corresponding Report;
- the records preserve decisions, implementation choices, verification, and deviations without duplicating a full design or implementation plan.

These files are audit records, not a second project-management system. Keep them short.

## 2. Directory layout

Records are grouped by the owning module:

```text
docs/construction/records/
└── <module-slug>/
    ├── tasks/
    │   └── <task-id>-<slug>.md
    └── reports/
        ├── <task-id>-<slug>.coder.md
        ├── <task-id>-<slug>.researcher.md
        ├── <task-id>-<slug>.tester.md
        └── <task-id>-<slug>.reviewer.md
```

Create only the directories and role reports actually needed by a task.

## 3. Task ID

Task IDs use:

```text
<MODULE>-<subarea>-<number>
```

Example:

```text
RC-val-001
RC-pkg-001
HOST-conn-001
```

Rules:

- `MODULE` is a stable 2–5 character uppercase module code.
- `subarea` is a short lowercase semantic token such as `val`, `pkg`, or `conn`; do not use an opaque single letter or a temporary phase number.
- `number` is a three-digit sequence local to that module and subarea, beginning at `001`.
- The lowercase kebab-case filename slug is descriptive only and is not part of Task identity.
- A module code is declared on first use and must not later be reassigned to another module.
- A cross-module Task uses the code of its primary state owner. Other affected modules are recorded in the Task body.
- Task IDs never change after work begins, even if the title or implementation changes.
- A materially new write authorization, remediation, or follow-up receives a new Task ID and references the earlier Task with `follows`.

Example filenames:

```text
tasks/RC-val-001-inert-json-materialization.md
reports/RC-val-001-inert-json-materialization.coder.md
reports/RC-val-001-inert-json-materialization.tester.md
```

## 4. Ownership and lifecycle

- The Controller owns the Task file.
- Workers may read but must not rewrite the Task.
- A Worker owns only the Report file for its assigned role.
- Before work begins, the Controller may revise the Task freely.
- After work begins, a material scope change creates a new Task. A non-material clarification may be appended by the Controller as a dated note.
- A Worker may escalate or stop; it does not silently expand the Task write scope.
- Only roles that actually participated create reports.
- Reports contain no secrets, credentials, raw model transcripts, or large command logs. They reference retained evidence when detail is needed.

## 5. Minimal Task template

```markdown
# <TASK-ID> <Title>

- owner: <module / state owner>
- follows: none | <TASK-ID>
- affected modules: <names or none>

## Objective

<One short outcome statement.>

## Write scope

<Allowed files or directories.>

## Constraints and escalation

<Frozen decisions and conditions that require asking the Controller.>

## Acceptance

<Observable checks that prove completion.>
```

The Task should normally fit on one screen. Large design rationale belongs in an approved design or ADR referenced by the Task.

## 6. Minimal Worker Report template

```markdown
# <TASK-ID> <Role> Report

- role: coder | researcher | tester | reviewer
- result: completed | blocked | failed
- commit: same-as-report | <commit SHA> | none

## Decisions

- uncertainty found: yes | no
- implicit decisions found: yes | no
- decisions made or escalation requested: <short list or none>

## Work and evidence

<What was implemented, researched, tested, or reviewed, and the concise evidence.>

## Deviations and remaining risk

<None, or a short explicit list.>
```

For an autonomous small-task Coder, `Decisions` is the retrospective micro-preflight: it records what was uncertain, what local decision was made, and why. It does not need a separate long preflight document.

## 7. Git rules

- Task and Worker Report files are versioned construction artifacts.
- The primary Coder normally commits the unchanged Task, its Report, and the corresponding implementation together.
- When a Report is in the implementation commit itself, use `commit: same-as-report`; do not amend repeatedly to embed the commit's own SHA.
- Researcher, Tester, or Reviewer reports produced later are committed with the next authorized remediation or module-closeout record and reference the exact implementation commit they examined.
- Workers stage only their authorized product files, the unchanged Task, and their own Report.
- Unrelated construction records and unrelated worktree changes are never included.
- A cancelled Task is retained with a short Controller note explaining that no implementation occurred.

## 8. Audit use

The Controller uses accumulated Reports to calibrate delegation within the same Coder and module:

- aligned local decisions preserve the current delegation mode;
- a material mismatch narrows autonomy for that decision category;
- scope expansion, hidden uncertainty, or public-contract drift returns the module to explicit authorization;
- restored autonomy requires later evidence from aligned Tasks.

This calibration is event-based, not a numeric Worker score.
