# PP-application-remediation-acceptance-001 Project Brick Integrity Focused Retest

- owner: Runtime Server Project Module
- follows: PP-application-remediation-001
- affected modules: Runtime Server Project Module; Runtime Contracts consumer
- workflow: W3 independent focused retest
- base reason: the remediation closes two acceptance-blocking findings in a new state owner and must receive independent integrated evidence
- implementation/product subject: `0b0d0bfd3139c9a9344cf9233da2578725b55608`
- orchestration baseline: task-record commit (self)

## Objective

Independently verify that the immutable remediation subject closes both original
Project findings without changing accepted Contract, transaction, archive,
history, dependency, or deferred-scope behavior.

## Scope and authority

- read scope:
  - subject `0b0d0bfd3139c9a9344cf9233da2578725b55608`
  - implementation baseline `90c6149e925dd2f9c5cc510550c291e5675707cf`
  - changed Project source/test/card and the original testing/review findings
  - accepted Runtime Contracts normalizer evidence and directly relevant
    Project application tests/source
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-application-remediation-acceptance-001-project-brick-integrity.testing.md`
- delegated discretion: choose bounded no-product-write substantiation needed
  to distinguish closure, bypass, regression, or evidence gap
- tools/external actions: deterministic local read/test/type/build/boundary/Git
  inspection only; no install, network, service, database, destructive,
  product-write, Project State edit, OpenSpec edit, or Git-history action
- delegation: none
- authority mode: task
- output mode: file

## Frozen decisions and escalation

- Treat `0b0d0bf` as immutable and do not fix a finding.
- Disposition both original findings separately:
  1. create/revise return and persist canonical Bodies, including nested text,
     and reads reject a non-canonical stored Body even when its digest matches
     canonical material;
  2. exact-revision reads classify an in-range miss and a returned
     beyond-current revision as integrity errors while preserving ordinary
     future absence.
- Verify the correction consumes only the accepted root Contracts normalizer
  and does not duplicate normalization.
- Exercise nearby Project application regression and integrated
  Contract/Server/build/boundary evidence proportionate to the W3 subject.
- Verify the candidate Project card matches the remediation and still says
  independent acceptance is pending.
- Preserve and do not stage the user's pre-existing Runbook, Project State
  policy/root/authority/design, and Project State OpenSpec edits.
- Tester reports mismatch without editing source, tests, card, Task, or prior
  evidence.

## References

- `docs/construction/records/project-persistence/reports/PP-application-acceptance-001-project-brick-application.testing.md`
- `docs/construction/records/project-persistence/reports/PP-application-review-001-project-brick-application.reviewing.md`
- `docs/construction/records/project-persistence/tasks/PP-application-remediation-001-project-brick-integrity.md`
- `docs/construction/records/project-persistence/reports/PP-contracts-002-acceptance-definition-brick-normalization.testing.md`

References are audit pointers only.

## Acceptance

1. Confirm exact implementation subject, baseline, orchestration HEAD, allowed
   record-only intervening range, protected dirty paths, and unchanged product
   subject.
2. Run fresh focused Project tests, Runtime Server types/full suite, Runtime
   Contracts compatibility tests, workspace build, boundary checks, and
   diff/import/ownership checks.
3. Demonstrate closure rather than bypass for both findings and classify any
   nearby regression or evidence limit.
4. Return PASS/FAIL, finding dispositions, decisive evidence, coverage limits,
   residual risk, and repository integrity.

## Handoff

Write only the declared delta-only testing Report and commit it as:
`test(server): retest project brick integrity`.
Return the report commit and verdict, then stop. Do not remediate, review,
reconcile Project State root/meta, or schedule persistence.
