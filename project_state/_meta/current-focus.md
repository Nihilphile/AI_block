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
- The Project boundary has a self-verified SQLite remediation candidate at
  `38fe697`. It closes the two P1 integrity/path-boundary findings in local
  evidence; focused independent retest and re-review are pending. Server
  composition, external adapters, Actor resolver wiring, and automated
  recovery remain absent.
- Root/Runtime Server routing and the system map include the accepted Project
  application boundary.
- Acceptance of SQLite persistence, external authoring adapters, Actor resolver
  wiring, Server composition, automated recovery, execution, Package workflow,
  Run, and Graph remain deferred.

## Next entry point

The defective reviewed SQLite candidate was `2cf9b84`, implemented under
[`PP-sqlite-001`](../../docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md)
with Node `v24.18.0`, pnpm `11.10.0`, and the retained
`@types/node 24.13.3`. Independent testing passed at `df5ef46`; Early Review
required remediation at `d0d763f`. The bounded correction is `38fe697`.

The next entry points are the
[`focused retest Task`](../../docs/construction/records/project-persistence/tasks/PP-sqlite-remediation-acceptance-001-integrity-and-path-boundary.md)
and subsequent
[`focused re-review Task`](../../docs/construction/records/project-persistence/tasks/PP-sqlite-remediation-review-001-integrity-and-path-boundary.md)
against `38fe697`. No Actor resolver Worker is authorized until both findings
close and both evidence gates accept that exact subject.

## Reconciliation posture

The Project card and its root/parent/system-map routes are accepted current
views and must not be deleted or recreated.

The Orchestrator owns persistence evidence acceptance, any remediation
authorization, the later Actor-integration decision, and every root/meta
reconciliation.
Future Coders may update only authorized Project implementation/evidence
claims; Testers report mismatches without editing and Reviewers verify changed
claims against exact subjects.
