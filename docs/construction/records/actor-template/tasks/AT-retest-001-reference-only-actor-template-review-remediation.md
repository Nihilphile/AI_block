# AT-retest-001 Reference-only ActorTemplate Review Remediation

- owner: Runtime Server Actor Module
- work: testing
- workflow: W3 focused independent retest
- remediation subject: `dd9279c0efbd76f27562961f1c22961bc7dd36be`
- coding evidence baseline: `c9a0438d9f9937ddb0441db1a6f80b29158022ef`
- originating review: `fbc7b30b78bc070198d19d3ae176382199155230`
- change: `build-reference-only-actor-template`

## Objective

Independently verify that the exact remediation subject closes Review findings F-1, F-2, and F-3 without changing implementation or expanding module scope.

## Authority

Read scope:

- the remediation subject and its focused Runtime Contracts, Actor Module, and boundary-checker changes;
- the originating Review, remediation Task, and remediation Coding Report;
- the OpenSpec ActorTemplate construction specification and directly relevant existing tests.

Write scope:

```text
docs/construction/records/actor-template/reports/AT-retest-001-reference-only-actor-template-review-remediation.testing.md
```

No product, test, Contract, checker, configuration, dependency, lockfile, OpenSpec, Task, or other construction-record edit is authorized.

External authority: none. No network, dependency installation, real backend invocation, stateful probe, Serena memory/onboarding, or Superpowers workflow is authorized.

## Acceptance

- Persisted Definition Brick Project/ID/revision/kind/UID/digest provenance and canonical digest are enforced for create, revise, and historical compile.
- Equal-content/different-identity, changed-content, persisted-digest drift, and Template revision-digest drift are rejected without revision or Snapshot writes.
- Resolver/validator/port exceptions produce the stable redacted `actor_template.operation_failed` operation result, never `schema_invalid` or `actor_template.validation_failed`, and leave no partial writes.
- Restricted roots reject all non-literal/unclassifiable dynamic `import()` and `require()` forms while permitted literal forms remain accepted.
- Existing deterministic validation reports, ActorTemplate lifecycle behavior, Contracts, ActorHost, Runtime Server, integration, build, typecheck, and boundary checks remain green.
- No Actor, Host, Package, Run, Graph, backend process, or launch behavior is introduced.

## Handoff

Return explicit PASS or FAIL for the exact remediation subject, mapped evidence for each originating finding, coverage limits, tool integrity, and final worktree state. Do not fix findings. Commit only the authorized testing Report with:

```text
test(actor): record actor template remediation retest
```
