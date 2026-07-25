# Current Focus

## Accepted current state

Project State System v0.1 and Runtime Design Knowledge System v0.1 remain
accepted documentation/process layers. Their canonical entries are the
[Project State root](../README.md) and
[Runtime design catalog](../../docs/design/README.md). They add no Runtime
behavior and do not replace source, Contracts, tests, OpenSpec, construction
evidence, or Git.

The active product change is
[`build-project-and-definition-brick-persistence`](../../openspec/changes/build-project-and-definition-brick-persistence/).
Its accepted Contract-first surface includes:

- root-exported Project and Definition Brick application Contracts at
  implementation subject `7d3eca4`;
- the single shared Definition Brick digest implementation at subject
  `f4ed012`;
- the root-exported Definition Brick Body normalizer at subject `2d8eaaf`,
  independently accepted by
  [testing](../../docs/construction/records/project-persistence/reports/PP-contracts-002-acceptance-definition-brick-normalization.testing.md)
  and
  [Early Review](../../docs/construction/records/project-persistence/reports/PP-contracts-002-review-definition-brick-normalization.reviewing.md).

These accepted Contract boundaries do not by themselves establish Project
persistence, Server composition, or Actor resolver integration.

The Runtime Server Project application/in-memory boundary is accepted at
implementation subject `0b0d0bf`. Its independent
[focused testing](../../docs/construction/records/project-persistence/reports/PP-application-remediation-acceptance-001-project-brick-integrity.testing.md)
and
[focused re-review](../../docs/construction/records/project-persistence/reports/PP-application-remediation-review-001-project-brick-integrity.reviewing.md)
closed both prior integrity findings with no remaining actionable finding or
blocking evidence gap.

## Current condition

- OpenSpec tasks `2.1` through `2.4` and accepted application tasks `3.1`
  through `3.5` are checked.
- The Runtime Server
  [Project Module](../apps/runtime-server/modules/project/README.md) owns the
  accepted application boundary, deterministic in-memory evidence, canonical
  Body authoring/integrity, and exact-revision coherence.
- The Project boundary has no production persistence, SQLite, restart
  recovery, Server composition, external adapter, or Actor resolver wiring.
- Root/Runtime Server routing and the system map include the accepted Project
  application boundary.
- SQLite, schema/migrations, restart recovery, production repositories,
  external authoring adapters, Actor resolver wiring, Server composition,
  execution, Package workflow, Run, and Graph remain deferred.

## Next entry point

The SQLite persistence boundary is frozen in
[`PP-sqlite-001`](../../docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md),
but no implementation Worker is authorized. The current execution environment
is Node `v24.14.1`, below the selected `>=24.15 <25` compatibility floor.

The smallest unblock is to install or select an actual Node `>=24.15 <25`
runtime, then confirm `node --version`, pnpm `11.10.0`, a clean worktree, and
the existing pinned `@types/node 24.13.3` surface before issuing
`IMPLEMENTATION_AUTHORIZED`. Do not request nonexistent
`@types/node@24.15.0`; the selected adapter does not use the untyped
`DatabaseSync.limits` surface.

## Reconciliation posture

The Project card and its root/parent/system-map routes are accepted current
views and must not be deleted or recreated.

The Orchestrator owns the compatibility unblock, persistence authorization,
later evidence acceptance, and every root/meta reconciliation.
Future Coders may update only authorized Project implementation/evidence
claims; Testers report mismatches without editing and Reviewers verify changed
claims against exact subjects.
