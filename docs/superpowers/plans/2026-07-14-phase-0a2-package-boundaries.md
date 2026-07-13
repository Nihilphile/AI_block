# Phase 0A.2 Process-First Package Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `F:/AI_project/AI_block` into a reproducible, compileable process-first pnpm workspace with three private application packages, one private Runtime Contracts root package, exact TypeScript project references, and executable boundary verification, without implementing Runtime Contracts or runtime behavior.

**Architecture:** Create one workspace application for each deployable process: `@ai-block/runtime-server`, `@ai-block/actor-host`, and `@ai-block/runtime-cli`. Create only `@ai-block/runtime-contracts` as a shared package; each application may consume its package root, while applications cannot import one another and Runtime Contracts cannot import application or infrastructure code. Use package-local composite TypeScript projects under a source-free root solution, with every unit emitting only to its own ignored `dist/` directory.

**Tech Stack:** Node.js `>=24 <25`, pnpm `11.10.0`, TypeScript `7.0.2`, `@types/node` `24.13.3`, ESM, `NodeNext`, `ES2023`, strict TypeScript, PowerShell, Git, and one Node.js ESM boundary-check script. No new dependency, build system, linter, test framework, schema library, or task runner is added.

## Global Constraints

- The authoritative design is `docs/superpowers/specs/2026-07-14-phase-0a2-package-boundaries-design.md`; the ADR, runtime architecture, runbook, and Phase 0A.1 plan are supporting sources in that priority order.
- The module begins with a read-only Coder preflight. The Coder may inspect files, versions, Git state, and source facts, but may not edit, scaffold, install, alter configuration, or run implementation commands before authorization.
- Every implementation task in this plan begins only after the controller sends an explicit `IMPLEMENTATION_AUTHORIZED` envelope containing resolved decisions, frozen scope, exact write scope, required verification, and acceptance criteria. The Coder must not simulate authorization with a shell variable or command.
- External execution prerequisite: the controller commits this revised plan separately before any Coder preflight. The Coder starts from a clean baseline `HEAD` that contains this plan; preflight captures the exact SHA as the named execution invariant `BASELINE_HEAD`. The controller carries that unchanged field through every delta authorization; intentional rebaseline requires a new controller decision and authorization.
- The same Coder is reused for Tasks 2–4 within this bounded workspace delivery. Each task still receives a delta preflight and a separate `IMPLEMENTATION_AUTHORIZED` envelope.
- The product Coder creates exactly one Phase 0A.2 product commit after complete Coder verification; the independent Tester runs against that committed product, and Tester PASS is required for controller acceptance. A failed Tester result returns to the same Coder and may receive a separately authorized remediation commit.
- A Tester is dispatched independently at the Phase 0A.2 module milestone after Coder work. A Reviewer is risk-based: the controller may dispatch one for the module milestone or for cross-boundary, security, scope-drift, or repeated-failure risk; a Reviewer is not mandatory after every task.
- Coder, Tester, and Reviewer have disjoint write scopes. The Tester and Reviewer do not edit production files, and no worker approves its own output.
- Existing `.gitignore`, `pnpm-workspace.yaml`, and `tsconfig.base.json` are preserved byte-for-byte. The current required contents are:

  ```text
  .gitignore
  node_modules/
  .pnpm-store/
  dist/
  coverage/
  *.tsbuildinfo
  .env
  .env.*
  !.env.example
  .DS_Store
  Thumbs.db
  ```

  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```

  ```json
  {"compilerOptions":{"target":"ES2023","module":"NodeNext","moduleResolution":"NodeNext","strict":true,"verbatimModuleSyntax":true,"noEmit":true,"skipLibCheck":true}}
  ```

- Supported versions are Node `>=24 <25`, pnpm `11.10.0`, TypeScript `7.0.2`, and `@types/node` `24.13.3`. Do not choose an unpinned latest version or install any other dependency.
- All workspace package names use the `@ai-block/` scope. The exact application identities are `@ai-block/runtime-server`, `@ai-block/actor-host`, and `@ai-block/runtime-cli`; the exact shared identity is `@ai-block/runtime-contracts`.
- Every application manifest has `private: true`, `type: "module"`, and only a `workspace:*` dependency on `@ai-block/runtime-contracts`. Applications omit `exports`, `main`, `types`, and `bin`; they are not importable libraries.
- Runtime Contracts is private, ESM-only, has top-level `types: "./dist/index.d.ts"`, exactly one `exports` entry for `.`, exactly `types: "./dist/index.d.ts"` and `import: "./dist/index.js"` conditions, no subpath export, and no CommonJS entry.
- `packages/runtime-contracts/src/index.ts` and each application `src/main.ts` contain exactly `export {};` and no other code. The Contracts source defines no Runtime Contract, schema, value type, validation, or behavior.
- The root `tsconfig.json` owns no source files. Its exact references are `packages/runtime-contracts`, `apps/runtime-server`, `apps/actor-host`, and `apps/runtime-cli`; each application references only Runtime Contracts, and Runtime Contracts references no application.
- Every local project extends `../../tsconfig.base.json`, sets `composite: true`, `rootDir: "src"`, `outDir: "dist"`, `declaration: true`, and `noEmit: false`; Runtime Contracts has no project reference, and each application has exactly one reference to `../../packages/runtime-contracts`.
- Do not create `apps/runtime-server/src/modules/`, `apps/runtime-server/src/infrastructure/`, `apps/actor-host/src/server-connection/`, `apps/actor-host/src/backend-supervisor/`, `apps/actor-host/src/backend-adapters/`, Graph directories, or generic `common`, `shared`, `core`, or `utils` directories. Future directories are created only when a later implementation phase has real files to own.
- Relative imports may not cross a workspace package root. Applications import Runtime Contracts only as `@ai-block/runtime-contracts`; deep imports, application-to-application package imports, application-to-application relative source imports, and Contracts-to-application/infrastructure imports are forbidden.
- `scripts/check-workspace-boundaries.mjs` is the single repository boundary checker. It compares the complete manifests and TypeScript projects, enforces the exact current source-tree contents and directory policy, verifies built artifacts, and runs real package/runtime/compiler probes. Its compile probes invoke `pnpm exec tsc --project <temporary-tsconfig> --noEmit --pretty false` through a cross-platform Node child process, and temporary ignored probe files are removed in `finally` blocks.
- Root scripts are exactly `build`, `clean`, `check:types`, `check:boundaries`, and `verify` as specified in Task 2. They use `tsc -b`, the Node.js checker, and the explicit acceptance sequence; no alternate build system is introduced.
- TypeScript clean is judged by absence of all emitted files and `.tsbuildinfo` files; empty ignored `dist/` directories are allowed, and no second cleanup script is created.
- `pnpm-lock.yaml` is regenerated by pnpm `11.10.0` after the four workspace manifests exist. There are four workspace importers and no new package snapshots; the existing toolchain package resolutions remain unchanged.
- Do not modify `.gitignore`, `pnpm-workspace.yaml`, or `tsconfig.base.json`; do not alter Git configuration or invent `user.name`/`user.email`. If identity is missing, report `NEEDS_CONTEXT` and stop before committing.
- The controller-owned plan file is outside the Coder write scope and is never staged by the product Coder. The controller commits this plan before Coder preflight, so the baseline `HEAD` already contains it. Final Git cleanliness means no product diff and no untracked non-ignored file.
- The boundary checker is invoked only through the root pnpm lifecycle script. It resolves `process.env.npm_execpath` once, requires a non-empty absolute file path, and invokes pnpm only through `spawnSync(process.execPath, [pnpmEntry, ...pnpmArgs], { cwd: root, encoding: "utf8", windowsHide: true, shell: false })`; direct `node scripts/check-workspace-boundaries.mjs` fails with a concise instruction to run `pnpm check:boundaries`.
- Negative probes are cause-specific. TypeScript failures must have normal status `1`, exactly the expected diagnostic count/code and path/message evidence; Node failures must have normal status `1` and the exact expected error code/message evidence. Launch errors, signals, missing statuses, status `42`, operational pnpm failures, and unrelated diagnostics are checker failures.
- Phase 0A.2 adds no Runtime Contract types or schemas, TypeBox, Ajv, `ajv-formats`, Vitest, fast-check, RFC 8785/JCS implementation, HTTP, SSE, WebSocket, SQLite, MCP, Claude adapter, CLI command, daemon lifecycle, Server module, ActorHost component, Run, Graph, persistence, transport, process management, or registry publication behavior.

### Architecture correction

Phase 0A.2 deliberately defers general JavaScript/TypeScript source-import enforcement to Phase 0B. Phase 0B must select a compiler- or parser-backed mechanism suitable for TypeScript 7 and must not extend a handwritten parser. This does not weaken Phase 0A.2: every actual product source is required to be the exact empty ESM module, while package topology, project references, `rootDir`, NodeNext resolution, package `exports`, and cause-specific compiler/runtime probes exercise the real boundary mechanisms.

---

## File Structure Map

All paths below are relative to `F:/AI_project/AI_block`.

### Create

| Path | Responsibility |
|---|---|
| `tsconfig.json` | Source-free root TypeScript solution referencing exactly the four workspace projects. |
| `apps/runtime-server/package.json` | Private ESM identity `@ai-block/runtime-server` and its `workspace:*` Runtime Contracts dependency; no export surface. |
| `apps/runtime-server/tsconfig.json` | Composite local project with `src` root, `dist` output, and the single Runtime Contracts reference. |
| `apps/runtime-server/src/main.ts` | Empty ESM application entrypoint; emits `dist/main.js`; performs no I/O. |
| `apps/actor-host/package.json` | Private ESM identity `@ai-block/actor-host` and its `workspace:*` Runtime Contracts dependency; no export surface. |
| `apps/actor-host/tsconfig.json` | Composite local project with `src` root, `dist` output, and the single Runtime Contracts reference. |
| `apps/actor-host/src/main.ts` | Empty ESM application entrypoint; emits `dist/main.js`; performs no I/O. |
| `apps/runtime-cli/package.json` | Private ESM identity `@ai-block/runtime-cli` and its `workspace:*` Runtime Contracts dependency; no export surface. |
| `apps/runtime-cli/tsconfig.json` | Composite local project with `src` root, `dist` output, and the single Runtime Contracts reference. |
| `apps/runtime-cli/src/main.ts` | Empty ESM application entrypoint; emits `dist/main.js`; performs no I/O. |
| `packages/runtime-contracts/package.json` | Private ESM identity `@ai-block/runtime-contracts`, top-level declaration entry, and the single public root export. |
| `packages/runtime-contracts/tsconfig.json` | Composite declaration-emitting local project with no project references. |
| `packages/runtime-contracts/src/index.ts` | Sole public entrypoint; exact empty ESM module until Phase 0B. |
| `scripts/check-workspace-boundaries.mjs` | Single exact-manifest, exact-project, exact-source-tree, directory-policy, artifact, toolchain, Git-cleanliness, and cause-specific positive/negative probe verifier. |

### Modify

| Path | Responsibility |
|---|---|
| `package.json` | Retain the pinned root identity/toolchain and add the exact build, clean, type-check, boundary-check, and verification scripts. |
| `pnpm-lock.yaml` | Regenerate the reproducible lockfile so it contains the root plus four workspace importers and workspace links to Runtime Contracts. |

### Preserve byte-for-byte

| Path | Responsibility |
|---|---|
| `.gitignore` | Existing ignored-output policy, including `dist/` and `*.tsbuildinfo`. |
| `pnpm-workspace.yaml` | Existing exact workspace membership `apps/*` and `packages/*`. |
| `tsconfig.base.json` | Existing strict NodeNext compiler baseline. |
| All existing files under `.codex/`, `docs/`, `openspec/`, and the root architecture/runbook Markdown files | Existing controller-owned and architecture evidence; no product task edits them. |

### Transient and never versioned

`node_modules/`, local `dist/` directories, `.tsbuildinfo` files, and checker probes under ignored `node_modules/.ai-block-boundaries-*` are generated only during verification and are removed or ignored. No `tests/` directory and no future internal module directory is created.

## Exact Interfaces and Configuration

### Root `package.json`

After Task 2, `package.json` must have exactly this JSON content (normal JSON whitespace is allowed only if the parsed object is identical):

```json
{
  "name": "ai-block",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.10.0",
  "engines": {
    "node": ">=24 <25",
    "pnpm": "11.10.0"
  },
  "scripts": {
    "build": "tsc -b tsconfig.json",
    "clean": "tsc -b tsconfig.json --clean",
    "check:types": "tsc -b tsconfig.json --pretty false",
    "check:boundaries": "node scripts/check-workspace-boundaries.mjs",
    "verify": "pnpm install --frozen-lockfile && git diff --exit-code && pnpm build && pnpm check:boundaries && pnpm clean && pnpm check:boundaries -- --git-clean && git diff --exit-code"
  },
  "devDependencies": {
    "@types/node": "24.13.3",
    "typescript": "7.0.2"
  }
}
```

### Application manifests

Each application manifest has exactly this shape, with the indicated `name`:

```json
{
  "name": "@ai-block/runtime-server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@ai-block/runtime-contracts": "workspace:*"
  }
}
```

Use the same content for `apps/actor-host/package.json` after changing `name` to `@ai-block/actor-host`, and for `apps/runtime-cli/package.json` after changing `name` to `@ai-block/runtime-cli`. Do not add `exports`, `main`, `types`, `bin`, devDependencies, or any other dependency.

### Runtime Contracts manifest

`packages/runtime-contracts/package.json` must be exactly:

```json
{
  "name": "@ai-block/runtime-contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

The manifest intentionally has no `main`, `require`, CommonJS condition, subpath export, dependency, or `bin` field.

### TypeScript project files

The root solution `tsconfig.json` must be exactly:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/runtime-contracts" },
    { "path": "./apps/runtime-server" },
    { "path": "./apps/actor-host" },
    { "path": "./apps/runtime-cli" }
  ]
}
```

Each application `tsconfig.json` must be exactly this shape, with the shown Runtime Contracts reference:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist",
    "noEmit": false
  },
  "include": ["src/**/*.ts"],
  "references": [
    { "path": "../../packages/runtime-contracts" }
  ]
}
```

`packages/runtime-contracts/tsconfig.json` must be exactly:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist",
    "noEmit": false
  },
  "include": ["src/**/*.ts"]
}
```

