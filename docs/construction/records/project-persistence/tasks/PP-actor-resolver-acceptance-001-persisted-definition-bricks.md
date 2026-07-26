# PP-actor-resolver-acceptance-001 Persisted Definition Brick Integrated Acceptance

- owner: Runtime Server Project/Actor boundary
- follows: PP-actor-resolver-001
- affected modules: Runtime Contracts; Runtime Server Project Module; Runtime Server Actor Module; workspace/toolchain boundary
- workflow: W3 independent integrated acceptance + Compatibility + Recovery + Security Review
- base reason: the completed public producer/consumer boundary must prove the full durable Project-to-Actor flow and failure semantics before whole-change acceptance
- implementation/product subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- implementation baseline: `e181255`
- accepted Project SQLite subject: `38fe697c12be6ce7032334cdd10897f554117dfc`
- orchestration baseline: task-record commit (self)

## Objective

Independently verify the complete accepted-change candidate from explicit
Project creation and Definition Brick authoring through restart and exact Actor
resolution/Snapshot provenance, including required absence, integrity,
concurrency, compatibility, state-card, and excluded-scope behavior.

## Scope and authority

- read scope:
  - exact integration subject/baseline and all accepted Contract, Project
    application, SQLite/remediation, and ActorTemplate evidence subjects needed
    to establish unchanged prior behavior;
  - Runtime Contracts, Project/Actor source/tests/exports/cards, checker,
    manifests/lockfile, active OpenSpec artifacts, current Runtime invariants,
    implementation Tasks, and focused evidence;
  - repository-owned verification/install commands and disposable-test
    conventions.
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-actor-resolver-acceptance-001-persisted-definition-bricks.testing.md`
- delegated discretion: add bounded no-product-write probes or test selections
  needed to classify product, environment, subject, card, acceptance, or
  evidence failures.
- tools/external actions:
  - deterministic local read/test/type/build/boundary/Git inspection;
  - one repository-root `pnpm install --frozen-lockfile` clean-install check,
    permitted to update ignored `node_modules` only and forbidden to alter
    manifests or lockfile;
  - explicitly prefixed disposable OS-temp SQLite databases outside the
    workspace, closed before cleanup;
  - no other install, service, production database, destructive action,
    product/config/Project State/OpenSpec/Task/prior-evidence write, or
    unrelated Git-history action.
- delegation: none
- authority mode: task
- output mode: file

## Frozen decisions and escalation

- Treat `2da0f00` as immutable. Do not fix, format, or stage product content.
- Verify exact resolver semantics:
  - exact persisted Project/Brick/revision returns the unchanged Contract
    revision;
  - later revisions never replace the requested revision;
  - archived exact history remains resolvable;
  - missing Project/Brick/revision returns ordinary absence;
  - integrity/persistence/unexpected failure is redacted and fail closed, not
    absence, and Actor persists no invalid Snapshot.
- Prove at least one full flow:
  explicit Project create → Brick create/revise/archive as applicable →
  adapter close → reopen compatible store → exact Actor resolver consumption →
  Template/Snapshot compilation with matching revision UID/digest provenance.
- Reexercise relevant SQLite restart, corruption, Project isolation,
  optimistic concurrency/rollback, schema/configuration failure, Node/runtime
  compatibility, and workspace-path/security behavior sufficiently to show
  that the integration did not bypass accepted producer guarantees.
- Confirm Node `>=24.15 <25`, pnpm `11.10.0`, exact
  `@types/node 24.13.3`, frozen-lockfile install, no third-party SQLite
  dependency, and no manifest/lockfile drift.
- Confirm Project owns the provider, Actor port/source remain unchanged,
  application code imports no SQLite details, Contracts are root-only, and no
  Server composition, ActorTemplate/Snapshot production persistence,
  cross-family Unit of Work, Actor creation, Host launch, HTTP/CLI, Package,
  Run, Graph, recovery automation, or execution entered.
- Report candidate Project-card mismatch without editing it. Verify Runtime
  Contracts and Actor cards remain accurate despite no change.
- A changed subject, install-induced tracked diff, non-disposable database, or
  required unlisted write returns `SUBJECT_MISMATCH`/`BLOCKED`; do not clean up
  tracked user work or remediate.

## References

- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-001-persisted-definition-bricks.md`
- `docs/construction/records/project-persistence/reports/PP-sqlite-remediation-acceptance-001-integrity-and-path-boundary.testing.md`
- `docs/construction/records/project-persistence/reports/PP-sqlite-remediation-review-001-integrity-and-path-boundary.reviewing.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `project_state/apps/runtime-server/modules/project/README.md`
- `project_state/apps/runtime-server/modules/actor/README.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Confirm exact subject/baseline/current orchestration HEAD, record-only
   intervening range, clean start, and unchanged product subject.
2. Run a frozen-lockfile clean install with no tracked drift, focused persisted
   resolver/SQLite/Project/Actor tests, Runtime Contracts and ActorHost tests,
   integration tests, types, build, workspace boundaries, full repository
   verification, diff/import/subject/scope, and final clean checks.
3. Map the full flow and each required negative/concurrency/integrity/
   compatibility/exclusion claim to fresh or still-applicable exact evidence.
4. Verify the changed Project candidate card and unchanged neighboring cards
   against the exact subject.
5. Return PASS only when no product defect, blocking evidence gap, subject
   mismatch, card mismatch, or tracked install drift remains.

## Handoff

Write only the declared delta-only testing Report and commit it as:
`test(server): accept persisted actor resolver`.
Return report commit, PASS/FAIL, decisive integrated evidence, coverage limits,
residual risk, and final repository state, then stop. Do not remediate, review,
reconcile Project State, edit OpenSpec, authorize new product work, or archive
the change.
