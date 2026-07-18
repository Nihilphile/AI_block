# Runtime ActorTemplate and Brick Design v0.1

> Status: discussion decisions captured; manifest and contract details remain draft
>
> Scope: Project workspace semantics, Brick registration, ActorTemplate identity and revisions, frozen Actor construction, ActorTemplate CLI, and the proposed Package-as-Brick unification
>
> Context: this document refines `runtime-module-concept-v0.2.md`, `runtime-object-module-v0.3.md`, `runtime-module-architecture-v0.1.md`, and `runtime-system-architecture-v0.1.md`. It does not replace their Server–Host, Run, or Graph architecture.

## 1. Design outcome

The Actor construction model is:

```text
Brick source/body
  -> Server registration
  -> persisted typed Brick with Server-owned Head
  -> ActorTemplate revision composed from exact Brick references
  -> ActorCompiler
  -> immutable ActorConfigSnapshot
  -> frozen Actor
  -> ActorLaunchSpec
  -> ActorHost
```

The principal decisions are:

1. `Project` is the logical workspace and top-level namespace.
2. Human-readable Project resource IDs are unique within their Project.
3. A Brick is independently persisted and consists of a Server-owned Head plus exactly one typed Body.
4. External callers submit a Brick Body or source plus registration intent; they do not construct an authoritative Brick Head.
5. `ActorTemplate` has a stable ID and immutable revisions.
6. `ActorTemplate create` initially composes only already-registered Bricks.
7. An Actor's execution configuration is frozen at creation. Static configuration changes require a new Actor ID.
8. Package Prompt input is dynamic; System Prompt, optional session-initialization Prompt, backend/model, Toolset, and static config are frozen.
9. Package is proposed as a dynamic, routable Brick rather than a wrapper around another complete Brick.
10. Mutable routing and delivery state remains owned by `Delivery`, not Package identity.

## 2. Project as logical workspace

`Project` is a logical runtime workspace, not necessarily one filesystem directory or one Git repository.

```text
Project
├── resource ID namespace
├── Brick registry
├── ActorTemplate registry
├── ActorPool
├── Package / Delivery / Run / Trace state
├── Project policy
└── allowed workspace roots
    ├── repository-a/
    └── repository-b/
```

A Project may bind one or more local workspace roots. Actor working directories and file capabilities must remain inside roots allowed by Project policy.

Selecting a Project changes Client context only. It does not activate the Project Runtime or start ActorHosts.

### 2.1 Identity model

Every persisted resource has a Server-generated globally unique internal UID. Named Project resources may also have a human-readable ID used by the CLI.

```text
uid: globally unique, Server generated
id:  human-readable, unique within one Project
```

Example:

```text
uid: brick_01J...
id:  coder-role
```

`create` is strict. If a requested human-readable ID already exists in the Project namespace, creation fails; it never overwrites, revises, or upserts implicitly.

High-volume runtime records such as Package and Delivery may use only Server-generated typed IDs, for example `pkg_01J...` and `delivery_01J...`.

## 3. Registered Brick model

A registered Brick has one Head and exactly one typed Body:

```text
RegisteredBrick<TBody>
├── Head       Server-owned identity and registration metadata
└── Body       typed semantic content
```

### 3.1 Brick Head

The Head is authoritative Server data. A caller cannot directly supply or forge it.

Conceptual fields include:

```text
uid
human_readable_id?
project_id
brick_kind
schema_version
revision?
content_digest
created_at
created_by
provenance
```

The Server derives identity, Project ownership, canonical digest, timestamps, and authoritative provenance from authenticated context and validated input.

Revision is kind-dependent. Reusable definition Bricks have immutable revisions; one-shot event Bricks such as Package do not.

### 3.2 Brick Body

The Body contains the typed semantic material. Initial reusable Definition Brick families are:

```text
BrickSysPromptBody
BrickPromptBody
BackendBrickBody
ToolsetBrickBody
RuntimeConfigBrickBody
```

Dynamic model input uses a Prompt Body. The exact naming relationship between `PromptBody`, `BrickPrompt`, and `PackageBrick` is addressed in section 9 because it requires a Runtime Contracts revision.

### 3.3 Brick source is not a registered Brick

A local file is a source artifact or candidate Body, not a complete Brick:

```text
local file
  -> parse and validate
  -> normalize
  -> calculate digest
  -> register
  -> Server generates Head
  -> persist RegisteredBrick
```

