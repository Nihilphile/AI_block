# CCA-implementation-001 Process and JSON Adapter Coding Report

- work: coding
- result: completed
- implementation subject: same-as-report
- orchestration baseline: `5af419b`
- lease: `claude-code-adapter-coder-01@1`

## Decisions

- uncertainty found: no
- implicit decisions found: yes
- decisions made or escalation requested: the private runner distinguishes synchronous spawn failure from asynchronous process-observation failure; a requested stop becomes `stopped` only after child close, while a rejected/unknown kill rejects stop; stopped completion bypasses terminal JSON parsing and never synthesizes a session. No scope escalation was required.

## Work and evidence

- Added a Host-generic Node process runner using tokenized `child_process.spawn`, `shell:false`, explicit cwd, UTF-8 stdin close, independent stdout/stderr capture, exit/signal facts, synchronous launch failure, idempotent explicit stop, and fail-closed unknown liveness.
- Added `ClaudeCodeAdapter` behind the existing `BackendAdapter` port with exact adapter/config/cwd/system-prompt/provider validation, metadata-only exact Claude Code `2.1.172` compatibility inspection, the frozen P5 create argv, orthogonally evidenced explicit-resume argv, and text-only stdin transport.
- Added terminal JSON validation for root object, `type === "result"`, `is_error === false`, string result, non-empty returned session, and exact resumed-session equality. Extra fields are ignored; process facts remain independent; non-zero exit with valid structured facts is preserved.
- Added deterministic tests using injected fixtures and local Node fake children only. Updated the workspace boundary topology for exactly the authorized source and test files. No Runtime Contract, public adapter port, Supervisor, CommandProcessor, manifest, tsconfig, dependency, or startup wiring changed.
- Commit identity: `same-as-report`; the containing commit SHA is reported in the final handoff.

## Verification or result

- `pnpm --filter @ai-block/actor-host exec vitest run test/backend/claude-code-adapter.test.ts`: passed, 1 file / 26 tests.
- `pnpm build`: passed.
- `pnpm --filter @ai-block/actor-host run test:types`: passed after the required workspace build.
- `pnpm check:boundaries`: passed after the required workspace build.
- `pnpm test:actor-host`: passed, 5 files / 80 tests.
- `pnpm test:contracts`: passed, 9 files / 58 tests.
- `pnpm test:runtime-server`: passed, 2 files / 20 tests.
- `pnpm test:integration`: passed, 1 file / 5 tests, including integration build and type checks.
- Broad suites total: 17 files / 163 tests. The 26 focused tests are included in the ActorHost total.
- `pnpm clean`: passed; generated TypeScript output was cleaned.
- `git diff --check`: passed. Final clean-worktree boundary evidence is performed after the authorized commit.

The first direct ActorHost test-type and boundary attempts were intentionally retained as ordering evidence: both failed only because the clean baseline lacked built Runtime Contracts/package artifacts. They passed after `pnpm build`; no source workaround was applied.

## Context and tool integrity

- Semantic lease continuity remained `claude-code-adapter-coder-01@1` with expected epoch 1, Task subject `949e742`, and starting baseline `5af419b` on a clean `main` worktree.
- Serena non-memory operations supplied initial instructions, project activation/config confirmation, symbol overviews, focused declarations/bodies, references, pattern search, guarded source replacements, and diagnostics. Diagnostics were clean after the workspace build. The initial test-file module-resolution diagnostic matched the absent build artifacts and cleared after build.
- Serena memory, memory listing/check/refresh, onboarding, and `.serena/` were not used. Superpowers/extra roles were not invoked.
- No real Claude executable, model, service, network, install/update, authentication, credential/private config, or existing session was accessed. Child launches were only local Node fake processes.

## Deviations and remaining risk

- The repository `pnpm verify` wrapper was not invoked because it unconditionally performs `pnpm install --frozen-lockfile`, while this Task forbids install/update and network-capable external actions. Its build, test, integration, boundary, clean, and diff-equivalent checks were run directly; final `--git-clean` runs after commit.
- Probe-007 did not execute the exact combined P5 resume argv. The frozen implementation composes observed P5 create with observed explicit returned-ID resume; one exact live combined-resume acceptance remains deferred as required.
- Automatic timeout, real-service acceptance, non-empty prompts/providers beyond the frozen subset, and startup registration remain deferred.
