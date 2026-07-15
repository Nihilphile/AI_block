# Runtime Contracts

`@ai-block/runtime-contracts` is the private, ESM-only JSON Contract boundary for Runtime Server, ActorHost, Runtime CLI, and Contract tests.

## Consumption

Import schemas, derived types, and helpers only from the package root:

```ts
import type { HostToServerMessage, Package } from "@ai-block/runtime-contracts";
import { PackageSchema, decodeContract } from "@ai-block/runtime-contracts";
```

Boundary inputs are parsed values. `decodeContract` materializes inert JSON, validates the exact TypeBox/Ajv schema, returns a defensive deeply frozen value, and rejects unknown fields and unsupported values.

The package uses the Phase 0B baseline: Node 24, TypeScript 7.0.2, TypeBox 1.3.6, Ajv 8.20.0, ajv-formats 3.0.1, canonicalize 3.0.0, Vitest 4.1.10, and fast-check 4.8.0. Frozen B.1–B.3 schemas and root exports are compatibility-controlled.

Do not use deep imports such as `@ai-block/runtime-contracts/src/...`; the package exposes only its root export. Applications remain private consumers and must not import one another or Runtime Contracts implementation files.
