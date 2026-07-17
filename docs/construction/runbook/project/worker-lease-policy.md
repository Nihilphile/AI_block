---
kind: project-profile
scope: lease
audience: all-workers
authority: constraint-only
---

# AI_block Worker Lease Policy

## Authority

- The Task and current Orchestrator authorization delta define what may be done now.
- Loaded profiles, procedures, policies, templates, design references, and source findings do not enlarge authority.
- Do not self-dispatch another Worker unless the Task explicitly grants delegation.
- Do not turn diagnosis, research, testing, or review authority into product-write authority.
- External, destructive, costly, or stateful actions require explicit Task authority.

## Repository conduct

- Preserve unrelated user and Worker changes.
- Stay inside exact write and external-action scope.
- Stop before changing a public Contract, dependency, acceptance condition, another state owner, or an unlisted path.
- Git, source, tests, and the committed subject remain authoritative over remembered context.
- Reports contain no secrets, raw transcripts, or large logs.

## Context loading

- Read only normative files explicitly listed in `lease.load_once` or the current dispatch `load` list.
- Do not scan a guide directory, load sibling files, or follow Task References automatically.
- Dynamic source investigation is permitted only inside Task read scope.
- Request missing normative context with `LOAD_REQUEST`; do not silently broaden context.

## Lease continuity

Track the lease ID and epoch supplied by the Orchestrator. Before reuse, confirm role/state owner, authority model, current accepted subject, and material open decisions.

Return `LEASE_RELOAD_REQUIRED` when continuity is uncertain. Do not claim that no compaction occurred merely because the lease ID is remembered; technical compaction may be unknown while semantic continuity remains confirmable.

## Handoff

State decisions, work/evidence, exact verification, deviations, remaining risk, and subject identity. Stop after the assigned handoff; do not schedule the next construction phase.