Changing the source file later never mutates a registered Brick.

### 3.4 Registration authority

A registration request may propose:

```text
human-readable ID
Brick kind
Body content
non-authoritative description or labels
```

The Server decides and records:

```text
internal UID
Project ownership
accepted Brick kind after schema validation
revision/version identity
canonical content digest
created_at and authoritative creator
accepted provenance
```

### 3.5 Definition Brick and Event Brick lifecycles

Brick families share the Head-plus-Body envelope but do not share one forced version lifecycle:

```text
RegisteredBrick
├── DefinitionBrick
│   ├── BrickSysPrompt
│   ├── BackendBrick
│   ├── ToolsetBrick
│   └── ActorStaticConfigBrick
└── EventBrick
    └── PackageBrick
```

Definition Bricks use a stable Project-scoped human-readable ID plus immutable revisions. Evolution of one intended definition creates a new revision; alternatives intended to coexist use different IDs.

PackageBrick is a one-shot immutable event and has no revision lifecycle. Correction or supersession creates a new PackageBrick with lineage to the earlier Package.

The canonical content digest is calculated from Brick kind, schema version, and canonicalized Body. It excludes human-readable ID, revision number, timestamps, creator, labels, and source filename. Equal digests mean equal canonical content, not equal domain identity.

## 4. Static and dynamic Brick boundary

The frozen Actor configuration includes:

```text
ordered BrickSysPrompt references
ordered session-initialization BrickPrompt references
backend provider and model
Toolset, Skills, MCP servers, and built-in tools
static execution surface and restrictions
working-directory and launch configuration
other static Actor configuration
```

The dynamic runtime state includes:

```text
Package Prompt input
Invocation prompt composition
backend session reference
ActorTrace
Run and lease state
Package and Delivery history
```

The core rule is:

> A dynamic Package Prompt may change what an Actor is asked to do, but it cannot add tools, change static execution restrictions, or grant orchestration authority.

Dynamic Prompt content may enter ordinary model input only. It cannot become System Instruction, add tools, replace the backend/model, or exceed Server-enforced policy.

An optional initialization BrickPrompt is pinned by the Template but injected as ordinary model input only when a backend session is created. It does not run when an Actor or ActorHost is created, and it does not by itself trigger a Run.

## 5. ActorTemplate identity and revisions

`ActorTemplate` is a reusable authoring lineage with a stable ID and immutable revisions.

```text
ActorTemplate: tpl-coder
├── revision 1  immutable
├── revision 2  immutable
└── revision 3  immutable and current
```

Template evolution and Template variants are different:

```text
same intended recipe evolving over time
  -> same Template ID, new revision

alternatives intended to coexist
  -> different Template IDs
```

Examples:

```text
prompt correction:
  tpl-coder@1 -> tpl-coder@2

coexisting model tiers:
  tpl-coder-flash@1
  tpl-coder-pro@1
```

Every successful revision operation must identify its base revision. The Server rejects stale concurrent revisions rather than silently overwriting a newer revision.

An Actor or compilation record always pins an exact Template revision and configuration digest. It never follows a floating `current` revision at runtime.

## 6. Frozen Actor semantics

An Actor's static execution configuration is immutable after Actor creation.

```text
ActorTemplate revision
  -> ActorConfigSnapshot
  -> Actor
```

An existing Actor never repoints to a newer snapshot. Changing System Prompt, session-initialization Prompt, backend/model, Toolset, or static config requires a new Actor ID.

What remains dynamic is runtime state:

```text
idle / reserved / running / waiting / unavailable / retired
backend session reference
ActorTrace
accepted and emitted Package references
Run and Invocation references
Host/process facts
```

`ActorConfigSnapshot` remains an internal immutable compilation artifact owned by the Actor Module. This design does not require it to be a primary user-managed CLI object.

The snapshot is self-contained for execution. Compilation resolves every static Brick revision, validates compatibility, and stores normalized static content plus source references and digests. Starting an existing Actor never re-resolves a Template's current revision or a Brick's current revision. Archiving a source Template or Brick therefore does not prevent an existing Actor from starting, and referenced revisions cannot be hard-deleted while retained by snapshots.

Existing Actors remain pinned when their source Template receives a new revision:

```text
tpl-coder@2 -> actor coder-001
tpl-coder@3 -> actor coder-002
```

### 6.1 Model-tier routing

