---
kind: template
scope: on-demand
audience: orchestrator
authority: none
---

# <TASK-ID> <Title>

- owner: <module / state owner>
- follows: none | <TASK-ID>
- affected modules: <names or none>
- workflow: W0 | W1 | W2 | W3, plus active gates
- base reason: <one rule-based sentence>
- implementation/product subject: <commit SHA or artifact>
- orchestration baseline: <commit SHA when different, or none>

## Objective

<One observable outcome.>

## Scope and authority

- read scope: <repository/system evidence the Worker may inspect dynamically>
- write scope: <exact paths or none>
- delegated discretion: <local decisions the Worker may make>
- tools/external actions: <allowed set and limits>
- delegation: none | <explicit capability>

## Frozen decisions and escalation

<Task-specific semantics, forbidden actions, and exact stop conditions.>

## References

<Audit pointers only. References are not auto-load directives. The dispatch manifest selects which are loaded.>

## Acceptance

<Observable checks and expected evidence.>

## Handoff

<Required Report path/type, subject identity, and commit instruction.>
