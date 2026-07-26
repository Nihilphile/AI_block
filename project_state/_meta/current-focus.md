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

The complete Project persistence and exact Actor resolver boundary is accepted
at final remediation subject `021c005`. Independent
[focused testing](../../docs/construction/records/project-persistence/reports/PP-actor-resolver-remediation-acceptance-001-result-validation.testing.md)
and
[focused re-review](../../docs/construction/records/project-persistence/reports/PP-actor-resolver-remediation-review-001-result-validation.reviewing.md)
closed the final malformed-result/redaction finding with no remaining
actionable finding or blocking evidence gap. The durable
[closeout](../../docs/construction/records/project-persistence/project-definition-brick-persistence-closeout.md)
records the full subject/evidence chain.

## Current condition

- OpenSpec implementation and closeout tasks are `30/30` complete. The change
  remains deliberately unarchived.
- The Runtime Server
  [Project Module](../apps/runtime-server/modules/project/README.md) owns the
  accepted application boundary, deterministic in-memory evidence, canonical
  Body authoring/integrity, exact-revision coherence, Project-owned SQLite
  persistence, and the provider for the existing Actor exact resolver port.
- The Project boundary owns accepted file-backed SQLite persistence at
  remediation subject `38fe697`. Independent focused
  [testing](../../docs/construction/records/project-persistence/reports/PP-sqlite-remediation-acceptance-001-integrity-and-path-boundary.testing.md)
  and
  [re-review](../../docs/construction/records/project-persistence/reports/PP-sqlite-remediation-review-001-integrity-and-path-boundary.reviewing.md)
  close both P1 findings with no remaining actionable finding or blocking
  evidence gap.
- Root/Runtime Server routing and the system map include the accepted Project
  application, uncomposed Project-owned SQLite boundary, and available
  Project-to-Actor resolver provider.
- Server-root resolver/database wiring, external authoring adapters,
  ActorTemplate/Snapshot production persistence, Actor creation, Host launch,
  Server composition, automated recovery, execution, Package workflow, Run,
  and Graph remain deferred.

## Next entry point

The persistence-first OpenSpec change is implementation-complete and accepted.
Archiving it is a separate administrative action and is not authorized by this
closeout.

The next product boundary is undecided. A likely Direct Actor continuation is
immutable Actor creation from an accepted ActorConfigSnapshot followed by a
separately controlled Host-launch boundary. That requires a new design/OpenSpec
decision; no product Worker or lease is active.

## Reconciliation posture

The Project card and its root/parent/system-map routes are accepted current
views and must not be deleted or recreated.

The Orchestrator owns the next product-boundary decision, OpenSpec archive
decision, and every root/meta reconciliation.
Future Coders may update only authorized Project implementation/evidence
claims; Testers report mismatches without editing and Reviewers verify changed
claims against exact subjects.
