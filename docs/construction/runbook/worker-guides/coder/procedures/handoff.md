---
kind: procedure
scope: dispatch
audience: coder
authority: method-only
---

# Coder Handoff

Load the Report template only when handoff is required.

- verify the authorized diff and subject identity;
- record uncertainty, implicit decisions, implementation approach, exact checks/results, deviations, and remaining risk;
- record whether the target state card was unchanged, reconciled, or found stale, with the scoped evidence path;
- report any cross-module mismatch or requested neighbor-card load for Orchestrator decision;
- distinguish self-verification from later independent evidence;
- stage only explicit authorized paths and the Coder's Report;
- use the Task-supplied commit message;
- confirm final worktree state without deleting unrelated work;
- return result, commit SHA, changed surfaces, evidence, and residual risk, then stop.
