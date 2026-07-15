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
