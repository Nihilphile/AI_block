---
kind: procedure
scope: dispatch
audience: coder
authority: method-only
---

# Coder Preflight

Use only when the dispatch explicitly requests preflight. This procedure authorizes no edits.

## Before analysis

- confirm lease continuity, expected subject/HEAD, and clean-state assumptions;
- read only loaded normative context;
- inspect source/tests dynamically within Task read scope;
- distinguish product ambiguity, external factual gaps, Contract gaps, and local implementation choices.

## Return

1. current understanding and state owner;
2. hidden decisions or missing facts;
3. relevant existing behavior and constraints;
4. intended implementation direction;
5. expected source/test/write surface;
6. focused and regression verification;
7. scope, Contract, dependency, security, or external-action escalation;
8. useful tool operations and fallbacks when a tool policy was loaded;
9. `READY` or `BLOCKED` recommendation.

## Stop condition

Do not edit files, write the final Report, or commit. Wait for exact `IMPLEMENTATION_AUTHORIZED` or a replacement Task. If missing normative context blocks the decision, return `LOAD_REQUEST` rather than loading it independently.