Backend model is static Actor configuration. One Actor does not switch between Flash and Pro inside a continuing backend session.

```text
simple task  -> coder-flash
complex task -> coder-pro
```

If work must be escalated, `coder-flash` emits a handoff Package containing the goal, completed work, artifact references, unresolved questions, and escalation reason. `coder-pro` consumes that Package in its own session.

### 6.2 Direct Actor MVP and future Graph grants

The Direct Actor MVP does not implement Graph, Actor-to-Actor delegation, or dynamic orchestration grants. A DirectRun may use only its statically installed runtime endpoints and the restricted single-Actor operations required for the end-to-end path, such as Package publication and completion reporting.

GraphInstance binding must not grant authority in the future. When Graph is implemented, a GraphRun will acquire Actor leases, freeze Node-to-Actor bindings, snapshot GraphPolicy, and derive run-scoped orchestration grants. A static Toolset may expose a generic delegation endpoint, but Server grants and validates concrete callable targets per GraphRun. Graph cannot install a tool absent from the Actor snapshot.

Any future RunContext Prompt or Package is advisory input that tells the model its current grant; it is never the security boundary. Direct Actor construction must leave room for such invocation context without implementing it in the MVP.

## 7. ActorTemplate CLI grammar

The general CLI shape is:

```text
ai-block <object-path> <verb> [typed object references] [flags]
```

An ID immediately follows the noun that owns it:

```text
actor-template tpl-coder show
```

The current ActorTemplate verb table is:

| Command | Meaning | Creates revision |
|---|---|---:|
| `actor-template list` | List Templates in the selected Project | no |
| `actor-template <id> create` | Create Template and revision 1 | yes |
| `actor-template <id> show` | Show current or exact revision | no |
| `actor-template <id> validate` | Validate a candidate or persisted revision | no |
| `actor-template <id> revise` | Create a new immutable revision | yes |
| `actor-template <id> history` | Show revision history | no |
| `actor-template <id> archive` | Prevent future use or revision while retaining history | no |

Examples:

```text
actor-template list

actor-template tpl-coder create \
  --file coder.actor-template.yaml

actor-template tpl-coder show --revision 2

actor-template tpl-coder revise \
  --base-revision 2 \
  --file coder-v3.actor-template.yaml

actor-template tpl-coder history
```

`revise` means create a new immutable revision; it never mutates an existing revision.

Component-level commands such as `sys-prompt set`, `backend set`, `toolset set`, and `config set` may be added as revision-producing convenience commands. Their exact signatures are not frozen in this version.

`actor-template build` is not currently a public CLI requirement. Compilation may remain an internal step of Actor creation until a durable user-facing build artifact has a clear use case.

## 8. ActorTemplate create input

The canonical creation command is:

```text
actor-template <template-id> create --file <manifest.yaml>
```

YAML is the primary human-facing format. JSON may be accepted as an equivalent serialization. The CLI parses the file and sends one structured create request to the Server.

The command path owns the Template ID. The manifest does not repeat the ID, avoiding two sources of truth.

### 8.1 MVP reference-only manifest

The MVP manifest references already-registered Bricks only. The following shape is illustrative, not yet a frozen wire schema:

```yaml
schema_version: 1.0.0
kind: actor_template_spec

metadata:
  display_name: Coder Pro
  description: Coder using a Pro backend profile
  labels:
    role: coder
    tier: pro

spec:
  system_prompt:
    bricks:
      - ref:
          id: coder-core
          revision: 3
      - ref:
          id: project-coding-policy
          revision: 1

  initial_prompt:
    bricks: []

  backend:
    ref:
      id: claude-code-deepseek-pro
      revision: 1

  toolset:
    ref:
      id: coder-standard-tools
      revision: 2

  runtime_config:
    ref:
      id: claude-code-default
      revision: 1
```

System Prompt Brick order is significant and must be preserved by the compiler.

`initial_prompt.bricks` is an ordered `0..N` collection of reusable BrickPrompt revisions. An explicit empty list means that no initialization Prompt is configured. The field is not a trigger: on the first real Package-driven Invocation, InvocationComposer combines initialization Prompt Bricks with accepted Package Bodies into one root Prompt and starts the backend with session `create`. Resume Invocations do not repeat the initialization Prompt. A later explicit creation of a replacement backend session injects it again.

Template references must resolve to exact immutable Definition Brick revisions. Floating `latest` or `current` references are not valid in the canonical manifest.

