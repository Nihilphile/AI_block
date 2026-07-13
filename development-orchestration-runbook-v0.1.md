# Development Orchestration Runbook v0.1

> Scope: construction workflow for implementing the Runtime design
>
> This file governs development Agents. It is not part of the Runtime product architecture.

## 1. Controller responsibility

The main controller owns:

- architecture and module boundaries
- Contract summaries and version decisions
- Architecture Decision Records
- implementation sequencing and module ownership
- resolution of implicit decisions and cross-module conflicts
- acceptance and release decisions
- worker orchestration and context control

The main controller does not personally implement production code, inspect full API documentation, execute implementation commands, review raw test logs, or perform detailed line-by-line code review.

It retains compressed, decision-relevant reports with references to full artifacts.

## 2. Worker roles

### Coder

- model: `gpt-5.6-luna`
- reasoning: `high`
- owns explicitly assigned production files
- performs module preflight before implementation
- implements only after explicit authorization
- cannot change frozen Contracts without a decision request

### Tester

- model: `gpt-5.6-luna`
- reasoning: `medium`
- owns explicitly assigned test files
- executes tests and retains raw output
- does not modify production code
- classifies failures as likely test, Contract, environment, or implementation defects

### Researcher

- investigates external documentation and empirical backend behavior
- does not implement production code
- separates verified facts, inferences, and behaviors requiring a controlled probe
- returns an architecture-facing decision brief rather than raw documentation dumps

### Reviewer

- inspects detailed diffs and implementation quality
- checks module boundaries, Contract compliance, security, and maintainability
- does not approve its own implementation
- returns prioritized findings and a release recommendation

## 3. Module-task preflight gate

Every module-level Coder assignment begins in analysis-only mode. The Coder may read relevant project files, but must not edit files, scaffold code, install dependencies, change configuration, or run implementation commands.

The Coder returns a `Preflight Report` containing:

1. task and boundary restatement
2. proposed files and module ownership
3. implicit architectural decisions
4. missing product or interface decisions
5. external factual gaps
6. assumptions it would otherwise make
7. proposed implementation and test approach
8. risks, failure cases, and integration dependencies
9. `READY_FOR_DECISION` status

The main controller resolves every material point. External behavior gaps are assigned to a Researcher before implementation.

Only the main controller may send `IMPLEMENTATION_AUTHORIZED`. The authorization contains resolved decisions, frozen Contracts, write scope, required tests, and acceptance criteria.

If a material gap appears after work begins, the Coder stops at a safe boundary and returns a new decision request instead of guessing across a module boundary.

## 4. Context-control rules

Workers receive self-contained prompts and only the context required for their task. They do not inherit the entire controller conversation.

Worker reports lead with:

- decision required
- result or finding
- Contract or architecture impact
- unresolved risk
- evidence artifact references

Raw API documentation, CLI help, source listings, diffs, build logs, and test logs remain in worker context or referenced artifacts unless a narrow excerpt is required for a decision.

The controller does not duplicate delegated research, implementation, testing, or review work.

## 5. Sequential delivery policy

Construction proceeds one independently reviewable deliverable at a time. Module implementations are not developed concurrently.

For the active deliverable:

1. Coder completes read-only preflight.
2. Controller resolves decisions; Researcher is inserted only when an external fact blocks the current deliverable.
3. Tester prepares the authorized black-box or Contract tests when test-first development applies.
4. Coder implements only the active deliverable.
5. Tester executes verification when the deliverable produces testable behavior or reaches a module milestone.
6. Controller decides whether an independent Reviewer is warranted by risk, scope, or accumulated change size.
7. Controller accepts or requests focused rework from the available evidence.
8. The next deliverable begins only after the current one is accepted.

No two Coders modify different modules in parallel. Tester and Reviewer do not run concurrently with an active Coder unless the controller explicitly identifies a read-only activity that cannot affect or be invalidated by the current write set. The default is sequential execution.

Within one module or tightly bounded delivery phase, the same Coder is reused across sequential tasks so that interface decisions, implementation context, and prior findings remain available. Each task still receives a delta preflight and a separate `IMPLEMENTATION_AUTHORIZED` envelope.

A fresh Coder is assigned when:

- work crosses into a different module or state owner
- the new task changes the architectural responsibility of the current module
- the existing Coder context has become contradictory or excessively broad
- an independent reimplementation perspective is required after repeated failure
- the controller explicitly resets the module execution context

Tester and Reviewer remain independent from the module Coder. They may be reused within the same module as long as they never edit production files or approve their own output.

Per-task review is not mandatory. The controller normally schedules Review at a substantial module or delivery milestone, and may insert it earlier for cross-module Contract changes, security or concurrency risk, repeated implementation failure, scope drift, or a Coder concern that cannot be resolved from test evidence. Small mechanical tasks may proceed on Coder self-review until the next milestone.

Controller-owned construction artifacts, including this Runbook, implementation plans, progress ledgers, and architecture decision records, may evolve during construction. Workers must not edit them unless explicitly assigned. Expected controller-authored drift in these artifacts does not block a product task; it is reconciled into the repository baseline at the next suitable module checkpoint.

The initial order is:

```text
Phase 0A workspace/toolchain
→ Phase 0B Runtime Contracts
→ FakeBackend execution skeleton
→ real ClaudeCodeAdapter controlled probes and integration
→ Direct Actor MVP modules one by one
→ Graph after Direct Actor acceptance
```

## 6. Implementation cycle

```text
Controller defines bounded task and acceptance criteria
→ Coder returns Preflight Report without edits
→ Researcher resolves external gaps when required
→ Controller records decisions
→ Controller sends IMPLEMENTATION_AUTHORIZED
→ Coder implements within assigned files
→ Tester executes independent tests when applicable
→ Controller optionally dispatches Reviewer based on risk or milestone
→ Controller accepts, requests focused rework, or escalates a decision
```

Coder, Tester, and Reviewer use disjoint write scopes. A worker never approves its own output.
