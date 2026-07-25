# PP-digest-001 Shared Definition Brick Canonical Digest

- owner: Runtime Contracts shared value boundary
- follows: PP-contracts-review-001
- affected modules: Runtime Contracts; Runtime Server Actor Module consumer; future Project Module consumer
- workflow: W3 + Compatibility + Early Review
- base reason: Project authoring and Actor validation require one public canonicalization/digest algorithm across state owners
- implementation/product subject: `1495fb6`
- orchestration baseline: task-record commit (self)

## Objective

Promote the accepted Definition Brick Body normalization and canonical SHA-256
digest algorithm from Actor implementation into one root-exported Runtime
Contracts helper, then make the Actor Module consume that helper without
changing digest values, validation behavior, or the accepted
`DefinitionBrickRevision` shape.

## Scope and authority

- read scope:
  - `packages/runtime-contracts/**`
  - `apps/runtime-server/src/modules/actor/**`
  - `apps/runtime-server/test/modules/actor/**`
  - directly relevant package/build/boundary configuration
  - accepted Contract, ActorTemplate, OpenSpec, state-card, and construction
    evidence
- implementation write scope:
  - `packages/runtime-contracts/src/**`
  - `packages/runtime-contracts/test/**`
  - `packages/runtime-contracts/package.json`
  - `apps/runtime-server/src/modules/actor/**`
  - `apps/runtime-server/test/modules/actor/**`
  - `scripts/check-workspace-boundaries.mjs`
  - `project_state/packages/runtime-contracts/README.md`
  - `project_state/apps/runtime-server/modules/actor/README.md`
  - `docs/construction/records/project-persistence/reports/PP-digest-001-shared-definition-brick-digest.coding.md`
- delegated discretion:
  - choose the internal Runtime Contracts helper file and pure-function
    composition;
  - preserve or wrap Actor-local exports only as needed for compatibility;
  - add focused deterministic fixtures for every Definition Brick Body kind;
  - reconcile only directly affected Runtime Contracts/Actor cards when their
    statements or evidence routes change.
- tools/external actions: deterministic local read/test/type/build/boundary commands only; no install, network, service, database, destructive, or Git-history action
- delegation: none

## Frozen decisions and escalation

- Preflight dispatch authorizes no edits.
- Runtime Contracts becomes the sole implementation owner of the Definition
  Brick canonicalization/digest helper.
- The helper must:
  - accept the existing strict `DefinitionBrickBody`/kind values;
  - remove one leading BOM and normalize CRLF/CR to LF for text-bearing prompt
    bodies exactly as the accepted Actor algorithm does;
  - recursively normalize composite prompt content without changing ordering;
  - canonicalize `{ kind, schema_version: "1.0.0", body }` with the existing
    RFC8785-compatible dependency;
  - return the existing lowercase SHA-256 digest Contract value;
  - fail closed rather than inventing alternate serialization.
- Existing Actor digest outputs, validation errors, exact-ref binding,
  Snapshot provenance, and `DefinitionBrickRevision` compatibility must not
  change.
- Do not introduce another digest algorithm, a Project-to-Actor import, a new
  dependency, lockfile change, persistence, SQLite, Project application
  behavior, transport, CLI, Host, Package, Run, recovery, or Graph.
- `scripts/check-workspace-boundaries.mjs` may change only for the exact new
  Runtime Contracts source/test topology and accepted root runtime/type export
  allowlists, plus the mirrored Runtime Contracts `test:types` command when the
  authorized package-local test list changes. Do not change probe logic or
  another workspace boundary.
- Coder may update only the two directly affected module cards if their current
  claims/evidence routes become stale. Root routing, Runtime Server routing,
  system map, current focus, and cross-module summaries remain
  Orchestrator-owned and must not change.
- Stop before any additional existing module, configuration, manifest,
  dependency, lockfile, Project State, checker behavior, or product semantic.

## References

- `docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md`
- `docs/construction/records/project-persistence/reports/PP-contracts-review-001-project-brick-contracts.reviewing.md`
- `docs/construction/records/actor-template/reference-only-actor-template-closeout.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

1. Preflight returns the exact helper API, file/move/wrapper plan, canonical
   algorithm mapping, compatibility risks, fixtures/tests, checker/card impact,
   verification, and `READY` or `BLOCKED`.
2. After separate implementation authorization, Runtime Contracts exports one
   canonical Definition Brick digest implementation and Actor consumes it
   without retaining a competing algorithm.
3. Focused Contract tests cover every Body kind, BOM/newline normalization,
   recursive composite content, property-order canonicalization, deterministic
   known digests, and invalid input/failure behavior.
4. Existing Actor validation/Snapshot tests prove byte-for-byte digest and
   behavior compatibility; no ActorTemplate/Snapshot semantic changes occur.
5. Runtime Contracts and Runtime Server tests/types/build, workspace build,
   boundary checks, and diff/no-excluded-scope checks pass.
6. Directly affected cards are either accurately reconciled or explicitly
   reported unchanged with evidence; no root/routing/meta Project State path is
   modified.
7. Implementation and coding Report are committed together as:
   `refactor(contracts): share definition brick digest`.

## Handoff

For preflight, return analysis and stop without editing or writing the final
Report. After explicit implementation authorization, write the coding Report,
stage only authorized paths, commit with the exact message, and stop. Do not
resume Project implementation, schedule testing/review, or mark unrelated
OpenSpec tasks.
