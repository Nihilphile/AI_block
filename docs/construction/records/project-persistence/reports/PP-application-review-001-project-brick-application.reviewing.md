# PP-application-review-001 Project and Definition Brick Application Review Report

- work: reviewing
- result: completed
- implementation subject: `a1fb21ddd44f81aec9754e1f62fb1bf22544835b`
- orchestration baseline: `0f02796369d7a40c4d0c100e20967769340d29ab`
- lease: `runtime-project-reviewer-01@1`

## Findings

1. **Acceptance blocking — create/revise return and persist the submitted Body rather than the canonical Body.** `canonicalDefinitionBrickBody` only selects a kind-specific schema and returns the decoded input unchanged (`apps/runtime-server/src/modules/project/values.ts:23-38`). Create and revise pass that unchanged value into `newRevision`, which returns and persists it (`application.ts:95-132`, `139-177`, `303-323`). The shared digest helper normalizes one leading BOM and CRLF/CR only inside private digest material, so it cannot make the revision Body canonical. Consequently a valid `sys_prompt` containing BOM/CRLF/CR is stored and returned verbatim while its digest represents normalized text; the same digest recomputation then accepts that non-canonical stored Body on reads. This violates the strict-create and canonical-content requirements and independently confirms the Tester finding. Correction must make the accepted Runtime Contracts normalization produce the Body used in create/revise results and repository writes, and reads must reject non-canonical stored Bodies. The equal-content test at `project-application.test.ts:136-167` must assert returned and stored Bodies, not only equal digests.
2. **Acceptance blocking — exact-revision reads do not enforce revision/aggregate coherence.** After validating the summary, `readExactDefinitionBrickRevision` maps every missing repository value to ordinary `definition_brick_revision_not_found` and accepts any returned revision matching the requested number (`application.ts:277-287`). `decodeStoredRevision` binds Project, Brick ID, kind, and optional requested revision, but never requires `revision.revision <= summary.current_revision` (`values.ts:69-85`). Therefore an aggregate at revision 1 can return a corrupt stored revision 2, while a missing immutable revision 1 is reported as ordinary absence rather than integrity failure. This violates immutable-history provenance and the frozen fail-closed corruption requirement. Correction must reject a returned revision beyond the aggregate current revision and distinguish a missing revision inside `1..current_revision` as `definition_brick_integrity_error`; focused negative evidence must cover both cases.

No other actionable finding was identified.

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: REMEDIATION_REQUIRED for the two product findings and their associated test/OpenSpec/module-card evidence gaps. Findings do not authorize repair under this lease.

## Work and evidence

- Confirmed exact subject `a1fb21ddd44f81aec9754e1f62fb1bf22544835b` against baseline `ac409aba3b55c794b81fd7152267dbd038cf835b` and separately recorded orchestration HEAD `0f02796369d7a40c4d0c100e20967769340d29ab`.
- Confirmed the post-subject range contains only the authorized application acceptance/review Task records and Tester Report; no product, test, configuration, dependency, checker, OpenSpec, or Project State change follows the immutable subject.
- Independently reviewed every Project source and test file, repository/UoW ports, deterministic in-memory adapter, accepted Runtime Contracts and digest helper, exact checker delta, Project card, Task/coding/testing evidence, current invariants, and active OpenSpec design/spec/tasks.
- Apart from the findings, command decoding precedes identity, clock, digest, repository, and UoW effects for invalid commands. Public command/result/error values remain aligned with root-exported Runtime Contracts, and unexpected port/UoW exceptions map to `persistence_failure`.
- One UoW covers each Project or Brick mutation. The in-memory adapter snapshots and restores Project records, the typed namespace, aggregates, revisions, and archive state on injected failures. It remains under the test root and does not claim production persistence.
- Project isolation, the shared cross-kind namespace, immutable kind, no-upsert create, optimistic revision conflict, equal-content revision advancement, idempotent archive/no ID release, deterministic list/history, archived exact reads, and stable repository-outcome mapping are otherwise coherent.
- The checker delta is exact: Project source/test topology plus a production-import policy allowing only `@ai-block/runtime-contracts` and same-module relatives, with allow/deny regression probes. No other topology, manifest, probe, diagnostic, or import rule changed.
- Production Project source imports only Runtime Contracts and same-module files. No Actor, SQLite, storage driver, Server composition, transport, CLI, Host, Package, Run, recovery, backup, Graph, dependency, manifest, configuration, or lockfile scope entered the subject.
- OpenSpec task 3.3 is incorrectly marked complete because canonical Body behavior is absent. The Project card's “strict Definition Brick create” claim and its claim that stored revision/identity values are checked before reads return them are incomplete until findings 1 and 2 close. Its application-only/in-memory boundary and persistence/composition exclusions are otherwise accurate. Unreconciled root/routing/meta Project State remains intentionally Orchestrator-owned and is not a finding.

## Verification or result

- `git rev-parse HEAD` — `0f02796369d7a40c4d0c100e20967769340d29ab`.
- `git log` and path inspection for `a1fb21d..0f02796` — record-only as authorized.
- `git diff --name-status ac409aba3b55c794b81fd7152267dbd038cf835b..a1fb21ddd44f81aec9754e1f62fb1bf22544835b` — only authorized Project source/tests/card, checker, OpenSpec 3.1–3.5 checkboxes, and coding Report.
- `git diff --check ac409aba3b55c794b81fd7152267dbd038cf835b a1fb21ddd44f81aec9754e1f62fb1bf22544835b` — passed.
- Manifest/dependency/configuration comparison — unchanged.
- Static import/excluded-scope search — passed.
- No duplicate suite or production probe was run. Exact source-path analysis independently substantiates both findings, and the Tester Report already provides fresh suite/build/checker evidence plus a no-file-write canonical Body reproduction.

## Context and tool integrity

- New lease `runtime-project-reviewer-01@1`, Project Module state owner, immutable subject, and review-only authority remained intact.
- Used only deterministic local Git and read-only repository inspection before writing this Report. No network, install, service, database, destructive action, product/test/checker/Project State/OpenSpec/Task/prior-Report mutation, remediation, delegation, or continuation into SQLite/Project construction occurred.

## Deviations and remaining risk

- Defects: findings 1 and 2.
- Evidence gaps: returned/stored canonical Body assertions and exact-revision/aggregate coherence corruption cases are absent; OpenSpec 3.3 and the two affected Project-card claims are premature.
- Deliberately deferred scope: production persistence, SQLite/schema/migrations, restart behavior, external adapters, Server composition, and Actor resolver integration remain future slices and are not defects in this application-only subject.
- Future-slice choices: no SQLite or resolver design decision was made. Remediation must close this application boundary before those consumers proceed.
- Recommendation: REMEDIATION_REQUIRED.
