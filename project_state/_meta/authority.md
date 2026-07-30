# Project State Authority

`project_state/` is authoritative only for bounded navigation and concise current-state orientation. It must not override the authority below.

## Authority separation

| Question | Governing source | Project State role |
|---|---|---|
| Product meaning and Runtime semantics | Approved product designs and accepted OpenSpec specifications | Summarize the intent needed to enter a module and link to the design |
| Actual behavior and supported surface | Source, Runtime Contracts, and tests | State only what scoped evidence establishes; source/tests remain executable truth |
| Verification and historical rationale | Construction records, evidence Reports, commits, closeouts, Git history | Link to durable evidence; do not copy a timeline into a card |
| Approved future work | Active OpenSpec changes | Identify deferred/planned scope; do not present it as current behavior |
| Construction procedure and Worker policy | `docs/construction/runbook/` | Route the required load, role, reconciliation, and review procedure |
| Current module orientation | `project_state/` | Provide the compact map and current condition only |

Explicit user direction and the Orchestrator's task authorization remain the immediate authority for the current write scope. Runbook Bricks constrain method and context selection; they do not grant product authority.

## Reconciliation rule

When a card disagrees with scoped source, Contracts, tests, or accepted
evidence, the card is stale. The Worker records the exact mismatch, affected
boundary, and evidence in its declared output. The Orchestrator decides whether
the current task authorizes correction or whether a bounded state change is
needed. Testers report mismatches; Reviewers verify candidate card updates;
Coders update only current implementation/evidence claims on the authorized
directly affected card. The Orchestrator owns module intent, stable ownership
boundaries, accepted/deferred condition, and root/meta routing.

## Current view, not history

Cards describe the accepted approach that is true today. When an approach changes, rewrite the current statement and link the relevant historical record or OpenSpec artifact. Do not preserve an old-versus-new narrative in the card.

`current-focus.md` follows the same rule. It identifies the current product
frontier, the accepted conditions that shape it, genuine product blockers, and
the next product entry point. It is not a live construction log and does not
track Worker leases, task completion, commit subjects, evidence chronology,
administrative queues, or handoff procedure.

## Key references

- [Project State System design](../../docs/construction/project-state-system-design.md)
- [Construction Runbook](../../docs/construction/runbook/README.md)
- [Runtime design catalog](../../docs/design/README.md)
- [Current Runtime invariants](../../docs/design/current/runtime-invariants.md)
- [OpenSpec change](../../openspec/changes/establish-project-state-system/)
