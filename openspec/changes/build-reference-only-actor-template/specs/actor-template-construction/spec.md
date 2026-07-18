## ADDED Requirements

### Requirement: Versioned Definition Brick references
The system SHALL represent reusable System Prompt, Initial Prompt, Backend, Toolset, and Runtime Config inputs as immutable Definition Brick revisions with a stable Project-scoped human-readable ID, a Server-generated revision identity, and a canonical content digest.

#### Scenario: Resolve an exact Definition Brick revision
- **WHEN** an ActorTemplate specification references an existing Definition Brick by human-readable ID and positive revision
- **THEN** the system resolves it to an immutable revision UID and digest without following a floating current revision

#### Scenario: Reject a missing Definition Brick revision
- **WHEN** an ActorTemplate specification references an ID or revision that does not exist in the selected Project
- **THEN** authoritative validation reports a deterministic `ref_not_found` issue and persists nothing

### Requirement: Strict ActorTemplate specification
The system SHALL accept ActorTemplate specifications using schema version `1.0.0`, `snake_case` fields, no unknown fields, and no implicit component defaults.

#### Scenario: Accept an explicit empty Prompt composition
- **WHEN** a specification includes `system_prompt.bricks: []` and `initial_prompt.bricks: []` plus valid Backend, Toolset, and Runtime Config references
- **THEN** the system treats both Prompt compositions as intentionally empty rather than missing

#### Scenario: Reject an omitted required component
- **WHEN** a specification omits either Prompt list or one of Backend, Toolset, or Runtime Config
- **THEN** authoritative validation reports `missing_required_component`

### Requirement: Typed component composition
An ActorTemplate revision SHALL contain ordered zero-or-more System Prompt Brick references, ordered zero-or-more Initial Prompt Brick references, exactly one Backend Brick reference, exactly one Toolset Brick reference, and exactly one Runtime Config Brick reference.

#### Scenario: Preserve Prompt order
- **WHEN** a candidate lists multiple System Prompt or Initial Prompt Brick revisions
- **THEN** validation and compilation preserve the authored order exactly

#### Scenario: Reject a kind mismatch
- **WHEN** a component slot resolves to a Definition Brick of the wrong kind
- **THEN** validation reports `brick_kind_mismatch` with a safe manifest path and expected and actual kinds

#### Scenario: Reject duplicate Prompt references
- **WHEN** the same exact Brick revision occurs more than once in one ordered Prompt list
- **THEN** validation reports `duplicate_brick_ref`

### Requirement: Definition Brick Body validation
The system SHALL validate Definition Brick Bodies by kind before they can satisfy an ActorTemplate reference.

#### Scenario: Validate Prompt Bodies
- **WHEN** a System Prompt text is empty, a Prompt text node is empty, or a composite Prompt has no parts
- **THEN** the corresponding Definition Brick revision is invalid for ActorTemplate composition

#### Scenario: Validate Backend Body
- **WHEN** a Backend Body lacks a registered adapter ID, a non-empty model ID, or adapter-valid structured configuration
- **THEN** ActorTemplate validation reports a Backend validation or compatibility issue

#### Scenario: Preserve model selection independently of adapter config
- **WHEN** a valid Backend Brick revision is resolved and compiled
- **THEN** the snapshot retains `model_id` as a required first-class field separate from opaque adapter `config`
- **AND** compilation does not silently rename, drop, or inject `model_id` into that adapter-specific configuration object

#### Scenario: Validate Toolset Body
- **WHEN** a Toolset Body contains duplicate provider IDs or an invalid provider configuration
- **THEN** ActorTemplate validation reports a Toolset validation issue

#### Scenario: Validate Runtime Config workspace
- **WHEN** Runtime Config resolves to an unknown Project workspace root or a working directory escaping that root
- **THEN** validation reports `workspace_root_not_found` or `workspace_path_escape` and does not expose unrestricted absolute paths

### Requirement: Authoritative deterministic validation
The Actor Module SHALL perform authoritative schema, identity, ownership, kind, cardinality, adapter, provider, compatibility, workspace, canonicalization, and digest validation independently of Client-side validation.

#### Scenario: Return multiple ordered issues
- **WHEN** a candidate has multiple independent validation failures
- **THEN** the operation returns `actor_template.validation_failed` with issues ordered by manifest path and issue code

