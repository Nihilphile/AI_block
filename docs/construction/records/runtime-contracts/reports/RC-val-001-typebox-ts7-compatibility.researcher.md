# RC-val-001 Researcher Report

- role: researcher
- result: completed
- subject commit: none

## Decisions

- uncertainty found: yes
- implicit decisions found: no
- decisions made or escalation requested: Prefer exact `typebox@1.3.6`; fallback to exact `@sinclair/typebox@0.34.49` only for short-term API stability. Do not use an unpinned `latest` or a semver range.

## Work and evidence

As of 2026-07-16, the official TypeBox 1.x line is the exact package `typebox`; npm registry metadata reports stable `latest` `1.3.6`, published 2026-07-08. The pinned recommendation is therefore `typebox@1.3.6`. The official 1.3.6 README explicitly says the line is developed against the TypeScript 7 native compiler, supports TypeScript 5+, provides native JSON Schema 2020-12 support, and is ESM-only. It also documents static derivation with `import Type from 'typebox'` and `Type.Static<typeof T>`.

| Area | `typebox@1.3.6` preferred | `@sinclair/typebox@0.34.49` fallback |
| --- | --- | --- |
| TypeScript 7 | Direct official support statement for 1.x / TS 7 native compiler | Officially the 0.x / TS 5–6 LTS line; no TS 7 support statement |
| API/import | `import Type from 'typebox'`; subpaths such as `typebox/value`, `typebox/compile`, `typebox/format`, `typebox/system` | `import { Type, type Static } from '@sinclair/typebox'`; existing subpaths such as `@sinclair/typebox/value` and `@sinclair/typebox/compiler` |
| Node 24 / ESM | Package metadata has `type: module`, `.mjs` import/default exports, and `.d.mts`; no `engines` claim, so Node 24 compatibility is package-format plus local verification rather than an explicit vendor engine guarantee | Dual ESM/CJS export map; compatible with ESM, but not the TS 7-supported line |
| JSON Schema | Official README claims native 2020-12 support and compiler coverage from draft 3 through 2020-12 | Official README targets draft-07 |
| Ajv 8.20.0 | Zero direct runtime dependencies; standard schemas work with Ajv's main draft-07 export. Ajv's official documentation requires the separate 2020 export for draft-2020-12. Local Node 24 probe: `Type.Object` and `Type.Tuple` compile with `new Ajv()`, while `Type.Tuple`'s emitted array-form `items` is rejected by `Ajv2020`; use draft-2020 mode only after a schema-by-schema gate | Same zero direct runtime dependencies and the same draft-07 tuple behavior; the existing import/API path is lower migration risk but has no official TS 7 support |
| License / footprint | MIT; npm metadata shows no dependencies or peerDependencies; 1.46 MB unpacked, 1,367 files | MIT; npm metadata shows no dependencies or peerDependencies; 1.91 MB unpacked, 1,070 files |

Migration is not drop-in. The official 1.0 migration guide records ESM-only packaging; removal of `Kind`, `Hint`, `ReadonlyKind`, `OptionalKind`, `Type.Date`, `Type.Uint8Array`, `Type.Recursive`, `Type.RegExp`, `Type.Composite`, `Type.Const`, `TypeRegistry`, and `TypeGuard`; `Type.Transform` → `Type.Codec`; `TypeCompiler.Compile` → `Compile` from `typebox/compile`; `FormatRegistry` moved to `typebox/format`; and changed `Value.Errors` / `Value.Cast` APIs. In particular, recursive Runtime Contracts schemas must be rewritten from `Type.Recursive` to `Type.Cyclic`/`Type.Ref` if that 0.x API is used.

First-party evidence: [TypeBox 1.3.6 README](https://raw.githubusercontent.com/sinclairzx81/typebox/1.3.6/readme.md), [TypeBox 1.0 migration guide](https://raw.githubusercontent.com/sinclairzx81/typebox/1.3.6/changelog/1.0.0-migration.md), [npm metadata for `typebox@1.3.6`](https://registry.npmjs.org/typebox/1.3.6), [npm registry history/dist-tags](https://registry.npmjs.org/typebox), [npm metadata for `@sinclair/typebox@0.34.49`](https://registry.npmjs.org/@sinclair%2ftypebox/0.34.49), [0.34.49 README](https://raw.githubusercontent.com/sinclairzx81/sinclair-typebox/0.34.49/readme.md), [Ajv 8.20.0 npm metadata](https://registry.npmjs.org/ajv/8.20.0), and [Ajv JSON Schema language guidance](https://ajv.js.org/json-schema.html).

## Deviations and remaining risk

The official TS 7 claim is direct for TypeBox 1.x, but the vendor does not publish a Node 24 engine claim and the README's 2020-12 support does not make every emitted builder schema valid for Ajv's `Ajv2020` class. Before implementation, the Controller should require a temporary Node 24 / TypeScript 7.0.2 / NodeNext compile-and-runtime gate over every approved public schema, including recursive and tuple-like cases, with Ajv 8.20.0 main-export versus 2020-export selection recorded. Highest risk: the 0.34.x-to-1.x breaking migration can change recursive schema construction and public error/compiler behavior.
