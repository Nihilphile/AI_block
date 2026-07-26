# PP-actor-resolver-remediation-acceptance-001 Result Validation Focused Retest

- owner: Runtime Server Project/Actor boundary
- follows: PP-actor-resolver-remediation-001
- affected modules: Runtime Server Project Module; existing Actor consumer behavior
- workflow: W3 independent focused retest
- base reason: the final acceptance-blocking P1 requires independent closure evidence against the corrected immutable subject
- implementation/product subject: `021c00504d87eaedaf6faa09e9e32a989926eb2c`
- defective subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- remediation baseline: `81629c1`
- orchestration baseline: task-record commit (self)

## Objective

Independently prove that runtime result/binding validation closes the malformed
reader fail-open/raw-error finding without regressing the previously passing
persisted resolver integration.

## Scope and authority

- read scope:
  - exact remediation/defective subjects, remediation baseline/diff, changed
    adapter/test/card, original integrated acceptance/review, remediation Task,
    Project result/Contract schemas, and directly affected Actor behavior;
  - active OpenSpec design/spec and repository verification commands needed for
    the focused correction.
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-actor-resolver-remediation-acceptance-001-result-validation.testing.md`
- delegated discretion: choose bounded no-product-write probes needed to
  distinguish closure, bypass, regression, subject/card mismatch, or evidence
  failure.
- tools/external actions: deterministic local read/test/type/build/boundary/Git
  inspection and prefixed disposable OS-temp SQLite databases only; no install,
  network service, production database, product/config/Project State/OpenSpec/
  Task/prior-evidence edit, destructive action, or unrelated Git-history action.
- delegation: none
- authority mode: task
- output mode: file

## Frozen decisions and escalation

- Treat `021c005` as immutable. Do not fix.
- Separately exercise null, undefined revision, malformed/ambiguous error,
  mismatched Project/Brick/kind/revision success, and arbitrary reader throw.
  Each must produce exactly the one static redacted resolver failure, never
  `undefined`, raw `TypeError`, raw reader error, or internal code/detail.
- Confirm strict Contract decoding and requested identity/kind/revision binding
  occur before the narrow post-validation type adaptation. The type adaptation
  must not bypass or weaken runtime validation.
- Retain evidence for valid exact success, all three ordinary-absence cases,
  no-latest selection, archived/restart behavior, Snapshot provenance,
  fail-closed corruption, and no Snapshot after failure.
- Confirm the remediation changes only adapter/test/Project-card paths and
  leaves checker, Actor, Contracts, Project application, SQLite, schema,
  dependency/lockfile, engine, OpenSpec, and exclusions unchanged.
- Verify the Project card matches the remediation and states focused retest and
  re-review pending.
- Report mismatch without editing any product/state/authority artifact.

## Acceptance

1. Confirm exact subjects, baseline, current orchestration HEAD, record-only
   intervening range, clean start, and unchanged remediation subject.
2. Run fresh focused resolver evidence for the P1 and nearby valid behavior,
   followed by relevant Runtime Server types/full suite, Contracts,
   ActorHost/integration, build, boundaries, diff/subject/scope, and final clean
   checks.
3. State whether the prior integrated PASS remains applicable to unchanged
   behavior and why.
4. Return PASS only if the P1 is closed with no regression, blocking evidence
   gap, subject mismatch, or card mismatch.

## Handoff

Write only the declared delta-only testing Report and commit it as:
`test(server): retest persisted resolver validation`.
Return report commit, P1 disposition, PASS/FAIL, evidence, limits, residual
risk, and final repository state, then stop. Do not remediate, review,
reconcile, edit OpenSpec, authorize further work, or archive.