The authoring reference is human-readable:

```yaml
ref:
  id: coder-core
  revision: 3
```

The Server resolves and persists immutable identity:

```yaml
resolvedRef:
  uid: brickrev_01J...
  digest: sha256:...
```

The Template revision retains the authoring reference for provenance and the resolved revision UID plus digest for exact execution and integrity checks.

### 8.2 MVP Body schemas

The first Body schemas deliberately stay small and map to the existing ActorLaunchSpec and InvocationSpec responsibilities. The examples below define domain shape; final TypeBox declarations remain implementation work. One intentional gap remains at the Host wire boundary: `model_id` is first-class frozen Actor configuration, while ActorLaunchSpec v1 and ClaudeCodeAdapter v0.1 do not yet expose model selection. ActorTemplate construction must retain `model_id` without hiding it inside adapter-specific `config`; a later dedicated contract/Adapter change will carry it across the Host boundary.

#### BrickSysPromptBody

```yaml
text: |
  You are a coding worker responsible for implementing bounded tasks.
```

The text must be non-empty. An Actor with no authored System Prompt uses an explicit empty Template list rather than registering an empty Brick. MVP does not support variables, conditional rendering, or runtime substitution inside System Prompt Bricks.

#### BrickPromptBody

The Prompt Body keeps the existing recursive text/composite model:

```yaml
kind: text
text: |
  Inspect the project before beginning the first task.
```

or:

```yaml
kind: composite
parts:
  - kind: text
    text: First prompt part.
  - kind: text
    text: Second prompt part.
```

Every text node is non-empty and every composite has at least one part. A Template expresses no initialization Prompt with `initial_prompt.bricks: []`; it does not register an empty Prompt Brick.

#### BackendBrickBody

```yaml
adapter_id: claude-code
model_id: deepseek-v4-pro
config: {}
```

`adapter_id` selects a registered Backend Adapter. `model_id` is required and frozen in the Actor snapshot. `config` is an adapter-specific structured object validated by the selected Adapter's configuration validator. Credentials and secret values are not stored in the Brick Body; only Server-resolvable secret or environment references may be supported later.

#### ToolsetBrickBody

```yaml
providers:
  - provider_id: ai-block-runtime-control
    config:
      operations:
        - package.publish
        - runtime.complete
```

Toolset is an ordered collection of static tool-provider configurations. Provider IDs must be unique within one Toolset revision. Skills, MCP servers, backend built-ins, and runtime-control endpoints are represented through provider adapters rather than Prompt text.

The Direct Actor MVP requires only the restricted operations needed to publish output and report completion. It does not require `runtime.delegate` or any Graph-oriented provider operation. An explicit empty Toolset may exist as a reusable Brick, although it cannot satisfy an end-to-end Direct Actor Template that requires runtime publication and completion.

#### RuntimeConfigBrickBody

```yaml
workspace:
  root_id: primary
  relative_working_directory: .
```

The MVP Runtime Config resolves a Project-allowed workspace root plus a relative working directory. Absolute Client-provided paths are not portable Template content. Server resolves and validates the final absolute working directory inside the selected Project root before producing a snapshot or LaunchSpec.

Session create/resume policy, Run timeout, Graph grants, current Run identity, and backend session ID are Runtime-owned state and are not fields of RuntimeConfigBrickBody.

### 8.3 Canonicalization and validation

Registration canonicalizes text sources to UTF-8 without BOM and LF line endings while preserving other meaningful whitespace. Structured Bodies use deterministic canonical JSON for digest computation after schema validation. Registration must not silently trim, interpolate, or rewrite semantic content.

ActorTemplate validation requires:

```text
system_prompt.bricks   ordered 0..N exact BrickSysPrompt revisions
initial_prompt.bricks  ordered 0..N exact BrickPrompt revisions
backend                exactly one BackendBrick revision
toolset                exactly one ToolsetBrick revision
runtime_config         exactly one RuntimeConfigBrick revision
```

The manifest must explicitly include both Prompt lists, even when empty. Duplicate exact Brick revisions in one ordered Prompt list are rejected as likely authoring errors.

Validation proceeds in layers:

```text
manifest shape
  -> exact reference resolution
  -> Project ownership and access
  -> expected Brick kind
  -> component cardinality and duplicate checks
  -> adapter-specific Backend config validation
  -> Toolset provider validation
  -> Backend/Toolset compatibility
  -> workspace-root containment
  -> canonical resolved configuration and digest
```

