---
module: Runtime Contracts
implementation_state: functional
work_state: stable
source_roots:
  - packages/runtime-contracts/src/
test_roots:
  - packages/runtime-contracts/test/
---

# Runtime Contracts

## Intent

Runtime Contracts is the sole shared cross-application and cross-process schema/value boundary for Runtime Server modules, ActorHost, Runtime CLI, and tests. It owns validation and serialization contracts, not persistence, repositories, process management, routing, Graph traversal, ActorTemplate compilation, or Server workflow.

## Implemented today

The package is a private ESM, root-export-only boundary. It currently provides strict JSON-like decoding and validation, identity/version/time/error values, recursive Brick Prompt values, Package/Delivery schemas and SHA-256 helpers, Actor launch/invocation/session/process facts, ActorTemplate/Definition Brick/Snapshot contracts, and Host protocol envelopes, payloads, and ACKs.

The accepted current Package shape is one immutable Package with a Head plus exactly one Body whose value is one root `BrickPrompt`; mutable routing state belongs to Delivery. Package is currently a Contracts/value surface, and Runtime Server has no Package workflow implementation. A possible Package-as-Brick redesign is unresolved future scope, not accepted current intent.

The historical [Phase 0B closeout](../../../docs/construction/records/runtime-contracts/phase-0b-closeout.md) records the accepted 9-file/58-test baseline. After the additive ActorTemplate Contract surface, the later [ActorTemplate closeout](../../../docs/construction/records/actor-template/reference-only-actor-template-closeout.md) records 10 files/79 tests and passing type checks. These counts support the Contract/value boundary at their respective subjects; they do not prove transport, persistence, Server authority, or CLI behavior.

## Boundary and dependencies

Consumers import from the package root and do not deep-import Contract implementation files. Contract source depends on its own schema/validation/hash modules and pinned schema/hash dependencies; it does not import an application. The package does not own database access, repository state, network listeners, process supervision, Package publication, Delivery transitions, Run state, or Graph evaluation.

Contract changes are cross-module interface changes. A future compatibility change must be explicitly authorized by an owning consumer and include downstream type/runtime evidence.

## Current condition

The accepted Phase 0B boundary is stable and the later ActorTemplate additions are additive. Host, Actor, Package, and ActorTemplate vocabulary is ahead of current workflow implementations. `model_id` is preserved in ActorTemplate snapshots but is not a first-class field in the current `ActorLaunchSpec`; launchability therefore remains a deferred cross-module decision, not a Contract defect or blocker for this card.

## Read next

- [Root state route](../../../project_state/README.md) and [authority](../../../project_state/_meta/authority.md)
- [Current Runtime invariants](../../../docs/design/current/runtime-invariants.md) for accepted Contract/value constraints and [Package and Delivery future design](../../../docs/design/future/package-and-delivery.md) for status-labeled workflow and proposed migration seams
- [Contract source](../../../packages/runtime-contracts/src/) and [Contract tests](../../../packages/runtime-contracts/test/) for executable truth
- [Runtime Contracts README](../../../packages/runtime-contracts/README.md) for consumer boundary rules
- [Phase 0B closeout](../../../docs/construction/records/runtime-contracts/phase-0b-closeout.md) for accepted evidence
- [ActorTemplate closeout](../../../docs/construction/records/actor-template/reference-only-actor-template-closeout.md) for the later additive 10-file/79-test Contract evidence

## Evidence

- Source: [`packages/runtime-contracts/src/`](../../../packages/runtime-contracts/src/)
- Tests: [`packages/runtime-contracts/test/`](../../../packages/runtime-contracts/test/)
- Historical accepted baseline: [Phase 0B closeout](../../../docs/construction/records/runtime-contracts/phase-0b-closeout.md) — 9 files/58 tests
- Later additive Contract evidence: [ActorTemplate closeout](../../../docs/construction/records/actor-template/reference-only-actor-template-closeout.md) — 10 files/79 tests
- Cross-boundary evidence: [Host Gateway closeout](../../../docs/construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md)
