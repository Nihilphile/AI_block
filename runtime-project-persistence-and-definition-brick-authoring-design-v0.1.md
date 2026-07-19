# Runtime Project Persistence and Definition Brick Authoring Design v0.1

> Status: product design draft
>
> Scope: Server-owned Project persistence, typed Project resource namespaces, Definition Brick authoring and revision lifecycle, ActorTemplate/Snapshot persistence integration, and recovery semantics.
>
> This is a product and runtime-boundary design document. It is not an OpenSpec change, construction plan, implementation Task, file ownership grant, or authorization to modify code.

## 1. Purpose

The reference-only ActorTemplate module already defines strict Definition Brick and ActorTemplate Contracts, immutable Template revisions, exact Brick references, validation, and ActorConfigSnapshot compilation behind inward-facing ports.

The next product-design problem is how authoritative data enters and survives in the Runtime:

```text
Client source
  -> structured Definition Brick candidate
  -> Server validation and registration
  -> immutable persisted Brick revision
  -> exact-ref resolution
  -> persisted ActorTemplate revision
  -> self-contained ActorConfigSnapshot
```

This document defines the intended product semantics for that path. It deliberately stops before implementation sequencing, HTTP endpoint design, final CLI parsing, Actor creation, Host launch, Package routing, Run, or Graph.

## 2. Relationship to existing design

The following documents remain authoritative for the wider Runtime:

- `runtime-module-concept-v0.2.md`
- `runtime-object-module-v0.3.md`
- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`
- `runtime-actor-template-and-brick-design-v0.1.md`
- `docs/construction/phase-1-architecture-invariants.md`

Where this document conflicts with the earlier statement that all named resources share one Project-wide human-readable namespace, this document supersedes that statement:

> A human-readable resource ID is unique within `Project + resource type`, not across every named resource type in the Project.

The Project remains the top-level ownership, policy, isolation, and lifecycle boundary. Typed namespaces change name resolution, not Project ownership.

## 3. Separation from construction planning

This document defines:

- product-visible lifecycle and identity semantics;
- module ownership and dependency direction;
- persistence invariants;
- required atomicity and recovery outcomes;
- intentional non-goals and open questions.

This document does not define:

- an OpenSpec change or task list;
- construction phases, Worker roles, leases, or commits;
- implementation file paths or package layout;
- a SQLite library, migration framework, SQL DDL, connection pool, WAL, or busy-timeout configuration;
- exact HTTP routes, status codes, or final CLI argument parsing;
- test command selection or acceptance ownership.

Those decisions belong to a later, separately authorized construction proposal derived from this design.

## 4. Runtime topology and authority

The Runtime Server is the only authoritative writer of persisted Project and Actor-construction state.

```text
CLI / UI / main controller
        |
        | structured Server command
        v
Runtime Server
├── Project Module
│   ├── Project Registry
│   └── workspace-root policy
├── Actor Module
│   ├── Definition Brick authoring
│   ├── ActorTemplate
│   └── ActorConfigSnapshot
└── Persistence Infrastructure
    └── Server-owned SQLite
```

The CLI is a stateless Client. It must not open the Runtime database, assign authoritative UIDs or revisions, or write registered Brick files directly into Server state.

ActorHost does not register Bricks, persist ActorTemplates, or compile Snapshots.

## 5. One Server-owned physical database

The MVP uses one physical SQLite database owned by the Runtime Server. Projects are logically isolated by authoritative `project_id` ownership on every Project-scoped record.

```text
Server data directory
└── runtime.sqlite
    ├── Project A state
    ├── Project B state
    └── Project C state
```

This choice follows from the Project model:

- one Server may manage multiple Projects;
- multiple Projects may be active concurrently;
- one Project may bind multiple workspace roots;
- a Project is not necessarily one repository or filesystem directory;
- Runtime state must not be silently placed inside a user code repository.

“Project-local persistence” therefore means logical ownership and query isolation, not one database file inside each Project workspace.

The exact Server data-directory convention and database filename remain configuration decisions. Clients must not derive or depend on them.

## 6. Module-owned state in a shared database

A shared physical database does not create shared domain ownership. Tables and repository interfaces remain module-owned.

```text
Project Module
├── Project metadata
└── Project workspace-root bindings

Actor Module
├── Definition Brick aggregates and revisions
├── ActorTemplate aggregates and revisions
└── ActorConfigSnapshots

