## 1. Runtime Contracts

- [x] 1.1 Add additive identity and exact-reference schemas for Project-scoped human-readable resource IDs, Definition Brick revision UIDs, positive revisions, digests, and ActorTemplate revision references without changing existing ID schemas.
- [x] 1.2 Add strict v1 Definition Brick Body and registered-revision schemas for BrickSysPrompt, BrickPrompt, BackendBrick, ToolsetBrick, and RuntimeConfigBrick, including canonical validation constraints and safe secret/path boundaries.
- [x] 1.3 Add strict v1 ActorTemplateSpec, metadata, resolved reference, Template revision/view, validation report/issue, command/result, and ActorConfigSnapshot schemas with root-only public exports; snapshot Backend content must retain first-class `model_id` separately from opaque adapter `config`.
- [x] 1.4 Add contract tests and compatibility fixtures proving valid/invalid cardinality, unknown-field rejection, exact refs, Body-kind rules, deterministic public serialization, and unchanged Package/Host contract fixtures.

## 2. Actor Module Foundation

- [x] 2.1 Create the `apps/runtime-server/src/modules/actor/` domain/application directory structure and define ports for Project namespace, Definition Brick resolution, Backend/Tool provider validators, Project workspace resolution, repositories, and unit of work.
- [x] 2.2 Implement pure Definition Brick reference resolution/domain values that preserve authored refs and resolved revision UID/digest while rejecting floating or cross-Project references.
- [x] 2.3 Implement canonicalization helpers for text and structured Bodies and deterministic Template revision/configuration digest material without importing filesystem, YAML, SQLite, HTTP, or Backend process implementations.

## 3. Validation and Compilation

- [x] 3.1 Implement layered ActorTemplate candidate validation for schema, required components, exact refs, kinds, duplicate Prompt refs, adapter/provider config, Backend/Toolset compatibility, and workspace containment.
- [x] 3.2 Implement deterministic aggregate validation reports and stable operation-level errors with safe redacted details and manifest path ordering.
- [x] 3.3 Implement the pure ActorCompiler that preserves Prompt order and produces a self-contained ActorConfigSnapshot with source provenance, resolved execution content (including separate Backend `adapter_id`, `model_id`, and opaque `config`), Initial Prompt content, and metadata-independent configuration digest; do not encode model selection into ActorLaunchSpec v1 or adapter config.
- [x] 3.4 Add focused validator/compiler tests covering empty Prompt lists, composite Initial Prompts, kind mismatch, stale/missing refs, unsafe workspace paths, equivalent execution content, and no runtime side effects.

## 4. ActorTemplate Application Service

- [x] 4.1 Implement side-effect-free candidate validation and read/list/history operations against the defined ports.
- [x] 4.2 Implement atomic create with Project namespace uniqueness, authoritative validation, immutable revision 1 persistence, and no implicit upsert.
- [x] 4.3 Implement atomic revise with current `base_revision` enforcement, immutable history, next-revision assignment, and archived-Template rejection.
- [x] 4.4 Implement archive and internal snapshot compilation/persistence operations without creating Actors, Hosts, Runs, Packages, or backend sessions.
- [x] 4.5 Add deterministic in-memory test adapters and application-service tests for successful operations, conflicts, rollback/no-partial-write behavior, validation parity, and snapshot reuse transparency.

## 5. Boundaries and Acceptance

- [x] 5.1 Extend repository boundary verification so Runtime Contracts remain schema/value-only and Actor domain/application code cannot import infrastructure, ActorHost, Host Gateway implementation, Package routing, Run Engine, Graph, or concrete Backend process code.
- [x] 5.2 Run focused ActorTemplate/Runtime Contracts tests and the repository build, typecheck, boundary, and full verification suites; resolve only failures attributable to this change.
- [x] 5.3 Perform independent acceptance against every `actor-template-construction` requirement, including proof that existing Package, Host, and ClaudeCodeAdapter behavior remains unchanged and that compiled snapshots preserve model selection without claiming current Host launchability.
- [ ] 5.4 Record implementation, acceptance, and any deferred-risk evidence in the construction records, then obtain module-level review when the stable implementation commit is ready.
