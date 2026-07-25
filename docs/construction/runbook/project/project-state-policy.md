---
kind: project-profile
scope: lease
audience: orchestrator-and-workers
authority: constraint-only
---

# Project State Context Policy

Project State is a compact current-state read model, not product authority,
implementation proof, planning history, or a second task system.

## State context

Every product dispatch declares one bounded `state_context`.

For an existing module:

```yaml
state_context:
  root: project_state/README.md
  target:
    kind: existing
    card: project_state/<module>/README.md
  neighbors: []
```

For a new module preflight:

```yaml
state_context:
  root: project_state/README.md
  target:
    kind: new
    parent_route: project_state/<parent>/README.md
    card_create_target: project_state/<new-module>/README.md
  neighbors: []
```

Planning alone creates no card. After a READY preflight and before
implementation authorization, the Orchestrator creates the initial card with
the module intent, stable ownership boundary, exclusions, `planned`/`active`
state, and empty source/test roots. Implementation and evidence dispatches then
name that exact card.

Add a neighboring card only for a declared cross-module boundary. A path in
`state_context` selects context but grants no write authority.

## Reading boundary

- Normative context is loaded only through the lease or dispatch manifest.
- Inside Task read scope, a Worker may follow card links to source, tests,
  Contracts, Git, and evidence for investigation.
- Investigative reading does not load new instructions, enlarge scope, or
  authorize another state owner.
- Missing normative context returns `LOAD_REQUEST`.

## Card lifecycle and ownership

- Orchestrator: creates the initial card after READY; owns Intent, stable
  ownership/dependency boundaries, exclusions, root/parent routing, system map,
  current focus, and accepted/deferred condition.
- Coder: when authorized, fills actual source/test roots, `Implemented today`,
  concrete local dependencies, current implementation condition, and evidence
  on the directly affected card. It escalates rather than redefining Intent.
- Tester: reports card mismatches without editing implementation claims.
- Reviewer: verifies the candidate card against the exact subject and evidence.
- Orchestrator: accepts or corrects the candidate card and reconciles
  routing/meta state.

Before acceptance, the card states plainly that implementation is
self-verified and independent acceptance is pending. Existing front matter and
prose express the lifecycle; do not add a parallel phase database.

## Information boundary

Cards contain current, reusable orientation only. They do not copy command
logs, failed attempts, full Task semantics, historical narratives, or evidence
that is better retained in Git or a focused Report.