CLI-side validation may reject malformed local input early, but Server validation is authoritative.

### 8.4 Compilation mapping

ActorCompiler resolves a Template revision into a self-contained ActorConfigSnapshot. The current cross-process contracts provide a direct target:

| Template component | Snapshot/contract result |
|---|---|
| ordered SysPrompt Bricks | `ActorLaunchSpec.system_prompts` |
| BackendBrick | snapshot `resolved.backend` with first-class `adapter_id`, `model_id`, and opaque `config`; a later LaunchSpec/Adapter contract revision maps all three across the Host boundary |
| ToolsetBrick | `ActorLaunchSpec.tool_providers` |
| RuntimeConfigBrick workspace | `ActorLaunchSpec.working_directory` |
| Initial Prompt Bricks | stored in ActorConfigSnapshot; composed into `InvocationSpec.prompt` only when `session.mode = create` |

`ActorLaunchSpec` does not carry the initialization Prompt because ActorHost does not perform semantic Prompt composition. InvocationComposer owns that behavior and still requires at least one real input Package before producing an InvocationSpec. ActorLaunchSpec v1 also lacks a first-class model field. ActorTemplate construction therefore stops at a snapshot that preserves `model_id`; it must not silently inject that value into the opaque adapter `config` object. LaunchSpec/Adapter model-selection support is a separate follow-up change.

### 8.5 Create transaction

Conceptual create behavior:

```text
parse structured input
  -> validate manifest schema
  -> verify Project-scoped Template ID uniqueness
  -> resolve every exact Brick reference
  -> enforce Project ownership and access policy
  -> validate Brick kinds and composition compatibility
  -> preserve ordered System Prompt composition
  -> normalize resolved Template specification
  -> calculate configuration digest
  -> atomically persist ActorTemplate and revision 1
```

Any failure creates neither a Template nor a partial revision. `create` never starts an ActorHost or creates a backend session.

### 8.6 Validation result and stable errors

ActorTemplate authoring should report multiple independent deterministic issues in one pass. The public operation returns one stable top-level error and an ordered issue list rather than exposing a different transport error for every manifest field.

```text
code:      actor_template.validation_failed
category:  validation
retryable: false
details:
  issues:
    - code: ref_not_found
      path: spec.backend.ref
      resource_id: backend-missing
      revision: 1
    - code: brick_kind_mismatch
      path: spec.toolset.ref
      expected_kind: toolset
      actual_kind: sys_prompt
```

Issue ordering is deterministic by manifest path and then issue code. Error details may contain IDs, revisions, expected/actual kinds, provider IDs, and safe relative paths. They must not echo Brick Body text, credentials, environment values, Server tokens, or unrestricted absolute paths.

Initial validation issue codes include:

```text
missing_required_component
duplicate_brick_ref
ref_not_found
brick_kind_mismatch
backend_config_invalid
tool_provider_invalid
backend_toolset_incompatible
workspace_root_not_found
workspace_path_escape
unsupported_schema_version
```

Operation-level errors remain separate because they describe identity or lifecycle rather than manifest content:

| Code | Category | Retryable | Meaning |
|---|---|---:|---|
| `project.resource_id_conflict` | conflict | no | requested Project-scoped human-readable ID already exists |
| `actor_template.not_found` | not-found | no | target Template does not exist |
| `actor_template.archived` | conflict | no | operation is forbidden on an archived Template |
| `actor_template.base_revision_conflict` | conflict | no | `revise` was based on a stale revision |
| `actor_template.validation_failed` | validation | no | candidate manifest or resolved composition is invalid |
| `actor_template.compilation_failed` | internal | no | validated persisted input could not be compiled because of an invariant failure |

Infrastructure unavailability uses the existing `unavailable` category and may be retryable. Authorization failures remain distinct from validation and must not reveal inaccessible cross-Project resource contents.

`validate` performs the same authoritative resolution and compatibility checks as `create` or `revise`, but persists nothing. A successful validation does not reserve an ID and does not guarantee that a later create cannot lose a race.

### 8.7 ActorConfigSnapshot shape

ActorConfigSnapshot is an immutable, self-contained internal build artifact. Conceptually:

