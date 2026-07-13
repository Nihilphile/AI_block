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
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

Only the paths shown above are created or modified in Phase 0A.2. Future internal module directories are documented but are not created until their implementation phase has real files to own.

## 3. Architectural meaning

### 3.1 `apps/`

`apps/` contains independently launched programs:

- `runtime-server` is the authoritative local daemon and Server composition root.
- `actor-host` is the separate process representing one Actor.
- `runtime-cli` is a stateless Client of the Server API.

Applications are private workspace packages. They are not imported by other applications or shared packages.

### 3.2 `packages/runtime-contracts`

`@ai-block/runtime-contracts` is the only shared package created in Phase 0A. It is the future transport-neutral schema and value-type boundary consumed by all three applications.

Phase 0A.2 gives it an explicit root export and an empty compileable module. Brick, Package, Actor, Host Protocol, Run, error, validation, hashing, and compatibility definitions remain Phase 0B work.

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

## 5. Build shape

- The root `tsconfig.json` is a solution file referencing the four workspace units.
- Every unit extends `tsconfig.base.json`, uses `composite`, owns `src/`, and emits only to its local ignored `dist/` directory.
- Root scripts orchestrate recursive build, clean, and type-check operations without introducing another build system.
- Application entrypoints and the Runtime Contracts root are intentionally empty ESM modules in this phase. They prove compilation and package topology but perform no I/O and expose no product behavior.
- The three application manifests declare the Runtime Contracts workspace dependency so package-manager topology matches the future allowed dependency direction.

## 6. Boundary verification

Phase 0A.2 acceptance must prove:

1. all four units build under the pinned Node, pnpm, and TypeScript versions;
2. a frozen workspace install is reproducible and does not mutate versioned files;
3. each application can resolve the Runtime Contracts root after build;
4. a Runtime Contracts private/deep subpath is rejected;
5. no application can resolve another application as a dependency;
6. generated output stays local to ignored `dist/` directories and can be cleaned centrally;
7. the root contains no new product source files or catch-all configuration clutter;
8. no Contract schema, runtime validation, persistence, transport, process management, Claude adapter, Run, or Graph behavior exists.

Verification should use the existing TypeScript and package-manager toolchain. Phase 0A.2 adds no schema, testing, lint, bundling, or task-runner dependency.

## 7. Alternatives rejected

### Domain package per Server module

Creating separate workspace packages for Project, Actor, Package, Host Gateway, Run Engine, and Graph would make ownership visible but would fragment a deliberately modular-monolith Server, create premature public boundaries, and produce excessive configuration files.

### One root `src/` tree

Putting Server, Host, CLI, and Contracts under one root source directory would use fewer manifests, but would blur deployable-process boundaries and make invalid cross-process imports easy.

### Central configuration without package-local TypeScript projects

A single root compiler project would reduce local files, but it would weaken ownership, build isolation, and cross-package root enforcement. Three small files per workspace unit are accepted structural cost rather than clutter.

## 8. Non-goals

Phase 0A.2 does not implement:

- Runtime Contract types or schemas;
- TypeBox, Ajv, Vitest, fast-check, or RFC 8785 dependencies;
- HTTP, SSE, WebSocket, SQLite, MCP, or Claude Code behavior;
- executable CLI commands or daemon lifecycle;
- Server domain modules, ActorHost components, or Graph;
- publication to an external package registry.

## 9. Completion boundary

Phase 0A is complete when the process-first workspace builds reproducibly, exposes only the intended Runtime Contracts root boundary, rejects forbidden dependency directions, and contains no Runtime Contract or runtime behavior.

The next independently reviewable deliverable is Phase 0B Runtime Contracts.
