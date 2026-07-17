---
kind: policy
scope: dispatch
audience: explicitly-authorized-worker
authority: method-only
---

# Authorized Superpowers Method Use

Use only the capability named by the Task or Orchestrator, and only inside the assigned work type and scope.

| Capability | Default construction use |
|---|---|
| Brainstorming/design exploration | Orchestrator while product decisions are open; Workers only for an assigned bounded question |
| Writing plans | Orchestrator; Coder may keep only a private local implementation sequence |
| Executing a plan | Assigned slice only |
| Test-driven development | Conditional and proportionate when required by the Task |
| Subagent-driven development | Orchestrator-only unless delegation is explicit |
| Scheduling review | Orchestrator-only |
| Performing review | Reviewer brief only; Coder self-check is not independent review |
| Verification before completion | Required for the Worker's owned output |
| Git/worktree workflow changes | Only the Task-authorized commit/action |

Do not invoke an adjacent capability automatically. Return missing authority to the Orchestrator.
