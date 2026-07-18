# AT-acceptance-001 Reference-only ActorTemplate Acceptance

- owner: Runtime Server Actor Module
- work: testing
- workflow: W3 independent integrated testing
- implementation subject: `9dab4fd18dcec1fe70933f9f495696d07bb0ad4b`
- change: `build-reference-only-actor-template`

## Objective

Independently verify the completed reference-only ActorTemplate construction boundary against every OpenSpec requirement without modifying the implementation subject.

## Authority

Read scope:

- the implementation subject and its committed ActorTemplate/Definition Brick contracts, Actor Module source/tests, and boundary checker;
- the OpenSpec proposal, design, specification, and task list;
- existing Package, Host, ActorHost, ClaudeCodeAdapter, and integration tests needed to prove non-regression.

Write scope:

```text
docs/construction/records/actor-template/reports/AT-acceptance-001-reference-only-actor-template.testing.md
```

No product, test, contract, configuration, dependency, lockfile, OpenSpec, or other construction-record edit is authorized.

External authority: none. No network, dependency installation, real backend invocation, or stateful probe is authorized.

## Acceptance

- Exact immutable Definition Brick references preserve Project ownership, authored identity, resolved UID, revision, kind, and digest semantics.
- Strict ActorTemplate specifications, Prompt ordering, empty Prompt lists, kind/cardinality checks, deterministic aggregate issues, and safe failure details behave as specified.
- Backend `model_id` remains first-class and separate from opaque adapter config through validation and Snapshot compilation.
- Template create/revise/archive/read/list/history behavior is deterministic, immutable, optimistic-concurrency-safe, atomic, and rollback-safe.
- Validation has no persistence side effects; Template operations create no Actor, Host, Run, Invocation, Package, Delivery, backend session, or Graph authority.
- Snapshot compilation preserves exact provenance, creates distinct Snapshot entities, permits equal configuration digests for equivalent execution content, and does not claim ActorLaunchSpec v1 launchability.
- Runtime Contracts and Actor Module import boundaries fail closed for forbidden dependencies, including dynamic-import/require bypasses.
- Existing Package, Host, ActorHost, ClaudeCodeAdapter, Runtime Server, and integration behavior remains green.
- Fresh focused and repository-wide verification passes from a clean start, or every failure is classified without remediation.

## Handoff

Return explicit PASS or FAIL for the exact implementation subject, mapped evidence, coverage limits, residual risk, Serena/tool integrity, and final worktree state. Commit only the authorized testing Report with:

```text
test(actor): record actor template acceptance
```

Do not fix findings or mark OpenSpec tasks complete.
