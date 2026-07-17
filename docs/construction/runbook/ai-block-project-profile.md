# AI_block Project Construction Profile

## Purpose

This profile specializes the generic Construction Runbook for AI_block. It governs project-specific Worker selection, delivery order, context control, communication, and tool policy without redefining product architecture.

## Orchestrator responsibility

The main Orchestrator owns architecture and module boundaries, Contract and version decisions, implementation sequencing, cross-module conflicts, Worker orchestration, and acceptance decisions.

The Orchestrator protects its context for architecture, major decisions, and delegation. Deep product-code investigation, full external API review, implementation, raw-log inspection, and line-by-line review are delegated when they would displace that context. Bounded read-back, status inspection, and Controller-owned construction-document maintenance may be performed directly.

## Worker runtime policy

- Sol is reserved for the main Orchestrator and is not dispatched as a Worker.
- Delegated Workers use the Luna model family.
- Use standard/default service speed. Do not request Speed or priority service unless the user explicitly changes this rule.
- Coding and reviewing work use `high` reasoning by default and `xhigh` for Contract-heavy, cross-module, security/concurrency-sensitive, or complex refactoring work.
- Testing and researching use `medium` by default; researching may use `high` when external behavior is ambiguous or conflicting.
- Worker creation names the model and reasoning explicitly instead of silently inheriting the Orchestrator configuration.

## Sequential delivery

- Product construction proceeds one independently acceptable deliverable at a time.
- Do not run two product-writing Workers in parallel by default.
- Read-only evidence work may overlap only when the Orchestrator determines it cannot affect or be invalidated by the active write set.
- Reuse a coherent Worker context across closely related Tasks in the same module or state owner.
- Use a fresh Worker when work crosses state owners, changes architectural responsibility, requires independent evidence, or the existing context has become stale, broad, or misaligned.
- Testing and reviewing remain independent from the Worker whose product output they examine.

## Context and communication

- Worker prompts are self-contained and include only the context needed for the assigned lease.
- Reports lead with decisions, result, architecture or Contract impact, unresolved risk, and evidence references.
- Raw documentation, source listings, diffs, transcripts, and large logs remain in Worker context or referenced artifacts.
- For long-running Worker execution, use one initial observation window of up to 15 minutes, then follow with windows of up to 5 minutes while work continues.
- Do not generate heartbeat commentary when Worker state has not changed. Report meaningful state changes, decisions, blockers, or completion.
- The user may interrupt or report observed Worker completion at any time; re-check state rather than assuming the previous wait remains authoritative.

## Construction sequence

The broad order is:

```text
Workspace and toolchain
→ Runtime Contracts
→ FakeBackend and ActorHost execution skeleton
→ Runtime Server Host Gateway walking skeleton
→ ClaudeCodeAdapter focused research and controlled probes
→ Direct Actor MVP modules one by one
→ Graph after Direct Actor acceptance
```

The current milestone plan and accepted architecture files determine the exact next Task. This sequence does not itself authorize implementation.

## Project policies and records

- Superpowers are governed by `policies/superpowers.md` and are optional role-scoped methods, not an automatic delivery pipeline.
- Serena is governed by `policies/serena.md`; its non-memory LSP/IDE capabilities may be used, while memory and `.serena/` inspection are prohibited.
- Delegated work uses `task-report-audit.md` and stores real records under `docs/construction/records/`.
- Product architecture and phase invariants remain authoritative construction inputs outside this Runbook.
