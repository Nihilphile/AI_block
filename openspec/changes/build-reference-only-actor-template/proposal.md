## Why

The runtime has proven its Host/backend execution path, but it still lacks the Actor construction boundary that turns reusable typed Bricks into a reproducible frozen Actor configuration. A reference-only ActorTemplate slice is the smallest next step that can establish identity, revision, validation, and compilation semantics without pulling Graph, file auto-registration, or Actor runtime orchestration into the module prematurely.

## What Changes

- Add strict v1 schemas and domain values for reusable Definition Brick revisions, exact Brick references, ActorTemplate specifications/revisions, validation reports, and immutable ActorConfigSnapshot artifacts.
- Add an ActorTemplate application boundary for validate, create, revise, read, list, history, archive, and internal snapshot compilation operations.
- Require ActorTemplate manifests to reference exact already-registered Brick revisions: ordered System Prompt and Initial Prompt lists, plus exactly one Backend, Toolset, and Runtime Config Brick.
- Add layered authoritative validation, deterministic issue ordering, optimistic revision concurrency, Project-scoped human-readable ID checks, and stable error semantics.
- Compile a validated Template revision into a self-contained snapshot that maps to existing ActorLaunchSpec and InvocationSpec responsibilities without starting an ActorHost or backend session, while retaining frozen `model_id` as a first-class snapshot field for a later Host-contract integration change.
- Explicitly defer public Brick authoring commands, local-file auto-registration, Actor creation/runtime lifecycle, Package-as-Brick migration, Actor-to-Actor delegation, and Graph.

## Capabilities

### New Capabilities

- `actor-template-construction`: Define reference-only ActorTemplate authoring, immutable revisions, validation, exact Definition Brick resolution, and ActorConfigSnapshot compilation.

### Modified Capabilities

None.

## Impact

- `packages/runtime-contracts`: new schemas and public value types for Definition Brick and ActorTemplate construction; the existing Package contract remains unchanged.
- `apps/runtime-server/src/modules/actor`: new domain/application module with inward-facing repository, resolver, validator-registry, workspace, and unit-of-work ports.
- Tests and boundary verification: contract tests, pure compiler tests, application-service state/validation tests, and dependency-boundary checks.
- No changes to ActorHost process behavior, ClaudeCodeAdapter, Host Gateway, Run Engine, Package routing, Graph, HTTP/SSE/CLI integration, or SQLite schema are required by this change. Consequently this change compiles but does not yet launch model-selecting snapshots through ActorLaunchSpec v1.
