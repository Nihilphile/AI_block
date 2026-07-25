# PP-contracts-002 Public Definition Brick Body Normalization

- owner: Runtime Contracts
- follows: PP-application-remediation-001 preflight
- affected modules: Runtime Contracts; future Runtime Server Project consumer
- workflow: W3
- base reason: a new root-exported canonicalization boundary will be consumed immediately by Project authoring and integrity reads
- implementation/product subject: `44b3bbc`
- orchestration baseline: task-record commit (self)

## Objective

Expose the existing Runtime Contracts Definition Brick Body normalization as
the single public root-importable helper used by the existing digest function
and future Project authoring, without changing digest bytes, schemas, serialized
values, Actor behavior, dependencies, or any application module.

## Scope and authority

- read scope:
  - Runtime Contracts Definition Brick digest/source/tests/root exports/card
  - checker runtime-export allowlist and relevant policy evidence
  - accepted shared-digest Task/Reports and Project remediation findings
  - Actor tests only for compatibility verification
- implementation write scope after separate authorization:
  - `packages/runtime-contracts/src/project-definition-brick/digest.ts`
  - `packages/runtime-contracts/src/project-definition-brick/index.ts`
  - `packages/runtime-contracts/src/index.ts`
  - `packages/runtime-contracts/test/project-definition-brick/definition-brick-digest.test.ts`
  - `scripts/check-workspace-boundaries.mjs`
  - `project_state/packages/runtime-contracts/README.md`
  - `docs/construction/records/project-persistence/reports/PP-contracts-002-definition-brick-normalization.coding.md`
- delegated discretion:
  - choose the public helper name and exact typed signature consistent with
    existing Contracts naming;
  - refactor the existing private function into that export without introducing
    a second implementation;
  - add focused normalization and compatibility cases.
- tools/external actions: deterministic local verification only; no install,
  network, service, database, destructive, or Git-history action
- delegation: none

## Frozen decisions and escalation

- Preflight dispatch authorizes no edits.
- Runtime Contracts remains the sole owner of Definition Brick Body
  normalization and digest computation.
- The public helper is additive and root-exported. It accepts a Contract-valid
  Definition Brick Body and returns the same typed Body shape after accepted
  normalization.
- Preserve the current accepted normalization exactly:
  - remove one leading BOM from every accepted text-bearing Body;
  - normalize CRLF and CR to LF;
  - recurse through prompt composite parts;
  - preserve structured Body values and ordering semantics; do not expose
    canonical JSON material or a serialized canonical form.
- `computeDefinitionBrickDigest` must call the same public normalizer and all
  six frozen digest values must remain byte-for-byte unchanged.
- Actor continues consuming only the digest helper; do not edit Actor source,
  tests, card, or public behavior.
- Checker change is limited to the exact Runtime Contracts runtime-export
  allowlist entry for the new helper. Do not alter type allowlists, topology,
  manifests, policies, probes, diagnostics, or rules.
- Do not change schemas, public serialized shapes, commands, results, errors,
  package manifests, dependencies, lockfiles, Project source/tests/card,
  OpenSpec, or any Server composition.
- Project State responsibility:
  - Contract Coder may update only the directly affected Runtime Contracts card;
  - root routing, system map, current focus, handoff, Actor/Project cards, and
    neighboring cards remain Orchestrator-owned or their respective owner;
  - Tester and Reviewer report card mismatch without editing it.

## References

- `docs/construction/records/project-persistence/tasks/PP-application-remediation-001-project-brick-integrity.md`
- `docs/construction/records/project-persistence/reports/PP-application-acceptance-001-project-brick-application.testing.md`
- `docs/construction/records/project-persistence/reports/PP-application-review-001-project-brick-application.reviewing.md`
- `docs/construction/records/project-persistence/tasks/PP-digest-001-shared-definition-brick-digest.md`

References are audit pointers only.

## Acceptance

1. Preflight returns the exact public API/signature, file/export/checker plan,
   test matrix, compatibility risk, Project State consequence, verification,
   and `READY` or `BLOCKED`.
2. After separate implementation authorization, one root-exported helper owns
   the accepted normalization and the digest helper consumes it.
3. Focused tests prove sys prompt, prompt text, nested composite, single BOM,
   CRLF/CR, structured Body preservation, non-mutation, and six frozen digests.
4. Full Contract tests/types, focused Actor compatibility tests, workspace
   build, boundary checks, and diff/scope checks pass.
5. The Runtime Contracts card accurately describes public normalization and
   digest ownership without claiming Project remediation or persistence.
6. Implementation and coding Report are committed together as:
   `feat(contracts): export definition brick normalization`.

## Handoff

For preflight, return the required analysis and stop without editing or writing
the coding Report. After explicit implementation authorization, write the
Report, stage only authorized paths, commit with the exact message, and stop.
Do not resume Project remediation, test, review, or update routing/meta.
