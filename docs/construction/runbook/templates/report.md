---
kind: template
scope: on-demand
audience: all-workers
authority: none
---

# <TASK-ID> <Work Type> Evidence

- work: coding | debugging | exploring | researching | testing | reviewing
- verdict: pass | accept | completed | blocked | failed | remediation-required
- implementation subject: <commit/artifact> | none
- orchestration baseline: <commit when relevant> | none
- lease: <lease-id>@<epoch> | not-applicable

## Decision or findings

<Lead with the verdict, durable decision, or actionable findings. Do not repeat
the Task.>

## Decisive evidence

<Only evidence needed to support the verdict/decision, with concise references
and exact results.>

## Coverage limits and residual risk

<None, or a short explicit list.>

## Integrity

<Subject/lease continuity, material deviation, and final repository state when
relevant. Omit routine tool narration.>
