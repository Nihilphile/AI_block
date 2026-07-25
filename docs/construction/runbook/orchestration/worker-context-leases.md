---
kind: policy
scope: orchestrator
audience: orchestrator
authority: constraint-only
---

# Worker Context Leases

## Model

A Worker is a temporary execution instance whose context is leased for one coherent role/state-owner episode. Reuse avoids reloading stable context; it does not create permanent identity or trust.

```text
Lease context      loaded once per epoch
Dispatch context   selected for the current Task/phase
Task delta         current authority and decisions
```

## Lease manifest

The Orchestrator records:

- lease ID and epoch;
- role and state owner;
- exact lease-scoped Brick paths and versions/commit;
- concrete runtime/model mapping when exposed;
- allowed delegation/external-action ceiling;
- current accepted subject and material open decisions.

The Worker reads only the explicit `lease.load_once` list. A role directory is never a load target.

## Dispatch manifest

Each assignment provides:

- lease ID and expected epoch;
- one bounded Project State context;
- authority mode and durable Task path or exact inline delta;
- exact dispatch `load` list;
- action;
- output mode;
- Task-specific decision/scope delta when needed.

References never auto-load new normative instructions. Inside authorized read
scope, state-card links to source, tests, Contracts, Git, and evidence remain
available for investigation under the Project State policy. Missing normative
context returns `LOAD_REQUEST`.

## Typical lease shapes

| Role | Typical coherent lease |
|---|---|
| Coder | Several related Tasks in one module/state-owner episode |
| Debugger | One failure investigation, optionally an authorized repair |
| Explorer | One bounded repository decision package |
| Researcher | One external uncertainty or compatible follow-up |
| Tester | One committed acceptance surface and focused retests |
| Reviewer | One module/boundary review and focused re-review |

## Retain

Retain when the role, state owner, architectural frame, and loaded lease policies remain aligned; prior context materially improves the next assignment; and context uncertainty is low.

## Reload or increment epoch

Reload lease Bricks and increment epoch when:

- lease policy or role profile materially changes;
- the Worker reports uncertain semantic continuity;
- assumptions or accepted subject changed incompatibly;
- context compaction may have lost required ceilings/decisions;
- repeated corrections reveal a stale mental model.

## Retire or replace

Retire when work crosses state owners, independent evidence is required, the agent is unavailable/not found, context has become broad or misleading, or a fresh approach is needed.

## Lease integrity check

Exact context-window tokens and compaction counters are not reliably exposed. Before reuse, require a small semantic check:

```yaml
lease_continuity: confirmed | uncertain | reset
lease_id: <id>
epoch: <integer>
role_state_owner: <value>
last_accepted_subject: <commit/artifact>
material_open_decisions: <short list>
loaded_lease_bricks: <exact paths and baseline>
compaction_observed: yes | no | unknown
```

`confirmed` permits dispatch-only loading. `uncertain` returns `LEASE_RELOAD_REQUIRED`. Remembering an ID alone is insufficient proof; conversely, observed compaction does not require reload when semantic lease integrity is confirmed.

Worker reuse is context management, not a reward or permanent trust status.
