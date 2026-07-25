---
module: Runtime Server Actor Module
implementation_state: reference-only
work_state: stable
source_roots:
  - apps/runtime-server/src/modules/actor/
test_roots:
  - apps/runtime-server/test/modules/actor/
---

# Runtime Server Actor Module

## Intent

The Actor Module is the Server-side semantic construction owner for typed Brick definitions and references, ActorTemplate, immutable ActorConfigSnapshot, Actor, ActorPool membership/availability, ActorTrace, and Actor backend-session references. It is intended to compile Template to Snapshot, build ActorLaunchSpec, and compose accepted Package bodies plus Run context into one InvocationSpec. ActorHost does not parse or assemble ActorTemplate.

## Implemented today

The accepted implementation is a reference-only ActorTemplate/ActorConfigSnapshot construction core behind ports. It resolves and validates exact Definition Bricks, canonicalizes values and digests, creates/revises/reads/lists/historizes/archives immutable Template revisions, and compiles and persists self-contained Snapshots with ordered prompt provenance and backend configuration. The Snapshot preserves `model_id`, but this module does not create a runtime Actor or launch a Host.

The application uses injected Project namespace, resolver, validator, workspace, clock, identity, repository, and Unit-of-Work ports. The current repository/UoW implementations are test-only in-memory adapters; no production persistence adapter is part of this boundary.

## Boundary and dependencies

The module depends on Runtime Contracts and its local compiler, validation, value, and port types. It does not depend on HTTP, WebSocket, Host Gateway implementation, ActorHost process details, SQLite, Package routing, Run, or Graph. Its current boundary stops before Actor creation, ActorPool behavior, ActorTrace/session persistence, LaunchSpec construction, Invocation composition, Package input, backend-session integration, and Graph authority.

Those absent capabilities are deferred construction scope, not current blockers. Any future change that crosses into Host launch, Package/Run context, or persistence must load the neighboring card and relevant Contract/evidence.

## Current condition

The reference-only result is accepted and the three remediation findings for persisted provenance, port exception mapping, and dynamic module-loading boundary bypass are closed. The module is stable at the current construction boundary. The next Direct Actor owner decision remains open; this card does not choose between concrete Project-local persistence/authoring and Actor creation followed by Host launch.

## Read next

- [Root state route](../../../../../project_state/README.md), [authority](../../../../../project_state/_meta/authority.md), and [system map](../../../../../project_state/_meta/system-map.md)
- [Actor source](../../../../../apps/runtime-server/src/modules/actor/) and [Actor tests](../../../../../apps/runtime-server/test/modules/actor/)
- [Runtime Contracts card](../../../../../project_state/packages/runtime-contracts/README.md)
- [Current Runtime invariants](../../../../../docs/design/current/runtime-invariants.md) for confirmed ownership and construction constraints
- Future design inputs, not current implementation: [Project persistence and Brick authoring](../../../../../docs/design/future/project-persistence-and-brick-authoring.md) and [Actor/Host lifecycle and recovery](../../../../../docs/design/future/actor-host-lifecycle-and-recovery.md)
- [Reference-only ActorTemplate closeout](../../../../../docs/construction/records/actor-template/reference-only-actor-template-closeout.md) for accepted evidence
- [OpenSpec ActorTemplate change](../../../../../openspec/changes/build-reference-only-actor-template/)

## Evidence

- Source: [`apps/runtime-server/src/modules/actor/`](../../../../../apps/runtime-server/src/modules/actor/)
- Tests: [`apps/runtime-server/test/modules/actor/`](../../../../../apps/runtime-server/test/modules/actor/)
- Accepted evidence: [reference-only ActorTemplate closeout](../../../../../docs/construction/records/actor-template/reference-only-actor-template-closeout.md)
- Contract evidence: [ActorTemplate contracts](../../../../../packages/runtime-contracts/src/actor-template/)