Future modules
├── Actor runtime state
├── Package / Delivery
├── Run / Invocation
└── Graph definitions and instances
```

Runtime Contracts owns schemas and inert values only. It owns no database records or migrations.

Infrastructure adapters may depend inward on module ports. Domain and application code must not import SQLite, migrations, filesystem source handling, HTTP, or CLI implementations.

## 7. Typed Project resource namespaces

Each named resource type has its own human-readable namespace within a Project.

```text
Project
├── Definition Brick namespace
│   └── unique(project_id, brick_id)
├── ActorTemplate namespace
│   └── unique(project_id, template_id)
├── Actor namespace
│   └── unique(project_id, actor_id)
└── Graph namespace
    └── unique(project_id, graph_id)
```

The same human-readable text may be used by different resource types:

```text
brick coder
actor-template coder
actor coder
graph coder
```

These references are unambiguous because commands, Contracts, logs, and relationships always carry a resource type or a typed UID.

### 7.1 Definition Brick kind is not a namespace dimension

All Definition Brick kinds share one Definition Brick namespace:

```text
sys_prompt
prompt
backend
toolset
runtime_config
```

Within one Project, a `sys_prompt` Brick and a `backend` Brick cannot both use the same `brick_id`. A Brick kind is an immutable aggregate property and a validation expectation, not an additional identity path.

### 7.2 Server UIDs remain globally unique

Human-readable IDs are ergonomic Project-scoped names. Persisted entities and revisions also carry Server-generated typed UIDs that are globally unique regardless of Project or resource type.

Logs and internal relationships should carry the typed UID and resource type even when displaying the human-readable ID.

### 7.3 No universal namespace table is required

The product model does not require one polymorphic `project_resources` authority table. Each owning repository can enforce its own `(project_id, resource_id)` uniqueness.

If the product later needs cross-type Project search, it should use a read model or database view. A search requirement must not transfer lifecycle ownership into a generic resource table.

## 8. Project persistence prerequisite

Definition Brick registration requires an authoritative Project to exist. The Project Module therefore supplies at least these facts to Server application flows:

```text
ProjectRecord
├── project_id                 Server-generated identity
├── lifecycle status
├── created_at
└── workspace-root bindings
```

A workspace-root binding conceptually contains:

```text
WorkspaceRootBinding
├── project_id
├── root_id                    human-readable within the Project
├── authoritative absolute path
└── lifecycle/policy metadata
```

Project selection remains Client context only. It does not activate the Project Runtime, start Hosts, or mutate ActorPool state.

Full Project CLI, runtime activation, desired-state reconciliation, workspace-root update semantics, and Project deletion are outside this document. A later construction change may bootstrap Projects through configuration or a minimal Project API, but it must not let Actor persistence invent implicit Projects.

## 9. Registered Definition Brick model

A registered Definition Brick is a stable aggregate plus immutable revisions.

```text
DefinitionBrick
├── brick_uid                  stable aggregate UID
├── project_id
├── brick_id                   stable human-readable ID
├── brick_kind                 immutable
├── current_revision
├── lifecycle_status           active | archived
└── revisions[]
    └── DefinitionBrickRevision
        ├── revision_uid       unique revision UID
        ├── revision           positive Server-assigned integer
        ├── schema_version
        ├── body               one strict typed Body
        ├── content_digest
        └── created_at
```

The aggregate identity, revision identity, content identity, and human-readable name are distinct:

```text
brick_uid       = which evolving Definition Brick
revision_uid    = which immutable persisted revision entity
brick_id        = Project-local human name
content_digest  = which canonical kind/schema/body content
```

Equal content digests do not merge aggregate or revision identity. Two explicit revisions may have equal canonical content while retaining distinct revision numbers and revision UIDs.

Physical payload deduplication may be introduced later as a transparent storage optimization. It must not change domain identity, provenance, Project isolation, or observable revision history.

## 10. Server-owned Head and caller-owned candidate Body

The caller may propose:

```text
brick_id
brick_kind on create
typed Body content
optional non-authoritative description or labels
```

The Server determines:

```text
project_id from authenticated/selected context
brick_uid
revision_uid
revision number
accepted immutable brick_kind
schema_version
canonical Body
content_digest
created_at
authoritative provenance
lifecycle state
```

A caller cannot upload or forge a complete registered Head.

The canonical Definition Brick digest is derived from Brick kind, schema version, and canonical Body. It excludes:

- Project ID;
- human-readable Brick ID;
- aggregate and revision UIDs;
- revision number;
- timestamps;
- description or labels;
- source filename and local path.

## 11. Source files are one-time authoring inputs

A local file is not authoritative Runtime state.

```text
local source file
  -> Client reads and safely decodes
  -> Client constructs a structured candidate
  -> Server independently materializes and validates
  -> Server canonicalizes and persists a revision
