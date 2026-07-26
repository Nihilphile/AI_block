# PP-actor-resolver-remediation-acceptance-001 Resolver Result Validation Evidence

- work: testing
- verdict: pass
- defective subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- remediation subject: `021c00504d87eaedaf6faa09e9e32a989926eb2c`
- remediation baseline: `81629c1acb986bc591d2a31a53f7641ed144377a`
- orchestration head: `88c557666d3b97195343996be695adff32a3ee99`
- lease: `runtime-project-actor-resolver-tester-01@1`

## Decision or findings

PASS. P1 is closed. The resolver now treats its structural Project exact-read
capability as a runtime trust boundary: complete results decode through the
root-exported Contract schema, successful revisions must bind to the requested
Project/Brick/revision and matching kind, and every reader call/result
operation is inside the fixed redacted failure boundary. `null`, undefined or
ambiguous shapes, malformed errors, mismatched successes, and arbitrary raw
reader throws all produce only `Persisted Definition Brick resolution failed.`
and never ordinary absence or a raw error. Valid success and precisely the
three allowed not-found outcomes retain their prior behavior.

Earlier integrated evidence remains applicable to unchanged provider behavior:
exact selection without latest substitution, Project isolation, archived
history, restart, Snapshot provenance, corruption failure, structural Actor
port assignment, import direction, and checker policy were retained and
re-exercised by the focused suite and surrounding regression matrix.

## Decisive evidence

- Identity and scope: `2da0f00..021c005` modifies only the authorized Project
  resolver provider, its focused test, and Project card. Contracts, Actor
  source/card, SQLite core/schema/configuration, checker, dependencies, and
  lockfile are unchanged. `021c005..88c5576` contains only remediation
  authorization records and root-focus orchestration; no product/test/tooling
  drift is present.
- Fresh focused resolver testing passed 4/4 after the Runtime Contracts build
  prerequisite. It asserts valid success, all three permitted absences, null,
  `{ revision: undefined }`, malformed/ambiguous error shapes, mismatched
  Project/Brick/kind/revision successes, and a raw reader throw; each invalid
  case rejects with the exact static failure.
- Relevant regressions passed: Runtime Server 70/70, Runtime Contracts 91/91,
  ActorHost 80/80, and integration 5/5. Root type check, workspace build,
  boundary/import probes, deterministic cleanup, and final git-clean boundary
  check passed. The pre-report worktree was clean.

## Coverage limits and residual risk

- This focused retest intentionally did not install dependencies or repeat the
  original frozen-install evidence; no dependency/lockfile/toolchain surface
  changed, and the retained integrated matrix passes.
- Server composition, ActorTemplate/Snapshot production persistence, recovery
  automation, and cross-process SQLite stress remain outside this remediation.
  The accepted synchronous SQLite/event-loop and bounded contention trade-offs
  remain residual risks.

## Integrity

Lease continuity is confirmed for `runtime-project-actor-resolver-tester-01@1`.
Testing started clean, preserved the immutable remediation subject, and changed
only this report. No product, test, configuration, Project State, OpenSpec,
task, or prior evidence was modified by this lease.
