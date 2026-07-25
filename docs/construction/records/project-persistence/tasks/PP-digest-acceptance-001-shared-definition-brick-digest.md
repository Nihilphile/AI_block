# PP-digest-acceptance-001 Shared Definition Brick Digest Acceptance

- owner: Runtime Contracts and Actor consumer boundary
- follows: PP-digest-001
- affected modules: Runtime Contracts; Runtime Server Actor Module
- workflow: W3 Independent Test + Compatibility
- base reason: the moved public digest implementation must prove byte-for-byte compatibility before Project consumes it
- implementation/product subject: `f4ed01230974fed132bb34650bfe2637549e76c1`
- orchestration baseline: task-record commit (self)

## Objective

Independently verify that Runtime Contracts is the sole Definition Brick digest
implementation, all six accepted digests and normalization rules are unchanged,
Actor validation/Snapshot behavior remains compatible, and the two changed
module cards accurately describe the boundary.

## Scope and authority

- read scope:
  - subject `f4ed01230974fed132bb34650bfe2637549e76c1`
  - baseline `045472b`
  - affected Runtime Contracts/Actor source, tests, cards, checker manifests,
    loaded Task/Report, OpenSpec specification, and accepted evidence
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-digest-acceptance-001-shared-definition-brick-digest.testing.md`
- delegated discretion: select focused compatibility/negative evidence and classify failures
- tools/external actions: deterministic local test/type/build/boundary/read commands only; no install, network, service, database, destructive, or product-write action
- delegation: none

## Frozen decisions and escalation

- Treat `f4ed012` as immutable and do not fix any finding.
- Verify the six frozen digest values, single-BOM/newline behavior, recursive
  order, property-order canonicalization, and fail-closed invalid JSON values.
- Verify Actor has no competing Definition Brick digest implementation and
  existing revision/Snapshot behavior remains unchanged.
- Testers report card mismatch without editing either card.
- Stop with subject mismatch if post-subject product/test/configuration/tooling
  changes are not limited to authorized construction records.

## References

- `docs/construction/records/project-persistence/tasks/PP-digest-001-shared-definition-brick-digest.md`
- `docs/construction/records/project-persistence/reports/PP-digest-001-shared-definition-brick-digest.coding.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`

References are audit pointers only.

## Acceptance

1. Confirm subject identity and clean immutable start.
2. Run fresh focused digest/Actor tests, full Contract/Server suites and types,
   workspace build, boundary checks, and sole-implementation search.
3. Inspect negative fixtures and exact card claims sufficiently to verify the
   accepted algorithm and exclusions.
4. Return PASS or classified findings, coverage limits, residual risk, and
   final worktree state.

## Handoff

Write and commit only the testing Report as:
`test(contracts): accept shared brick digest`.
Do not remediate, mark OpenSpec tasks, review, or resume Project work.
