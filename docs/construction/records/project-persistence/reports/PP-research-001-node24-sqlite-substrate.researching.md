# PP-research-001 — Node 24 SQLite substrate research brief

## Question and blocked decision

**Question.** Under this repository's declared Node range (`>=24 <25`), does
the built-in `node:sqlite` API supply the file-backed, prepared-statement,
transaction, constraint, and migration substrate required by the proposed
bounded Project and Definition Brick persistence slice, or does that slice
require a separately versioned third-party SQLite runtime dependency?

**Blocked decision.** Runtime Server persistence infrastructure selection for
the proposed durable SQLite adapter. This brief supplies compatibility evidence
only; it does not select the product substrate, schema, transaction policy, or
implementation.

## Finding

`node:sqlite` documents every primitive named by the proposal: a file-backed
`DatabaseSync`, prepared statements with bound values, SQL execution, foreign
key configuration, lock timeout configuration, and transaction-state
inspection. The documentation therefore supports it as a technically sufficient
first substrate for this bounded slice; those primitives do **not** by
themselves require a third-party runtime dependency.

The compatibility qualification is material: the repository's unpinned
`>=24 <25` range includes Node 24 releases where the module remained
experimental, while Node 24.15.0 changed it to Stability 1.2 (release
candidate). Thus the present range does not establish one release-candidate
guarantee for every permitted runtime. A construction decision that relies on
that guarantee must either set and enforce a Node minimum of 24.15.0 (while
remaining below 25), or explicitly accept the experimental-status portion of
Node 24 and test it. This is a compatibility implication, not a requested
Orchestrator product decision.

## Authoritative evidence (Node.js primary sources, checked 2026-07-26)

The workspace root manifest declares Node `>=24 <25`; the Runtime Server
manifest currently has no SQLite dependency.