```

Changing, moving, or deleting the source file later never mutates a registered Brick revision.

The Actor Module receives decoded structured commands. It does not receive local filesystem paths, YAML parser objects, HTTP uploads, or CLI argv.

YAML/JSON syntax handling, duplicate-key rejection, custom-tag rejection, alias bounds, raw Markdown wrapping, and source directives belong to Client/import adapters. Server-side Contract validation remains authoritative even if the Client has already validated locally.

Source filenames and absolute paths are excluded from canonical content and identity. Whether a safe, non-authoritative source label is retained for audit or display remains an open question.

## 12. Definition Brick authoring lifecycle

The v0.1 lifecycle is:

```text
missing
  | create
  v
active @ revision 1
  | revise(base_revision = 1)
  v
active @ revision 2..N
  | archive(base_revision = N)
  v
archived @ revision N
```

### 12.1 Validate

Candidate validation is side-effect free. It may check:

- Project existence and ownership;
- human-readable ID syntax;
- create/revise command shape;
- strict Body schema and unknown fields;
- Body-kind consistency;
- canonicalization and digest material;
- contextual authoring conflicts visible at validation time.

Validation does not reserve an ID, assign a UID or revision, or guarantee that a later concurrent create/revise will still succeed.

Intrinsic Brick authoring validation must not require the current machine to provide the referenced Backend adapter or Tool provider. Environment-specific Backend, Toolset, compatibility, and workspace checks remain authoritative during ActorTemplate validation and Snapshot compilation.

### 12.2 Create

Create is strict:

- the Project must exist;
- `(project_id, brick_id)` must be unused in the Definition Brick namespace;
- the Body must validate for the requested immutable kind;
- the Server creates a new aggregate UID and revision UID;
- the first revision is `1`;
- aggregate and revision persistence are atomic;
- create never overwrites, revises, restores, or upserts implicitly.

### 12.3 Revise

Revise is explicit and optimistic-concurrency-safe:

- the aggregate must exist and be active;
- `base_revision` must equal the current revision;
- the requested Body must use the aggregate's existing immutable kind;
- the Server assigns `current_revision + 1` and a fresh revision UID;
- previous revisions remain immutable and readable;
- an equal content digest is allowed and does not collapse the new revision identity;
- a failed revise creates no partial revision or current-revision update.

### 12.4 Archive

Archive prevents new authoring use while retaining identity and history:

- archiving does not delete or mutate revisions;
- new revisions are forbidden after archive;
- the Brick ID is never released for reuse;
- hard delete and unarchive are absent from v0.1;
- repeating archive may return the existing archived state without creating a new revision;
- the first state transition uses optimistic concurrency against the current revision.

### 12.5 Read, list, and history

The application model supports:

```text
get current Brick
get exact Brick revision
list Brick summaries in a Project
list immutable revision history
include or exclude archived aggregates in list views
```

Read projections may expose current aggregate lifecycle status alongside immutable revision content. Archive status is not rewritten into historical revision digests.

## 13. Archived Brick resolution

Archive is an authoring lifecycle rule, not historical erasure.

The factual resolver must be able to distinguish:

```text
not found or inaccessible
found and active
found and archived
```

Conceptually:

```text
ResolvedDefinitionBrick
├── exact immutable revision
└── aggregate_status: active | archived
```

Policy belongs to the caller:

| Use | Active revision | Archived revision |
|---|---:|---:|
| Create/revise ActorTemplate | allowed | rejected |
| Validate a new authoring candidate | allowed | deterministic issue |
| Compile an already persisted historical Template revision | allowed | allowed |
| Read exact Brick history | allowed | allowed |

This prevents two failure modes:

- treating archived content as available for new composition;
- breaking reproducibility of a Template that validly captured the exact reference before archive.

A resolver must not hide lifecycle facts behind an ambiguous `undefined`, nor should callers bypass Project ownership or access checks to obtain archived content.

## 14. Conceptual application interface

The Actor Module owns Definition Brick authoring semantics behind decoded structured commands.

Conceptual operations are:

```text
validateDefinitionBrickCandidate(command)
createDefinitionBrick(command)
reviseDefinitionBrick(command)
getDefinitionBrick(project_id, brick_id, revision?)
listDefinitionBricks(project_id, filters?)
getDefinitionBrickHistory(project_id, brick_id)
archiveDefinitionBrick(project_id, brick_id, base_revision)
resolveExactDefinitionBrick(project_id, exact_ref)
```

Conceptual mutating command material is:

```text
CreateDefinitionBrick
├── project_id from Server context
├── requested_brick_id
├── brick_kind
└── body

