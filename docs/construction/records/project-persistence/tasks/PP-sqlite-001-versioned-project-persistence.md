# PP-sqlite-001 Versioned Project SQLite Persistence

- owner: Runtime Server Project Module
- follows: PP-sqlite-preflight-001
- affected modules: Runtime Server Project Module; root Node/toolchain boundary; workspace checker
- workflow: W3 + Compatibility + Recovery + Security Review + Early Review
- base reason: this is the first production persistence substrate and changes the supported Node floor before later Actor resolver consumption
- implementation/product subject: `3cb5170`
- orchestration baseline: task-record commit (self)

## Objective

Implement and independently accept one Project-owned, file-backed,
schema-versioned `node:sqlite` adapter for OpenSpec tasks `4.1` through `4.5`,
without adding Actor resolver integration, Server composition, or another
state owner.

## Scope and authority

- read scope:
  - root/runtime-server manifests, installed types, lockfile, TypeScript
    configuration, checker, and repository temp-test conventions;
  - accepted Project application source/tests/card and consumed Runtime
    Contracts;
  - active OpenSpec proposal/design/spec/tasks, current Runtime invariants,
    accepted SQLite research, and PP-sqlite-preflight-001;
  - current official Node 24 `node:sqlite` documentation.
- implementation write scope after separate authorization:
  - `package.json`
  - `scripts/check-workspace-boundaries.mjs`
  - `apps/runtime-server/src/modules/project/index.ts`
  - `apps/runtime-server/src/modules/project/infrastructure/sqlite/configuration.ts`
  - `apps/runtime-server/src/modules/project/infrastructure/sqlite/migrations/v1.ts`
  - `apps/runtime-server/src/modules/project/infrastructure/sqlite/persistence.ts`
  - `apps/runtime-server/src/modules/project/infrastructure/sqlite/index.ts`
  - `apps/runtime-server/test/modules/project/sqlite-persistence.test.ts`
  - `project_state/apps/runtime-server/modules/project/README.md`
  - checkbox state for OpenSpec tasks `1.3` and `4.1` through `4.5` only
- delegated discretion:
  - internal private helper/type organization within the authorized SQLite
    files;
  - exact fixed DDL identifiers and prepared-statement names;
  - deterministic disposable-test helper structure inside the authorized test
    file;
  - diagnostic detail retained inside the owning module without crossing
    Runtime Contracts.
- tools/external actions:
  - after explicit implementation authorization, deterministic local
    source/test/build/checker commands and disposable OS-temp SQLite databases;
  - no runtime install/upgrade, third-party service, production database,
    destructive downgrade, network service, or unrelated Git-history action.
- delegation: none
- authority mode: task
- output mode: commit

## Compatibility authorization gate

Implementation is **not authorized** while the executing runtime is below
Node 24.15. Before authorization, the Orchestrator must confirm:

```text
node --version -> >=24.15.0 and <25.0.0
pnpm --version -> 11.10.0
git status -> clean
```

The implementation changes root `engines.node` from `>=24 <25` to
`>=24.15 <25`. Keep the existing exact `@types/node` `24.13.3`: registry
verification established that it is the current 24-series type release and it
already covers every selected API below. Do not request nonexistent
`@types/node@24.15.0`, add type augmentation, use `DatabaseSync.limits`, or
change dependencies/lockfile. Stop if the engine-only manifest edit causes a
lockfile change.

## Frozen implementation decisions

### Configuration and connection

- Export a Project-module SQLite factory/lifecycle through the existing Project
  root. Do not expose SQL rows, statements, paths, or driver errors through
  Runtime Contracts.
- Factory input is exactly `{ databasePath: string }`.
- Reject empty, relative, `:memory:`, directory, nonexistent-parent, cwd/default,
  Project-repository-derived, or environment-derived paths. Do not create the
  parent directory.
- Canonicalize the existing real parent plus database filename for the
  process-wide serialization key.
- Open one `DatabaseSync` connection per adapter with:
  - `allowExtension: false`;
  - `enableForeignKeyConstraints: true`;
  - `defensive: true`;
  - `readBigInts: true`;
  - `allowBareNamedParameters: false`;
  - `allowUnknownNamedParameters: false`;
  - `timeout: 250`.
- Verify required connection/security settings before serving. Close is
  explicit and idempotent.
- Do not configure `DatabaseSync.limits`; accepted Contract Bodies have no new
  size ceiling in this slice.

### Serialization and transactions

- A process-wide FIFO mutex keyed by canonical database path covers every
  Project Unit of Work across adapter instances. It prevents same-process write
  interleaving and is released on every outcome.
- Cross-process or unknown-connection contention uses SQLite's separate 250 ms
  timeout. Do not retry or busy-wait in JavaScript.
- Each mutation flow is:

```text
acquire FIFO key
-> BEGIN IMMEDIATE
-> prepared repository operations
-> COMMIT
-> release
```

- On every exception, attempt `ROLLBACK` before release and before application
  error mapping. Preserve the original failure category if rollback also
  fails, while retaining rollback failure only as module-local diagnostic
  context.
