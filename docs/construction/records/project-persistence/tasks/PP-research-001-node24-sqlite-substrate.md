# PP-research-001 Node 24 SQLite Substrate Decision Brief

- owner: Runtime Server persistence infrastructure decision
- follows: PP-explore-001
- affected modules: future Project/persistence boundary
- workflow: W0 + Research + Compatibility
- base reason: the new durable substrate depends on exact Node 24 built-in API and stability guarantees
- implementation/product subject: `166b1ac261c9d1a783339541ff7415581d87f7e4`
- orchestration baseline: current OpenSpec proposal workspace

## Objective

Determine whether the Node.js 24 built-in `node:sqlite` API is an appropriate
first durable SQLite substrate for the bounded Project and Definition Brick
persistence slice, or whether the proposal requires a separately versioned
third-party SQLite dependency.

## Scope and authority

- read scope:
  - root and Runtime Server package manifests for the exact Node baseline;
  - the active persistence proposal and explicitly loaded design context;
  - official Node.js 24 documentation and release/stability documentation.
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-research-001-node24-sqlite-substrate.researching.md`
- delegated discretion:
  - assess API stability, synchronous/asynchronous execution model, prepared
    statements, transactions, foreign-key/configuration support, error
    behavior, file-backed databases, and compatibility limits relevant to the
    proposed slice;
  - recommend whether built-in SQLite closes the dependency decision.
- tools/external actions: read-only official documentation lookup; no code execution, package install, database probe, or third-party service
- delegation: none

## Frozen decisions and escalation

- Research only. Do not modify Runtime, tests, dependencies, lockfiles,
  OpenSpec, Project State, design, North Star, or the Task.
- Use authoritative primary sources for Node.js 24. Do not perform a general
  SQLite library survey.
- Separate documented guarantees from inference.
- Do not choose domain semantics or authorize implementation.

## References

- `package.json`
- `apps/runtime-server/package.json`
- `openspec/changes/build-project-and-definition-brick-persistence/proposal.md`
- `docs/design/future/project-persistence-and-brick-authoring.md`

References are audit pointers only. The dispatch manifest selects normative
context.

## Acceptance

The Report must answer:

1. whether `node:sqlite` is available and at what stability level under the
   repository's Node `>=24 <25` baseline;
2. whether it supports the file-backed, prepared-statement, explicit
   transaction, constraint, and migration operations needed by the proposal;
3. the material synchronous-runtime, version, security, and operational
   limitations;
4. whether a third-party runtime dependency is required for this slice;
5. what compatibility evidence an implementation Worker and Tester must later
   produce.

## Handoff

Write the decision brief at the authorized Report path. Cite official sources
and applicable versions. Do not commit or self-assign follow-up work.