| Need | Documented guarantee | Applicable Node 24 version/evidence |
| --- | --- | --- |
| Availability and stability | `node:sqlite` was added in v22.5.0; it ceased requiring `--experimental-sqlite` in v22.13.0/v23.4.0 but remained experimental; v24.15.0 made SQLite a release candidate, currently Stability 1.2. It is available only with the `node:` scheme. | [Node 24 SQLite API — module history and stability](https://nodejs.org/docs/v24.18.0/api/sqlite.html#sqlite) and [Node 24.15.0 release](https://nodejs.org/en/blog/release/v24.15.0). |
| File-backed database | `new DatabaseSync(path)` accepts a path; a SQLite database may be file-backed, with a file path used for that mode. | [DatabaseSync constructor](https://nodejs.org/docs/v24.18.0/api/sqlite.html#new-databasesyncpath-options). |
| Synchronous execution | `DatabaseSync` represents one connection and **all** its APIs execute synchronously; `StatementSync` APIs do likewise. | [DatabaseSync](https://nodejs.org/docs/v24.18.0/api/sqlite.html#class-databasesync) and [StatementSync](https://nodejs.org/docs/v24.18.0/api/sqlite.html#class-statementsync). |
| Prepared statements and parameter binding | `prepare()` compiles a statement; `StatementSync` is parameterizable and bound parameters protect against SQL injection. `run`, `get`, `all`, and `iterate` are documented statement operations. | [prepare](https://nodejs.org/docs/v24.18.0/api/sqlite.html#databasepreparesql-options) and [StatementSync](https://nodejs.org/docs/v24.18.0/api/sqlite.html#class-statementsync). |
| SQL, transactions, and migrations | `exec(sql)` executes one or more SQL statements. `isTransaction` reports whether the connection is within a transaction and wraps SQLite autocommit state. These provide the documented substrate to issue explicit SQL `BEGIN`/`COMMIT`/`ROLLBACK` and transactional migration SQL; Node does not document a higher-level transaction callback API here. | [exec](https://nodejs.org/docs/v24.18.0/api/sqlite.html#databaseexecsql) and [isTransaction](https://nodejs.org/docs/v24.18.0/api/sqlite.html#databaseistransaction). |
| Constraints and lock configuration | Foreign-key enforcement is enabled by default and can be configured with `enableForeignKeyConstraints` or `PRAGMA foreign_keys`. `timeout` is the busy-lock wait in milliseconds and defaults to `0`, after which SQLite returns an error. | [DatabaseSync options](https://nodejs.org/docs/v24.18.0/api/sqlite.html#new-databasesyncpath-options). |
| Security configuration | Extensions default off. `defensive` disables SQL features that could deliberately corrupt a database and is default-on from v24.14.0; runtime limits are available in v24.15.0 to constrain malicious input. | [DatabaseSync options](https://nodejs.org/docs/v24.18.0/api/sqlite.html#new-databasesyncpath-options) and [Node 24.15.0 release](https://nodejs.org/en/blog/release/v24.15.0). |
| Error and data-conversion behavior | Unsupported JavaScript values throw. Integer reads outside JavaScript's safe range throw `ERR_OUT_OF_RANGE` unless BigInt reads are enabled. Several lifecycle/configuration operations also document exceptions. | [type conversion](https://nodejs.org/docs/v24.18.0/api/sqlite.html#type-conversion-between-javascript-and-sqlite) and [DatabaseSync API](https://nodejs.org/docs/v24.18.0/api/sqlite.html#class-databasesync). |

## Documented guarantee vs. inference

### Documented guarantees

- The API is present in Node 24 and is release-candidate stability from
  v24.15.0; the same official history establishes that earlier permitted Node
  versions were still experimental.
- It can open a file-backed database; exposes synchronous execution, prepared
  statements, multi-statement SQL execution, foreign-key configuration, and a
  configurable lock timeout.
- The stated error/data-conversion and security-option behavior applies as
  documented above.

### Inference for this proposal

- The proposed aggregate/revision writes, stale-base checks, migration ledger,
  and integrity checks can be expressed with the documented prepared SQL plus
  explicit SQLite transactions. This follows from the listed primitives; it is
  not a Node guarantee about the proposal's future schema or atomicity.
- No third-party SQLite runtime package is technically necessary to implement
  the listed first slice, provided the implementation accepts the synchronous
  model and establishes a supported Node 24 minor-version policy.
- Because all database APIs are synchronous, database work and any busy-lock
  wait run on the calling JavaScript execution path. For a Runtime Server that
  may later serve concurrent requests, an owning design must bound work,
  select timeout/retry/serialization behavior, and prevent long transactions;
  the current design correctly leaves that policy open.

## Compatibility limits and operational risks

- **Version floor:** `>=24 <25` permits 24.0–24.14, not only the release
  candidate state introduced in 24.15.0. It also crosses API additions such as
  `defensive` (v24.12.0), its default-on change (v24.14.0), and `limits`
  (v24.15.0). Do not depend on those additions without a matching floor or a
  compatibility test.
- **Synchronous runtime:** There is no documented asynchronous `Database`
  counterpart in this API. A slow query, migration, or configured busy wait
  can block the caller. The default busy timeout is zero, so lock contention
  produces an error immediately unless the adapter deliberately configures it.
- **Transactions:** The API documents transaction state, not a Node-managed
  transaction callback/automatic rollback abstraction. The adapter must own
  explicit `BEGIN`/`COMMIT`/`ROLLBACK` handling, including exceptions and
  cleanup; it must not infer domain atomicity merely from `exec()` accepting
  multiple statements.
- **Constraints and errors:** Foreign keys default on but should be made
  explicit and verified by the adapter. SQLite constraint/lock failures are
  surfaced as errors; no proposal-specific mapping, retry policy, or error
  taxonomy is documented by Node.
- **Security and input:** Keep extension loading disabled (the default), set
  defensive mode deliberately rather than relying on its pre-v24.14 default,
  bind all data values, and decide explicit limits for untrusted or unusually
  large input. SQL identifiers and migration SQL remain construction-owned,
  not parameter values.
- **Data representation:** Persisted integers that can exceed JavaScript safe
  integers need a deliberate BigInt policy; unsupported values throw. This is
  relevant to future timestamps, sequence numbers, and any binary provenance
  representation.
- **Operations remain outside the brief:** backup/export/recovery guarantees,
  database location and filename, deletion, corruption handling policy, and
  multi-process concurrency are open design decisions, not resolved by API
  availability.

## Required later compatibility evidence

An implementation Worker and Tester should produce, under the accepted Node
version policy and without substituting a third-party driver:

1. A clean-install/type-check proof that imports use `node:sqlite` and the
   selected minimum Node 24 version is enforced by the workspace/CI policy.
2. File-backed restart evidence: bootstrap/migrate, close, reopen, and resolve
   the same Project and exact immutable Brick revision.
3. Prepared-statement evidence for authoring and exact-resolution paths,
   including values that would be unsafe if concatenated into SQL.
4. Transactional rollback evidence for failed create/revise/archive and failed
   migration, demonstrating no partial aggregate/revision state; separately
   test stale-base and constraint failures.
5. Foreign-key, uniqueness/check/not-null (as selected by the schema), and
   lock-contention/timeout behavior evidence, with repository-level mapping of
   driver errors to the owning persistence boundary.
6. Explicit security/configuration evidence: extension loading remains
   disabled, foreign keys and defensive mode are set intentionally, and chosen
   input/SQL limits and BigInt conversion behavior are covered.
7. Corrupt/invalid database and migration-ledger failure evidence consistent
   with the eventual accepted operational policy; this brief does not define
   that policy.

## Remaining uncertainty

- The current proposal does not state the exact Node 24 patch/minor floor,
  supported operating systems, expected database size, maximum transaction
  duration, or deployment concurrency model. Official API documentation cannot
  establish whether synchronous execution meets those future operational
  requirements.
- Node's release-candidate stability is not the same as a stable API guarantee;
  an accepted compatibility policy must decide whether that status is adequate
  and how Node 24 minor upgrades are controlled.
- This research did not perform a database probe, installation, benchmark, or
  corruption experiment, by task constraint. Such observations remain required
  construction/test evidence, not findings of this report.

## Construction implication (not a product decision)

The official Node 24 evidence closes the narrow factual question that a
third-party runtime dependency is necessary for the proposal's named SQLite
operations: it is not technically required. It leaves the Orchestrator to
choose whether to adopt the built-in release-candidate substrate with an
explicit Node compatibility floor, accept earlier experimental Node 24
releases, or make a different authorized product decision.
