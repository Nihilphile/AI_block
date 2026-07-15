# RC-val-002 Runtime Contract Kernel

- owner: Runtime Contracts
- follows: RC-val-001
- affected modules: workspace boundary verification
- workflow: W3 + Compatibility
- base reason: establishes the public validation boundary consumed by three processes and migrates the workspace from an empty Contract stub to real source
- triggered gates: Compatibility: adds exact runtime/test dependencies and freezes serialized validation semantics under Node 24, TypeScript 7, NodeNext, TypeBox, and Ajv
- product baseline: 32640bc96d90a218b283c30f81d9c413c0aff105

## Objective

Implement the B.1 strict JSON, decoding, identity, version, timestamp, and stable-error Contract kernel while keeping repository-wide verification green.

## Write scope

The Coder may add or modify only:

```text
packages/runtime-contracts/package.json
packages/runtime-contracts/src/index.ts
packages/runtime-contracts/src/validation/**
packages/runtime-contracts/src/identity/**
packages/runtime-contracts/src/error/**
packages/runtime-contracts/test/validation/**
packages/runtime-contracts/test/identity/**
packages/runtime-contracts/test/error/**
scripts/check-workspace-boundaries.mjs
package.json
pnpm-lock.yaml
docs/construction/records/runtime-contracts/reports/RC-val-002-contract-kernel.coder.md
```

Generated `dist/` output is never committed. No application, Brick, Package, Actor, Host, Graph, persistence, transport, or Claude path is writable.

## Constraints and escalation

- Read and follow ADR-0002, the approved Phase 0B design, and the Phase 0B implementation plan; the design is authoritative for ID prefixes, public names, error normalization, inert JSON handling, and deferred scope.
- Use exact runtime versions `typebox@1.3.6`, `ajv@8.20.0`, and `ajv-formats@3.0.1`; use exact development version `vitest@4.1.10`. `canonicalize` and `fast-check` remain deferred to B.2.
- Use the Ajv main export and only the approved Draft-07-compatible TypeBox subset. Every exported schema needs a Node 24 + TypeScript 7.0.2 + NodeNext compile-and-runtime test.
- Follow strict test-first RED → GREEN → REFACTOR. Record the observed RED and final verification in the Coder Report.
- Update the Phase 0A boundary checker only enough to recognize the approved domain topology, exact dependency policy, root-only exports, and real source. Do not write a JavaScript/TypeScript import parser.
- Repository-wide verification must remain green at the accepted commit. A known-red intermediate slice is not acceptable.
- Treat hostile in-process Proxy behavior according to the approved trust caveat; do not claim an impossible side-effect-free Proxy security boundary.
- Begin with a delta preflight and wait for exact `IMPLEMENTATION_AUTHORIZED` before any write, dependency installation, generated output, or test execution that mutates the workspace.
- Escalate any TypeBox 1.x builder, Ajv dialect, TypeScript declaration, public API, or checker conflict rather than silently changing the approved design.

## Acceptance

- Valid inputs return discriminated success values that are defensive copies and recursively frozen.
- Accessors, custom prototypes, symbol keys, sparse arrays, cycles, unsupported JavaScript values, non-finite numbers, and lone surrogates fail with stable project-owned errors.
- Unknown fields, coercion, defaults, additional-field removal, invalid IDs, unsupported versions, and non-canonical timestamps fail closed.
- Exact ID prefixes, canonical timestamp rules, error codes/messages/details, root exports, and TypeBox-derived types match the approved design.
- All B.1 schema compatibility tests, focused tests, TypeScript build, frozen install, workspace boundary verification, and repository-wide verification pass deterministically.
- Installation and verification leave no unexpected tracked or untracked files; `.serena/` is pre-existing user-owned state and remains untouched.
- The Coder commits only the authorized implementation files and its own Report with `subject commit: same-as-report`.
