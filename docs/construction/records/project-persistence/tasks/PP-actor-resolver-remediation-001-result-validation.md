# PP-actor-resolver-remediation-001 Resolver Result Validation

- owner: Runtime Server Project Module provider
- follows: PP-actor-resolver-review-001
- affected modules: Runtime Server Project Module; existing Actor consumer behavior
- workflow: W3 bounded remediation + focused retest/re-review
- base reason: one P1 fail-open/redaction defect blocks acceptance of the final producer/consumer boundary
- implementation/product subject: `2da0f00e5ffa4afbf0d209d062ddc2c5d311af19`
- orchestration baseline: task-record commit (self)

## Objective

Close the single accepted review finding by runtime-validating every structural
Project exact-read result and its requested identity binding inside the
adapter's fixed redacted failure boundary.

## Scope and authority

- read scope:
  - exact defective subject, review/acceptance Tasks and Reports, adapter,
    focused test, Project application result/Contract schemas, Project card,
    accepted Actor validation/error behavior, and active OpenSpec design/spec;
  - repository verification and disposable SQLite fixture conventions.
- write scope:
  - `apps/runtime-server/src/modules/project/infrastructure/actor-definition-brick-resolver.ts`
  - `apps/runtime-server/test/modules/project/actor-definition-brick-resolver.test.ts`
  - `project_state/apps/runtime-server/modules/project/README.md`
- delegated discretion:
  - private result-guard/helper organization inside the authorized adapter;
  - focused malformed structural-reader fixture shape inside the authorized
    test.
- tools/external actions: deterministic local source/test/type/build/boundary/
  Git commands and explicitly prefixed disposable OS-temp SQLite databases
  only; no install, network service, production database, destructive action,
  dependency/lockfile/schema/Contract/Actor-source/checker/OpenSpec/root-meta
  write, or unrelated Git-history action.
- delegation: none
- authority mode: task
- output mode: commit

## Frozen decisions and escalation

- Treat `2da0f00` as the immutable defective subject. The structural reader is
  a runtime trust boundary even when its TypeScript type is correct.
- Put both the reader call and every result-processing operation inside one
  redacting boundary. No raw `TypeError`, reader exception, malformed value,
  internal result code, stored value, path, or driver detail may escape.
- A success is valid only when:
  - the outer result is the complete expected success shape;
  - the revision passes the existing strict root-exported Runtime Contract
    schema;
  - its Project ID, Brick ID, kind, and revision equal the exact request.
  Return that validated revision unchanged.
- A not-found result maps to `undefined` only when the outer/error result is
  the complete expected error shape and its stable code is exactly one of:
  `project_not_found`, `definition_brick_not_found`, or
  `definition_brick_revision_not_found`.
- Every malformed/null/ambiguous result, malformed error, mismatched success,
  non-not-found Project error, or thrown exception produces the same static
  Project-local resolver error used by the defective subject. Do not create a
  new public error type or expose a cause/message from the underlying value.
- Add focused cases for at least:
  - `null`;
  - `{ revision: undefined }`;
  - malformed/ambiguous error results;
  - success with mismatched Project ID;
  - success with mismatched Brick ID, kind, or revision;
  - reader throwing an arbitrary raw error.
  Each must assert the exact static resolver failure and never ordinary
  absence. Retain valid success and all three valid not-found absence cases.
- Preserve exact/no-latest/archive/restart/Snapshot/corruption semantics,
  adapter API/export, checker policy, Runtime Contracts, Project application,
  SQLite core/schema, Actor source/card, dependencies, and exclusions.
- Update only the Project card's concrete validation behavior, remediation
  subject/evidence-pending condition, and directly relevant evidence route. Do
  not edit Intent, ownership, exclusions, root/meta, or another card.
- Do not mark OpenSpec task `7.4` complete. The Orchestrator owns closure only
  after focused independent retest and re-review both accept the corrected
  subject.
- Stop with `SCOPE_EXPANSION_REQUIRED` before changing any unlisted path,
  public Contract/port, dependency, checker, schema, state owner, external
  action, or acceptance condition.

## References

- `docs/construction/records/project-persistence/reports/PP-actor-resolver-review-001-persisted-definition-bricks.reviewing.md`
- `docs/construction/records/project-persistence/reports/PP-actor-resolver-acceptance-001-persisted-definition-bricks.testing.md`
- `docs/construction/records/project-persistence/tasks/PP-actor-resolver-001-persisted-definition-bricks.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Confirm exact defective subject, Task baseline, clean start, and unchanged
   Contracts/Actor/SQLite/checker/dependency/lockfile surfaces.
2. Prove every malformed/mismatched/thrown reader case above becomes the exact
   static resolver failure, never absence or a raw error.
3. Prove valid exact success, all three allowed absence cases, no-latest,
   archived/restart/Snapshot provenance, and corruption behavior remain
   unchanged.
4. Run focused resolver tests followed by Runtime Server types/full suite,
   Runtime Contracts and ActorHost/integration regressions, build, types,
   boundaries, diff, subject, exact-scope, and final clean checks.
5. Commit only the three authorized paths as:
   `fix(server): validate persisted resolver results`.
6. Leave the Project card plainly self-verified with focused independent
   retest/re-review pending.

## Handoff

Use `output_mode: commit` with a compact Task/baseline/verification/deviation/
residual-risk receipt. Create no coding Report. Return commit SHA, exact
checks, remaining risk, and unique handoff, then stop. Do not schedule
evidence, edit root/meta/OpenSpec, authorize more work, or close the change.
