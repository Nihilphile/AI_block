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

## Current condition

- OpenSpec tasks `2.1` through `2.4` and candidate implementation tasks `3.1`
  through `3.5` are checked.
- The Runtime Server
  [Project Module candidate](../apps/runtime-server/modules/project/README.md)
  exists at implementation subject `a1fb21d`, with bounded application source,
  deterministic in-memory evidence, and no SQLite or production composition.
- Independent
  [testing](../../docs/construction/records/project-persistence/reports/PP-application-acceptance-001-project-brick-application.testing.md)
  and
  [Early Review](../../docs/construction/records/project-persistence/reports/PP-application-review-001-project-brick-application.reviewing.md)
  did not accept that subject. They found two blocking defects:
  1. create/revise returned and stored the submitted Body rather than the
     canonical Body;
  2. exact-revision reads did not distinguish missing claimed history from
     ordinary future absence or reject a returned revision beyond the
     aggregate's current revision.
- The first defect's required public normalizer is now accepted in Runtime
  Contracts. Project remediation itself has not been implemented or
  re-accepted.
- The Project card remains a candidate current view. Root/Runtime Server
  routing and the system map intentionally remain unreconciled until the
  Project module passes remediation, independent testing, and review.
- SQLite, schema/migrations, restart recovery, production repositories,
  external authoring adapters, Actor resolver wiring, Server composition,
  execution, Package workflow, Run, and Graph remain deferred.

## Next entry point

Resume
[`PP-application-remediation-001`](../../docs/construction/records/project-persistence/tasks/PP-application-remediation-001-project-brick-integrity.md)
under the current Runbook:

1. reload the Project Coder lease because the lease and Project State policies
   changed;
2. use the existing Project card as the target state context and Runtime
   Contracts as the declared neighbor;
3. perform a reply-only delta preflight confirming that accepted subject
   `2d8eaaf` removes the canonicalization blocker;
4. after `READY`, authorize one bounded implementation commit for the two
   findings and their focused tests/card reconciliation;
5. run independent focused re-test and re-review against the exact remediation
   subject before accepting the module.

Do not start SQLite or another product slice before this remediation closes.

## Reconciliation posture

This Project card was created under the preceding Runbook lifecycle and already
exists, so do not delete or recreate it. Treat it as the candidate card for the
existing-module remediation flow.

The Coder may update only its authorized Project implementation/evidence
claims. Testers report mismatches without editing; Reviewers verify the
candidate card. The Orchestrator owns Intent, stable ownership and exclusions,
accepted/deferred condition, root/parent routing, the system map, this focus
file, and final reconciliation.