The exact project-reference graph is therefore:

```text
root tsconfig.json
├── packages/runtime-contracts/tsconfig.json
├── apps/runtime-server/tsconfig.json ──→ packages/runtime-contracts/tsconfig.json
├── apps/actor-host/tsconfig.json ─────→ packages/runtime-contracts/tsconfig.json
└── apps/runtime-cli/tsconfig.json ────→ packages/runtime-contracts/tsconfig.json
```

### Empty source modules

All four source files must contain exactly one line:

```ts
export {};
```

This makes each file an ESM module while exposing no Runtime Contract and performing no product work.

### Lockfile importer result

Run pnpm to generate the lockfile; do not hand-edit package snapshots. With pnpm `11.10.0`, the `importers:` section must contain the existing root importer plus these exact four workspace importers, and the `packages:` and `snapshots:` sections must remain the existing toolchain graph:

```yaml
  apps/actor-host:
    dependencies:
      '@ai-block/runtime-contracts':
        specifier: workspace:*
        version: link:../../packages/runtime-contracts

  apps/runtime-cli:
    dependencies:
      '@ai-block/runtime-contracts':
        specifier: workspace:*
        version: link:../../packages/runtime-contracts

  apps/runtime-server:
    dependencies:
      '@ai-block/runtime-contracts':
        specifier: workspace:*
        version: link:../../packages/runtime-contracts

  packages/runtime-contracts: {}
```

The root importer remains the current pinned `@types/node` `24.13.3` and TypeScript `7.0.2` importer. A lockfile diff containing a registry package addition, changed integrity, or changed toolchain snapshot is a failure.

---

## Task 1: Complete the module read-only Coder preflight

**Files:**
- Read: `F:/AI_project/AI_block/docs/superpowers/specs/2026-07-14-phase-0a2-package-boundaries-design.md`
- Read: `F:/AI_project/AI_block/docs/adr/0002-phase-0-workspace-and-contract-policy.md`
- Read: `F:/AI_project/AI_block/runtime-module-architecture-v0.1.md`
- Read: `F:/AI_project/AI_block/development-orchestration-runbook-v0.1.md`
- Read: `F:/AI_project/AI_block/docs/superpowers/plans/2026-07-13-phase-0a1-root-workspace.md`
- Read: all current workspace files and Git metadata; modify nothing.

**Interfaces:**
- Consumes: the controller's bounded Phase 0A.2 task and the repository at `F:/AI_project/AI_block`.
- Produces: a `Preflight Report` with boundary restatement, ownership, implicit decisions, missing decisions, external gaps, assumptions, implementation/test approach, risks, and `READY_FOR_DECISION`.

- [ ] **Step 1: Confirm the Coder is in read-only preflight mode.** Do not run an install, build, generator, formatter, patch, or configuration command. The report must state `Preflight mode: analysis-only; no edits or implementation commands executed.`

- [ ] **Step 2: Confirm the current root and repository state.**

  Run in PowerShell:

  ```powershell
  if ((Resolve-Path -LiteralPath .).Path -ne 'F:\AI_project\AI_block') { throw 'Unexpected workspace root' }
  $status=@(git status --porcelain=v1 --untracked-files=all)
  if ($status.Count -ne 0) { $status; throw 'Coder baseline worktree is not clean' }
  $baseline=(git rev-parse HEAD).Trim()
  if ([string]::IsNullOrWhiteSpace($baseline)) { throw 'Cannot capture baseline HEAD' }
  git cat-file -e ("{0}:docs/superpowers/plans/2026-07-14-phase-0a2-package-boundaries.md" -f $baseline)
  if ($LASTEXITCODE -ne 0) { throw 'Controller-revised plan is not present in baseline HEAD' }
  git branch --show-current
  "BASELINE_HEAD=$baseline"
  ```

  Expected: root `F:\AI_project\AI_block`; an empty status; current branch `main`; and one `BASELINE_HEAD=<40-hex-SHA>` line proving the controller-revised plan is in the clean baseline. Record that exact SHA in the Preflight Report and carry it unchanged as `BASELINE_HEAD` through every later task authorization. Do not assert an absolute repository commit count.

- [ ] **Step 3: Confirm the read-only toolchain facts.**

  Run:

  ```powershell
  node --version
  pnpm --version
  if ((node --version).Trim() -ne 'v24.14.1') { throw 'Unexpected current Node fact; resolve with controller before implementation' }
  if ((pnpm --version).Trim() -ne '11.10.0') { throw 'pnpm must be 11.10.0' }
  ```

  Expected current facts: `v24.14.1` and `11.10.0`. The implementation constraint remains the range `>=24 <25`, not a hard-coded patch version.

