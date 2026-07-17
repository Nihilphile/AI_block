---
kind: policy
scope: orchestrator
audience: orchestrator
authority: constraint-only
---

# Evidence and Acceptance

## Core rule

No construction result is accepted solely because a Worker says it is complete. Evidence must be fresh, relevant to the subject being accepted, and proportionate to impact.

This does not mean every Task needs a separate testing or reviewing Worker.

## Evidence ownership

- `coding` supplies targeted self-verification for its implementation.
- `testing` supplies independent behavioral evidence when the workflow or a gate requires it.
- `reviewing` evaluates semantics, boundaries, maintainability risks, and compliance with the accepted design; it does not duplicate test execution.
- the Orchestrator evaluates whether the evidence satisfies Task and module acceptance.

The Orchestrator should consume concise evidence and decisions rather than re-running every command or reading every raw log.

## Minimum evidence by level

| Level | Default evidence |
|---|---|
| W0 | Read-back, diff, or bounded factual evidence |
| W1 | Direct deterministic self-verification |
| W2 | Targeted tests plus relevant build/type/static checks |
| W3 | Slice self-verification plus independent integrated testing |

Triggered gates may add specific evidence.

## Subject identity

Testing and reviewing Reports identify the exact commit or artifact examined. If the subject changes materially, earlier evidence does not silently transfer to the new subject.

## Module acceptance

Normal review happens once at the state-owner or public-boundary acceptance point. It is not repeated per Task or per slice unless Early Review was triggered.

A module composed only of mechanical W1 work with no semantic change may waive review when the Orchestrator records why.

## Failure handling

Evidence failure returns a bounded finding:

- product defect;
- test or environment defect;
- acceptance ambiguity;
- subject mismatch;
- insufficient evidence.

The Orchestrator decides whether the response is a local W1 correction, a coupled W2 repair, a W3 boundary change, or a return to product design.
