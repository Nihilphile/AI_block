---
kind: procedure
scope: dispatch
audience: coder
authority: method-only
---

# Coder Handoff

- verify the authorized diff and subject identity;
- reconcile the directly affected card according to the loaded Project State
  policy when authorized;
- record only uncertainty, material decisions, exact checks/results,
  deviations, and remaining risk not already visible in source, tests, card,
  or Task;
- report cross-module or charter mismatches for Orchestrator decision;
- distinguish self-verification from later independent evidence;
- stage only explicit authorized paths and declared durable output;
- use the Task/delta commit instruction;
- confirm final worktree state without deleting unrelated work;
- return result, commit SHA or artifact, changed surfaces, and residual risk,
  then stop.

For `output_mode: commit`, place the compact execution receipt in the commit
body and create no coding Report. Load the Report template only for an explicit
`output_mode: file`.