- [ ] **Step 4: Report the complete proposed write scope and the deferred paths.** The report must name every Create/Modify path in the File Structure Map, state that `.gitignore`, `pnpm-workspace.yaml`, and `tsconfig.base.json` are preserved byte-for-byte, and state that future Server/ActorHost internal directories and all Runtime Contract/runtime behavior are deferred.

- [ ] **Step 5: Return `READY_FOR_DECISION` and wait for the controller's explicit `IMPLEMENTATION_AUTHORIZED` envelope.** Include the exact `BASELINE_HEAD` value in the report. Every later delta authorization must repeat that same value; if a later current `HEAD` differs, return `BLOCKED` and do not rebaseline. If a material conflict or missing decision is discovered, return `NEEDS_CONTEXT` with the exact file/decision and do not proceed. No design decision is unresolved in the approved sources; the exact package identities and configuration in this plan are the frozen decisions for Tasks 2–4.

## Task 2: Create the process-first workspace tree and exact package/compiler files

**Files:**
- Create: `F:/AI_project/AI_block/tsconfig.json`
- Create: `F:/AI_project/AI_block/apps/runtime-server/package.json`
- Create: `F:/AI_project/AI_block/apps/runtime-server/tsconfig.json`
- Create: `F:/AI_project/AI_block/apps/runtime-server/src/main.ts`
- Create: `F:/AI_project/AI_block/apps/actor-host/package.json`
- Create: `F:/AI_project/AI_block/apps/actor-host/tsconfig.json`
- Create: `F:/AI_project/AI_block/apps/actor-host/src/main.ts`
- Create: `F:/AI_project/AI_block/apps/runtime-cli/package.json`
- Create: `F:/AI_project/AI_block/apps/runtime-cli/tsconfig.json`
- Create: `F:/AI_project/AI_block/apps/runtime-cli/src/main.ts`
- Create: `F:/AI_project/AI_block/packages/runtime-contracts/package.json`
- Create: `F:/AI_project/AI_block/packages/runtime-contracts/tsconfig.json`
- Create: `F:/AI_project/AI_block/packages/runtime-contracts/src/index.ts`
- Modify: `F:/AI_project/AI_block/package.json`
- Preserve: `F:/AI_project/AI_block/.gitignore`, `F:/AI_project/AI_block/pnpm-workspace.yaml`, and `F:/AI_project/AI_block/tsconfig.base.json` byte-for-byte.

**Interfaces:**
- Consumes: Task 1's `IMPLEMENTATION_AUTHORIZED` envelope and the exact JSON/YAML/TypeScript contents in the Exact Interfaces and Configuration section.
- Produces: four compileable local TypeScript projects with no future empty module directories and manifests that encode only the approved dependency direction.

- [ ] **Step 1: Perform the delta preflight for this task and obtain a new `IMPLEMENTATION_AUTHORIZED` envelope.** Re-read only the assigned files, confirm that `$BASELINE_HEAD` is present in the envelope, and run `if ((git rev-parse HEAD).Trim() -cne $BASELINE_HEAD) { 'BLOCKED: baseline HEAD changed'; exit 2 }`. Confirm that no other worker has changed the assigned files. Do not edit until the controller authorizes this exact write scope; do not recapture or redefine `BASELINE_HEAD`.

- [ ] **Step 2: Create the directories and files with `apply_patch` using this complete patch.** Do not create `modules`, `infrastructure`, ActorHost component directories, `tests`, or any generic catch-all directory.

  ```diff
  *** Begin Patch
  *** Update File: package.json
  @@
  -{"name":"ai-block","version":"0.0.0","private":true,"type":"module","packageManager":"pnpm@11.10.0","engines":{"node":">=24 <25","pnpm":"11.10.0"},"devDependencies":{"@types/node":"24.13.3","typescript":"7.0.2"}}
  +{
  +  "name": "ai-block",
  +  "version": "0.0.0",
  +  "private": true,
  +  "type": "module",
  +  "packageManager": "pnpm@11.10.0",
  +  "engines": {
  +    "node": ">=24 <25",
  +    "pnpm": "11.10.0"
  +  },
  +  "scripts": {
  +    "build": "tsc -b tsconfig.json",
  +    "clean": "tsc -b tsconfig.json --clean",
  +    "check:types": "tsc -b tsconfig.json --pretty false",
  +    "check:boundaries": "node scripts/check-workspace-boundaries.mjs",
  +    "verify": "pnpm install --frozen-lockfile && git diff --exit-code && pnpm build && pnpm check:boundaries && pnpm clean && pnpm check:boundaries -- --git-clean && git diff --exit-code"
  +  },
  +  "devDependencies": {
  +    "@types/node": "24.13.3",
  +    "typescript": "7.0.2"
  +  }
  +}
  *** Add File: tsconfig.json
  +{
  +  "files": [],
  +  "references": [
  +    { "path": "./packages/runtime-contracts" },
  +    { "path": "./apps/runtime-server" },
  +    { "path": "./apps/actor-host" },
  +    { "path": "./apps/runtime-cli" }
  +  ]
  +}
  *** Add File: apps/runtime-server/package.json
  +{
  +  "name": "@ai-block/runtime-server",
  +  "version": "0.0.0",
  +  "private": true,
  +  "type": "module",
  +  "dependencies": {
  +    "@ai-block/runtime-contracts": "workspace:*"
  +  }
  +}
  *** Add File: apps/runtime-server/tsconfig.json
  +{
  +  "extends": "../../tsconfig.base.json",
  +  "compilerOptions": {
  +    "composite": true,
  +    "declaration": true,
  +    "rootDir": "src",
  +    "outDir": "dist",
  +    "noEmit": false
  +  },
  +  "include": ["src/**/*.ts"],
  +  "references": [
  +    { "path": "../../packages/runtime-contracts" }
  +  ]
  +}
  *** Add File: apps/runtime-server/src/main.ts
  +export {};
  *** Add File: apps/actor-host/package.json
  +{
  +  "name": "@ai-block/actor-host",
  +  "version": "0.0.0",
  +  "private": true,
  +  "type": "module",
  +  "dependencies": {
  +    "@ai-block/runtime-contracts": "workspace:*"
  +  }
  +}
  *** Add File: apps/actor-host/tsconfig.json
  +{
  +  "extends": "../../tsconfig.base.json",
  +  "compilerOptions": {
  +    "composite": true,
  +    "declaration": true,
  +    "rootDir": "src",
  +    "outDir": "dist",
  +    "noEmit": false
  +  },
  +  "include": ["src/**/*.ts"],
  +  "references": [
  +    { "path": "../../packages/runtime-contracts" }
  +  ]
  +}
  *** Add File: apps/actor-host/src/main.ts
  +export {};
  *** Add File: apps/runtime-cli/package.json
  +{
  +  "name": "@ai-block/runtime-cli",
  +  "version": "0.0.0",
  +  "private": true,
  +  "type": "module",
  +  "dependencies": {
  +    "@ai-block/runtime-contracts": "workspace:*"
  +  }
  +}
  *** Add File: apps/runtime-cli/tsconfig.json
  +{
  +  "extends": "../../tsconfig.base.json",
  +  "compilerOptions": {
  +    "composite": true,
  +    "declaration": true,
  +    "rootDir": "src",
  +    "outDir": "dist",
  +    "noEmit": false
  +  },
  +  "include": ["src/**/*.ts"],
  +  "references": [
  +    { "path": "../../packages/runtime-contracts" }
  +  ]
  +}
  *** Add File: apps/runtime-cli/src/main.ts
  +export {};
  *** Add File: packages/runtime-contracts/package.json
  +{
  +  "name": "@ai-block/runtime-contracts",
  +  "version": "0.0.0",
  +  "private": true,
  +  "type": "module",
  +  "types": "./dist/index.d.ts",
  +  "exports": {
  +    ".": {
  +      "types": "./dist/index.d.ts",
  +      "import": "./dist/index.js"
  +    }
  +  }
  +}
  *** Add File: packages/runtime-contracts/tsconfig.json
  +{
  +  "extends": "../../tsconfig.base.json",
  +  "compilerOptions": {
  +    "composite": true,
  +    "declaration": true,
  +    "rootDir": "src",
  +    "outDir": "dist",
  +    "noEmit": false
  +  },
  +  "include": ["src/**/*.ts"]
  +}
  *** Add File: packages/runtime-contracts/src/index.ts
  +export {};
  *** End Patch
  ```

- [ ] **Step 3: Verify the root files that were required to remain unchanged.**

  Run:

  ```powershell
  git diff --exit-code -- .gitignore pnpm-workspace.yaml tsconfig.base.json
  if ($LASTEXITCODE -ne 0) { throw 'Preserved root file changed' }
  'PASS: .gitignore, pnpm-workspace.yaml, and tsconfig.base.json are byte-for-byte unchanged'
  ```

  Expected exact output: `PASS: .gitignore, pnpm-workspace.yaml, and tsconfig.base.json are byte-for-byte unchanged`.

