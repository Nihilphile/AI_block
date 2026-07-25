# PP-contracts-002 Acceptance of Public Definition Brick Body Normalization

- owner: Runtime Contracts
- follows: PP-contracts-002
- affected modules: Runtime Contracts; Actor compatibility boundary; future Project consumer
- workflow: W3 Independent Test
- base reason: Project remediation will persist values returned by this new public helper, so normalization and compatibility require independent evidence
- implementation/product subject: `2d8eaaf54d7a1850d2b4d627331589084f9f4151`
- orchestration baseline: task-record commit (self)

## Objective

Independently verify that the root-exported Definition Brick Body normalizer is
the sole accepted implementation, returns exact canonical typed Bodies without
mutating inputs, preserves every frozen digest and Actor behavior, and is
represented accurately by the checker and Runtime Contracts card.

## Scope and authority

- read scope:
  - subject `2d8eaaf54d7a1850d2b4d627331589084f9f4151`
  - baseline `b9d419fa913fd0535b09d3e31737480023845a5d`
  - affected Contracts source/tests/exports/card and checker delta
  - PP-contracts-002 Task/coding Report, accepted digest evidence, Project
    remediation finding evidence, and Actor compatibility tests
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-contracts-002-acceptance-definition-brick-normalization.testing.md`
- delegated discretion: select deterministic negative, mutation, compatibility,
  export, build, boundary, and card evidence and classify failures
- tools/external actions: deterministic local verification only; no install,
  network, service, database, destructive, product-write, Project State edit,
  OpenSpec edit, or Git-history action
- delegation: none

## Frozen decisions and escalation

- Treat `2d8eaaf` as immutable; do not fix any finding.
- Verify root-only import and exact typed helper behavior for sys prompt, prompt
  text, nested composites, one-leading-BOM removal, CRLF/CR normalization,
  structured Body preservation, and non-mutation.
- Verify all six frozen digest values and raw-vs-normalized digest equivalence.
- Verify one implementation owns normalization and digest calls it directly.
- Verify Actor source is unchanged and focused/full Server behavior remains
  compatible.
- Verify checker delta is one runtime allowlist entry and the Runtime Contracts
  card does not overclaim Project remediation or persistence.
- Tester reports state mismatch without editing any card.

## Acceptance

1. Confirm exact subject, baseline, clean worktree, and record-only
   post-subject commits.
2. Run fresh focused/full Contracts tests and types, Actor compatibility,
   Runtime Server suite/types, workspace build, boundaries, and export/ownership
   searches.
3. Inspect or add no-file-write substantiation sufficient for every
   normalization, non-mutation, digest, export, compatibility, checker, and
   state-card claim.
4. Return PASS or classified findings, coverage limits, residual risk, and
   final worktree state.

## Handoff

Write and commit only the testing Report as:
`test(contracts): accept definition brick normalization`.
Do not remediate, review, resume Project, or update routing/meta.
