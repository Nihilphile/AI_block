# RC-pkg-001 Brick and Package Identity Contracts

- owner: Runtime Contracts
- follows: RC-val-002
- affected modules: workspace boundary verification
- workflow: W3 + Compatibility
- base reason: establishes the immutable Package wire identity and recursive prompt boundary consumed across processes
- triggered gates: Compatibility: adds RFC 8785 canonicalization and freezes serialized Package hash semantics and compatibility vectors
- product baseline: 359f539587deb295d9a13cc0c541c292e629008a

## Objective

Implement B.2 BrickPrompt, BrickSysPrompt, Package identity, PackageRef, minimal Delivery snapshots, and RFC 8785/SHA-256 hash primitives on the accepted B.1 Contract kernel.

## Write scope

The Coder may add or modify only:

```text
packages/runtime-contracts/package.json
packages/runtime-contracts/src/index.ts
packages/runtime-contracts/src/brick/**
packages/runtime-contracts/src/package/**
packages/runtime-contracts/test/brick/**
packages/runtime-contracts/test/package/**
packages/runtime-contracts/test/fixtures/rfc8785/**
scripts/check-workspace-boundaries.mjs
package.json
pnpm-lock.yaml
docs/construction/records/runtime-contracts/reports/RC-pkg-001-brick-package-identity.coder.md
```

No application, Actor execution, Host protocol, Graph, persistence, transport, routing workflow, or Claude path is writable.

## Constraints and escalation

- Read and follow ADR-0002, the approved Phase 0B design/plan, RC-val-002 public kernel, and construction rules.
- Use exact runtime dependency `canonicalize@3.0.0` and exact development dependency `fast-check@4.8.0`; do not add other dependencies.
- Begin with a delta preflight and wait for exact `IMPLEMENTATION_AUTHORIZED` before writing, installing, generating output, or running mutating commands.
- Freeze exact discriminators and fields through Controller clarification before implementation; do not invent Package creator, provenance, Delivery, or public hashing semantics.
- Package has exactly one root `BrickPrompt` Body. `BrickSysPrompt` remains a distinct privileged type and can never decode as a Package Body.
- Hash material is the complete immutable Package with only `head.content_hash` omitted. Routing and Delivery state never participate.
- Only inert, validated I-JSON reaches `canonicalize`. Use its default API only, hash canonical UTF-8 bytes with Node SHA-256, and serialize lowercase `sha256:` digests.
- Retain a small attributed RFC/Cyberphone vector subset and add deterministic fast-check properties; do not vendor or run the 100-million-number corpus.
- Follow strict RED → GREEN → REFACTOR and record observed RED plus final verification in the Coder Report.
- Update the boundary checker only for approved B.2 topology/dependencies/exports; do not create a JS/TS parser.
- `pnpm verify` must remain green. Escalate recursive TypeBox/Ajv incompatibility rather than switching dialect or weakening schema strictness.

## Acceptance

- Text and composite BrickPrompt values decode strictly; composite order is preserved and the root/body invariant is enforced.
- BrickSysPrompt is structurally non-interchangeable with BrickPrompt.
- Package Head, creator, provenance, PackageRef, Package, and minimal Delivery schemas match the Controller-frozen field model and reject unknown fields.
- Hash verification is invariant to object-key order, sensitive to array order and every immutable field except `content_hash`, and handles `-0` according to JCS.
- Non-I-JSON and behavioral JavaScript values fail before canonicalization.
- Attributed official vectors, property tests, TypeScript/Node compatibility, frozen installation, build, boundary checks, clean checks, and repository-wide verification pass.
- The Coder commits only authorized files and its own Report with `subject commit: same-as-report`.