- [ ] **Step 4: Validate every manifest by complete canonical parsed-object comparison.** This is an exact check, not a selected-field check: canonicalization sorts object keys recursively, arrays remain ordered, and any extra/missing/altered key fails.

  Run:

  ```powershell
  @'
  import { readFileSync } from "node:fs";

  const canonical = (value) => Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
      : value;
  const exact = (path, expected) => {
    const actual = JSON.parse(readFileSync(path, "utf8"));
    if (JSON.stringify(canonical(actual)) !== JSON.stringify(canonical(expected))) throw new Error(`Complete object mismatch: ${path}`);
  };
  exact("package.json", {
    name: "ai-block",
    version: "0.0.0",
    private: true,
    type: "module",
    packageManager: "pnpm@11.10.0",
    engines: { node: ">=24 <25", pnpm: "11.10.0" },
    scripts: {
      build: "tsc -b tsconfig.json",
      clean: "tsc -b tsconfig.json --clean",
      "check:types": "tsc -b tsconfig.json --pretty false",
      "check:boundaries": "node scripts/check-workspace-boundaries.mjs",
      verify: "pnpm install --frozen-lockfile && git diff --exit-code && pnpm build && pnpm check:boundaries && pnpm clean && pnpm check:boundaries -- --git-clean && git diff --exit-code"
    },
    devDependencies: { "@types/node": "24.13.3", typescript: "7.0.2" }
  });
  for (const [path, name] of [
    ["apps/runtime-server/package.json", "@ai-block/runtime-server"],
    ["apps/actor-host/package.json", "@ai-block/actor-host"],
    ["apps/runtime-cli/package.json", "@ai-block/runtime-cli"]
  ]) exact(path, {
    name,
    version: "0.0.0",
    private: true,
    type: "module",
    dependencies: { "@ai-block/runtime-contracts": "workspace:*" }
  });
  exact("packages/runtime-contracts/package.json", {
    name: "@ai-block/runtime-contracts",
    version: "0.0.0",
    private: true,
    type: "module",
    types: "./dist/index.d.ts",
    exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } }
  });
  console.log("PASS: root, application, and Runtime Contracts manifests are complete exact objects");
  '@ | node --input-type=module
  if ($LASTEXITCODE -ne 0) { throw 'Complete manifest comparison failed' }
  ```

  Expected exact output: `PASS: root, application, and Runtime Contracts manifests are complete exact objects`.

- [ ] **Step 5: Validate the root solution and every unit tsconfig by complete canonical parsed-object comparison.** This exact check rejects extra tsconfig keys, altered `rootDir`/`outDir`/`composite`/`declaration`/`noEmit` values, altered includes, and altered or extra references.

  Run:

  ```powershell
  @'
  import { readFileSync } from "node:fs";

  const canonical = (value) => Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
      : value;
  const exact = (path, expected) => {
    const actual = JSON.parse(readFileSync(path, "utf8"));
    if (JSON.stringify(canonical(actual)) !== JSON.stringify(canonical(expected))) throw new Error(`Complete object mismatch: ${path}`);
  };
  exact("tsconfig.json", {
    files: [],
    references: [
      { path: "./packages/runtime-contracts" },
      { path: "./apps/runtime-server" },
      { path: "./apps/actor-host" },
      { path: "./apps/runtime-cli" }
    ]
  });
  const compilerOptions = { composite: true, declaration: true, rootDir: "src", outDir: "dist", noEmit: false };
  exact("packages/runtime-contracts/tsconfig.json", {
    extends: "../../tsconfig.base.json",
    compilerOptions,
    include: ["src/**/*.ts"]
  });
  for (const path of ["apps/runtime-server/tsconfig.json", "apps/actor-host/tsconfig.json", "apps/runtime-cli/tsconfig.json"]) exact(path, {
    extends: "../../tsconfig.base.json",
    compilerOptions,
    include: ["src/**/*.ts"],
    references: [{ path: "../../packages/runtime-contracts" }]
  });
  console.log("PASS: root solution and all local TypeScript projects are complete exact objects");
  '@ | node --input-type=module
  if ($LASTEXITCODE -ne 0) { throw 'Complete tsconfig comparison failed' }
  ```

  Expected exact output: `PASS: root solution and all local TypeScript projects are complete exact objects`.