```yaml
head:
  snapshot_id: actor_config_...
  project_id: project_...
  source_template:
    template_uid: actor_template_...
    human_readable_id: tpl-coder
    revision: 3
    revision_digest: sha256:...
  config_digest: sha256:...
  created_at: ...

source_bricks:
  - slot: sys_prompt
    order: 0
    revision_uid: brickrev_...
    digest: sha256:...
  - slot: backend
    revision_uid: brickrev_...
    digest: sha256:...

resolved:
  system_prompts: []
  initial_prompts: []
  backend:
    adapter_id: claude-code
    model_id: deepseek-v4-pro
    config: {}
  tool_providers: []
  working_directory: ...
```

`config_digest` is computed from canonical resolved execution content, not Template display metadata. Two Template revisions may therefore have different revision digests but the same Actor configuration digest.

Snapshot persistence and Actor creation are coordinated atomically from the caller's perspective. A failed Actor creation must not leave a user-visible half-created Actor. Snapshot reuse by `config_digest` is an internal optimization and does not change Actor identity.

LaunchSpecBuilder later adds Actor identity to the snapshot's resolved launch content. Before an Actor using this snapshot can start, the Host launch contract and selected Backend Adapter must support the snapshot's first-class `model_id`; until then, launch compatibility validation fails rather than dropping or hiding the model selection. InvocationComposer uses `initial_prompts` only for session `create`, combines them with at least one accepted Package Body, and produces the single root Prompt required by InvocationSpec.

Template `create` and `revise` validate and persist Template revisions but do not start Host processes or create backend sessions. The first Actor creation from a Template revision is allowed to compile and persist the internal snapshot without exposing `actor-template build` as a public command.

### 8.8 Wire and authoring conventions

ActorTemplate authoring uses one strict JSON-compatible data model serialized as YAML or JSON.

```text
schema_version: 1.0.0
kind: actor_template_spec
field naming: snake_case
unknown fields: rejected
implicit defaults: none
```

`ActorTemplateSpec` has its own schema version even when its initial value matches the shared Runtime Contracts version. Definition Brick Heads independently record the schema version of their Body kind, allowing Template and Brick schemas to evolve without one global lockstep version.

Human-readable Project resource IDs use lowercase kebab case, contain at most 64 characters, and match:

```text
^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$
```

`@` is not part of an ID and may be reserved for human display of an exact revision such as `coder-core@3`. Canonical structured references remain objects:

```yaml
ref:
  id: coder-core
  revision: 3
```

Revision is a positive Server-assigned integer. The manifest omits Project ID, Template ID, revision, UID, digest, status, and timestamps because these come from command context or Server registration.

The CLI accepts safe YAML 1.2 or JSON, rejects duplicate mapping keys and custom tags, bounds alias expansion, materializes plain JSON values, and then validates the same contract sent to Server. YAML file paths and source directives are Client concerns and are removed or resolved before a canonical domain command reaches Actor Module.

### 8.9 ActorTemplate application interface

The Actor Module receives decoded structured commands rather than YAML text, filesystem paths, HTTP requests, or CLI arguments.

Conceptual application interface:

```text
validateCandidate(command) -> ValidationReport
createTemplate(command) -> ActorTemplateRevisionView
reviseTemplate(command) -> ActorTemplateRevisionView
getTemplate(projectId, templateId, revision?) -> ActorTemplateRevisionView
listTemplates(projectId, filter?) -> ActorTemplateSummary[]
getTemplateHistory(projectId, templateId) -> ActorTemplateRevisionSummary[]
archiveTemplate(projectId, templateId) -> ActorTemplateSummary

compileSnapshot(projectId, templateRef) -> ActorConfigSnapshot
```

Command shapes:

```text
ValidateActorTemplateCandidate
├── project_id
├── requested_template_id
├── operation: create | revise
├── base_revision?       required for revise
└── spec

CreateActorTemplate
├── project_id
├── requested_template_id
└── spec

ReviseActorTemplate
├── project_id
├── template_id
├── base_revision
└── spec
```

`validateCandidate` has no side effects and does not reserve IDs. `createTemplate` performs Project namespace reservation, authoritative validation, and revision-1 persistence in one transaction. `reviseTemplate` uses optimistic concurrency: current revision must equal `base_revision`, and the Server assigns the next revision.

`compileSnapshot` is an internal Actor Module operation used by Actor creation. It is not a Control API or CLI requirement in v0.1.

Required inward-facing ports are:

