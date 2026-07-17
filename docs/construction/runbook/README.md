# AI_block Construction Runbook

## Purpose

This is a set of task-specific working guides, not a rigid execution harness.

The Orchestrator decides what work is being delegated, its allowed scope, authority, acceptance conditions, and escalation boundaries. A Worker reads the guide relevant to the work it has been assigned. Reading a guide never grants authority.

The system is designed to remove unnecessary construction ceremony while retaining enough structure for safe delegation and useful audit records.

## Design principles

1. **Work, not identity.** `coding`, `exploring`, `testing`, and similar names describe the work being performed, not permanent Worker roles.
2. **Authority comes from delegation.** The Task and the Orchestrator define permissions and boundaries. Guides explain methods only.
3. **Progressive disclosure.** Load only this entry point, the AI_block profile, the assigned work guide, and any specifically triggered rule.
4. **Minimum sufficient workflow.** Start with the thinnest workflow justified by impact; add controls only for concrete binary triggers.
5. **Bounded context leases.** Reuse a Worker while a coherent body of work benefits from its context, then retire it.
6. **Evidence before acceptance.** Completion claims are supported by fresh, proportionate evidence without forcing every Task through independent testing and review.
7. **Records are interfaces.** Task and Report files carry decisions across Workers without duplicating full transcripts or implementation plans.

## Directory map

```text
docs/construction/
├── runbook/
│   ├── README.md
│   ├── ai-block-project-profile.md
│   ├── orchestration/
│   │   ├── workflow-levels.md
│   │   ├── specialized-gates.md
│   │   ├── worker-context-leases.md
│   │   └── evidence-and-acceptance.md
│   ├── work-guides/
│   │   ├── coding.md
│   │   ├── debugging.md
│   │   ├── exploring.md
│   │   ├── researching.md
│   │   ├── testing.md
│   │   └── reviewing.md
│   ├── policies/
│   │   ├── superpowers.md
│   │   └── serena.md
│   ├── task-report-audit.md
│   ├── templates/
│   │   ├── task.md
│   │   └── report.md
│   └── examples/
│       └── workflow-classification.md
└── records/
    └── <module Task and Report records>
```

Product architecture constraints, milestone plans, and real Task/Report records remain outside the Runbook because they define construction targets or evidence, not general working method.

## Loading routes

### Orchestrator, when classifying new construction

Read:

1. this file;
2. `ai-block-project-profile.md`;
3. `orchestration/workflow-levels.md`;
4. `orchestration/specialized-gates.md` only for possible triggered gates;
5. `task-report-audit.md` when creating a delegated Task;
6. `orchestration/worker-context-leases.md` when selecting or retaining a Worker.

### Worker, when performing assigned work

Read:

1. the Task or delegation message;
2. `ai-block-project-profile.md`;
3. exactly the applicable file under `work-guides/`;
4. referenced product design and acceptance material;
5. a specialized gate or tool policy only when the Task activates it;
6. `templates/report.md` before handoff.

If one assignment genuinely contains multiple kinds of work, the Orchestrator may name multiple guides. A Worker does not broaden its assignment merely because another guide exists.

## Authority order

| Source | Governs |
|---|---|
| Explicit user direction | Current construction authority and exceptions |
| Approved product design, contract, or ADR | What the product must mean |
| Orchestrator Task or clarification | What this Worker may do now |
| `ai-block-project-profile.md` | Project-specific execution and Worker policy |
| Orchestration references | How much construction control is required |
| Work guide or tool policy | How to perform the assigned work well |
| Report | What was actually decided, done, and evidenced |

A work guide or policy cannot override product design, enlarge write scope, authorize external actions, or permit self-dispatch.
