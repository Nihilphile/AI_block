# Phase 0A.1 Root Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve every existing workspace file byte-for-byte, initialize one Git history, and add only the pinned root Node/pnpm/TypeScript workspace toolchain.

**Architecture:** This is a root-only, ESM-first bootstrap with no application, package, test, source, Contract, or runtime implementation. The Git index captures the exact 15-file pre-write baseline; later read-only index comparisons prove preservation without creating an inventory or hash file.

**Tech Stack:** Node `>=24 <25`, pnpm `11.10.0`, TypeScript `7.0.2`, `@types/node` `24.13.3`, ESM, NodeNext, ES2023, strict TypeScript, PowerShell, Git, and `apply_patch`.

## Global Constraints

- External execution prerequisite: do not run any plan command or write until the controller dispatch contains an `IMPLEMENTATION_AUTHORIZED` envelope with resolved decisions, frozen scope/Contracts, exact write scope, verification requirements, acceptance criteria, and this plan path. If any field is absent, report `NEEDS_CONTEXT` and stop.
- The Coder confirms receipt of that envelope in its implementation report; no shell variable, token, or command may simulate authorization.
- Preserve all 15 pre-existing files byte-for-byte, including every root-level Markdown design file and every file under `.codex/`, `docs/`, and `openspec/`.
- Versioned/intentional outputs are exactly `.gitignore`, `.npmrc`, `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `pnpm-lock.yaml`, plus `.git/` metadata and one commit.
- `node_modules/` is allowed only as a transient `pnpm install` artifact; it must be gitignored and never staged or committed. No external snapshot/hash/inventory file may be created.
- Pin Node to `>=24 <25`, pnpm to `11.10.0`, TypeScript to `7.0.2`, and `@types/node` to `24.13.3`; install no unpinned dependency.
- Use ESM-first `NodeNext`/`ES2023`/`strict`/`verbatimModuleSyntax`; do not add dual CommonJS output.
- Do not create `apps/`, `packages/`, `tests/`, source files, Runtime Contracts, Runtime behavior, Vitest, TypeBox, Ajv, `ajv-formats`, fast-check, or any RFC 8785/JCS package.
- Before committing, require existing Git `user.name` and `user.email`; if either is absent, report `NEEDS_CONTEXT`, stop, and do not invent or modify identity.
- Make exactly one commit with subject `chore: initialize root workspace` after every gate passes. Ignore and do not edit `docs/superpowers/plans/2026-07-13-phase-0a-workspace.md` if it appears.

---

## File Structure Map

Preserve unchanged; exact pre-initialization inventory:

```text
.codex/skills/openspec-apply-change/SKILL.md
.codex/skills/openspec-archive-change/SKILL.md
.codex/skills/openspec-explore/SKILL.md
.codex/skills/openspec-propose/SKILL.md
.codex/skills/openspec-sync-specs/SKILL.md
.codex/skills/openspec-update-change/SKILL.md
development-orchestration-runbook-v0.1.md
docs/adr/0001-claude-code-adapter-baseline.md
docs/adr/0002-phase-0-workspace-and-contract-policy.md
docs/superpowers/plans/2026-07-13-phase-0a1-root-workspace.md
openspec/config.yaml
runtime-module-architecture-v0.1.md
runtime-module-concept-v0.2.md
runtime-object-module-v0.3.md
runtime-system-architecture-v0.1.md
```

Create at root: `.gitignore` (generated-file exclusions), `.npmrc` (engine/package-manager enforcement), `package.json` (private ESM toolchain manifest), `pnpm-workspace.yaml` (future workspace globs only), `tsconfig.base.json` (strict NodeNext baseline), and generated `pnpm-lock.yaml` (exact dependency graph). Create `.git/` metadata and transient ignored `node_modules/`; create nothing else.

### Task 1: Validate the dispatch, inventory the workspace, and initialize Git

**Files:**
- Preserve: the exact 15-file inventory above.
- Create: `F:/AI_project/AI_block/.git/` only.

**Interfaces:**
- Consumes: the complete controller `IMPLEMENTATION_AUTHORIZED` envelope and workspace root `F:/AI_project/AI_block`.
- Produces: an empty `main` repository whose index contains the exact 15 pre-existing files as the preservation baseline.

- [ ] **Step 1: Validate the external dispatch before running commands.** Confirm all envelope fields named in Global Constraints are present; otherwise report `NEEDS_CONTEXT` and stop. Record `Authorization envelope received: IMPLEMENTATION_AUTHORIZED` for the final Coder report; this step runs no command.
- [ ] **Step 2: Record pre-write directory state.** Run: `'apps','packages','tests','.git' | ForEach-Object { "$_=" + (Test-Path -LiteralPath (Join-Path 'F:/AI_project/AI_block' $_) -PathType Container) }`
  - Expected exact output, in order: `apps=False`, `packages=False`, `tests=False`, `.git=False`.
- [ ] **Step 3: Assert the exact 15-file inventory without writing a manifest.** Run: `$root='F:/AI_project/AI_block'; $expected=@('.codex/skills/openspec-apply-change/SKILL.md','.codex/skills/openspec-archive-change/SKILL.md','.codex/skills/openspec-explore/SKILL.md','.codex/skills/openspec-propose/SKILL.md','.codex/skills/openspec-sync-specs/SKILL.md','.codex/skills/openspec-update-change/SKILL.md','development-orchestration-runbook-v0.1.md','docs/adr/0001-claude-code-adapter-baseline.md','docs/adr/0002-phase-0-workspace-and-contract-policy.md','docs/superpowers/plans/2026-07-13-phase-0a1-root-workspace.md','openspec/config.yaml','runtime-module-architecture-v0.1.md','runtime-module-concept-v0.2.md','runtime-object-module-v0.3.md','runtime-system-architecture-v0.1.md')|Sort-Object; $actual=@(Get-ChildItem -LiteralPath $root -Force -File -Recurse|ForEach-Object{$_.FullName.Substring($root.Length+1).Replace('\','/')}|Sort-Object); if (@(Compare-Object $expected $actual).Count -ne 0) { throw 'Pre-initialization inventory mismatch' }; 'PASS: exact pre-initialization inventory contains 15 files'`
  - Expected exact output: `PASS: exact pre-initialization inventory contains 15 files`.
- [ ] **Step 4: Initialize Git.** Run: `git init --initial-branch=main`
  - Expected: exit code `0`. Then run: `$branch=git symbolic-ref --short HEAD; $count=git rev-list --all --count; if ($branch -cne 'main' -or $count -cne '0') { throw 'Git initialization mismatch' }; 'PASS: Git initialized on main with zero commits'`
  - Expected exact output: `PASS: Git initialized on main with zero commits`.
- [ ] **Step 5: Capture the preservation baseline in the Git index.** Run: `git add -- .codex development-orchestration-runbook-v0.1.md docs openspec runtime-module-architecture-v0.1.md runtime-module-concept-v0.2.md runtime-object-module-v0.3.md runtime-system-architecture-v0.1.md`
  - Expected: exit code `0`. Then run: `$expected=@('.codex/skills/openspec-apply-change/SKILL.md','.codex/skills/openspec-archive-change/SKILL.md','.codex/skills/openspec-explore/SKILL.md','.codex/skills/openspec-propose/SKILL.md','.codex/skills/openspec-sync-specs/SKILL.md','.codex/skills/openspec-update-change/SKILL.md','development-orchestration-runbook-v0.1.md','docs/adr/0001-claude-code-adapter-baseline.md','docs/adr/0002-phase-0-workspace-and-contract-policy.md','docs/superpowers/plans/2026-07-13-phase-0a1-root-workspace.md','openspec/config.yaml','runtime-module-architecture-v0.1.md','runtime-module-concept-v0.2.md','runtime-object-module-v0.3.md','runtime-system-architecture-v0.1.md')|Sort-Object; $actual=@(git diff --cached --name-only|Sort-Object); if (@(Compare-Object $expected $actual).Count -ne 0) { throw 'Preservation index mismatch' }; 'PASS: Git index baseline matches exactly 15 files'`
  - Expected exact output: `PASS: Git index baseline matches exactly 15 files`.

### Task 2: Create the five root configuration files with `apply_patch`

**Files:**
- Create: `F:/AI_project/AI_block/.gitignore`, `.npmrc`, `package.json`, `pnpm-workspace.yaml`, and `tsconfig.base.json`.

**Interfaces:**
- Consumes: Task 1's preservation index and the exact pins/global constraints.
- Produces: five verified root files consumed by Tasks 3–5.

- [ ] **Step 1: Use `apply_patch` from the repository root with this exact patch:**
  ```diff
*** Begin Patch
*** Add File: .gitignore
+node_modules/
+.pnpm-store/
+dist/
+coverage/
+*.tsbuildinfo
+.env
+.env.*
+!.env.example
+.DS_Store
+Thumbs.db
*** End Patch
  ```
  - Run: `$e=@('node_modules/','.pnpm-store/','dist/','coverage/','*.tsbuildinfo','.env','.env.*','!.env.example','.DS_Store','Thumbs.db'); $a=@(Get-Content -LiteralPath '.gitignore'); if (@(Compare-Object $e $a -SyncWindow 0 -CaseSensitive).Count -ne 0) { throw '.gitignore mismatch' }; 'PASS: .gitignore exact and node_modules/ ignored'`
  - Expected exact output: `PASS: .gitignore exact and node_modules/ ignored`.
- [ ] **Step 2: Use `apply_patch` with:**
  ```diff
*** Begin Patch
*** Add File: .npmrc
+engine-strict=true
+package-manager-strict-version=true
*** End Patch
  ```
  - Run: `$e=@('engine-strict=true','package-manager-strict-version=true'); $a=@(Get-Content -LiteralPath '.npmrc'); if (@(Compare-Object $e $a -SyncWindow 0 -CaseSensitive).Count -ne 0) { throw '.npmrc mismatch' }; 'PASS: .npmrc exact'`
  - Expected exact output: `PASS: .npmrc exact`.
- [ ] **Step 3: Use `apply_patch` with:**
  ```diff
*** Begin Patch
*** Add File: package.json
+{"name":"ai-block","version":"0.0.0","private":true,"type":"module","packageManager":"pnpm@11.10.0","engines":{"node":">=24 <25","pnpm":"11.10.0"},"devDependencies":{"@types/node":"24.13.3","typescript":"7.0.2"}}
*** End Patch
  ```
  - Run: `$e='{"name":"ai-block","version":"0.0.0","private":true,"type":"module","packageManager":"pnpm@11.10.0","engines":{"node":">=24 <25","pnpm":"11.10.0"},"devDependencies":{"@types/node":"24.13.3","typescript":"7.0.2"}}'; $a=@(Get-Content -LiteralPath 'package.json'); if ($a.Count -ne 1 -or $a[0] -cne $e) { throw 'package.json mismatch' }; 'PASS: package.json exact with two pinned devDependencies'`
  - Expected exact output: `PASS: package.json exact with two pinned devDependencies`.
- [ ] **Step 4: Use `apply_patch` with:**
  ```diff
*** Begin Patch
*** Add File: pnpm-workspace.yaml
+packages:
+  - "apps/*"
+  - "packages/*"
*** End Patch
  ```
  - Run: `$e=@('packages:','  - "apps/*"','  - "packages/*"'); $a=@(Get-Content -LiteralPath 'pnpm-workspace.yaml'); if (@(Compare-Object $e $a -SyncWindow 0 -CaseSensitive).Count -ne 0) { throw 'pnpm-workspace.yaml mismatch' }; 'PASS: pnpm-workspace.yaml exact'`
  - Expected exact output: `PASS: pnpm-workspace.yaml exact`.
- [ ] **Step 5: Use `apply_patch` with:**
  ```diff
*** Begin Patch
*** Add File: tsconfig.base.json
+{"compilerOptions":{"target":"ES2023","module":"NodeNext","moduleResolution":"NodeNext","strict":true,"verbatimModuleSyntax":true,"noEmit":true,"skipLibCheck":true}}
*** End Patch
  ```
  - Run: `$e='{"compilerOptions":{"target":"ES2023","module":"NodeNext","moduleResolution":"NodeNext","strict":true,"verbatimModuleSyntax":true,"noEmit":true,"skipLibCheck":true}}'; $a=@(Get-Content -LiteralPath 'tsconfig.base.json'); if ($a.Count -ne 1 -or $a[0] -cne $e) { throw 'tsconfig.base.json mismatch' }; 'PASS: tsconfig.base.json exact'`
  - Expected exact output: `PASS: tsconfig.base.json exact`.

### Task 3: Install the exact root dependency graph

**Files:**
- Create: `F:/AI_project/AI_block/pnpm-lock.yaml`; allow transient ignored `F:/AI_project/AI_block/node_modules/`.

**Interfaces:**
- Consumes: Task 2's verified root configuration, Node major 24, and pnpm `11.10.0`.
- Produces: a lockfile and installed TypeScript `7.0.2`/Node types `24.13.3` for Task 4.

- [ ] **Step 1: Assert active versions.** Run: `node -e "if(Number(process.versions.node.split('.')[0])!==24)process.exit(1);console.log('PASS: Node version satisfies >=24 <25')"`; expected exact output: `PASS: Node version satisfies >=24 <25`. Run: `if ((pnpm --version).Trim() -cne '11.10.0') { throw 'pnpm mismatch' }; 'PASS: pnpm=11.10.0'`; expected exact output: `PASS: pnpm=11.10.0`.
- [ ] **Step 2: Generate the lockfile and transient install tree.** Run: `pnpm install`
  - Expected: exit code `0`. Then run: `if (-not (Test-Path 'pnpm-lock.yaml' -PathType Leaf) -or -not (Test-Path 'node_modules' -PathType Container)) { throw 'Install outputs missing' }; git check-ignore -q -- node_modules; if ($LASTEXITCODE -ne 0) { throw 'node_modules is not ignored' }; 'PASS: pnpm-lock.yaml created; node_modules transient and ignored'`
  - Expected exact output: `PASS: pnpm-lock.yaml created; node_modules transient and ignored`.

### Task 4: Verify lock stability, toolchain, scope, and preservation

**Files:**
- Read: all 21 intended versioned files and transient installed manifests.
- Modify: transient `node_modules/` only as pnpm requires; `pnpm-lock.yaml` must remain byte-for-byte unchanged.

**Interfaces:**
- Consumes: Task 1's index baseline and Task 3's generated lock/install tree.
- Produces: deterministic pass/fail assertions authorizing Task 5; no new file.

- [ ] **Step 1: Prove frozen install leaves the lockfile unchanged using in-memory hashes.** Run: `$before=(Get-FileHash -Algorithm SHA256 -LiteralPath 'pnpm-lock.yaml').Hash; pnpm install --frozen-lockfile; if ($LASTEXITCODE -ne 0) { throw 'Frozen install failed' }; $after=(Get-FileHash -Algorithm SHA256 -LiteralPath 'pnpm-lock.yaml').Hash; if ($before -cne $after) { throw 'pnpm-lock.yaml changed' }; 'PASS: frozen install preserved pnpm-lock.yaml byte-for-byte'`
  - Expected exact output: `PASS: frozen install preserved pnpm-lock.yaml byte-for-byte`.
- [ ] **Step 2: Verify exact installed tools.** Run: `node -e "const f=require('node:fs');const n=JSON.parse(f.readFileSync('node_modules/@types/node/package.json')).version;const t=JSON.parse(f.readFileSync('node_modules/typescript/package.json')).version;if(n!=='24.13.3'||t!=='7.0.2')process.exit(1);console.log('PASS: @types/node=24.13.3; typescript=7.0.2')"`; expected exact output: `PASS: @types/node=24.13.3; typescript=7.0.2`. Run: `pnpm exec tsc --version`; expected exact output: `Version 7.0.2`.
- [ ] **Step 3: Prove every pre-existing file matches the index baseline.** Run: `git diff --exit-code -- .codex development-orchestration-runbook-v0.1.md docs openspec runtime-module-architecture-v0.1.md runtime-module-concept-v0.2.md runtime-object-module-v0.3.md runtime-system-architecture-v0.1.md; if ($LASTEXITCODE -ne 0) { throw 'Pre-existing file changed' }; 'PASS: all 15 pre-existing files are byte-for-byte unchanged'`
  - Expected exact output: `PASS: all 15 pre-existing files are byte-for-byte unchanged`.
- [ ] **Step 4: Assert deferred directories remain absent and transient dependencies remain unversioned.** Run: `$present=@('apps','packages','tests'|Where-Object{Test-Path $_ -PathType Container}); git check-ignore -q -- node_modules; if ($present.Count -ne 0 -or $LASTEXITCODE -ne 0) { throw 'Phase boundary mismatch' }; 'PASS: apps=False; packages=False; tests=False; node_modules=ignored'`
  - Expected exact output: `PASS: apps=False; packages=False; tests=False; node_modules=ignored`.
- [ ] **Step 5: Run: `git diff --check`**; expected: no output and exit code `0`.

### Task 5: Preflight author identity and create the single baseline commit

**Files:**
- Stage/commit: the exact 15 preserved files and six root outputs; modify `.git/` only.

**Interfaces:**
- Consumes: every Task 4 pass and existing Git `user.name`/`user.email`.
- Produces: one clean `main` commit and a Coder report confirming the real authorization envelope.

- [ ] **Step 1: Preflight Git identity without modifying it.** Run: `$name=git config --get user.name; $email=git config --get user.email; if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($email)) { 'NEEDS_CONTEXT: Git user.name and user.email are required'; exit 2 }; 'PASS: Git author identity present'`
  - Expected exact pass output: `PASS: Git author identity present`. Missing identity output: `NEEDS_CONTEXT: Git user.name and user.email are required`; stop without committing or running `git config`.
- [ ] **Step 2: Stage and assert exactly 21 files.** Run: `git add --all`; expected exit code `0`. Then run: `$expected=@('.codex/skills/openspec-apply-change/SKILL.md','.codex/skills/openspec-archive-change/SKILL.md','.codex/skills/openspec-explore/SKILL.md','.codex/skills/openspec-propose/SKILL.md','.codex/skills/openspec-sync-specs/SKILL.md','.codex/skills/openspec-update-change/SKILL.md','.gitignore','.npmrc','development-orchestration-runbook-v0.1.md','docs/adr/0001-claude-code-adapter-baseline.md','docs/adr/0002-phase-0-workspace-and-contract-policy.md','docs/superpowers/plans/2026-07-13-phase-0a1-root-workspace.md','openspec/config.yaml','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','runtime-module-architecture-v0.1.md','runtime-module-concept-v0.2.md','runtime-object-module-v0.3.md','runtime-system-architecture-v0.1.md','tsconfig.base.json')|Sort-Object; $actual=@(git diff --cached --name-only|Sort-Object); if (@(Compare-Object $expected $actual).Count -ne 0) { throw 'Staged set mismatch' }; 'PASS: staged set matches exactly 21 files'`; expected exact output: `PASS: staged set matches exactly 21 files`.
- [ ] **Step 3: Run: `git diff --cached --check`**; expected: no output and exit code `0`.
- [ ] **Step 4: Run: `git commit -m "chore: initialize root workspace"`**; expected: exit code `0` and one root commit.
- [ ] **Step 5: Assert final state.** Run: `$branch=(git branch --show-current).Trim(); $count=(git rev-list --count HEAD).Trim(); $subject=(git log -1 --pretty=%s).Trim(); $status=@(git status --porcelain=v1); if ($branch -cne 'main' -or $count -cne '1' -or $subject -cne 'chore: initialize root workspace' -or $status.Count -ne 0) { throw 'Final state mismatch' }; 'PASS: one baseline commit on main; worktree clean; node_modules unversioned'`
  - Expected exact output: `PASS: one baseline commit on main; worktree clean; node_modules unversioned`.
- [ ] **Step 6: In the Coder report, include exactly `Authorization envelope received: IMPLEMENTATION_AUTHORIZED` and every PASS result emitted by Tasks 4 and 5; do not create a report file.**