ReviseDefinitionBrick
├── project_id from Server context
├── brick_id
├── base_revision
└── body
```

Exact public Contract names and result envelopes are not frozen here. They must preserve the established separation between:

- deterministic candidate validation findings;
- not-found/inaccessible outcomes;
- ID and optimistic-concurrency conflicts;
- archived lifecycle conflicts;
- redacted unexpected operation failures.

Raw SQLite, parser, filesystem, validator, or adapter exceptions must not cross the Server boundary.

## 15. CLI relationship

The established object-first grammar remains compatible with typed namespaces:

```text
brick <id> create
brick <id> revise
brick <id> show
brick <id> history
brick <id> archive
brick list

actor-template <id> create
actor-template <id> revise
actor-template <id> show
actor-template <id> history
actor-template <id> archive
actor-template list
```

Whenever an ID appears after a typed object noun, that noun determines the namespace.

Final file flags, manifest format, local validation UX, output formatting, Project selection syntax, and HTTP mapping remain later Client/API design. The CLI must still send a structured candidate rather than granting Actor Module access to a local path.

Automatic registration of missing Brick files during ActorTemplate create/revise is explicitly excluded from the first authoring slice. Initial authoring uses explicit Brick create/revise operations.

## 16. Logical persistence records

The product requires the equivalent of these logical records, without freezing physical SQL DDL:

```text
schema_migrations

projects
project_workspace_roots

definition_bricks
definition_brick_revisions

actor_templates
actor_template_revisions
actor_config_snapshots
```

Required invariants include:

- every Project-scoped record belongs to exactly one existing Project;
- Definition Brick human IDs are unique per Project within the Brick resource type;
- ActorTemplate human IDs are independently unique per Project within the Template resource type;
- aggregate UIDs and revision UIDs are globally unique;
- Brick kind cannot change across revisions;
- revision numbers are positive, monotonic, and unique within an aggregate;
- canonical Body and digest survive Server restart without depending on source files;
- archived aggregates and immutable revisions are retained;
- an ActorTemplate revision retains authored exact refs plus resolved revision UIDs and digests;
- ActorConfigSnapshot retains self-contained resolved content and provenance;
- secrets and resolved credentials are not persisted in Definition Brick Bodies or Snapshots.

Repositories may store complete canonical Contract documents, normalized columns, or both. Physical normalization is an adapter decision as long as the above invariants and safe query behavior remain observable.

## 17. Transaction and concurrency semantics

All authoritative writes occur through Server-owned Unit of Work boundaries.

### 17.1 Brick create

The following succeed or fail together:

```text
verify Project
check/reserve typed Brick ID
assign aggregate and revision identities
persist aggregate
persist revision 1
publish successful result
```

### 17.2 Brick revise

The revision insert and current-revision compare-and-swap are one atomic operation. Two concurrent revisions with the same `base_revision` cannot both become the next revision.

### 17.3 Brick archive

Archive state transition is atomic and cannot delete history. Concurrent revise/archive operations must serialize into one accepted state transition and one conflict/retry outcome, never a partial hybrid.

### 17.4 ActorTemplate authoring against Brick archive

Creating or revising a Template and checking that all referenced Bricks are active must share an authoritative transaction boundary sufficient to avoid a new Template silently committing against a Brick archived earlier in the serialization order.

Both serialization orders are valid:

- Template commits while the Brick is active, then Brick archives; the persisted Template remains historically valid.
- Brick archives first, then new Template authoring rejects that exact ref.

### 17.5 Historical compilation

Immutable persisted Template and Brick revisions are revalidated against stored UIDs and digests before Snapshot persistence. Archive status does not invalidate a previously accepted exact reference.

## 18. Persistence recovery semantics

Server restart must not alter resource identity, revision ordering, digest, archive state, or exact-ref resolution.

The minimum product-level recovery story is:

```text
register Project
  -> create all required Definition Bricks
  -> close and reopen persistence
  -> resolve the same exact revisions
  -> create ActorTemplate revision 1
  -> close and reopen persistence
  -> compile a self-contained Snapshot
  -> revise a Brick
  -> old Template still resolves its old exact revision
  -> archive that Brick
  -> new Template authoring rejects the archived Brick
  -> historical Template compilation remains possible