```text
ProjectNamespacePort
DefinitionBrickResolver
BackendConfigValidatorRegistry
ToolProviderValidatorRegistry
ProjectWorkspaceResolver
ActorTemplateRepository
ActorConfigSnapshotRepository
ActorModuleUnitOfWork
```

The domain/compiler layer does not import YAML, HTTP, SQLite, WebSocket, Claude Code, or filesystem implementations. Backend- and Tool-provider-specific configuration validation is reached through registries/ports; Actor Module does not depend on concrete Adapter process code.

`ActorTemplateRevisionView` exposes safe identity, metadata, authored exact refs, resolved refs/digests, validation status, and revision digest. It does not expose resolved secret values or internal repository records.

## 9. Future file-to-Brick registration

After the reference-only MVP is stable, an ActorTemplate manifest may accept a local Brick source:

```yaml
spec:
  system_prompt:
    bricks:
      - source:
          file: ./prompts/coder-core.md
          registerAs: coder-core
```

The file path is a Client-side input location and is never persisted as the Template's runtime dependency. The intended behavior is:

```text
read file
  -> parse and validate candidate Body
  -> canonicalize and calculate digest
  -> reuse an exact existing Brick when allowed
  -> otherwise register a new Brick with a Server-generated Head
  -> replace source entry with an exact Brick reference
  -> commit Brick registration and Template revision atomically
```

Automatic registration must never implicitly revise or overwrite an existing Brick:

```text
requested ID absent
  -> register new Brick

requested ID present with exact accepted content
  -> reuse exact registration when policy allows

requested ID present with different content
  -> conflict; require explicit Brick revision or a new ID
```

The auto-registration ID-generation rule, deduplication scope, and Brick revision behavior are deferred.

## 10. Package as a dynamic Brick

The proposed unified model is:

```text
RegisteredBrick
├── static configuration Bricks
│   ├── BrickSysPrompt
│   ├── BackendBrick
│   ├── ToolsetBrick
│   └── ActorStaticConfigBrick
└── dynamic PackageBrick
    └── PromptBody
```

External Clients, Actors, and LLM tools do not submit an authoritative Package Head. They submit a Prompt Body, publication intent, and permitted routing intent. Server derives authenticated origin and registers the Package Brick.

Conceptually:

```text
Prompt Body + publication intent
  -> authenticate Client or ActorHost context
  -> validate publication authority
  -> generate Package Brick Head
  -> persist immutable Package Brick
  -> create Delivery records for authorized recipients
```

The Package Brick Head contains immutable identity and semantic provenance, such as:

```text
package UID
Project ID
Brick kind and schema version
content digest
authoritative producer identity
Run / Invocation origin
parent or causation references
creation time
```

Mutable routing information remains separate:

```text
Delivery
├── Package Brick reference
├── recipient
├── route context
├── attempt and idempotency state
├── acknowledgement
└── delivery status
```

This preserves the existing invariant that one immutable Package may have multiple deliveries and that routing state does not mutate Package identity.

### 10.1 Contract compatibility impact

The current Runtime Contracts describe:

```text
Package
├── PackageHead
└── Body: one complete root BrickPrompt
```

The proposed unified shape is:

```text
PackageBrick
├── Server-generated PackageBrickHead
└── PromptBody
```

This removes a potential nested identity envelope. It is a deliberate contract change, not an implementation detail. Before implementation it requires an approved Runtime Contracts change, compatibility mapping, and focused migration tests. Until that change is approved, the existing Phase 1 Package contracts remain authoritative.

## 11. Module ownership

The intended ownership remains:

```text
Project Module
  owns Project namespace and workspace-root policy

Actor Module
  owns static Brick definitions/registration interfaces,
  ActorTemplate, ActorConfigSnapshot, Actor, and ActorTrace

Package Module
  owns Package Brick publication, PackageStore,
  Delivery, lineage, and publication idempotency

ActorHost
  receives ActorLaunchSpec only;
  it never registers static Bricks or compiles ActorTemplate

Server application
  coordinates module transactions and exposes Client APIs
```

If static Brick persistence later becomes large enough to justify a separate Brick Module, that is a future module-boundary decision. It is not required by the current object model.

## 12. Confirmed decisions