#### Scenario: Validate without side effects
- **WHEN** a Client validates a candidate specification
- **THEN** the system performs the same authoritative checks as create or revise while reserving no ID and persisting no Template, revision, or snapshot

### Requirement: Project-scoped Template identity
The system SHALL create ActorTemplates under a human-readable ID that is unique in the selected Project resource namespace and SHALL never interpret create as overwrite, revise, or upsert.

#### Scenario: Create revision one
- **WHEN** a valid candidate uses an available Project-scoped ID
- **THEN** the system atomically creates the ActorTemplate and immutable revision 1

#### Scenario: Reject an occupied ID
- **WHEN** create requests a human-readable ID already occupied in the Project namespace
- **THEN** the system returns `project.resource_id_conflict` and leaves the existing resource unchanged

### Requirement: Immutable Template revisions
The system SHALL preserve every ActorTemplate revision as immutable and SHALL create a new revision only through an explicit revise operation using optimistic concurrency.

#### Scenario: Revise from the current base
- **WHEN** revise supplies the current base revision and a valid candidate specification
- **THEN** the system atomically creates the next Server-assigned immutable revision and retains all earlier revisions

#### Scenario: Reject a stale base revision
- **WHEN** revise supplies a base revision that is no longer current
- **THEN** the system returns `actor_template.base_revision_conflict` without creating another revision

#### Scenario: Prevent revision of an archived Template
- **WHEN** revise targets an archived ActorTemplate
- **THEN** the system returns `actor_template.archived`

### Requirement: Self-contained ActorConfigSnapshot compilation
The Actor Module SHALL compile an exact ActorTemplate revision into an immutable self-contained ActorConfigSnapshot containing resolved static execution content, exact source Brick revision references and digests, source Template provenance, and a configuration digest independent of display metadata.

#### Scenario: Compile launch content
- **WHEN** a valid Template revision is compiled
- **THEN** ordered System Prompts, Backend adapter ID, model ID, opaque Backend configuration, Tool providers, and resolved working directory are available to a later LaunchSpecBuilder without re-reading current Template or Brick revisions

#### Scenario: Stop before unsupported Host model transport
- **WHEN** ActorLaunchSpec v1 or the selected Backend Adapter cannot represent the snapshot's first-class model ID
- **THEN** this capability still preserves the model ID in the compiled snapshot and does not claim that the snapshot is launchable

#### Scenario: Retain initialization Prompt content
- **WHEN** a Template revision contains Initial Prompt Brick references
- **THEN** the snapshot retains their resolved ordered content for InvocationComposer and does not place that content in ActorLaunchSpec

#### Scenario: Equivalent execution content
- **WHEN** two Template revisions differ only in display metadata
- **THEN** their Template revision digests differ while their Actor configuration digests may be equal

### Requirement: Session initialization Prompt semantics
InvocationComposer SHALL inject configured Initial Prompt content only into a real Package-driven Invocation that creates a backend session.

#### Scenario: First session creation
- **WHEN** the first accepted input Package creates a backend session for an Actor whose snapshot has Initial Prompt content
- **THEN** InvocationComposer combines the ordered Initial Prompt content and accepted Package Bodies into one root Prompt

#### Scenario: Resume existing session
- **WHEN** a later Invocation resumes the existing backend session
- **THEN** InvocationComposer does not repeat the Initial Prompt content

#### Scenario: Initialization Prompt does not trigger execution
- **WHEN** an Actor or ActorHost is created or initialized without an input Package
- **THEN** no Invocation or backend session is created from Initial Prompt content alone

### Requirement: ActorTemplate module isolation
The ActorTemplate domain and application layer SHALL depend only on inward-facing Project namespace, Definition Brick resolver, validator registry, workspace resolver, repository, and unit-of-work ports.

#### Scenario: Keep infrastructure outside the module core
- **WHEN** ActorTemplate operations parse, validate, persist, or compile domain state
- **THEN** the domain/compiler code has no dependency on YAML, HTTP, WebSocket, SQLite, filesystem implementations, Claude Code process code, Package routing, Run Engine, or Graph

### Requirement: Reference-only Direct Actor scope
This capability SHALL NOT auto-register local files, migrate the existing Package contract, create or run Actors, start ActorHosts, create backend sessions, delegate to other Actors, or execute Graphs.

#### Scenario: Create a Template without runtime side effects
- **WHEN** ActorTemplate create or revise succeeds
- **THEN** no Actor, Host process, Run, Invocation, Package, Delivery, or backend session is created
