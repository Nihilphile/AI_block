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
- The Project boundary has a committed self-verified SQLite persistence
  candidate at `2cf9b84`; independent testing and Early Review are pending.
  Server composition, external adapters, Actor resolver wiring, and automated
  recovery remain absent.
- Root/Runtime Server routing and the system map include the accepted Project
  application boundary.
- Acceptance of SQLite persistence, external authoring adapters, Actor resolver
  wiring, Server composition, automated recovery, execution, Package workflow,
  Run, and Graph remain deferred.

## Next entry point

The immutable SQLite candidate is `2cf9b84`, implemented under
[`PP-sqlite-001`](../../docs/construction/records/project-persistence/tasks/PP-sqlite-001-versioned-project-persistence.md)
with Node `v24.18.0`, pnpm `11.10.0`, and the retained
`@types/node 24.13.3`. It is not accepted yet.

The next entry points are the committed independent
[`testing Task`](../../docs/construction/records/project-persistence/tasks/PP-sqlite-acceptance-001-versioned-project-persistence.md)
and subsequent
[`Early Review Task`](../../docs/construction/records/project-persistence/tasks/PP-sqlite-review-001-versioned-project-persistence.md).
No Actor resolver Worker is authorized until both evidence gates accept the
exact candidate.

## Reconciliation posture

The Project card and its root/parent/system-map routes are accepted current
views and must not be deleted or recreated.

The Orchestrator owns persistence evidence acceptance, any remediation
authorization, the later Actor-integration decision, and every root/meta
reconciliation.
Future Coders may update only authorized Project implementation/evidence
claims; Testers report mismatches without editing and Reviewers verify changed
claims against exact subjects.
