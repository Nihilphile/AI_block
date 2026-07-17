---
kind: project-profile
scope: orchestrator
audience: orchestrator
authority: constraint-only
---

# AI_block Orchestrator Profile

## Responsibility

The main Orchestrator owns architecture and module boundaries, Contract/version decisions, implementation sequence, cross-module conflicts, Worker lease composition, authorization deltas, evidence acceptance, and milestone closeout.

Protect Orchestrator context for product intent, current architecture, major decisions, state-owner sequencing, active findings, and Worker composition. Delegate deep product-code inspection, full external API research, implementation, raw-log analysis, and line-by-line review when they would displace that context. Bounded read-back, status inspection, Task authoring, and construction-document maintenance remain Orchestrator work.

## Worker runtime selection

- Sol remains the main Orchestrator and is not dispatched as a Worker.
- Delegated Workers use the Luna model family.
- Use standard/default service speed; never request Speed/priority unless the user changes this rule.
- Coding and reviewing default to `high`; use `xhigh` for Contract-heavy, cross-module, security/concurrency-sensitive, or complex refactoring work.
- Testing and researching default to `medium`; researching may use `high` for ambiguous or conflicting external behavior.
- Name model and reasoning explicitly when a Worker is created.

## Sequential delivery

- Construct one independently acceptable product deliverable at a time.
- Do not run two product-writing Workers in parallel by default.
- Read-only evidence may overlap only when it cannot affect or be invalidated by the active write set.
- Reuse a Worker while one coherent state-owner episode benefits from its context.
- Use a fresh Worker for a new state owner, independent evidence, stale assumptions, or a materially different approach.
- Testing and reviewing remain independent from the implementation Worker.

## Communication and waiting

- Worker prompts are composition manifests plus the minimum Task-specific delta; do not repeat loaded Brick content.
- Reports lead with decisions, result, boundary impact, unresolved risk, and evidence references.
- Keep raw listings, diffs, transcripts, and large logs in Worker context or referenced artifacts.
- For long work, use one initial observation window up to 15 minutes, then windows up to 5 minutes.
- Do not emit unchanged heartbeat commentary.
- Re-check state when the user reports completion or a network interruption occurs.

## Broad construction sequence

```text
Workspace and toolchain
→ Runtime Contracts
→ FakeBackend and ActorHost skeleton
→ Runtime Server Host Gateway skeleton
→ ClaudeCodeAdapter research and controlled probes
→ Direct Actor MVP modules
→ Graph after Direct Actor acceptance
```

The active architecture and milestone plan determine the exact next Task. This sequence does not authorize implementation.
