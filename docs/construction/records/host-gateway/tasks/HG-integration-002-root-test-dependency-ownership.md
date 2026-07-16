# HG-integration-002 Root Integration Dependency Ownership

- owner: root integration composition
- follows: HG-integration-001
- affected modules: root test tooling only; Runtime Contracts as a development dependency
- workflow: W2 + Compatibility
- base reason: this Task corrects bounded test-runner/type-resolution ownership without changing product behavior
- triggered gates: Compatibility: root workspace importer and lockfile change using already pinned exact workspace/test dependencies; independent Tester reruns the failed acceptance afterward
- product baseline: `d6f21f0`

## Objective

Remove the root integration suite's dependency on private ActorHost test tooling by giving the root composition explicit ownership of its Vitest runner and Runtime Contracts development dependency.

## Governing finding

Use `docs/construction/records/host-gateway/reports/HG-integration-001-fake-backend-walking-skeleton.tester.md` as the authoritative blocking evidence.

## Write scope

The Coder may modify only:

- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.integration.json`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/host-gateway/reports/HG-integration-002-root-test-dependency-ownership.coder.md`

Do not modify the integration test, either app/package source/test/manifest, Runtime Contracts, another config, architecture/design, prior Task, or prior Report.

## Frozen correction

- Add exact root development dependencies:
  - `@ai-block/runtime-contracts: workspace:*`
  - `vitest: 4.1.10`
- Record only the root importer changes and reuse existing exact lockfile resolutions. Add no new version, runtime dependency, optional native addon, or unrelated package.
- Root integration scripts invoke the root-owned Vitest executable. Remove every `--filter @ai-block/actor-host exec vitest` or equivalent private-app runner delegation.
- `tsconfig.integration.json` resolves `vitest` and `@ai-block/runtime-contracts` through normal root package-manager/NodeNext resolution. Remove every path into `apps/*/node_modules`, app-private dependency directory, or direct Runtime Contracts declaration artifact mapping used only to bypass ownership.
- Built app JavaScript/declaration imports used by the privileged integration composition remain unchanged; this Task does not create app exports or production app-to-app imports.
- Boundary checker verifies the exact new root devDependencies, exact root integration scripts, and absence of private-app `node_modules`/runner mappings.
- Existing app privacy, deep-import rejection, production app-to-app negative probes, exact integration exception, and all package boundaries remain intact.
- No Serena memory or `.serena/` inspection. Temporary Superpowers role restrictions apply.

## Coder preflight gate

Before editing, report:

1. current root manifest/importer/config/script ownership mismatch and exact expected changed lines/files;
2. exact root devDependency and lock importer delta, confirming existing package resolutions are reused;
3. corrected integration scripts and normal NodeNext type resolution with no private-app path;
4. whether root-owned `@ai-block/runtime-contracts` workspace resolution requires build before type/run and how current clean-state script satisfies it;
5. boundary checker positive/negative updates;
6. focused RED/GREEN and final verification commands, including the previously failing root `pnpm exec vitest --version` probe;
7. any dependency, lock, TypeScript, or scope conflict;
8. READY or BLOCKED recommendation.

Do not edit until exact `IMPLEMENTATION_AUTHORIZED` is returned.

## Acceptance

- From the root, `pnpm exec vitest --version` resolves exactly 4.1.10 without filtering through an app.
- `pnpm why vitest` and workspace metadata show root ownership in addition to package-local owners.
- No integration script/config references ActorHost's private Vitest or `node_modules`.
- After `pnpm clean`, direct `pnpm run test:integration` builds prerequisites, type-checks, and passes all five scenarios.
- `pnpm install --frozen-lockfile` and full `pnpm verify` pass; generated output is cleaned and worktree is clean.
- Product source/tests/manifests, integration test, and app privacy remain unchanged.
- Independent Tester can rerun the prior failed acceptance without a root ownership finding.
- Commit only authorized paths with message `test: own root integration dependencies`.
