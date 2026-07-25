## ADDED Requirements

### Requirement: Explicit durable Project bootstrap
The Runtime Server SHALL create a Project only through an explicit application
operation, SHALL assign its authoritative `ProjectId` and creation facts, and
SHALL durably read that Project after process restart. Project creation SHALL
NOT activate a Project Runtime, start an ActorHost, or implicitly create another
resource.

#### Scenario: Project is created and reopened
- **WHEN** an authorized caller explicitly creates a Project and the Server later reopens the same persistence store
- **THEN** the Server returns the same authoritative Project identity and persisted creation facts without activating Runtime execution

#### Scenario: Unknown Project is rejected
- **WHEN** a Definition Brick operation names a Project that does not exist
- **THEN** the Server rejects the operation with the stable `project_not_found` error and persists no Brick state

### Requirement: Project-local typed Definition Brick namespace
The Server SHALL scope a Definition Brick aggregate by
`ProjectId + Definition Brick resource type + brick_id`. All Definition Brick
kinds SHALL share that one Brick namespace within a Project, while unrelated
resource types MAY reuse the same human-readable identifier. A Brick's kind
SHALL be immutable after creation.

#### Scenario: Same Brick ID is isolated by Project
- **WHEN** two Projects each create a Definition Brick with the same `brick_id`
- **THEN** the Server persists and resolves two independent aggregates under their respective Projects

#### Scenario: Kind cannot change
- **WHEN** a revise request attempts to change the kind of an existing Definition Brick
- **THEN** the Server rejects the request and leaves the aggregate and all revisions unchanged

### Requirement: Strict Definition Brick creation
The Server SHALL create a Definition Brick only when its Project exists and its
Project-local Brick ID is unused. Creation SHALL validate and canonicalize the
typed Body, generate aggregate and revision identities, assign revision `1`,
compute the canonical content digest, and atomically persist the aggregate and
immutable first revision. Creation SHALL never upsert or revise an existing
Brick.

#### Scenario: Brick is created at revision one
- **WHEN** a valid candidate Body and unused Project-local `brick_id` are submitted
- **THEN** the Server returns an active aggregate with immutable revision `1`, Server-owned identities, canonical Body, digest, and creation time

#### Scenario: Duplicate create does not mutate
- **WHEN** creation is requested for an existing Project-local `brick_id`
- **THEN** the Server returns `definition_brick_already_exists` and does not create a revision or alter the existing aggregate

### Requirement: Immutable revision with optimistic concurrency
The Server SHALL revise an active Definition Brick only when the supplied
`base_revision` equals the aggregate's current revision. A successful revise
SHALL append one new immutable revision with the next positive revision number
and a fresh revision identity, even when its canonical content digest equals a
prior revision. Competing stale revisions SHALL NOT both succeed.

#### Scenario: Revision advances atomically
- **WHEN** a valid revise request supplies the current `base_revision`
- **THEN** the Server appends exactly one new immutable revision and atomically advances the aggregate's current revision

#### Scenario: Stale revision loses
- **WHEN** a revise request supplies a `base_revision` that is no longer current
- **THEN** the Server returns `definition_brick_revision_conflict` and persists no part of the losing revision

#### Scenario: Equal content preserves provenance
- **WHEN** a valid explicit revise has canonical content equal to an earlier revision
- **THEN** the Server still creates a distinct revision number and revision identity while retaining the equal content digest

### Requirement: Archive preserves exact history
The Server SHALL archive a Definition Brick without deleting its aggregate,
releasing its Project-local ID, or altering historical revisions. Archive SHALL
prevent new revisions and new authoring references, while exact historical
revision resolution SHALL remain available for previously accepted
ActorTemplate/Snapshot provenance. Repeating archive SHALL be idempotent.

#### Scenario: Archived history remains resolvable
- **WHEN** a Brick is archived and a consumer resolves one of its exact persisted revisions
- **THEN** the Server returns the unchanged historical revision

#### Scenario: Archived Brick cannot be revised
- **WHEN** a caller attempts to revise an archived Brick
- **THEN** the Server returns `definition_brick_archived` and leaves history unchanged

#### Scenario: Brick ID is not released
- **WHEN** a caller archives a Brick and then attempts to create another Brick with the same Project-local `brick_id`
- **THEN** the Server returns `definition_brick_already_exists`