```

Recovery failure must be surfaced as an operation-level fault. The Server must not silently create a replacement Project, renumber revisions, reimport source files, or treat corrupted canonical content as a valid new revision.

## 19. Security and isolation

- Every module entry point enforces Project ownership from authoritative Server context.
- A caller cannot select another Project by forging `project_id` inside a source manifest.
- Cross-Project Brick resolution is inaccessible and must not disclose whether the target exists.
- Absolute local source paths are not canonical Brick content and are not sent into Actor Module commands.
- RuntimeConfig workspace paths remain Project-root-relative semantic material; final absolute resolution is controlled by Project workspace policy.
- Backend and Toolset Bodies contain references/configuration but not resolved credentials or secret values.
- Validation and operation results expose stable safe details, never raw SQL, filesystem paths, stack traces, credentials, or adapter internals.

## 20. Explicit non-goals

This design does not include:

- an implementation or migration plan;
- exact SQLite tables, indexes, pragmas, or library selection;
- Project Runtime activation/deactivation;
- final Project or Brick CLI syntax and output;
- HTTP route and authentication design;
- automatic file-to-Brick registration from ActorTemplate manifests;
- source-file watching or live synchronization;
- hard delete, unarchive, garbage collection, or cross-Project Brick sharing;
- domain-visible digest deduplication;
- mutable Actor configuration;
- Actor creation, ActorPool, Host bootstrap, backend launch, or session behavior;
- Package-as-Brick migration;
- Run Engine, delegation, Graph, or GraphRun grants;
- backup, export/import, replication, or database encryption policy.

## 21. Open questions

The following questions do not block this product boundary from being used as the basis for a later proposal:

1. Does a Project expose a globally unique human-readable alias in addition to its Server-generated `project_id`?
2. What default Server data directory and database filename are used on each supported platform?
3. Which safe non-authoritative source metadata, if any, is retained for audit or display?
4. How does the CLI map raw Markdown into `sys_prompt` versus structured `prompt` Bodies without making Brick kind ambiguous?
5. What API later updates Project workspace-root bindings, and does that policy need its own revision identity for reproducible recompilation?
6. What future transaction coordinates optional Brick auto-registration with ActorTemplate create/revise?
7. What export/backup format preserves Project identity, immutable revisions, and cross-record provenance?

## 22. Confirmed decisions

1. The Runtime Server is the sole authoritative writer of persisted Project and Actor-construction state.
2. The MVP uses one Server-owned physical SQLite database for multiple logically isolated Projects.
3. Project is a logical workspace and may bind multiple filesystem roots; Runtime persistence does not live implicitly inside a Project repository.
4. State remains module-owned even when modules share one physical database.
5. Human-readable IDs are unique within `Project + resource type`.
6. Different resource types may use the same human-readable ID in one Project.
7. All Definition Brick kinds share one Brick namespace; Brick kind is immutable after create.
8. Server-generated typed UIDs remain globally unique.
9. No universal Project resource-namespace authority table is required for the typed namespace model.
10. Definition Brick is a stable aggregate with immutable positive revisions.
11. A successful explicit revise always creates a fresh revision identity; equal content digest does not collapse provenance.
12. Source files are one-time Client inputs and never become authoritative registered Bricks.
13. The Server generates and owns Head identity, Project ownership, revisions, digest, timestamps, and authoritative provenance.
14. Create is strict and never upserts or revises implicitly.
15. Revise uses optimistic concurrency and never mutates historical revisions.
16. Archive prevents new revisions and new authoring references, never releases the Brick ID, and preserves exact history.
17. Historical Template compilation may resolve an archived Brick revision that was accepted before archive.
18. Definition Brick authoring performs intrinsic Body validation; environment-specific Backend/Tool/workspace compatibility remains part of Template/Snapshot validation.
19. Automatic file registration during Template authoring is deferred; the first authoring path registers Bricks explicitly.
20. CLI and Server APIs operate on structured candidates; Actor Module does not parse paths, YAML, HTTP, or argv.
21. ActorTemplate and Snapshot persistence use the existing Actor Module semantics and retain exact resolved provenance.
22. This document does not authorize construction; a later OpenSpec proposal must define implementation scope and acceptance separately.
