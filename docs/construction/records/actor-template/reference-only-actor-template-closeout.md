# Reference-only ActorTemplate Module Closeout

- status: accepted
- closed by: Orchestrator
- acceptance date: 2026-07-19
- OpenSpec change: `build-reference-only-actor-template`
- original implementation subject: `9dab4fd18dcec1fe70933f9f495696d07bb0ad4b`
- review remediation subject: `dd9279c0efbd76f27562961f1c22961bc7dd36be`
- final independent retest: `12aedb3a2d79d82d7b0c84474cf0a3adfb851702`
- final focused re-review: `9bced16d8a4ba97c6bba367c2cc870b913a03e36`

## Accepted outcome

The reference-only ActorTemplate construction module is accepted. It defines strict Definition Brick and ActorTemplate Contracts, validates and persists immutable Template revisions through ports, and compiles self-contained ActorConfigSnapshots without creating an Actor, Host, Run, Package, backend session, or Graph authority.

Actor execution configuration remains static: system-prompt, Backend, Toolset, runtime config, and initial Prompt references are frozen into immutable Template revisions and compiled Snapshots. Runtime Prompt Packages remain a later dynamic input path. Backend `model_id` is preserved as a first-class Snapshot field rather than hidden in opaque adapter config.

## Accepted capabilities

- Project-scoped human-readable Definition Brick and ActorTemplate identities with server UIDs and immutable positive revisions.
- Strict v1 Bodies for system prompt, prompt, Backend, Toolset, and runtime-config Definition Bricks.
- Reference-only Template creation and revision: every component must already exist as an exact Project-local Brick revision.
- Deterministic aggregate validation, stable redacted validation/operation results, strict kind/cardinality rules, Prompt ordering, and optional empty initial Prompt lists.
- Atomic create, revise, archive, read, list, history, and internal compile/persist operations behind explicit repositories and Unit of Work ports.
- Self-contained ActorConfigSnapshots with source provenance, distinct Snapshot identity, canonical configuration digest, resolved execution content, and separate Backend adapter/model/config fields.
- Fail-closed Runtime Contracts and Actor Module dependency boundaries, including non-literal dynamic `import()`/`require()` rejection in restricted roots.

## Review remediation and evidence

The first module Review identified three actionable findings:

- historical hydration did not enforce persisted Definition Brick UID/digest provenance;
- resolver/port exceptions were incorrectly represented as client schema failures;
- non-literal dynamic module references could bypass the boundary checker.

Remediation `dd9279c` closed all three. Persisted Project/ID/revision/kind/UID/digest provenance and canonical Brick/Template digests are now verified before Snapshot writes; unexpected port failures use the fixed redacted `actor_template.operation_failed` result; and unclassifiable dynamic loading fails closed.

Independent focused retest returned PASS:

```text
Focused remediation       3 files / 39 tests
Runtime Contracts        10 files / 79 tests
ActorHost                 5 files / 80 tests
Runtime Server            5 files / 45 tests
Integration               1 file  / 5 tests
```

Build, typecheck, workspace boundaries, cleanup, and Git-clean verification passed. The remediation lease did not rerun the install-bearing root `pnpm verify`; its non-install constituents passed, while the original stable implementation had already passed the literal root verification. The final focused Reviewer marked F-1, F-2, and F-3 CLOSED, found no new actionable defect, and recommended module acceptance.

## Deferred scope and risk

- No concrete Brick/Template/Snapshot persistence, namespace, workspace, validator, HTTP, or CLI adapter is included; database isolation and concurrent transaction behavior remain unproven.
- ActorConfigSnapshot does not yet create an Actor or transport first-class `model_id` through ActorLaunchSpec v1/ClaudeCodeAdapter v0.1. The module deliberately stops before launchability.
- Public Brick authoring, file auto-registration, Package-as-Brick migration, Actor lifecycle, Host bootstrap, Package routing, Run Engine, recovery, delegation, Graph, and GraphRun capability grants remain outside this change.
- The boundary checker uses pinned `typescript/unstable/ast`; every TypeScript upgrade must rerun compatibility probes or replace it with a stable parser boundary.
- Initial Prompt Bricks are retained as ordered Snapshot content only; Invocation composition and first-session injection remain later work.

## Next construction boundary

The next change should stay on the Direct Actor path and choose one narrow owner boundary: either concrete Project-local Brick/ActorTemplate persistence and authoring, or immutable Actor creation from an accepted ActorConfigSnapshot followed by Host launch integration. Graph composition and graph-scoped delegation authority remain deferred until the single-Actor path is complete.

This closeout completes the OpenSpec implementation tasks but does not archive the change or authorize the next module. The four runtime product-design documents and Phase 1 architecture invariants remain the north-star authorities.
