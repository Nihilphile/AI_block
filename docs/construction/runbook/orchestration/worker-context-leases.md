# Worker Context Leases

## Model

A Worker is a temporary execution instance, not a permanent role identity. Its context is leased for a coherent body of work.

The Orchestrator may reuse the same Worker across related Tasks in one module when prior context improves continuity. The Worker is retired when that context becomes stale, misleading, excessively broad, or unrelated to the next Task.

## Lease inputs

The Orchestrator defines:

- assigned work type or types;
- objective and acceptance;
- readable context and writable scope;
- frozen decisions and local discretion;
- permitted tools and external actions;
- whether delegation or additional Workers are allowed;
- stop and escalation conditions;
- expected Report.

None of these permissions are implied by a work guide.

## Default lease shapes

| Work | Typical lease |
|---|---|
| coding | Several tightly related Tasks in one coherent module episode |
| debugging | One failure investigation, optionally followed by an explicitly authorized repair |
| exploring | One bounded repository question or evidence package |
| researching | One external factual uncertainty or decision brief |
| testing | One committed subject and its stated acceptance surface |
| reviewing | One module/boundary acceptance package or focused re-review |

These are defaults, not identities. The same underlying model may receive a different lease later with fresh boundaries.

## Retain the Worker when

- the state owner and architectural frame remain the same;
- new work depends materially on knowledge gained in the current episode;
- earlier Reports show the context is aligned and manageable;
- handoff cost would exceed context-staleness risk.

## Retire or reset the Worker when

- work crosses into an unrelated module or decision domain;
- assumptions have materially changed;
- repeated corrections reveal a wrong mental model;
- context volume begins to obscure the active Task;
- independent evidence is required;
- the Orchestrator needs a fresh implementation approach.

Worker reuse is a context-management decision, not a reward or permanent trust status.
