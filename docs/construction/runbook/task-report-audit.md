# Task and Report Audit

## Purpose

Every delegated construction assignment leaves a small Git-tracked authorization and evidence trail:

- the Orchestrator owns the Task;
- each Worker owns the Report for the work it actually performed;
- records preserve meaningful decisions, implementation or evidence, deviations, and remaining risk.

These are interfaces between Workers, not a second project-management system.

## Naming

Task IDs use:

```text
<MODULE>-<subarea>-<number>
```

Example: `RC-val-001`.

- `MODULE`: stable uppercase 2–5 character module code;
- `subarea`: short lowercase semantic token;
- `number`: three-digit sequence local to module and subarea.

## Record layout

```text
docs/construction/records/
└── <module-slug>/
    ├── tasks/
    │   └── <task-id>-<slug>.md
    └── reports/
        ├── <task-id>-<slug>.coding.md
        ├── <task-id>-<slug>.exploring.md
        ├── <task-id>-<slug>.researching.md
        ├── <task-id>-<slug>.debugging.md
        ├── <task-id>-<slug>.testing.md
        └── <task-id>-<slug>.reviewing.md
```

Create only Reports for work actually assigned. Suffixes identify work performed, not permanent roles. Existing historical `.coder.md`, `.researcher.md`, `.tester.md`, and `.reviewer.md` suffixes remain valid and are not renamed.

## Ownership

- The Orchestrator writes and commits the Task before authorized product work begins.
- A Worker may read but not rewrite the Task.
- A Worker writes only its own work Report and authorized product files.
- Material objective, write-scope, acceptance, or public-semantic changes require a new Task or explicit re-authorization according to the workflow.
- Reports contain no secrets, raw transcripts, or large logs.

## Task content

A Task records:

- identity, owner, baseline, and workflow classification;
- objective and exact write/read scope;
- authoritative references and frozen decisions;
- delegated discretion and forbidden actions;
- allowed tools, external actions, and delegation capability;
- escalation conditions;
- observable acceptance and expected Report.

The Task is the authority boundary. A work guide cannot enlarge it.

## Report content

A Report records:

- work performed and subject identity;
- meaningful uncertainty and decisions;
- implementation approach or evidence;
- verification/result;
- deviations and remaining risk.

The Orchestrator judges reported decisions as accepted, acceptable alternative, correction required, or out of authority. This calibrates future delegation only for the same Worker context, module, and decision category; it is not a global score.

## Git use

- Task and Reports are versioned construction artifacts.
- Product-writing Workers commit their implementation and corresponding Report together when practical.
- Independent testing and reviewing Reports name the exact subject commit examined.
- Workers stage only authorized files and their own Report.
- Cancelled or blocked Tasks remain with a brief status explanation.
