# RC-val-001 TypeBox and TypeScript 7 Compatibility

- owner: Runtime Contracts
- follows: none
- affected modules: none
- workflow: W0 + Compatibility + Research
- base reason: delegated read-only evidence needed before a runtime dependency decision
- triggered gates: Compatibility: Runtime Contracts adds a runtime schema dependency under the TypeScript 7 baseline; Research: authoritative evidence does not support the currently pinned TypeBox 0.x combination
- product baseline: 606cfacb14f0e0f0d56bf2fc31399a6227c35d90

## Objective

Select the exact TypeBox line and version that Runtime Contracts should use with Node 24, ESM, TypeScript 7.0.2, and Ajv 8.20.0.

## Write scope

The Researcher may add only:

```text
docs/construction/records/runtime-contracts/reports/RC-val-001-typebox-ts7-compatibility.researcher.md
```

No product, dependency, lockfile, ADR, design, plan, or Task edit is authorized.

## Constraints and escalation

- Compare retaining `@sinclair/typebox@0.34.49` with moving to the officially TS7-supported TypeBox line.
- Use exact versions and authoritative first-party evidence as of 2026-07-16.
- Verify package name, ESM/NodeNext imports, static type derivation, JSON Schema draft, Ajv compatibility, license, runtime dependency footprint, and migration impact.
- Do not choose an unpinned `latest` dependency and do not perform product implementation.
- Return the decision to the Controller if official support, Ajv interoperability, or migration surface remains ambiguous.

## Acceptance

- The Report gives one explicit recommendation and one fallback.
- The recommended exact version has direct evidence for TypeScript 7 and Node 24/ESM compatibility, or the Report clearly explains why only empirical support is available.
- Differences from TypeBox `0.34.49` that affect the approved Runtime Contracts design are listed.
- Remaining compatibility risks and the required local verification gate are concise and actionable.

## Controller decision — 2026-07-16

Accepted `typebox@1.3.6` as the Phase 0B schema-builder dependency. The fallback `@sinclair/typebox@0.34.49` is rejected because it has no official TypeScript 7 support statement.

Phase 0B initially uses the Ajv 8.20.0 main export and only the JSON Schema Draft-07-compatible subset emitted by the approved TypeBox builders. Every public schema must pass a Node 24, TypeScript 7.0.2, NodeNext compile-and-runtime compatibility gate. Draft 2020-12-specific Ajv mode is not enabled by default. Recursive Brick schemas are a B.2 delta decision and must prove their emitted schema against the selected Ajv mode before implementation proceeds.
