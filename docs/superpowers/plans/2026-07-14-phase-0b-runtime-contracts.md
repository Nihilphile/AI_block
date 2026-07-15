# Phase 0B Runtime Contracts Implementation Plan

## Baseline and authority

- approved design: `docs/superpowers/specs/2026-07-14-phase-0b-runtime-contracts-design.md`
- construction rules: `development-orchestration-runbook-v0.1.md`
- product baseline before Phase 0B planning: `139fa7c489117e065ed4f3b85a3cd6926608dd9f`
- module owner during implementation: one persistent Luna Coder
- implementation order: strictly B.1, B.2, B.3, then B.4

This plan is deliberately mechanical. The approved design is authoritative for semantics and deferred scope.

## Common gate for every slice

Before edits, the Coder returns a read-only preflight containing:

1. proposed exact file write set;
2. implicit decisions and conflicts with the approved design;
3. external information gaps;
4. tests that will fail before implementation and pass after it;
5. confirmation that no later-slice behavior is required.

The first slice receives a full module preflight. Later slices receive a delta preflight focused on new decisions, changed paths, and changed assumptions. No write begins before the controller sends an exact `IMPLEMENTATION_AUTHORIZED` envelope.

Each slice uses test-first implementation, keeps all public imports at the package root, and leaves the worktree clean except for its authorized commit. The repository-wide verification command must remain green at every accepted slice; no slice may knowingly defer a broken Phase 0A checker to B.4.

## B.1 Contract kernel

Deliver:

- exact Phase 0B dependency and test-tool installation;
- `typebox@1.3.6` and Ajv `8.20.0` integration through the approved Draft-07-compatible schema subset;
- inert JSON materialization and strict boundary decoding;
- deep defensive copy and freeze;
- identifier, exact-version, canonical-timestamp, and stable-error schemas;
- root exports for B.1 only;
- focused deterministic tests.
- migration of the Phase 0A boundary checker from the empty-source invariant to the approved Runtime Contracts domain topology and dependency policy, without a handwritten source parser;
- root verification integration for the B.1 Contract test.

Acceptance:

- valid values decode into frozen defensive copies;
- malformed JSON-like values, unknown fields, invalid IDs, unsupported versions, invalid timestamps, and unpaired surrogates fail through normalized stable errors;
- Ajv implementation wording does not become public error identity;
- frozen installation, TypeScript build, and B.1 tests pass;
- every B.1 public schema compiles and validates under Node 24, TypeScript 7.0.2, NodeNext, and the Ajv main export;
- repository-wide verification remains green after real Runtime Contracts source replaces the Phase 0A empty stub;
- no Brick, Package, Actor, Host, persistence, transport, or workflow behavior is introduced.

Checkpoint: independent Tester verifies B.1 because the validation kernel controls every later contract. Review is not automatic unless implementation reveals a semantic or security concern.

## B.2 Brick and Package identity

Deliver:

- `BrickPrompt` and `BrickSysPrompt` schemas;
- Package Head, creator, provenance, PackageRef, Package, and minimal Delivery snapshot schemas;
- pinned RFC 8785 wrapper using `canonicalize@3.0.0`;
- Package hash-material, compute, and verify primitives;
- curated attributed RFC/Cyberphone fixtures and property tests.

Acceptance:

- Package has exactly one root BrickPrompt Body;
- Package Body cannot decode as BrickSysPrompt;
- every immutable Package field except `content_hash` affects the digest;
- object order is non-semantic, array order is semantic, and `-0` canonicalizes as JCS specifies;
- non-I-JSON and behavioral JavaScript values never reach the canonicalizer;
- official high-value vectors and deterministic property tests pass.

Checkpoint: independent Tester verifies B.2. An early Reviewer is triggered only if hashing, recursive schemas, or provenance semantics diverge from the approved design.

## B.3 Actor and Host protocol contracts

Deliver:

- ActorLaunchSpec with strict adapter/provider wrappers and private JSON configuration payloads;
- InvocationSpec and process-level InvocationResult;
- Host envelope, correlation, ACK, generation, sequence, and the approved minimal message union;
- Package publication and completion request contracts;
- positive, negative, and round-trip tests.

Acceptance:

- adapter-specific Claude, MCP, Skill, executable, and resume details remain outside generic contracts;
- Invocation input is one BrickPrompt plus ordered PackageRefs and cannot mutate Actor system/tool configuration;
- InvocationResult reports process facts without deciding Run state;
- every Host variant is strictly discriminated and rejects unknown fields and incompatible versions;
- ACK and correlation shapes are deterministic and transport-neutral.

Checkpoint: independent Tester verifies B.3. Cross-process semantic drift triggers an early Reviewer.

## B.4 Compatibility and module hardening

Deliver:

- application consumer fixtures through `@ai-block/runtime-contracts` root exports;
- complete deterministic package test command and root verification integration;
- final exact public export audit and dependency-boundary hardening without a handwritten source parser;
- fixture attribution and module documentation required to consume the contracts;
- cleanup of accidental dead exports or test-only production surface.

Acceptance:

- runtime-server, actor-host, and runtime-cli compile against the package root;
- private deep imports fail;
- frozen install, build, clean, Contract tests, compatibility fixtures, and boundary verification pass without changing versioned files;
- no infrastructure imports or later-phase behavior exist in Runtime Contracts;
- generated output is ignored and cleanup is deterministic.

Checkpoint: independent Tester runs the full Phase 0B matrix, then an independent Luna Reviewer performs the module-level architecture and correctness review.

## Module closeout

The controller accepts Phase 0B only after B.4 Tester and Reviewer pass. The closeout records:

- final commit;
- frozen public contracts and dependency versions;
- complete verification result;
- deferred decisions carried into FakeBackend;
- the exact entry point for the next walking-skeleton module.