### Requirement: Authoring and exact-resolution read surface
The application boundary SHALL provide aggregate read, deterministic list,
immutable revision history, exact revision read, create, revise, and archive
operations. It SHALL expose an adapter compatible with the existing Actor
`DefinitionBrickResolverPort` so Actor validation and Snapshot compilation can
consume exact persisted revisions without changing resolver semantics.

#### Scenario: History returns immutable revisions in deterministic order
- **WHEN** a caller reads the history of an existing Definition Brick
- **THEN** the Server returns every persisted revision in ascending revision order without rewriting historical values

#### Scenario: Actor resolver consumes persisted revision
- **WHEN** the Actor Module resolves an exact reference to an existing persisted revision
- **THEN** the adapter returns a Contract-valid `DefinitionBrickRevision` with matching Project, ID, revision, kind, Body, digest, and timestamp

#### Scenario: Missing exact revision preserves resolver behavior
- **WHEN** the Actor Module resolves an exact reference that does not exist
- **THEN** the adapter reports absence according to the existing resolver port and does not substitute the latest revision

### Requirement: Canonical content and integrity enforcement
Definition Brick authoring SHALL use the accepted canonical Body normalization
and digest rules already consumed by ActorTemplate validation. Durable reads
and exact resolution SHALL verify the stored Contract shape and digest before
returning a revision. Invalid or corrupted authoritative records SHALL fail
closed and SHALL NOT be reported as an ordinary missing record.

#### Scenario: Canonical digest is stable
- **WHEN** semantically equivalent accepted input normalizes to the same canonical Body
- **THEN** authoring computes the same content digest under the accepted digest algorithm

#### Scenario: Corrupted revision fails closed
- **WHEN** a stored revision's Body, digest, identity binding, or Contract shape is inconsistent
- **THEN** the Server returns `definition_brick_integrity_error`, exposes no corrupted revision to Actor, and performs no repair by inference

### Requirement: Atomic module-owned persistence
Project creation and each Definition Brick create, revise, and archive operation
SHALL execute within a module-owned transaction boundary. A failed operation
SHALL leave no partial aggregate, revision, namespace, or current-revision
state. The persistence adapter SHALL serialize conflicting writes sufficiently
to enforce strict create and optimistic revision concurrency.

#### Scenario: Failed create rolls back
- **WHEN** persistence fails after reserving a Brick identity but before the first revision and aggregate are durably complete
- **THEN** the transaction rolls back all effects and a later valid create can use the identity

#### Scenario: Concurrent revision conflict is atomic
- **WHEN** two writers revise the same aggregate from the same `base_revision`
- **THEN** at most one transaction commits and the other returns `definition_brick_revision_conflict`

### Requirement: Versioned durable store and restart behavior
The first implementation SHALL use one explicitly configured,
Server-authoritative SQLite database with a versioned schema bootstrap. Startup
SHALL validate the schema version and required integrity settings before
serving persistence operations. Reopening a compatible store SHALL preserve
Projects, aggregates, revisions, archive state, and exact resolution. An
unsupported or failed migration SHALL fail closed without partially serving the
store.

#### Scenario: Compatible store survives restart
- **WHEN** the Server closes and reopens a compatible database after committed Project and Brick operations
- **THEN** all committed records and exact historical revision behavior remain unchanged

#### Scenario: Unsupported schema fails closed
- **WHEN** startup encounters a database schema version it cannot safely read or migrate
- **THEN** persistence initialization returns `unsupported_schema_version` and does not serve partial Project or Brick state

### Requirement: Typed shared application contracts and stable errors
Cross-module Project and Definition Brick application commands, results, and
errors SHALL be represented by strict Runtime Contract schemas exported from
the package root. The boundary SHALL provide stable error categories for
missing Project, duplicate Brick, missing Brick/revision, stale revision,
archived Brick, invalid candidate, integrity failure, unsupported schema, and
persistence failure. This change SHALL NOT define HTTP routes, CLI grammar, or
file-import formats.

#### Scenario: Invalid application input is rejected at the boundary
- **WHEN** a Project or Definition Brick command fails strict Runtime Contract validation
- **THEN** the application boundary returns the stable invalid-candidate error and invokes no persistence mutation

#### Scenario: Consumer imports from Contract root
- **WHEN** Runtime Server modules or tests consume the new Project/Brick application schemas
- **THEN** they import them from `@ai-block/runtime-contracts` without deep-importing Contract implementation files