- [ ] **Step 6: Confirm the source modules are empty ESM modules and no future directory was created.**

  Run:

  ```powershell
  $expected="export {};`n"
  $authorized=@{
    'packages/runtime-contracts/src'='index.ts'
    'apps/runtime-server/src'='main.ts'
    'apps/actor-host/src'='main.ts'
    'apps/runtime-cli/src'='main.ts'
  }
  foreach($path in $authorized.Keys) {
    $entries=@(Get-ChildItem -LiteralPath $path -Force)
    if ($entries.Count -ne 1) { throw "Source root must contain exactly one entry: $path" }
    if ($entries[0].PSIsContainer -or $entries[0].Name -cne $authorized[$path]) { throw "Source root must contain exactly $($authorized[$path]) and no subdirectory: $path" }
    $file=Join-Path $path $authorized[$path]
    if ((Get-Content -Raw -LiteralPath $file) -cne $expected) { throw "Non-empty Phase 0A.2 source: $file" }
  }
  $forbidden=@('common','shared','core','utils')
  $found=@(Get-ChildItem -LiteralPath 'apps','packages','scripts' -Directory -Recurse -Force | Where-Object { $_.FullName -notmatch '\\node_modules(\\|$)' -and $_.FullName -notmatch '\\dist(\\|$)' -and $forbidden -contains $_.Name })
  if ($found.Count -ne 0) { $found.FullName; throw 'Deferred or catch-all directory exists' }
  'PASS: each A.2 src root contains exactly its authorized empty ESM module; catch-all directories are absent'
  ```

  Expected exact output: `PASS: each A.2 src root contains exactly its authorized empty ESM module; catch-all directories are absent`.

## Task 3: Regenerate the lockfile and prove workspace install topology

**Files:**
- Modify: `F:/AI_project/AI_block/pnpm-lock.yaml` through pnpm `11.10.0` only.
- Read: all five workspace manifests and root toolchain files.
- Transient: ignored `F:/AI_project/AI_block/node_modules/`.

**Interfaces:**
- Consumes: Task 2's four manifests, exact package identities, and pinned root toolchain.
- Produces: a lockfile with exactly the root importer plus the three application importers and the Runtime Contracts importer, with no new registry dependency.

- [ ] **Step 1: Perform the delta preflight and obtain a new `IMPLEMENTATION_AUTHORIZED` envelope for the lockfile/install write scope.** Confirm the unchanged `BASELINE_HEAD` field and run `if ((git rev-parse HEAD).Trim() -cne $BASELINE_HEAD) { 'BLOCKED: baseline HEAD changed'; exit 2 }`. Confirm that only the expected Task 2 paths are changed and that `.gitignore`, `pnpm-workspace.yaml`, and `tsconfig.base.json` remain unchanged; do not recapture or redefine the baseline.

- [ ] **Step 2: Regenerate only the lockfile from the manifests.**

  Run:

  ```powershell
  pnpm install --lockfile-only
  if ($LASTEXITCODE -ne 0) { throw 'Lockfile generation failed' }
  ```

  Expected: exit code `0`; `pnpm-lock.yaml` contains the four exact workspace importer entries shown in the Lockfile importer result, and no package/snapshot resolution outside the existing pinned toolchain.

- [ ] **Step 3: Compare the complete lockfile structure against the pre-change committed lockfile without adding a YAML dependency.** The controller-revised plan is already committed at baseline `HEAD`, while `pnpm-lock.yaml` is still the pre-change lockfile. Use this exact built-in Node/PowerShell comparison; it parses the deterministic top-level pnpm lockfile sections by indentation and compares every line outside `importers:` byte-for-byte, then compares the complete expected importer block byte-for-byte. This rejects extra/stale importers and any package, snapshot, registry, resolution, or integrity change.

  Run:

  ```powershell
  @'
  import { execFileSync } from "node:child_process";
  import { readFileSync } from "node:fs";

  const git = process.platform === "win32" ? "git.exe" : "git";
  const before = execFileSync(git, ["show", "HEAD:pnpm-lock.yaml"], { encoding: "utf8" });
  const after = readFileSync("pnpm-lock.yaml", "utf8");
  const normalize = (value) => value.replaceAll("\r\n", "\n").trimEnd() + "\n";
  const lines = (value) => normalize(value).split("\n");

  function section(value, startName, endName) {
    const rows = lines(value);
    const start = rows.findIndex((row) => row === `${startName}:`);
    const end = endName === undefined ? rows.length : rows.findIndex((row, index) => index > start && row === `${endName}:`);
    if (start < 0 || (endName !== undefined && end < 0)) throw new Error(`Missing lockfile section ${startName}/${endName}`);
    return rows.slice(start, end < 0 ? rows.length : end).join("\n") + "\n";
  }

  function outsideImporters(value) {
    const rows = lines(value);
    const importers = rows.findIndex((row) => row === "importers:");
    const packages = rows.findIndex((row, index) => index > importers && row === "packages:");
    if (importers < 0 || packages < 0) throw new Error("Lockfile must contain importers and packages sections");
    return rows.slice(0, importers).concat(rows.slice(packages)).join("\n") + "\n";
  }

  const expectedImporters = `importers:

    .:
      devDependencies:
        '@types/node':
          specifier: 24.13.3
          version: 24.13.3
        typescript:
          specifier: 7.0.2
          version: 7.0.2

    apps/actor-host:
      dependencies:
        '@ai-block/runtime-contracts':
          specifier: workspace:*
          version: link:../../packages/runtime-contracts

    apps/runtime-cli:
      dependencies:
        '@ai-block/runtime-contracts':
          specifier: workspace:*
          version: link:../../packages/runtime-contracts

    apps/runtime-server:
      dependencies:
        '@ai-block/runtime-contracts':
          specifier: workspace:*
          version: link:../../packages/runtime-contracts

    packages/runtime-contracts: {}`;

  if (normalize(section(after, "importers", "packages")) !== normalize(expectedImporters)) throw new Error("Exact importer keys or dependency/link shape mismatch");
  if (normalize(outsideImporters(before)) !== normalize(outsideImporters(after))) throw new Error("Lockfile changed outside importers: packages/snapshots/registry/resolution/integrity/settings mismatch");
  console.log("PASS: complete lockfile structure is unchanged outside the four exact workspace importers");
  '@ | node --input-type=module
  if ($LASTEXITCODE -ne 0) { throw 'Structural lockfile comparison failed' }
  ```

  Expected exact output: `PASS: complete lockfile structure is unchanged outside the four exact workspace importers`.

- [ ] **Step 4: Run a frozen install and prove it leaves the lockfile byte-for-byte unchanged.**

  Run:

  ```powershell
  $before=(Get-FileHash -Algorithm SHA256 -LiteralPath 'pnpm-lock.yaml').Hash
  pnpm install --frozen-lockfile
  if ($LASTEXITCODE -ne 0) { throw 'Frozen install failed' }
  $after=(Get-FileHash -Algorithm SHA256 -LiteralPath 'pnpm-lock.yaml').Hash
  if ($before -cne $after) { throw 'Frozen install changed pnpm-lock.yaml' }
  if (-not (Test-Path -LiteralPath 'node_modules' -PathType Container)) { throw 'node_modules missing after install' }
  if ((git check-ignore --quiet -- node_modules; $LASTEXITCODE) -ne 0) { throw 'node_modules is not ignored' }
  'PASS: frozen install succeeded and preserved pnpm-lock.yaml byte-for-byte'
  ```

  Expected exact output: `PASS: frozen install succeeded and preserved pnpm-lock.yaml byte-for-byte`.

- [ ] **Step 5: Confirm the pinned compiler and dependency manifest without using a dependency-list heuristic.** Run `pnpm exec tsc --version`; expected exact output `Version 7.0.2`. Run `node -e "const fs=require('node:fs'); const p=JSON.parse(fs.readFileSync('package.json','utf8')); if(JSON.stringify(p.devDependencies)!==JSON.stringify({'@types/node':'24.13.3',typescript:'7.0.2'})) process.exit(1); console.log('PASS: only the two pinned root toolchain dependencies are declared')"`; expected exact output `PASS: only the two pinned root toolchain dependencies are declared`. No TypeBox, Ajv, Vitest, fast-check, RFC 8785/JCS, or runtime dependency is declared.

## Task 4: Add the single actual workspace-boundary checker

**Files:**
- Create: `F:/AI_project/AI_block/scripts/check-workspace-boundaries.mjs`.
- Read: root/package manifests, all local `tsconfig.json` files, the four exact source entry files and their source-root entries, built `dist/` artifacts, Git status in `--git-clean` mode, and the pinned TypeScript CLI through `pnpm exec tsc`.
- Transient: probe files under ignored `node_modules/.ai-block-boundaries-*`; always remove them synchronously in `finally`.

**Interfaces:**
- Consumes: Task 2's exact manifests, exact empty source modules, project references, and Task 3's installed pinned TypeScript/runtime package links.
- Produces: exit code `0` and the normal PASS line only when the complete topology, exact source tree, directory rules, artifacts, tool versions, positive imports, and cause-specific negative probes pass. `--git-clean` mode produces its own PASS line only for an empty porcelain status. Any mismatch exits `1` with captured process output and concrete failure messages.

- [ ] **Step 1: Perform the delta preflight and obtain a new `IMPLEMENTATION_AUTHORIZED` envelope for the checker file only.** Confirm the unchanged `BASELINE_HEAD` field and run `if ((git rev-parse HEAD).Trim() -cne $BASELINE_HEAD) { 'BLOCKED: baseline HEAD changed'; exit 2 }`. Confirm that this task writes only `scripts/check-workspace-boundaries.mjs`; the checker may create and remove only ignored temporary probe files during execution. Do not recapture or redefine the baseline.

- [ ] **Step 2: Create `scripts/check-workspace-boundaries.mjs` with this complete implementation using `apply_patch`.**

  ```js
  import { spawnSync } from "node:child_process";
  import { fileURLToPath } from "node:url";
  import {
    existsSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
    writeFileSync
  } from "node:fs";
  import { dirname, isAbsolute, join, relative, resolve } from "node:path";

  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const pnpmEntry = process.env.npm_execpath ?? "";
  if (pnpmEntry.length === 0 || !isAbsolute(pnpmEntry)) {
    console.error("BOUNDARY CHECK FAILED: run this checker through `pnpm check:boundaries` so npm_execpath is an absolute pnpm entry file.");
    process.exit(1);
  }
  try {
    if (!statSync(pnpmEntry).isFile()) throw new Error("npm_execpath is not a file");
  } catch {
    console.error("BOUNDARY CHECK FAILED: run this checker through `pnpm check:boundaries` so npm_execpath points to a readable pnpm entry file.");
    process.exit(1);
  }

  const checkerArgs = process.argv.slice(2);
  if (checkerArgs.length > 1 || (checkerArgs.length === 1 && checkerArgs[0] !== "--git-clean")) {
    console.error("BOUNDARY CHECK FAILED: supported invocation is `pnpm check:boundaries` with optional `-- --git-clean`.");
    process.exit(1);
  }
  const gitCleanMode = checkerArgs[0] === "--git-clean";
  const contractName = "@ai-block/runtime-contracts";
  const appNames = [
    "@ai-block/runtime-server",
    "@ai-block/actor-host",
    "@ai-block/runtime-cli"
  ];
  const contracts = {
    kind: "contracts",
    name: contractName,
    dir: join(root, "packages", "runtime-contracts")
  };
  const apps = [
    { kind: "app", name: "@ai-block/runtime-server", dir: join(root, "apps", "runtime-server") },
    { kind: "app", name: "@ai-block/actor-host", dir: join(root, "apps", "actor-host") },
    { kind: "app", name: "@ai-block/runtime-cli", dir: join(root, "apps", "runtime-cli") }
  ];
  const units = [...apps, contracts];
  const failures = [];

  function fail(message) {
    failures.push(message);
  }

  function check(condition, message) {
    if (!condition) fail(message);
  }

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
    return value;
  }

  function same(left, right) {
    return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
  }

  function readJson(path) {
    try {
      return JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      fail(`cannot read JSON ${path}: ${error.message}`);
      return {};
    }
  }

  function readText(path) {
    try {
      return readFileSync(path, "utf8");
    } catch (error) {
      fail(`cannot read text ${path}: ${error.message}`);
      return "";
    }
  }

  function directories(path) {
    if (!existsSync(path)) return [];
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  }

  function checkManifestShape() {
    const expectedRoot = {
      name: "ai-block",
      version: "0.0.0",
      private: true,
      type: "module",
      packageManager: "pnpm@11.10.0",
      engines: { node: ">=24 <25", pnpm: "11.10.0" },
      scripts: {
        build: "tsc -b tsconfig.json",
        clean: "tsc -b tsconfig.json --clean",
        "check:types": "tsc -b tsconfig.json --pretty false",
        "check:boundaries": "node scripts/check-workspace-boundaries.mjs",
        verify: "pnpm install --frozen-lockfile && git diff --exit-code && pnpm build && pnpm check:boundaries && pnpm clean && pnpm check:boundaries -- --git-clean && git diff --exit-code"
      },
      devDependencies: { "@types/node": "24.13.3", typescript: "7.0.2" }
    };
    check(same(readJson(join(root, "package.json")), expectedRoot), "root package manifest has extra, missing, or altered fields");

    for (const app of apps) {
      const expected = {
        name: app.name,
        version: "0.0.0",
        private: true,
        type: "module",
        dependencies: { [contractName]: "workspace:*" }
      };
      check(same(readJson(join(app.dir, "package.json")), expected), `${app.dir}: complete application manifest mismatch`);
    }

    const expectedContracts = {
      name: contractName,
      version: "0.0.0",
      private: true,
      type: "module",
      types: "./dist/index.d.ts",
      exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } }
    };
    check(same(readJson(join(contracts.dir, "package.json")), expectedContracts), "Runtime Contracts complete manifest mismatch");
  }

  function checkDirectories() {
    check(same(directories(join(root, "apps")), ["actor-host", "runtime-cli", "runtime-server"]), "apps directory policy mismatch");
    check(same(directories(join(root, "packages")), ["runtime-contracts"]), "packages directory policy mismatch");
    const authorizedSourceFiles = new Map([
      [contracts, "index.ts"],
      [apps[0], "main.ts"],
      [apps[1], "main.ts"],
      [apps[2], "main.ts"]
    ]);
    for (const unit of units) {
      const owned = directories(unit.dir).filter((name) => name !== "dist" && name !== "node_modules");
      check(same(owned, ["src"]), `${unit.dir}: unexpected owned directory`);
      const sourceRoot = join(unit.dir, "src");
      const entries = existsSync(sourceRoot) ? readdirSync(sourceRoot, { withFileTypes: true }) : [];
      const expectedFile = authorizedSourceFiles.get(unit);
      check(entries.length === 1 && entries[0].isFile() && entries[0].name === expectedFile, `${sourceRoot} must contain exactly ${expectedFile} and no subdirectory`);
    }
    const forbiddenCatchAll = new Set(["common", "shared", "core", "utils"]);
    for (const tree of [join(root, "apps"), join(root, "packages"), join(root, "scripts")]) {
      const pending = [tree];
      while (pending.length > 0) {
        const current = pending.pop();
        for (const entry of readdirSync(current, { withFileTypes: true })) {
          if (!entry.isDirectory() || entry.name === "node_modules" || entry.name === "dist") continue;
          const child = join(current, entry.name);
          check(!forbiddenCatchAll.has(entry.name), `${child}: generic catch-all directory is forbidden`);
          pending.push(child);
        }
      }
    }
  }

  function checkTsGraph() {
    const compilerOptions = { composite: true, declaration: true, rootDir: "src", outDir: "dist", noEmit: false };
    const expectedRoot = {
      files: [],
      references: [
        { path: "./packages/runtime-contracts" },
        { path: "./apps/runtime-server" },
        { path: "./apps/actor-host" },
        { path: "./apps/runtime-cli" }
      ]
    };
    check(same(readJson(join(root, "tsconfig.json")), expectedRoot), "complete root TypeScript solution mismatch");
    for (const unit of units) {
      const expected = {
        extends: "../../tsconfig.base.json",
        compilerOptions,
        include: ["src/**/*.ts"],
        ...(unit.kind === "app" ? { references: [{ path: "../../packages/runtime-contracts" }] } : {})
      };
      check(same(readJson(join(unit.dir, "tsconfig.json")), expected), `${unit.dir}: complete local TypeScript project mismatch`);
    }
  }

  function checkSources() {
    const expected = "export {};\n";
    for (const unit of units) {
      const entry = join(unit.dir, "src", unit.kind === "app" ? "main.ts" : "index.ts");
      check(readText(entry) === expected, `${entry}: source is not the exact empty ESM module`);
    }
  }

  function outputText(value) {
    return typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
  }

  function normalizedOutput(stdout, stderr) {
    return `${stdout}\n${stderr}`.replaceAll("\\", "/");
  }

  function parseTscDiagnostics(stdout, stderr) {
    const diagnostics = [];
    for (const line of normalizedOutput(stdout, stderr).split(/\r?\n/)) {
      const match = line.match(/error (TS\d+):\s*(.*)$/i);
      if (match) diagnostics.push({ code: match[1].toUpperCase(), message: match[2] });
    }
    return diagnostics;
  }

  function tscExpectationMatches(status, stdout, stderr, expected) {
    const diagnostics = parseTscDiagnostics(stdout, stderr);
    if (expected.success) return status === 0 && diagnostics.length === 0;
    if (status !== expected.status || diagnostics.length !== expected.codes.length) return false;
    const actualCodes = diagnostics.map((diagnostic) => diagnostic.code).sort();
    const expectedCodes = [...expected.codes].map((code) => code.toUpperCase()).sort();
    if (JSON.stringify(actualCodes) !== JSON.stringify(expectedCodes)) return false;
    const output = normalizedOutput(stdout, stderr);
    return expected.fragments.every((fragment) => output.includes(fragment.replaceAll("\\", "/")));
  }

  function nodeExpectationMatches(status, stdout, stderr, expected) {
    if (status !== expected.status) return false;
    if (expected.stdout !== undefined && stdout !== expected.stdout) return false;
    if (expected.stderr !== undefined && stderr !== expected.stderr) return false;
    if (expected.code !== undefined && !stderr.includes(`Error [${expected.code}]:`)) return false;
    return (expected.stdoutIncludes ?? []).every((fragment) => stdout.includes(fragment))
      && (expected.stderrIncludes ?? []).every((fragment) => stderr.includes(fragment));
  }

  function runProbeMatcherRegressionChecks() {
    const expectedTsc = {
      status: 1,
      codes: ["TS6059"],
      fragments: ["expected-target.ts", "is not under 'rootDir'"]
    };
    check(!tscExpectationMatches(1, "probe.mts(1,1): error TS2307: unrelated module", "", expectedTsc), "regression: unrelated TypeScript diagnostic was accepted");
    check(!tscExpectationMatches(1, "error TS6059: wrong boundary evidence", "", expectedTsc), "regression: TypeScript diagnostic without exact path/message evidence was accepted");
    check(!tscExpectationMatches(42, "error TS6059: expected-target.ts is not under 'rootDir'", "", expectedTsc), "regression: TypeScript exit 42 was accepted");
    const expectedNode = { status: 1, stdout: "", code: "ERR_PACKAGE_PATH_NOT_EXPORTED", stderrIncludes: ["Package subpath './src/index.js'"] };
    check(!nodeExpectationMatches(42, "", "Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './src/index.js'", expectedNode), "regression: Node exit 42 was accepted");
    check(!nodeExpectationMatches(1, "", "Error [ERR_MODULE_NOT_FOUND]: unrelated", expectedNode), "regression: unrelated Node error was accepted");
  }

  function validateProcess(label, result, expected) {
    const stdout = outputText(result.stdout);
    const stderr = outputText(result.stderr);
    if (result.error) {
      fail(`${label}: launch error: ${result.error.message}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    if (result.signal !== null) {
      fail(`${label}: process terminated by signal ${String(result.signal)}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    if (!Number.isInteger(result.status)) {
      fail(`${label}: missing or non-numeric process status\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    if (!expected(result.status, stdout, stderr)) {
      fail(`${label}: unexpected process status or output; status=${result.status}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    return { status: result.status, stdout, stderr };
  }

  function runPnpm(label, pnpmArgs, expected) {
    const result = spawnSync(process.execPath, [pnpmEntry, ...pnpmArgs], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      shell: false
    });
    return validateProcess(label, result, expected);
  }

  function checkToolchain() {
    runPnpm("pnpm version", ["--version"], (status, stdout, stderr) => status === 0 && stdout.trim() === "11.10.0" && stderr.trim() === "");
    runPnpm("TypeScript version", ["exec", "tsc", "--version"], (status, stdout, stderr) => status === 0 && stdout.trim() === "Version 7.0.2" && stderr.trim() === "");
  }

  function checkArtifacts() {
    const isFile = (path) => {
      try {
        return statSync(path).isFile();
      } catch {
        return false;
      }
    };
    for (const app of apps) check(isFile(join(app.dir, "dist", "main.js")), `${app.dir}: dist/main.js missing or not a file`);
    check(isFile(join(contracts.dir, "dist", "index.js")), "Runtime Contracts dist/index.js missing or not a file");
    check(isFile(join(contracts.dir, "dist", "index.d.ts")), "Runtime Contracts dist/index.d.ts missing or not a file");
  }

  function checkGitClean() {
    const result = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      shell: false
    });
    return validateProcess("Git cleanliness", result, (status, stdout, stderr) => status === 0 && stdout.trim() === "" && stderr.trim() === "");
  }

  function runNodeProbe(file, source, expected) {
    writeFileSync(file, source, "utf8");
    const result = spawnSync(process.execPath, [file], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      shell: false
    });
    return validateProcess(`Node probe ${file}`, result, (status, stdout, stderr) => nodeExpectationMatches(status, stdout, stderr, expected));
  }

  function runTscProbe(label, directory, source, expected) {
    const sourceFile = join(directory, `${label}.mts`);
    const configFile = join(directory, `${label}.tsconfig.json`);
    const config = {
      compilerOptions: {
        target: "ES2023",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        verbatimModuleSyntax: true,
        noUncheckedSideEffectImports: true,
        skipLibCheck: true,
        rootDir: "."
      },
      files: [sourceFile]
    };
    writeFileSync(sourceFile, source, "utf8");
    writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    return runPnpm(`tsc probe ${label}`, ["exec", "tsc", "--project", configFile, "--noEmit", "--pretty", "false"], (status, stdout, stderr) => tscExpectationMatches(status, stdout, stderr, expected));
  }

  function toImportPath(path) {
    const value = path.replaceAll("\\", "/");
    return value.startsWith(".") ? value : `./${value}`;
  }

  function diagnosticPath(path) {
    return resolve(path).replaceAll("\\", "/");
  }

  function rootDirExpectation(target, directory) {
    return {
      status: 1,
      codes: ["TS6059"],
      fragments: [
        `File '${diagnosticPath(target)}' is not under 'rootDir' '${diagnosticPath(directory)}'.`,
        "'rootDir' is expected to contain all source files."
      ]
    };
  }

  function runBoundaryProbes() {
    const temporary = [];
    try {
      for (const app of apps) {
        const dir = mkdtempSync(join(join(app.dir, "node_modules"), ".ai-block-boundaries-"));
        temporary.push(dir);
        check(runTscProbe(`root-${app.name.split("/").pop()}`, dir, `import ${JSON.stringify(contractName)};\n`, { success: true }) !== undefined, `${app.name}: package-root TypeScript probe failed`);
        check(runNodeProbe(join(dir, "root.mjs"), `import ${JSON.stringify(contractName)};\n`, { status: 0, stdout: "", stderr: "" }) !== undefined, `${app.name}: package-root runtime import failed`);
      }

      const appDir = temporary[0];
      const deepSpecifier = `${contractName}/src/index.js`;
      check(runNodeProbe(join(appDir, "deep.mjs"), `import ${JSON.stringify(deepSpecifier)};\n`, {
        status: 1,
        stdout: "",
        code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
        stderrIncludes: ["Package subpath './src/index.js' is not defined by \"exports\""]
      }) !== undefined, "Runtime Contracts deep-import runtime probe did not fail for the exact exports boundary reason");

      const appPackageSpecifier = appNames[1];
      check(runNodeProbe(join(appDir, "app-package.mjs"), `import ${JSON.stringify(appPackageSpecifier)};\n`, {
        status: 1,
        stdout: "",
        code: "ERR_MODULE_NOT_FOUND",
        stderrIncludes: ["Cannot find package '@ai-block/actor-host'"]
      }) !== undefined, "application-to-application package runtime probe did not fail for the exact package-resolution reason");

      const appRelativeFile = join(appDir, "relative-application.mts");
      const appRelativeTarget = join(apps[1].dir, "src", "main.ts");
      const appRelativeSpec = toImportPath(relative(dirname(appRelativeFile), appRelativeTarget)).replace(/\.ts$/, ".js");
      check(runTscProbe("relative-application", appDir, `import ${JSON.stringify(appRelativeSpec)};\n`, rootDirExpectation(appRelativeTarget, appDir)) !== undefined, "application-to-application relative TypeScript probe did not fail with exact TS6059 evidence");

      const contractsDir = mkdtempSync(join(join(root, "node_modules"), ".ai-block-boundaries-contracts-"));
      temporary.push(contractsDir);
      const contractsAppFile = join(contractsDir, "contracts-application.mts");
      const contractsAppTarget = join(apps[0].dir, "src", "main.ts");
      const contractsAppSpec = toImportPath(relative(dirname(contractsAppFile), contractsAppTarget)).replace(/\.ts$/, ".js");
      check(runTscProbe("contracts-application", contractsDir, `import ${JSON.stringify(contractsAppSpec)};\n`, rootDirExpectation(contractsAppTarget, contractsDir)) !== undefined, "Runtime Contracts-to-application TypeScript probe did not fail with exact TS6059 evidence");

      const infrastructureSpecifier = "infrastructure/internal.js";
      check(runTscProbe("contracts-infrastructure", contractsDir, `import ${JSON.stringify(infrastructureSpecifier)};\n`, {
        status: 1,
        codes: ["TS2882"],
        fragments: [`Cannot find module or type declarations for side-effect import of '${infrastructureSpecifier}'.`]
      }) !== undefined, "Runtime Contracts-to-infrastructure TypeScript probe did not fail with exact TS2882 evidence");
    } catch (error) {
      fail(`probe setup or execution threw: ${error.message}`);
    } finally {
      for (const dir of temporary) {
        try {
          rmSync(dir, { recursive: true, force: true });
          if (existsSync(dir)) fail(`probe cleanup failed: ${dir} still exists`);
        } catch (error) {
          fail(`probe cleanup failed for ${dir}: ${error.message}`);
        }
      }
    }
  }

  runProbeMatcherRegressionChecks();
  checkToolchain();
  if (gitCleanMode) {
    checkGitClean();
  } else {
    checkManifestShape();
    checkDirectories();
    checkTsGraph();
    checkSources();
    checkArtifacts();
    runBoundaryProbes();
  }

  if (failures.length > 0) {
    console.error("BOUNDARY CHECK FAILED");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(gitCleanMode
      ? "PASS: Git worktree clean; no nonignored tracked or untracked paths remain"
      : "PASS: workspace boundaries, manifests, references, artifacts, and probes verified");
  }
  ```

  The implementation contains no general source-import parsing. Its exact source-tree/content checks are sufficient for the four current empty modules; real `pnpm exec tsc` and Node probes prove package-root access and each forbidden direction. The temporary cleanup records setup/probe failures and cleanup failures together, removes every ignored probe directory synchronously, and adds no fixture to the build graph.

- [ ] **Step 3: Execute the checker after a successful build.**

  Run:

  ```powershell
  pnpm build
  if ($LASTEXITCODE -ne 0) { throw 'Build failed before boundary check' }
  pnpm check:boundaries
  if ($LASTEXITCODE -ne 0) { throw 'Boundary checker failed' }
  ```

  Expected: build exit code `0`; checker prints exactly `PASS: workspace boundaries, manifests, references, artifacts, and probes verified`; ignored probe directories do not remain under `node_modules`.

- [ ] **Step 4: Confirm every negative probe is rejected for its intended cause.** Run `pnpm check:boundaries` and retain the result. Expected: the deep Contracts package import fails in Node with status `1`, `ERR_PACKAGE_PATH_NOT_EXPORTED`, and the exact `./src/index.js` exports message; the app package import fails in Node with status `1`, `ERR_MODULE_NOT_FOUND`, and the exact `@ai-block/actor-host` package message; the app-relative and Contracts-to-app compiler probes each fail with status `1`, only `TS6059`, and the exact target/rootDir evidence; the Contracts-to-infrastructure probe fails with status `1`, only `TS2882`, and the exact `infrastructure/internal.js` message. The command exits `0` only because all expected rejections match; an unrelated diagnostic, status `42`, launch error, signal, or missing status makes it exit `1`.

- [ ] **Step 5: Verify the remediation Git-clean mode is present without running it against the intentionally dirty pre-commit tree.** Inspect the exact implementation above and confirm that only `pnpm check:boundaries -- --git-clean` selects the mode, that it requires status `0` plus empty stdout/stderr from `git status --porcelain=v1 --untracked-files=all`, and that its exact success line is `PASS: Git worktree clean; no nonignored tracked or untracked paths remain`. Its first executable acceptance check is Task 5 Step 11 after the product commit and generated-file cleanup. Direct Node invocation remains forbidden.

## Task 5: Run the Phase 0A.2 module milestone, review by risk, and commit the accepted boundary

**Files:**
- Read/verify: every Create/Modify path in this plan.
- Stage/commit: only the Phase 0A.2 product files from the File Structure Map; never stage the controller-owned plan path from `docs/superpowers/plans/2026-07-14-phase-0a2-package-boundaries.md`.
- Modify Git metadata only through the one meaningful product commit; do not modify Git configuration.

**Interfaces:**
- Consumes: Tasks 1–4 output, the same Coder's self-review, and the Tester milestone report.
- Produces: exactly one planned Phase 0A.2 product commit named `feat: establish phase 0a2 package boundaries`, an independent Tester PASS against that committed product, no generated product output, and final Git cleanliness. A separately authorized remediation commit is permitted only if the Tester returns a failure.

- [ ] **Step 1: Perform the final Coder delta preflight and obtain the task's `IMPLEMENTATION_AUTHORIZED` envelope.** Confirm the exact product file set, confirm the plan path is outside write/stage scope, confirm the acceptance sequence below is frozen, and assert `if ((git rev-parse HEAD).Trim() -cne $BASELINE_HEAD) { 'BLOCKED: baseline HEAD changed'; exit 2 }`. Carry the original `BASELINE_HEAD` unchanged; do not recapture or redefine it.

- [ ] **Step 2: Run the Coder self-review before dispatching the Tester.** Verify all of the following with read-only inspection: the four workspace units are the only workspace units; all application manifests are private and have no export fields; Runtime Contracts has only the `.` export; the root and local TypeScript references match the exact graph; every source root contains only its one authorized file and every source file is exactly `export {};`; no new dependency or future directory exists; the checker contains no general source-import parsing or permanent fixture path; and every negative matcher requires the exact status, diagnostic/error identity, and path/message evidence stated in Task 4.

- [ ] **Step 3: Complete the Coder's own verification before staging or committing.** Run:

  ```powershell
  pnpm build
  if ($LASTEXITCODE -ne 0) { throw 'Coder build verification failed' }
  pnpm check:boundaries
  if ($LASTEXITCODE -ne 0) { throw 'Coder boundary verification failed' }
  pnpm clean
  if ($LASTEXITCODE -ne 0) { throw 'Coder clean verification failed' }
  $generated=@(Get-ChildItem -LiteralPath 'apps','packages' -File -Recurse -Force | Where-Object { $_.FullName -match '\\dist(\\|$)' -or $_.Name -like '*.tsbuildinfo' })
  if ($generated.Count -ne 0) { $generated.FullName; throw 'Coder clean left generated files' }
  'PASS: Coder build, boundary, and generated-file cleanup verification passed'
  ```

  Expected exact output: `PASS: Coder build, boundary, and generated-file cleanup verification passed`. Empty `dist` directories are allowed after TypeScript clean; emitted files and `.tsbuildinfo` files are not.

- [ ] **Step 4: Check the existing Git identity without changing it.**

  Run:

  ```powershell
  $name=(git config --get user.name).Trim()
  $email=(git config --get user.email).Trim()
  if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($email)) { 'NEEDS_CONTEXT: Git user.name and user.email are required'; exit 2 }
  'PASS: Git author identity is present'
  ```

  Expected: `PASS: Git author identity is present`. If missing, stop without `git config`, staging, or commit.

- [ ] **Step 5: Dispatch a Reviewer only when the controller's risk assessment warrants it.** A review is warranted for a changed import-policy rule, a TypeScript reference/configuration discrepancy, a failed/reworked boundary probe, scope drift, or any unresolved Coder concern. A clean mechanical result may proceed from Coder self-review plus Tester evidence; do not schedule a Reviewer after each prior task by default.

- [ ] **Step 6: Stage exactly the product paths and inspect the staged diff.**

  Run:

  ```powershell
  if ([string]::IsNullOrWhiteSpace($BASELINE_HEAD)) { throw 'BASELINE_HEAD execution invariant is missing' }
  if ((git rev-parse HEAD).Trim() -cne $BASELINE_HEAD) { 'BLOCKED: current HEAD differs from original BASELINE_HEAD'; exit 2 }
  git add -- package.json pnpm-lock.yaml tsconfig.json apps packages scripts/check-workspace-boundaries.mjs
  git diff --cached --check
  if ($LASTEXITCODE -ne 0) { throw 'Staged diff has whitespace errors' }
  $staged=@(git diff --cached --name-only | Sort-Object)
  $expected=@(
    'apps/actor-host/package.json',
    'apps/actor-host/src/main.ts',
    'apps/actor-host/tsconfig.json',
    'apps/runtime-cli/package.json',
    'apps/runtime-cli/src/main.ts',
    'apps/runtime-cli/tsconfig.json',
    'apps/runtime-server/package.json',
    'apps/runtime-server/src/main.ts',
    'apps/runtime-server/tsconfig.json',
    'package.json',
    'packages/runtime-contracts/package.json',
    'packages/runtime-contracts/src/index.ts',
    'packages/runtime-contracts/tsconfig.json',
    'pnpm-lock.yaml',
    'scripts/check-workspace-boundaries.mjs',
    'tsconfig.json'
  ) | Sort-Object
  if ((Compare-Object $expected $staged).Count -ne 0) { throw 'Staged product path set mismatch' }
  'PASS: staged product path set contains exactly 16 Phase 0A.2 files'
  ```

  Expected exact output: `PASS: staged product path set contains exactly 16 Phase 0A.2 files`. The three preserved root files and all existing design/runbook files must be absent from the staged diff.

- [ ] **Step 7: Create the one planned product commit without changing Git configuration.** Use the unchanged `BASELINE_HEAD` invariant from Task 1; do not capture a new baseline SHA, then run:

  Run:

  ```powershell
  git commit -m "feat: establish phase 0a2 package boundaries"
  if ($LASTEXITCODE -ne 0) { throw 'Product commit failed' }
  $product=(git rev-parse HEAD).Trim()
  $parentLine=(git rev-list --parents -n 1 $product).Trim().Split(' ',[System.StringSplitOptions]::RemoveEmptyEntries)
  $descendants=@(git rev-list --ancestry-path "$BASELINE_HEAD..$product")
  if ($parentLine.Count -ne 2 -or $parentLine[1] -cne $BASELINE_HEAD -or $descendants.Count -ne 1) { throw 'Product commit is not exactly one descendant of the original BASELINE_HEAD' }
  "PASS: product commit $product is the single planned descendant of original BASELINE_HEAD $BASELINE_HEAD"
  ```

  Expected: exit code `0`; one product commit whose first parent is the original unchanged `BASELINE_HEAD` and whose exact subject is `feat: establish phase 0a2 package boundaries`. Do not recapture the baseline or assert an absolute repository commit count.

- [ ] **Step 8: Dispatch the independent Tester against the committed product.** The Tester receives no production write scope, retains raw output, and runs the exact acceptance sequence below against the product commit from Step 7. The Tester confirms exact current source contents rather than expecting general source parsing, retains the cause-specific TypeScript/Node evidence, and classifies any failure as environment, manifest/configuration, boundary-checker, or implementation failure.

- [ ] **Step 9: Execute the exact approved acceptance sequence, including frozen-install stability.** Run these commands in this exact order from `F:/AI_project/AI_block`:

  ```powershell
  $before=(Get-FileHash -Algorithm SHA256 -LiteralPath 'pnpm-lock.yaml').Hash
  pnpm install --frozen-lockfile
  if ($LASTEXITCODE -ne 0) { throw 'Frozen install failed' }
  $after=(Get-FileHash -Algorithm SHA256 -LiteralPath 'pnpm-lock.yaml').Hash
  if ($before -cne $after) { throw 'pnpm-lock.yaml changed during frozen install' }
  git diff --exit-code
  if ($LASTEXITCODE -ne 0) { throw 'Frozen install changed tracked files' }
  pnpm build
  if ($LASTEXITCODE -ne 0) { throw 'Root build failed' }
  pnpm check:boundaries
  if ($LASTEXITCODE -ne 0) { throw 'Boundary check failed' }
  pnpm clean
  if ($LASTEXITCODE -ne 0) { throw 'Clean failed' }
  git diff --exit-code
  if ($LASTEXITCODE -ne 0) { throw 'Clean changed tracked files' }
  ```

  This is the design's exact command sequence: `pnpm install --frozen-lockfile`, `git diff --exit-code`, `pnpm build`, `pnpm check:boundaries`, `pnpm clean`, `git diff --exit-code`. The hash assertions prove frozen-install stability without creating a hash file.

- [ ] **Step 10: Verify build artifacts before clean and generated-file removal after clean.** `pnpm check:boundaries` must have observed `apps/runtime-server/dist/main.js`, `apps/actor-host/dist/main.js`, `apps/runtime-cli/dist/main.js`, `packages/runtime-contracts/dist/index.js`, and `packages/runtime-contracts/dist/index.d.ts`. After `pnpm clean`, run:

  ```powershell
  $generated=@(Get-ChildItem -LiteralPath 'apps','packages' -File -Recurse -Force | Where-Object { $_.FullName -match '\\dist(\\|$)' -or $_.Name -like '*.tsbuildinfo' })
  if ($generated.Count -ne 0) { $generated.FullName; throw 'Clean left emitted or tsbuildinfo files' }
  'PASS: all expected emitted files and tsbuildinfo files were removed; empty dist directories are allowed'
  ```

  Expected exact output: `PASS: all expected emitted files and tsbuildinfo files were removed; empty dist directories are allowed`.

- [ ] **Step 11: Prove final Git cleanliness and ignored-output behavior.**

  Run:

  ```powershell
  pnpm check:boundaries -- --git-clean
  if ($LASTEXITCODE -ne 0) { throw 'Boundary checker Git-clean mode failed' }
  $status=@(git status --porcelain=v1 --untracked-files=all)
  if ($status.Count -ne 0) { $status; throw 'Final Git worktree is not clean' }
  if ((git check-ignore --quiet -- node_modules; $LASTEXITCODE) -ne 0) { throw 'node_modules is not ignored' }
  'PASS: final Git status is clean and transient node_modules remains ignored'
  ```

  Expected: the checker first prints exactly `PASS: Git worktree clean; no nonignored tracked or untracked paths remain`, then PowerShell prints exactly `PASS: final Git status is clean and transient node_modules remains ignored`.

- [ ] **Step 12: Record the Tester milestone result and controller acceptance.** The Tester report must state frozen lockfile stability, successful build, all five required artifacts observed, allowed Contracts root imports accepted by TypeScript and Node, the deep and app-package imports rejected by their exact Node errors, the app-relative and Contracts-to-app probes rejected only by exact `TS6059` evidence, the Contracts-to-infrastructure probe rejected only by exact `TS2882` evidence, emitted files and `.tsbuildinfo` files removed after clean, Git-clean mode passed, and final Git status is clean. Tester PASS is required for controller acceptance. If Tester fails, return the work to the same Coder; any remediation receives a separate `IMPLEMENTATION_AUTHORIZED` envelope and may create a separately authorized remediation commit, followed by another independent Tester run.

## Explicit Phase 0A.2 non-implementation boundary

This plan creates topology and verification only. It does not create Runtime Contract interfaces, schemas, validators, frozen values, IDs, Package hashing, compatibility vectors, fixtures, test suites, runtime modules, persistence, transport endpoints, process supervisors, Claude Code adapters, executable CLI commands, daemon lifecycle, MCP bridge behavior, Run workflow, Graph behavior, external package publication, or a general JavaScript/TypeScript source-import enforcement mechanism. The next independently reviewable deliverable is Phase 0B Runtime Contracts, which must choose a compiler- or parser-backed mechanism if real source imports require enforcement.

## Plan self-review checklist

- [ ] Every requirement in the approved Phase 0A.2 design is assigned to a file map entry, exact configuration section, checker implementation, acceptance step, or explicit non-goal.
- [ ] No future module directory is created, and no generic `common`, `shared`, `core`, or `utils` directory is permitted.
- [ ] Every package name, dependency string, export path, source filename, project reference, `rootDir`, `outDir`, `composite`, and build artifact name is consistent across the map, configs, checker, and commands.
- [ ] The checker compares complete parsed manifest/tsconfig objects, asserts each source root has exactly its authorized empty ESM file and no subdirectory, checks actual directories/artifacts, and uses pinned CLI/compiler plus Node probes with cause-specific normal-process status and diagnostic/error evidence; temporary files are ignored and removed in `finally`, and setup/probe plus cleanup failures are reported together.
- [ ] The lockfile task compares the complete committed pre-change lockfile outside `importers:` and compares the exact four-workspace importer structure without a YAML or dependency-list heuristic.
- [ ] The acceptance sequence includes frozen install/hash stability, post-install Git diff, build artifacts, positive Contracts root imports, exact Node deep/app-package failures, exact TypeScript app-relative/Contracts failures, clean removal, the remediation Git-clean mode, and final Git cleanliness.
- [ ] No general source-import parser, TypeScript unstable programmatic API, parser dependency, permanent probe fixture, or claim of arbitrary future source enforcement remains; Phase 0B owns that future mechanism.
- [ ] The controller-revised plan is committed before preflight, the product commit is exactly one descendant of captured baseline `HEAD`, the Tester runs against that commit, and Tester PASS gates controller acceptance.
- [ ] The runbook gates require read-only Coder preflight, per-task `IMPLEMENTATION_AUTHORIZED`, same-Coder reuse, an independent Tester milestone, and risk-based rather than per-task Review.
- [ ] No command in this plan modifies Git configuration, invents author identity, adds a dependency, or stages the controller-owned plan file.
