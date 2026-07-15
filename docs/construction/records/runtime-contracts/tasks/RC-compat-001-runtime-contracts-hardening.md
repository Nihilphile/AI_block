# RC-compat-001 Runtime Contracts Compatibility and Hardening

- owner: Runtime Contracts
- follows: RC-host-001
- affected modules: runtime-server, actor-host, runtime-cli
- workflow: W3 + Compatibility
- base reason: integrates and verifies the complete public Runtime Contracts boundary before downstream FakeBackend consumption
- triggered gates: Compatibility: audits root exports, TypeScript/Node consumers, fixtures, package boundaries, reproducible installation, and serialized Contract compatibility
- product baseline: 20238a041a3f6cdfc0a1a7f9a0c4baaa52816027

## Objective

Complete B.4 compatibility fixtures, consumer verification, boundary hardening, module documentation, and final Runtime Contracts acceptance without changing the frozen B.1–B.3 wire semantics.

## Write scope

Coder-authorized paths:

```text
packages/runtime-contracts/package.json
packages/runtime-contracts/README.md
packages/runtime-contracts/test/compatibility/**
apps/runtime-server/src/main.ts
apps/actor-host/src/main.ts
apps/runtime-cli/src/main.ts
scripts/check-workspace-boundaries.mjs
package.json
docs/construction/serena-lsp-worker-guide.md
docs/construction/records/runtime-contracts/reports/RC-compat-001-runtime-contracts-hardening.coder.md
```

Independent evidence paths, owned only by the assigned role:

```text
docs/construction/records/runtime-contracts/reports/RC-compat-001-runtime-contracts-hardening.tester.md
docs/construction/records/runtime-contracts/reports/RC-compat-001-runtime-contracts-hardening.reviewer.md
```

No dependency, lockfile, frozen Contract schema/implementation, persistence, transport, process, Run, Graph, or Claude path is writable. A discovered public-semantic defect stops this Task and creates a focused remediation Task.

## Constraints and escalation

- Read and follow ADR-0002, the approved Phase 0B design/plan, all accepted B.1–B.3 public contracts, and construction rules.
- Begin with a delta preflight and wait for exact `IMPLEMENTATION_AUTHORIZED`; identify which app/fixture paths are actually necessary rather than modifying all allowed paths automatically.
- Treat Serena only as a stateless LSP/IDE code tool. Do not read, write, validate, refresh, or rely on Serena memory. Existing `.serena/` content remains ignored and untouched.
- Inventory the Serena capabilities exposed to this Coder, excluding every memory capability. Use Serena as the primary path across the Task where naturally applicable: project activation, directory/file discovery, pattern search, symbol overview, symbol lookup, reference analysis, rename, insert-before/after, symbol-body replacement, and available task-adherence/completion checks. Do not manufacture a product change solely to exercise a function; record capabilities that had no legitimate B.4 use case.
- Use ordinary file tools only for non-symbolic files, unsupported operations, deterministic fixture generation, or a concrete Serena limitation; record each fallback category and reason.
- Current Git HEAD, ordinary Git diff, TypeScript, runtime tests, and boundary verification are authoritative. Serena output never replaces those checks.
- Produce `docs/construction/serena-lsp-worker-guide.md` from the actual B.2–B.4 experience. It must explain the stateless model, the available non-memory capability map, navigation/search/reference/mutation workflows, memory prohibition, scope safety, verification loop, Windows considerations, fallbacks, and a concise future-Worker checklist.
- Keep application compatibility edits type-only and behavior-free. Applications remain private and non-importable.
- Verify package-root consumption and reject deep imports, app-to-app package imports, and app-to-app relative-source imports without introducing a handwritten JavaScript/TypeScript parser.
- Preserve exact root exports and remove no accepted B.1–B.3 symbol. Test fixtures do not become production exports.
- Follow RED → GREEN → REFACTOR for new compatibility behavior and keep repository-wide `pnpm verify` green.

## Acceptance

- runtime-server, actor-host, and runtime-cli compile against `@ai-block/runtime-contracts` only through its package root, with no runtime behavior added.
- Positive round-trip fixtures and negative package-boundary probes prove the intended public surface and fail for the intended cause.
- Frozen install, build, declarations, all Contract tests, compatibility fixtures, boundary checks, clean checks, and Git-clean verification pass deterministically.
- Runtime Contracts has concise consumer documentation, fixture attribution, no dead/test-only public exports, and no infrastructure or later-phase behavior.
- The Serena guide is detailed enough for a future Coder to use LSP operations as its primary code workflow without using memory.
- The Coder Report includes a capability matrix listing each exposed non-memory Serena operation category, whether and how it was used, observed benefit/friction, ordinary-tool fallbacks and reasons, and a final recommendation.
- The Coder commits only its authorized files and Report with `subject commit: same-as-report`.
- After the Coder commit, an independent Luna Tester verifies the integrated Phase 0B acceptance matrix and commits only its Tester Report.
- After Tester evidence, an independent Luna Reviewer performs the one module-level architecture/correctness review and commits only its Reviewer Report.
