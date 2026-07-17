# Workflow Levels

## Decision model

Use:

```text
base workflow level + independently triggered gates
```

Do not produce a numeric risk score. Impact determines the base level; concrete yes/no conditions add controls.

## Base decision tree

```text
Does the work modify product code or a product deliverable?
├─ no  → W0
└─ yes
   Does it establish/change a public boundary, cross state owners,
   or require coordinated slices with a controlled shared interface?
   ├─ yes → W3
   └─ no
      Does it change behavior, state, or internal structure in one module?
      ├─ yes → W2
      └─ no
         Are outcome and write scope exact, the edit reversible,
         and verification direct and deterministic?
         ├─ all yes → W1
         └─ any no  → W2
```

File count is not a classification rule.

## W0 — Construction support

Use for bounded read-only inspection, status reporting, or maintenance of construction records.

Default:

- no implementation Worker;
- no Task/Report pair unless delegated evidence will materially constrain later construction;
- deep repository investigation may still be delegated as `exploring` to protect Orchestrator context.

Product design is outside this classification.

## W1 — Lightweight autonomous construction

Use for narrow, reversible, fully specified changes with direct verification and no public-boundary effect.

Default:

- Orchestrator provides exact objective, write scope, constraints, and acceptance;
- coding Worker performs a micro-preflight and continues without a second authorization;
- Worker self-verifies and writes a brief Report;
- no separate plan, independent test, or review.

The Worker retrospectively reports meaningful uncertainty, implicit decisions, chosen direction, and reason.

## W2 — Standard module construction

Use for a bounded feature, bug fix, or refactor that changes behavior, state, or structure inside one state-owning module.

Default:

- Orchestrator writes the Task;
- coding Worker returns a full preflight;
- Orchestrator closes material decisions and gives one implementation authorization;
- Worker implements, tests, self-verifies, and reports;
- no independent testing or per-Task review unless triggered separately.

## W3 — Controlled multi-boundary construction

Use for public boundaries, multiple state owners, or coordinated slices whose interface or compatibility order must be controlled.

Default:

- Orchestrator provides a short construction map covering ownership, sequence, interfaces, and acceptance;
- unresolved decisions close before their dependent slice starts;
- implementation is authorized in meaningful slices, not per file;
- integrated output receives independent testing;
- review normally occurs once at module or boundary acceptance, not after every slice.

## General rules

- A Worker may escalate but may not downgrade the assigned workflow.
- If a risky part is separable, split it into another Task rather than thickening unrelated work.
- Product ambiguity returns to product-design authority; more construction ceremony cannot resolve it.
- External state changes always require their own explicit authorization.
- Every added Worker, approval round-trip, or artifact must cite a concrete trigger.
