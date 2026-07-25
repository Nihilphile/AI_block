# PP-contracts-002 Review of Public Definition Brick Body Normalization

- owner: Runtime Contracts
- follows: PP-contracts-002-acceptance
- affected modules: Runtime Contracts; Actor compatibility boundary; future Project consumer
- workflow: W3 Early Review
- base reason: the public helper becomes authoritative stored-value semantics for Project remediation
- implementation/product subject: `2d8eaaf54d7a1850d2b4d627331589084f9f4151`
- orchestration baseline: task-record commit (self)

## Objective

Review the public Definition Brick Body normalizer for single ownership,
semantic precision, typed API minimality, non-mutation, digest and Actor
compatibility, export/checker exactness, maintainability, excluded scope, and
accurate Runtime Contracts state representation.

## Scope and authority

- read scope:
  - subject `2d8eaaf54d7a1850d2b4d627331589084f9f4151`
  - baseline `b9d419fa913fd0535b09d3e31737480023845a5d`
  - affected Contracts source/tests/exports/card and checker delta
  - PP-contracts-002 Task/coding/testing evidence, accepted digest evidence,
    Project findings, Actor tests, and current runtime invariants
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-contracts-002-review-definition-brick-normalization.reviewing.md`
- delegated discretion: identify correctness, mutation, ownership, public-API,
  compatibility, checker, evidence, maintainability, or state-card findings
- tools/external actions: read-only inspection and minimal local
  substantiation; no install, network, service, database, product write,
  Project State edit, OpenSpec edit, or destructive action
- delegation: none

## Frozen decisions and escalation

- Review only; do not fix or edit prior artifacts.
- Verify the helper exposes typed normalized Body only, not canonical JSON,
  digest material, or serialized representations.
- Verify normalization is single-owner, recursive where required, preserves
  structured Bodies, and does not mutate caller input.
- Verify digest behavior and failure behavior did not drift and Actor requires
  no source change.
- Verify root exports/checker/card are exact and no schema, serialized shape,
  manifest, dependency, Project, persistence, or execution scope entered.
- Findings do not authorize remediation.

## Acceptance

1. Confirm exact subject, baseline, current orchestration HEAD, and record-only
   intervening commits.
2. Lead with actionable findings and exact locations; explicitly state when
   none exist.
3. Review every frozen item, focused evidence, checker delta, and Runtime
   Contracts card against the immutable subject.
4. Separate defects, evidence gaps, deferred Project remediation, and future
   persistence choices.
5. Return `ACCEPT` or `REMEDIATION_REQUIRED`.

## Handoff

Write and commit only the reviewing Report as:
`review(contracts): review definition brick normalization`.
Do not repair, resume Project, update routing/meta, or schedule persistence.
