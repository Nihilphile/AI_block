# PP-sqlite-acceptance-001 Versioned Project SQLite Persistence Acceptance

- owner: Runtime Server Project Module
- follows: PP-sqlite-001
- affected modules: Runtime Server Project Module; root Node/toolchain boundary; workspace checker
- workflow: W3 independent acceptance + Compatibility + Recovery + Security Review
- base reason: the first production persistence substrate changes the supported Node floor and must prove durable, concurrent, fail-closed behavior before Actor consumes it
- implementation/product subject: `2cf9b84a87b72199ba41c610864364e93cf550c4`
- implementation baseline: `d83b90c0386e433fcc47adeabc79215c212074f1`
- orchestration baseline: task-record commit (self)

## Objective

Independently test the immutable SQLite persistence subject against its frozen
Project behavior, compatibility, transaction, recovery, integrity, security,
scope, and candidate-card acceptance conditions.

## Scope and authority

- read scope:
  - exact implementation subject and baseline;
  - implementation Task, committed diff, Project SQLite source/test surface,
    root engine constraint, checker, and candidate Project card;
  - active OpenSpec proposal/design/spec/tasks and accepted Project application
    behavior needed to judge the persistence adapter;
  - local Node/package/type/runtime facts and existing repository verification
    commands.
- write scope:
  - `docs/construction/records/project-persistence/reports/PP-sqlite-acceptance-001-versioned-project-persistence.testing.md`
- delegated discretion: choose additional bounded no-product-write test cases
  needed to distinguish a product defect, environment defect, acceptance
  ambiguity, subject mismatch, or evidence gap.
- tools/external actions: deterministic local read/test/type/build/boundary/Git
  inspection and explicitly prefixed disposable OS-temp SQLite databases only;
  no install, network service, production database, source/config/dependency/
  lockfile/Project State/OpenSpec edit, destructive downgrade, or unrelated
  Git-history action.
- delegation: none
- authority mode: task
- output mode: file

## Frozen decisions and escalation

- Treat `2cf9b84` as immutable. Do not fix, format, or stage product content.
- Confirm the actual runtime remains Node `>=24.15 <25`, pnpm is `11.10.0`,
  the exact pinned `@types/node` remains `24.13.3`, and no SQLite dependency or
  lockfile change entered the subject.
- Independently cover explicit path rejection; clean bootstrap and required
  settings; prepared Body values; rollback; close/reopen durability; archived
  exact history; Project isolation; same-process stale-base contention;
  external lock timeout; required database constraints; bootstrap/migration
  failure; unsupported/altered schema; and Body/digest/binding/integer
  corruption.
- Verify stable Project application error behavior and ensure corrupt or
  unsupported stores fail closed rather than returning ordinary absence or
  partial service.
- Check that the synchronous adapter remains Project-owned and uncomposed:
  Runtime Contracts, Actor, Server composition, HTTP/CLI, Package, Run, Graph,
  backup/export, and recovery automation remain outside the subject.
- Report any candidate Project-card mismatch without editing it.
- Preserve all unrelated work. A dirty or materially changed subject returns
  `SUBJECT_MISMATCH` or `BLOCKED`, not cleanup or remediation.

## References

- `docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md`
- `openspec/changes/build-project-and-definition-brick-persistence/design.md`
- `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
- `project_state/apps/runtime-server/modules/project/README.md`

References are audit pointers only. The dispatch manifest selects normative
inputs.

## Acceptance

1. Confirm exact implementation subject, baseline, current orchestration HEAD,
   record-only intervening range, clean start, and unchanged product subject.
2. Map every frozen behavior above to fresh evidence, including negative,
   contention, restart, schema, and corruption behavior.
3. Run focused SQLite/Project evidence followed by relevant Runtime Server,
   Runtime Contracts, ActorHost/integration, types, build, workspace-boundary,
   full repository, diff, import, and scope checks.
4. Verify the candidate Project card states only the implemented persistence
   boundary and still marks independent acceptance pending.
5. Return PASS only if no product defect, blocking evidence gap, subject
   mismatch, or state-card mismatch remains.

## Handoff

Write only the declared delta-only testing Report and commit it as:
`test(server): accept project sqlite persistence`.
Return the report commit, exact verdict, decisive evidence, coverage limits,
residual risk, and final repository state, then stop. Do not remediate, review,
authorize Actor integration, or reconcile root/meta Project State.
