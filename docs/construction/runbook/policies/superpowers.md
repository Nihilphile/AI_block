# Superpowers Authorization Policy

## Scope

This project assigns architecture, coding, testing, reviewing, researching, and exploring as distinct delegated work. Superpowers capabilities are optional methods, not an end-to-end workflow that every Worker must execute.

The Construction Runbook owns process control. A Superpowers capability must not automatically chain brainstorming, planning, implementation, testing, review, or subagent dispatch when those responsibilities belong to separate assignments.

## Default rule

Superpowers are a method library, not a workflow engine.

- Do not auto-chain capabilities into a complete delivery pipeline.
- Do not invoke another Worker, create a product plan, request a review, or add ceremony merely because a capability recommends it.
- Use only the portion authorized for the current work and Task.
- A Task may specifically authorize an otherwise restricted capability and must state why.
- Reading a skill does not grant permission to perform every action it describes.

## Work authorization matrix

| Superpowers capability | Orchestrator | coding | researching | testing | reviewing |
|---|---|---|---|---|---|
| Brainstorming / design exploration | Allowed while product decisions are open | Denied by default | Only for the assigned question | Denied | Concern explanation only; no redesign |
| Writing product/construction plans | Allowed | Denied; private local sequence only | Denied | Denied | Denied |
| Executing an approved plan | May coordinate | Only within the Task | Only assigned research | Only acceptance work | Only review brief |
| Test-driven development | May require per Task | Conditional and proportionate | Not applicable | Independent verification only | Not applicable |
| Subagent-driven development | Orchestrator-only by default | Denied unless explicitly granted | Denied unless explicitly granted | Denied | Denied |
| Scheduling review | Orchestrator-only | Denied | Denied | Denied | Not applicable |
| Performing review | Bounded governance checks | Self-check only | Denied | Testing findings only | Allowed within brief |
| Verification before completion | Required for owned records | Required | Required | Required | Required |
| Git/worktree workflow changes | User/project authorized only | Task-scoped commit only | Report commit only | Report commit only | Report commit only |

## Coding boundary

Coding work must think before implementation, but its preflight is not a new brainstorming or planning phase. It determines whether the Task is clear, identifies missing decisions or facts, names affected surfaces, and proposes proportionate verification.

When a material gap exists, return it to the Orchestrator. Do not broaden into architecture design, self-dispatch a team, or schedule review. After authorization, implement the Task, self-verify, write the Report, and stop.

## Verification separation

- Coding self-verification does not replace independently assigned testing.
- Coding self-review does not replace independently assigned reviewing.
- Testing findings do not authorize product fixes.
- Reviewing findings do not authorize remediation implementation.
- The Orchestrator selects independent work through workflow levels and specialized gates, not automatic capability chaining.
