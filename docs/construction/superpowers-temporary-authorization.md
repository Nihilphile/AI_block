# Superpowers Temporary Authorization Rules

> Status: temporary project-level construction policy.
>
> Scope: Superpowers workflow skills used during software construction. This policy does not govern product runtime capabilities, Actor tools, or ordinary domain-specific tooling such as Serena.

## 1. Purpose

This project assigns architecture, implementation, testing, review, and research to distinct roles. Superpowers skills are therefore treated as optional methods, not as an end-to-end workflow that every Worker must execute.

The project construction workflow owns process control. A Superpowers skill must not automatically chain brainstorming, planning, implementation, testing, review, or subagent dispatch when those responsibilities belong to different roles.

## 2. Authority order

For construction work, apply authority in this order:

1. explicit user direction;
2. approved product architecture, design, and ADRs;
3. the authorized construction Task and Controller clarifications;
4. project construction workflow and role rules;
5. locally useful techniques from a Superpowers skill.

A lower item may refine execution inside the scope granted by a higher item. It may not enlarge that scope, reassign a role, reopen a frozen decision, or add mandatory process stages.

## 3. Default rule

Superpowers are a method library, not a workflow engine.

- Do not auto-chain skills into a complete delivery pipeline.
- Do not invoke another role, create a plan, request a review, or add ceremony merely because a skill recommends it.
- Use only the portion of a skill that is authorized for the current role and Task.
- When a skill conflicts with the Task or project workflow, follow the Task and project workflow and report the conflict if it materially affects execution.
- Task-specific authorization may temporarily permit an otherwise restricted skill. The Task must name the skill or capability and the reason.
- Workflow-changing Superpowers capabilities not listed as allowed below are denied by default until the Controller authorizes them.

## 4. Role authorization matrix

| Superpowers capability | Controller / Architect | Coder | Researcher | Tester | Reviewer |
|---|---|---|---|---|---|
| Brainstorming / design exploration | Allowed when product decisions are open | Denied by default | Only for the assigned research question | Denied | Only to explain a design concern; may not redesign |
| Writing product or construction plans | Allowed | Denied; may keep a short private implementation sequence | Denied | Denied | Denied |
| Executing an approved plan | May coordinate | Allowed only within the authorized Task | Only the assigned research plan | Only the acceptance plan | Only the review brief |
| Test-driven development | May require it per Task | Conditional; use when required by the Task or proportionate to behavior risk | Not applicable | May design independent verification, not product implementation | Not applicable |
| Subagent-driven development | Controller-only by default | Denied unless the Task explicitly grants delegation | Denied unless explicitly granted | Denied | Denied |
| Requesting or scheduling code review | Controller-only | Denied | Denied | Denied | Not applicable |
| Performing code review | May perform bounded governance checks | Self-check only; not an independent review | Denied | Testing findings only | Allowed within the review brief |
| Verification before completion | Required for Controller-owned records | Required for the Coder's own deliverable | Required for research claims | Required for acceptance claims | Required for review claims |
| Git/worktree workflow changes | Only when authorized by the user/project workflow | Only Task-scoped commits; no branch/worktree expansion | Report commit only | Report commit only | Report commit only |

## 5. Coder boundary

A Coder must think before implementation, but its preflight is not a new brainstorming or planning phase. The preflight answers only:

1. Is the authorized Task sufficiently clear to implement?
2. Are there implicit decisions, missing facts, or unsafe assumptions?
3. What Task-scoped files and interfaces are affected?
4. What proportionate verification demonstrates completion?

If a material product decision or information gap exists, the Coder reports it to the Controller and waits. It does not resolve the gap by starting a broad brainstorm, rewriting the plan, dispatching its own team, or changing the architecture.

After `IMPLEMENTATION_AUTHORIZED`, the Coder implements the approved Task, performs scoped self-verification, writes its Coder Report, and stops. Independent testing and review remain separate roles when the selected workflow requires them.

## 6. Verification and review separation

Self-verification proves that a Worker exercised reasonable care over its own output. It does not collapse role boundaries:

- Coder verification does not replace an independently assigned Tester.
- Coder self-review does not replace an independently assigned Reviewer.
- Tester findings do not authorize product fixes.
- Reviewer findings do not authorize implementation; remediation requires a new or clarified Task.

The Controller selects Tester and Reviewer participation through `workflow-thickness-reference.md`, not through automatic Superpowers chaining.

## 7. Worker instruction rule

Worker prompts and Task files should state the applicable role boundary. When a Superpowers capability is specifically useful, authorize that capability rather than the entire workflow.

Example:

```text
Use test-driven development for the state-transition behavior in this Task.
Do not start a separate brainstorming or planning workflow.
Do not dispatch subagents or request review; return uncertainties to the Controller.
```

Reading a skill does not grant permission to perform every action it describes.

## 8. Review of this temporary policy

Keep this policy until repeated construction experience supports a stable replacement. Revise it when a concrete Task demonstrates that a role permission is too broad, too narrow, or ambiguous; do not expand ceremony speculatively.
