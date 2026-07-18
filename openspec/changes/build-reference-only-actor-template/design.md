## Context

The repository already has a frozen Runtime Contracts baseline, a Host Gateway/FakeBackend walking skeleton, and an accepted ClaudeCodeAdapter v0.1. The next Direct Actor dependency is the Actor construction boundary described by `runtime-actor-template-and-brick-design-v0.1.md`: reusable typed Definition Bricks must be composed into immutable ActorTemplate revisions and compiled into a reproducible ActorConfigSnapshot before Actor creation can be implemented safely.

Current BrickPrompt and BrickSysPrompt contracts are unregistered value shapes, and ActorLaunchSpec already carries resolved System Prompts, opaque Backend adapter configuration, Tool providers, and working directory. It does not yet carry first-class model selection. This change adds the missing Server-side authoring and compilation model while leaving the existing Package shape and Host protocol unchanged.

## Goals / Non-Goals

**Goals:**

- Define strict v1 contracts and domain values for Definition Brick revisions, exact references, ActorTemplate specifications/revisions, validation reports, and ActorConfigSnapshot.
- Implement a reference-only ActorTemplate application boundary with immutable revisions and deterministic validation.
- Compile exact Template revisions into self-contained snapshots that map cleanly to existing LaunchSpec and InvocationSpec responsibilities and retain frozen `model_id` without hiding it in opaque adapter configuration.
- Preserve module ownership and allow later Actor creation, file registration, and Graph grants without redesigning ActorTemplate identity.

**Non-Goals:**

- Public Brick authoring CLI or local-file auto-registration.
- Package-as-Brick contract migration.
- Actor creation, ActorPool, Host startup, Run Engine, Package routing, delegation, or Graph.
- HTTP/SSE endpoints, CLI integration, SQLite tables, or full recovery semantics.
- Non-empty real Claude Code System Prompt/Toolset realization; this change stops at compilation boundaries.

## Decisions

### 1. Additive contracts; preserve Package v1

Runtime Contracts will gain ActorTemplate/Definition Brick construction schemas without changing the current Package, Delivery, ActorLaunchSpec, InvocationSpec, or Host messages. Package-as-Brick remains a separately approved breaking change.

`BackendBrickBody` and the snapshot's resolved Backend content carry `adapter_id`, required non-empty `model_id`, and opaque adapter `config` as distinct fields. ActorLaunchSpec v1 and ClaudeCodeAdapter v0.1 do not yet carry `model_id`; this change must neither drop it nor inject it into `config`. A later dedicated LaunchSpec/Backend Adapter change will transport model selection and define launch compatibility. Until then, this module's boundary ends at compilation.

Alternative considered: migrate Package while introducing registered Bricks. Rejected because it would reopen a proven cross-process path and combine two independent migrations.

### 2. Definition Brick revisions are exact immutable inputs

Reusable Definition Bricks have a Project-scoped human-readable ID and immutable revisions. Authoring references use `id + revision`; the resolver returns a revision UID, kind, canonical Body, and digest. No canonical reference may use `latest` or `current`.

Alternative considered: create a new human-readable ID for every content change. Rejected because it turns ordinary definition evolution into manual lineage management. Alternative considered: floating references. Rejected because identical manifests could compile differently over time.

This slice needs resolver and repository ports plus test fixtures; it does not expose Definition Brick create/revise commands.

### 3. One strict ActorTemplateSpec schema

The wire/authoring model uses `snake_case`, dedicated schema version `1.0.0`, lowercase kebab-case Project resource IDs, explicit empty Prompt lists, exact references, unknown-field rejection, and no implicit defaults.

The component model is:

```text
system_prompt.bricks   ordered 0..N BrickSysPrompt revisions
initial_prompt.bricks  ordered 0..N BrickPrompt revisions
backend                exactly one BackendBrick revision
toolset                exactly one ToolsetBrick revision
runtime_config         exactly one RuntimeConfigBrick revision
```

Alternative considered: many CLI flags or inline Brick Bodies. Rejected because composition ordering, reusable identity, and atomic validation become ambiguous.

### 4. Authoritative validation is layered and aggregate

Client validation is advisory. Actor Module resolves and validates schema, Project ownership, kind, cardinality, adapter/provider compatibility, workspace containment, canonicalization, and digests. Independent issues are returned under `actor_template.validation_failed` in deterministic path/code order. Identity and lifecycle failures remain separate operation-level errors.

