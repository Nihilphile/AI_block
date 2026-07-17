# Debugging Work Guide

## Use this guide when

The assignment is to reproduce, isolate, explain, or repair a failure.

Debugging authority has two distinct forms:

- **diagnosis only** — inspect and report the cause; do not implement a repair;
- **diagnosis and repair** — implement only after the Task explicitly grants write scope and acceptance.

## Working method

1. Restate the observed failure and expected behavior.
2. Establish a reliable reproduction or state why one is unavailable.
3. Reduce the hypothesis space using local evidence.
4. Distinguish root cause from symptoms and unrelated defects.
5. Identify the smallest credible repair surface.
6. If repair is authorized, add or update evidence that fails for the cause and passes after the repair.

## Boundaries

- Do not turn diagnosis permission into product-write permission.
- Do not repair adjacent issues without authorization.
- External probes, destructive reproduction, and production access require explicit permission.
- Escalate when evidence points to product ambiguity, a public-contract change, or another state owner.

## Handoff

Report reproduction, root cause, decisive evidence, affected surface, proposed or implemented repair, verification, and unresolved uncertainty.
