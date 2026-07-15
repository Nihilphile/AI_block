# RC-host-001 Actor and Host Protocol Contracts

- owner: Runtime Contracts
- follows: RC-pkg-001
- affected modules: future Actor Module, ActorHost, Host Gateway, and Run Engine consumers
- workflow: W3 + Compatibility
- base reason: establishes the versioned cross-process initialization, invocation, and Host message boundary
- triggered gates: Compatibility: freezes serialized Actor/Host protocol shapes, correlation, sequencing, and exact-version behavior
- product baseline: 485c1f44bc7df020766c8b452d491cdf1c5af417

## Objective

Implement B.3 ActorLaunchSpec, InvocationSpec, process-level InvocationResult, and the minimal transport-neutral Host protocol contracts on the accepted B.1/B.2 foundation.

## Write scope

The Coder may add or modify only:

```text
packages/runtime-contracts/src/index.ts
packages/runtime-contracts/src/actor/**
packages/runtime-contracts/src/host/**
packages/runtime-contracts/test/actor/**
packages/runtime-contracts/test/host/**
scripts/check-workspace-boundaries.mjs
docs/construction/records/runtime-contracts/reports/RC-host-001-actor-host-protocol-contracts.coder.md
```

No application, dependency, lockfile, existing B.1/B.2 implementation, persistence, network transport, process supervisor, Run workflow, Graph, or Claude adapter path is writable.

## Constraints and escalation

- Read and follow ADR-0002, the approved Phase 0B design/plan, accepted B.1/B.2 public contracts, and construction rules.
- Begin with a delta preflight and wait for exact `IMPLEMENTATION_AUTHORIZED`; freeze every wire discriminator, field, enum, optionality rule, and public symbol before implementation.
- ActorLaunchSpec uses strict generic adapter/provider wrappers with intentional `JsonObject` config payloads. Claude flags, executable discovery, MCP/Skill internals, and resume mechanics remain adapter-private.
- InvocationSpec carries one root BrickPrompt, ordered PackageRefs, immutable identity, and an explicit create/resume session directive; it cannot mutate system prompts or tools.
- InvocationResult reports backend/process facts only and never decides Run state.
- Host envelopes use exact protocol version, message ID, optional correlation, sender sequence, connection generation, sent timestamp, and one strict discriminated payload.
- Include only the approved minimal Server→Host and Host→Server message variants, ACK, Package publication request, and completion request. Do not implement transport, authentication, retry, replay, reconnect, heartbeat scheduling, or orchestration behavior.
- Follow strict RED → GREEN → REFACTOR, keep all public imports at the package root, and keep `pnpm verify` green.
- Continue using Serena for useful symbol/declaration navigation. If running `serena memories check`, set `PYTHONUTF8=1`; do not modify memory or MCP configuration to address the CP936 display issue, and never stage `.serena/`.
- Escalate any contradiction with existing Package authority, session ownership, or generic-versus-adapter-private boundaries.

## Acceptance

- Actor launch, adapter/provider extension, invocation/session, and process-result schemas match Controller-frozen shapes and reject unknown fields.
- Adapter-private configuration remains an explicit second-stage-validation JSON extension point without leaking Claude-specific fields into Runtime Contracts.
- Every Host payload and envelope is strictly discriminated, exact-versioned, immutable after decode, and round-trips through JSON.
- ACK/correlation, sender sequence, connection generation, Package publication, completion request, session report, and fault shapes are deterministic and transport-neutral.
- Invalid cross-direction variants, unknown fields, incompatible versions, invalid identities, and malformed nested B.1/B.2 values fail closed.
- TypeScript/Node/Ajv compatibility, focused tests, build, boundary checks, clean checks, and repository-wide `pnpm verify` pass.
- The Coder commits only authorized files and its own Report with `subject commit: same-as-report`.