Alternative considered: fail on the first issue. Rejected because authoring nested manifests would require repeated edit/submit cycles and produce poorer automated diagnostics.

### 5. Immutable revisions use optimistic concurrency

Create reserves the Project-scoped ID and persists revision 1 atomically. Revise requires `base_revision` to equal the current revision, then assigns the next revision atomically. Revisions are never mutated. Archive blocks future revision while retaining history.

Alternative considered: mutable Template rows. Rejected because Actor provenance and reproducible compilation would require reconstructing historical state.

### 6. Snapshot is self-contained and internal

ActorConfigSnapshot contains source Template provenance, exact source Brick refs/digests, resolved System Prompts, resolved Initial Prompts, Backend content (`adapter_id`, `model_id`, and opaque `config`), Tool providers, working directory, and a digest over canonical resolved execution content. Display metadata is excluded from the configuration digest.

LaunchSpecBuilder later adds Actor identity and maps resolved launch fields to a Host contract that can represent all frozen execution choices. Because ActorLaunchSpec v1 lacks first-class `model_id`, that transport mapping is not implemented by this change. InvocationComposer owns Initial Prompt composition and only uses it for session `create`. ActorHost never compiles Templates or performs semantic Prompt composition.

Alternative considered: keep only Brick refs in the snapshot. Rejected because Host startup would depend on re-resolution and archival/deletion policy. Alternative considered: expose snapshots as a primary CLI object. Deferred because no user-facing build artifact is required for the Direct Actor path.

### 7. Module boundary uses ports

The new Server module lives under `apps/runtime-server/src/modules/actor/` and separates pure domain/compiler code from application coordination. Required ports cover Project namespace, Definition Brick resolution, Backend/Tool provider validator registries, Project workspace resolution, Template/snapshot repositories, and a unit of work.

YAML/filesystem parsing belongs to future Client/Control API adapters. Concrete SQLite and Claude Code implementations remain outside the module core. Existing Runtime Contracts remains the only cross-workspace package dependency.

### 8. Scope ends before runtime side effects

Template validate/create/revise/read/archive and internal snapshot compilation are the only behaviors in this change. They do not create Actors, start Hosts, invoke Backend processes, publish Packages, acquire leases, or grant delegation rights.

## Risks / Trade-offs

- [Risk] Actor Module depends on Definition Bricks that have no public authoring command in this slice. → Use explicit resolver/repository ports and deterministic fixtures; add Brick authoring as the next independent capability.
- [Risk] Generic Backend and Tool provider config objects can hide adapter-specific errors. → Require validator registries and fail authoritative Template validation before persistence.
- [Risk] Self-contained snapshots duplicate small resolved contents. → Accept duplication for reproducibility; optional storage deduplication by digest must remain invisible to domain identity.
- [Risk] A new set of contract types reopens Runtime Contracts after Phase 0B. → Keep changes additive, add compatibility fixtures, and do not alter existing Package/Host schemas.
- [Risk] Workspace resolution could leak or accept unsafe absolute paths. → Resolve through ProjectWorkspaceResolver, reject root escape, and redact unrestricted absolute paths from validation details.
- [Risk] This module-only slice is not an end-to-end Direct Actor feature. → Keep acceptance explicit and follow it with Actor creation/runtime integration rather than claiming MVP completion.
- [Risk] ActorLaunchSpec v1 and ClaudeCodeAdapter v0.1 cannot yet transport first-class `model_id`. → Preserve it in Backend Brick and snapshot contracts, forbid implicit encoding in opaque adapter config, and require a separate Host-contract/Adapter evolution before launch integration.

## Migration Plan

1. Add additive Runtime Contracts schemas/types and compatibility fixtures.
2. Add the isolated Actor module and pure compiler/application tests behind ports.
3. Add boundary verification so Actor domain code cannot import infrastructure or ActorHost implementation.
4. Keep existing Package, Host Gateway, ActorHost, and ClaudeCodeAdapter tests unchanged and green.
5. Rollback is removal of the additive module/contracts before any persisted production ActorTemplate data or public API consumes them.

## Open Questions

No blocking questions remain for the reference-only slice. File auto-registration, digest deduplication scope, Package-as-Brick migration, and public Brick/Actor/CLI commands are separate future changes.