- Reads may use prepared statements outside a write transaction but still
  perform the accepted application integrity checks before returning values.

### Safe values and error boundary

- Bind every data value. Only fixed schema/transaction SQL may use `exec`.
- Read SQLite integers as `bigint`; convert only positive values at or below
  `Number.MAX_SAFE_INTEGER`. Never round an integer.
- Invalid configuration, open, lock, unexpected constraint, or driver failure
  maps to the existing `persistence_failure` boundary.
- Unsupported/altered schema or failed initialization maps to
  `unsupported_schema_version` and the adapter serves no operation.
- Malformed stored JSON, IDs, integer range, Body, identity binding, canonical
  form, or digest flows through the existing fail-closed Project integrity
  boundary rather than being reported as ordinary absence.
- Preserve stable strict-create, stale-base, archived, not-found, and conflict
  mappings established by the accepted application module.

### Schema version 1

- One fixed migration in `migrations/v1.ts` bootstraps an empty store and
  atomically inserts ledger version `1`.
- Required tables:
  - `project_schema_migrations(version INTEGER PRIMARY KEY CHECK(version >= 1))`;
  - `projects(project_id TEXT PRIMARY KEY, created_at TEXT NOT NULL)`;
  - `definition_brick_aggregates` with aggregate UID primary key, Project
    foreign key, unique `(project_id, brick_id)` namespace, immutable
    kind/status checks, positive current revision, and composite uniqueness
    needed by revisions;
  - `definition_brick_revisions` with revision UID primary key, composite
    aggregate/Project/Brick/kind foreign key, unique `(brick_uid, revision)`,
    positive revision, and required Body JSON/digest/timestamp fields.
- Add an exact lookup index for `(project_id, brick_id, revision)`.
- Startup bootstraps only a structurally empty store. A ledger other than
  exactly version 1, missing/altered required schema, or a nonempty unledgered
  store fails closed. Do not infer, repair, downgrade, delete, or partially
  serve it.

### Tests, recovery, and exclusions

- The single SQLite test file owns only explicitly prefixed disposable
  OS-temp directories. It closes adapters before deleting those directories
  and never deletes a failed non-disposable database.
- Focused evidence covers invalid paths; clean bootstrap/settings; prepared Body
  values; Project/Brick create/revise/archive rollback; close/reopen durability;
  archived exact history; Project isolation; same-process competing stale-base
  conflict; external lock timeout; FK/unique/check/not-null constraints;
  migration/bootstrap failure; unsupported/altered schema; and raw
  Body/digest/binding/integer corruption.
- Do not modify Project application ports/values/errors/semantics, Runtime
  Contracts, Actor, Server main/composition, HTTP/CLI/file import,
  ActorTemplate/Snapshot persistence, Package, Run, Graph, backup/export, or
  recovery automation.
- Update only the existing Project card's implementation/dependency/current
  condition/evidence claims. Retain its Intent and explicitly defer composition,
  Actor resolver wiring, automated recovery, and execution. Create no facet or
  neighboring card.
- Checker changes are limited to:
  - exact root Node-engine expectation and executable runtime-floor guard;
  - exact new Project source/test topology;
  - an infrastructure-only import policy permitting `node:sqlite`, `node:fs`,
    and `node:path` plus Runtime Contracts/same-module relatives.
- Stop with scope escalation for any additional path, dependency, type
  augmentation, lockfile change, Contract/application-port change, or
  cross-module write.

## References

- `docs/construction/records/project-persistence/tasks/PP-sqlite-preflight-001-versioned-project-persistence.md`
- `docs/construction/records/project-persistence/reports/PP-research-001-node24-sqlite-substrate.researching.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `project_state/apps/runtime-server/modules/project/README.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Compatibility preflight confirms the actual Node/pnpm/clean baseline and
   selected built-in API surface before any edit.
2. OpenSpec tasks `1.3` and `4.1` through `4.5` are implemented as one coherent
   Project persistence subject; no 5.x Actor integration enters.
3. Targeted Project application/SQLite tests, Runtime Server types/full suite,
   Runtime Contracts tests/types, workspace build, boundary checks, full
   repository verification, diff/scope checks, and restart/contention/
   corruption evidence pass under Node 24.15+.
4. The candidate Project card accurately states the private file-backed
   adapter, durability/integrity/transaction bounds, evidence, and exclusions.
5. The implementation, tests, checker, exact engine update, OpenSpec checkboxes,
   and candidate card are committed together as:
   `feat(server): add versioned project sqlite persistence`.
6. Independent Tester and Early Reviewer accept the exact committed subject
   before Actor resolver integration or root/meta reconciliation continues.

## Handoff

After explicit `IMPLEMENTATION_AUTHORIZED`, use `output_mode: commit`, stage
only authorized paths, and place a compact receipt in the commit body with
Task, baseline, runtime/toolchain, verification, deviation, and residual risk.
Create no coding Report. Return the commit SHA and unique handoff, then stop.
Do not schedule independent evidence, update root/meta state, or continue into
Actor integration.
