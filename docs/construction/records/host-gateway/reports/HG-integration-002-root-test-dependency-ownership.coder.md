# HG-integration-002 Root Integration Dependency Ownership — Coder Report

- role: coder
- result: implemented
- subject commit: same-as-report

## Ownership correction

Root integration tooling now owns its declared test dependencies. The root `package.json` has exactly:

```json
"@ai-block/runtime-contracts": "workspace:*",
"vitest": "4.1.10"
```

The focused integration script now invokes the root-owned executable:

```text
pnpm exec vitest run --root . tests/integration/host-walking-skeleton/host-walking-skeleton.test.ts
```

No `--filter @ai-block/actor-host exec vitest`, app-private runner delegation, `apps/*/node_modules` path, or direct Runtime Contracts declaration-artifact mapping remains in the root integration manifest/configuration.

## Lock and TypeScript evidence

The root lock importer contains only the authorized additions:

```yaml
'@ai-block/runtime-contracts':
  specifier: workspace:*
  version: link:packages/runtime-contracts
vitest:
  specifier: 4.1.10
  version: 4.1.10(@types/node@24.13.3)(vite@8.1.4(@types/node@24.13.3))
```

The existing exact Vitest resolution and workspace link are reused. No package resolution, runtime dependency, optional native addon, or unrelated lock entry changed. `tsconfig.integration.json` is now a separate no-emit NodeNext project with only `types: ["node"]`; normal root package-manager resolution supplies both package-root imports after the existing build prerequisite.

## Checker and boundary policy

The boundary checker now requires the exact root devDependency set, exact root integration scripts, and the path-free integration TypeScript configuration. Existing exact integration topology, app privacy, Runtime Contracts package-root policy, deep-import rejection, app-to-app package/source negatives, and all other boundary probes remain unchanged.

## RED/GREEN and verification

- RED before the correction: root `pnpm exec vitest --version` failed with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` / command not found; `pnpm why vitest -r` listed only ActorHost, Runtime Contracts, and Runtime Server owners.
- Frozen `pnpm install --frozen-lockfile` passed and materialized root `@ai-block/runtime-contracts` and `vitest 4.1.10` ownership.
- GREEN ownership probes: root `pnpm exec vitest --version` reported `vitest/4.1.10`; `pnpm why vitest -r` listed `ai-block@0.0.0` plus the existing package owners; root workspace metadata listed both devDependencies.
- Clean-state `pnpm clean` followed by `pnpm run test:integration` passed the build prerequisite, no-emit TypeScript check, one Vitest file, and all 5 integration scenarios.
- `pnpm check:boundaries` passed with all existing negative probes.
- Final clean-subject `pnpm verify` passed at the subject commit.

## Scope and concerns

Only the authorized root manifest, lockfile, integration TypeScript config, boundary checker, and this Report changed. The integration test and all product/app manifests and sources remain unchanged. No Serena memory or `.serena/` inspection, subagents, review request, or workflow chaining was used.

Concerns: none.
