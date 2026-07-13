# Phase 0A.2 Process-First Package Boundaries Design

> Status: approved for planning
>
> Scope: physical workspace structure, deployable-process boundaries, package exports, and TypeScript import direction only

## 1. Outcome

Phase 0A.2 turns the root workspace into a compileable process-first monorepo without implementing Runtime Contracts or runtime behavior.

The directory tree is an architectural boundary. It must make the three deployable programs, the Server modular-monolith boundary, and the single cross-process shared package visible without requiring readers to inspect implementation details.

## 2. Chosen approach

Use one workspace application per deployable process and create shared workspace packages only for code that genuinely crosses process boundaries.

```text
AI_block/
├── scripts/
│   └── check-workspace-boundaries.mjs
├── apps/
│   ├── runtime-server/
│   │   ├── src/main.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── actor-host/
│   │   ├── src/main.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── runtime-cli/
│       ├── src/main.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── runtime-contracts/
│       ├── src/index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

Phase 0A.2 creates the four workspace units, the root solution config, and one repository boundary checker. It modifies the root `package.json` and `pnpm-lock.yaml`. The existing `.gitignore`, `pnpm-workspace.yaml`, and `tsconfig.base.json` are verified prerequisites and remain unchanged: `.gitignore` already excludes `dist/` and `*.tsbuildinfo`, while `pnpm-workspace.yaml` already matches only `apps/*` and `packages/*`.

Future internal module directories are documented but are not created until their implementation phase has real files to own.

## 3. Architectural meaning

### 3.1 `apps/`

`apps/` contains independently launched programs:

- `runtime-server` is the authoritative local daemon and Server composition root.
- `actor-host` is the separate process representing one Actor.
- `runtime-cli` is a stateless Client of the Server API.

Applications are private workspace packages with stable names required for pnpm filtering. Each application manifest sets `private: true`, declares `type: module`, and deliberately omits `exports`, `main`, `types`, and `bin`. Applications are not importable libraries and are not imported by other applications or shared packages.

### 3.2 `packages/runtime-contracts`

`@ai-block/runtime-contracts` is the only shared package created in Phase 0A. It is the future transport-neutral schema and value-type boundary consumed by all three applications.

Phase 0A.2 gives it an explicit root export and an empty compileable module. Its manifest freezes the following package surface:

- package name: `@ai-block/runtime-contracts`;
- private workspace package for the current implementation line;
- ESM only via `type: module`;
- top-level type entry: `./dist/index.d.ts`;
- exactly one `exports` entry, `.`, with `types: ./dist/index.d.ts` and `import: ./dist/index.js`;
- build artifacts: `dist/index.js` and `dist/index.d.ts`;
- no subpath exports and no CommonJS entry.

Brick, Package, Actor, Host Protocol, Run, error, validation, hashing, and compatibility definitions remain Phase 0B work.

No other domain package is created pre-emptively. In particular, Project, Actor, Package, Run Engine, Host Gateway, and Graph do not become separate workspace packages.

### 3.3 Server modular monolith

When Server implementation begins, its internal ownership structure will grow under `apps/runtime-server/src/modules/`:

```text
apps/runtime-server/src/
├── modules/
│   ├── project/
│   ├── actor/
│   ├── package/
│   ├── host-gateway/
│   └── run-engine/
├── infrastructure/
└── main.ts
```

Graph is added only in the Graph phase. These directories are architectural reservations in this design, not Phase 0A.2 filesystem outputs.

Server internal modules import shared schemas and value types only from the `@ai-block/runtime-contracts` root. They remain internal folders of `runtime-server`; they do not become separate workspace consumers.

### 3.4 ActorHost internal boundary

When ActorHost implementation begins, its internal components will grow under its application root:

```text
apps/actor-host/src/
├── server-connection/
├── backend-supervisor/
├── backend-adapters/
└── main.ts
```

These directories are likewise deferred until they own implementation files.

## 4. Import and dependency rules

1. All workspace package names use the `@ai-block/` scope.
2. Applications may depend on `@ai-block/runtime-contracts` through `workspace:*` and import it only through its package root.
3. `@ai-block/runtime-contracts` may not import from any application or infrastructure implementation.
4. Application-to-application imports are forbidden.
5. Relative imports may not cross a workspace package root.
6. Deep imports such as `@ai-block/runtime-contracts/src/...` or private subpaths are forbidden.
7. `runtime-contracts` exposes only the `.` export in Phase 0A.2.
8. Package-local `rootDir`, TypeScript project references, NodeNext resolution, and package `exports` encode these boundaries without adding a lint framework.
9. Generic directories named `common`, `shared`, `core`, or `utils` are not created as catch-all ownership zones.
10. `scripts/check-workspace-boundaries.mjs` verifies the current empty source tree and exercises the dependency policy through real TypeScript and Node positive/negative probes. It does not parse arbitrary future TypeScript source.

The TypeScript reference graph is exact:

```text
root solution
├── packages/runtime-contracts
├── apps/runtime-server ──→ packages/runtime-contracts
├── apps/actor-host ──────→ packages/runtime-contracts
└── apps/runtime-cli ─────→ packages/runtime-contracts
```

The root solution owns no source files. Each application references Runtime Contracts. Runtime Contracts references no application. Applications do not reference each other.

## 5. Build shape

- The root `tsconfig.json` is a solution file referencing the four workspace units.
- Every unit extends `tsconfig.base.json`, uses `composite`, owns `src/`, and emits only to its local ignored `dist/` directory.
- Root scripts orchestrate recursive build, clean, and type-check operations without introducing another build system.
- Application entrypoints and the Runtime Contracts root are intentionally empty ESM modules in this phase. They prove compilation and package topology but perform no I/O and expose no product behavior.
- The three application manifests declare the Runtime Contracts workspace dependency so package-manager topology matches the future allowed dependency direction.

## 6. File responsibility map

| File or path | Responsibility |
|---|---|
| root `package.json` | pinned package manager and tools; root build, clean, boundary-check, and verification scripts |
| `pnpm-workspace.yaml` | exact workspace membership: `apps/*` and `packages/*`; preserved unchanged |
| `pnpm-lock.yaml` | reproducible dependency graph and four workspace importers; regenerated and committed |
| `.gitignore` | generated-output exclusions including `dist/` and `*.tsbuildinfo`; verified unchanged |
| `tsconfig.base.json` | shared strict NodeNext compiler policy; preserved unchanged |
| root `tsconfig.json` | source-free solution references for all four units |
| application `package.json` | private application identity and `workspace:*` Runtime Contracts dependency; no export surface |
| application `tsconfig.json` | local `rootDir`/`outDir`, composite build, and Runtime Contracts reference |
| Contracts `package.json` | private ESM package identity and the single public root export |
| Contracts `tsconfig.json` | composite library build and declaration output |
| Contracts `src/index.ts` | sole public entrypoint; empty module until Phase 0B |
| application `src/main.ts` | empty ESM application entrypoint; no I/O or product behavior |
| `scripts/check-workspace-boundaries.mjs` | manifest, reference-graph, exact current source-tree, directory-policy, build-artifact, and positive/negative TypeScript/Node boundary verification |

## 7. Boundary verification

Phase 0A.2 acceptance must prove:

1. `pnpm install --frozen-lockfile` succeeds against the updated lockfile without changing it;
2. `git diff --exit-code` succeeds after frozen installation;
3. the root build command succeeds under the pinned Node, pnpm, and TypeScript versions;
4. every application produces `dist/main.js`;
5. Runtime Contracts produces `dist/index.js` and `dist/index.d.ts`;
6. every application resolves `@ai-block/runtime-contracts` from the package root after build;
7. a Runtime Contracts private/deep package import is rejected;
8. an application-to-application package import is rejected;
9. an application-to-application relative source import is rejected;
10. temporary Runtime Contracts-to-application and Runtime Contracts-to-infrastructure probes are rejected for their exact expected compiler diagnostics;
11. the clean command removes all four local `dist/` outputs;
12. no new catch-all `common`, `shared`, `core`, or `utils` directory exists;
13. no Contract schema, runtime validation, persistence, transport, process management, Claude adapter, Run, or Graph behavior exists.

The boundary checker reads the real manifests, TypeScript references, and exact current source-tree contents. It uses the pinned TypeScript compiler and built application/package outputs for compact positive and negative probes without adding them to the normal build graph. It must cover the allowed Contracts root import, forbidden Contracts deep import, forbidden app package import, forbidden relative cross-package import, and forbidden Contracts-to-application/infrastructure directions. Negative probes must match exact expected diagnostics or runtime error evidence rather than merely any failure. Any temporary artifacts use ignored temporary storage and are always removed.

Phase 0A.2 deliberately does not implement a general JavaScript/TypeScript import parser. Its product source files are exactly empty ESM modules, so there is no real source import graph to scan yet. Project references, package dependencies, `rootDir`, NodeNext resolution, package `exports`, exact source contents, and real compiler/runtime probes jointly prove the Phase 0A.2 boundary. When Phase 0B introduces real imports, that phase must select a compiler- or parser-backed enforcement mechanism appropriate to TypeScript 7; it must not extend a handwritten lexer into a substitute language parser.

The acceptance command sequence is explicit:

```text
pnpm install --frozen-lockfile
git diff --exit-code
pnpm build
pnpm check:boundaries
pnpm clean
git diff --exit-code
```

The build creates the required local artifacts; `check:boundaries` verifies them and executes the positive/negative probes before `clean` removes them. Final status verification must also show no untracked, non-ignored generated files.

Verification should use the existing TypeScript and package-manager toolchain. Phase 0A.2 adds no schema, testing, lint, bundling, or task-runner dependency.

## 8. Alternatives rejected

### Domain package per Server module

Creating separate workspace packages for Project, Actor, Package, Host Gateway, Run Engine, and Graph would make ownership visible but would fragment a deliberately modular-monolith Server, create premature public boundaries, and produce excessive configuration files.

### One root `src/` tree

Putting Server, Host, CLI, and Contracts under one root source directory would use fewer manifests, but would blur deployable-process boundaries and make invalid cross-process imports easy.

### Central configuration without package-local TypeScript projects

A single root compiler project would reduce local files, but it would weaken ownership, build isolation, and cross-package root enforcement. Three small files per workspace unit are accepted structural cost rather than clutter.

### Handwritten JavaScript/TypeScript import parser

A custom lexer initially appears dependency-free, but correct handling of Unicode escapes, template expressions, comments, dynamic imports, and token context would duplicate language-parser responsibilities. Phase 0A.2 uses real compiler/runtime probes instead.

### TypeScript 7 unstable programmatic API

TypeScript 7 exposes programmatic compiler surfaces under explicitly unstable entrypoints. Depending on those entrypoints for a workspace bootstrap would add native API-server lifecycle and compatibility risk. Phase 0A.2 uses the pinned CLI; Phase 0B may revisit a stable parser/compiler integration when real Contract source exists.

## 9. Compatibility and precedence

This design is authoritative for the physical Phase 0 workspace layout. It refines earlier generic sketches that showed Server domain modules near top-level package directories. Those sketches remain conceptually useful for module ownership, but their physical placement is superseded as follows:

- Server domain modules live under `apps/runtime-server/src/modules/`;
- ActorHost components live under `apps/actor-host/src/`;
- only transport-neutral Runtime Contracts live under `packages/` during Phase 0;
- internal Server modules consume Runtime Contracts through its package root without becoming workspace packages.

## 10. Non-goals

Phase 0A.2 does not implement:

- Runtime Contract types or schemas;
- TypeBox, Ajv, Vitest, fast-check, or RFC 8785 dependencies;
- HTTP, SSE, WebSocket, SQLite, MCP, or Claude Code behavior;
- executable CLI commands or daemon lifecycle;
- Server domain modules, ActorHost components, or Graph;
- publication to an external package registry.

## 11. Completion boundary

Phase 0A is complete when the process-first workspace builds reproducibly, exposes only the intended Runtime Contracts root boundary, rejects forbidden dependency directions, and contains no Runtime Contract or runtime behavior.

The next independently reviewable deliverable is Phase 0B Runtime Contracts.