1. Project is a logical workspace and top-level ownership boundary.
2. Human-readable resource IDs are unique within a Project; internal UIDs are Server generated.
3. Brick is independently persisted.
4. Brick has a Server-owned Head and exactly one typed Body.
5. A source file supplies Body content; it is not itself a registered Brick.
6. ActorTemplate initially references only already-registered Bricks.
7. Future file input may register missing valid Bricks before creating/revising a Template.
8. Automatic file registration cannot silently overwrite or revise an existing Brick.
9. ActorTemplate has one stable ID and immutable revisions.
10. Coexisting Template variants use different Template IDs.
11. Actor static execution configuration is frozen; changing it requires a new Actor.
12. Package Prompt input is dynamic; System Prompt, optional session-initialization Prompt, backend/model, Toolset, and static config are frozen.
13. Model-tier switching is performed by routing work to a different Actor and handing off by Package.
14. ActorTemplate create uses structured YAML/JSON input.
15. Package is intended to become a dynamic Brick registered by Server from a Prompt Body and authenticated publication context.
16. Package routing and delivery state remains in Delivery.
17. Reusable Definition Bricks use stable IDs plus immutable revisions; coexisting variants use different IDs.
18. PackageBrick is an immutable one-shot event and does not have revisions.
19. ActorTemplate manifests reference Definition Bricks by exact `id + revision`; Server persists resolved revision UID plus digest.
20. ActorConfigSnapshot is a self-contained immutable artifact containing resolved static content, source references, and digests.
21. ActorTemplate has no separate orchestration capability field; Worker-to-Worker authority belongs to a future GraphRun grant.
22. Direct Actor MVP does not implement Graph grants or Actor-to-Actor delegation.
23. ActorTemplate may pin ordered initialization BrickPrompts, including an explicit empty list; they are injected only on backend session creation and never trigger execution by themselves.
24. The MVP Definition Brick families are BrickSysPrompt, BrickPrompt, BackendBrick, ToolsetBrick, and RuntimeConfigBrick.
25. ActorTemplate explicitly carries ordered `0..N` SysPrompt and Initial Prompt references plus exactly one Backend, Toolset, and RuntimeConfig reference.
26. Backend model is required and frozen; credentials are not stored in Backend Brick Bodies.
27. Direct Actor Toolset needs only Package publication and completion operations; delegation is deferred with Graph.
28. ActorCompiler maps resolved static Bricks into a self-contained snapshot and keeps Initial Prompt composition in InvocationComposer. Existing ActorLaunchSpec responsibilities are the target, but first-class `model_id` transport requires a later LaunchSpec/Backend Adapter contract change and must not be encoded implicitly in opaque adapter config.
29. ActorTemplate validation returns deterministic ordered issues under the stable `actor_template.validation_failed` error.
30. Identity/lifecycle conflicts use separate stable operation-level errors rather than validation issues.
31. ActorConfigSnapshot contains resolved launch content, Initial Prompt content, exact source Brick references, and a configuration digest independent of display metadata.
32. Template create/revise does not start a Host or backend session; internal snapshot compilation may occur atomically during Actor creation without a public build command.
33. ActorTemplate authoring and wire contracts use strict `snake_case`, reject unknown fields and implicit defaults, and begin at the dedicated schema version `1.0.0`.
34. Human-readable Project resource IDs use lowercase kebab case with a 64-character limit; exact revisions are structured references rather than ID suffixes.
35. Actor Module receives decoded structured commands and depends on inward-facing resolver, validator, workspace, repository, and unit-of-work ports rather than CLI, YAML, persistence, or concrete Backend implementations.

## 13. Open questions

The following are intentionally unresolved:

1. How are automatically registered human-readable Brick IDs generated when `registerAs` is omitted?
2. Is digest deduplication scoped to one Project or to a wider local store?
3. What transaction boundary coordinates future Brick auto-registration with ActorTemplate creation?
4. What compatibility version introduces Package-as-Brick into Runtime Contracts?
5. How are existing Package fixtures and persisted records migrated to the unified envelope?

## 14. Explicit non-goals

This document does not design:

```text
Actor CLI beyond the construction relationship
Package CLI
Run CLI
Graph CLI or Graph execution
Brick authoring CLI verbs
SQLite table layout
HTTP endpoint paths
cross-Project Brick sharing
fork
dynamic tools
backend process behavior already covered by the Adapter design
```

The ActorTemplate component model, reference-only create manifest, validation contract, snapshot mapping, and module boundary are sufficiently defined for an implementation proposal. File auto-registration and Package-as-Brick migration remain later changes and do not block the reference-only ActorTemplate slice.
