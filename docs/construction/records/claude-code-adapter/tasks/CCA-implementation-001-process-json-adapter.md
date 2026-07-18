# CCA-implementation-001 Process and JSON Adapter v0.1

- owner: ActorHost / ClaudeCodeAdapter
- follows: CCA-preflight-001 and CCA-probe-007
- affected modules: ActorHost; workspace boundary checker
- workflow: W2
- base reason: The accepted Host lifecycle port now has authoritative local JSON/session evidence and a frozen zero-tool profile.
- implementation/product subject: `949e742`
- orchestration baseline: `bb3157c`

## Objective

Implement and deterministically test the v0.1 ClaudeCodeAdapter and Host-generic Node process runner behind the existing BackendAdapter/Supervisor port, without a real Claude/model invocation or Runtime Contract change.

## Scope and authority

- read scope: CCA-preflight-001 read scope plus explicitly loaded final decision/evidence Bricks and workspace boundary checker.
- write scope:
  - `apps/actor-host/src/backend/process-runner.ts`
  - `apps/actor-host/src/backend/claude-code-adapter.ts`
  - `apps/actor-host/test/backend/claude-code-adapter.test.ts`
  - `scripts/check-workspace-boundaries.mjs`
  - `docs/construction/records/claude-code-adapter/reports/CCA-implementation-001-process-json-adapter.coding.md`
- delegated discretion: private names/types, fixture organization in the authorized test file, and local implementation choices preserving frozen behavior and existing interfaces.
- tools/external actions: Serena non-memory operations; local fake-child processes; focused/full test, build, and boundary commands; Git diff/status/add/commit limited to write scope. No real Claude executable/model/service, network, install/update, authentication, credentials/private config/session inspection, destructive action, or dependency change.
- delegation: none.

## Frozen decisions and escalation

- Implement exactly `claude-code-adapter-v0.1-decisions.md`.
- Implement the real runner with Node native child-process spawn, tokenized argv, and `shell:false`; no PowerShell/.NET production dependency.
- Keep the runner Host-generic and Claude CLI/profile/parser logic Adapter-specific.
- Initialization uses only metadata `--version`; tests use injected deterministic fixtures/fake local children and never the real Claude executable.
- Do not modify existing BackendAdapter/Supervisor/CommandProcessor/Runtime Contracts interfaces or behavior, register a new app factory, wire Claude into startup, add a dependency, or expand into Actor/Package/Run/Graph.
- Do not silently accept unsupported config, version, prompts, system prompts, providers, malformed/error JSON, missing/mismatched session, or unknown process liveness.
- Automatic timeout is not implemented.
- Exact new source/test files and boundary-checker topology update are authorized. Any unlisted file, public interface, manifest/tsconfig, dependency, or accepted FakeBackend behavior change requires `SCOPE_EXPANSION_REQUEST` before editing.
- Serena memory/onboarding/`.serena/` remain forbidden. Superpowers does not authorize workflow chaining or extra roles.

## Acceptance

- Existing BackendAdapter port is implemented with no public Contract change.
- Initialization tests: exact config schema, absolute executable/cwd validation, metadata-only exact `2.1.172` version check, no model Invocation, rejection of non-empty system prompts/tool providers and unsupported version/config.
- Argument/input tests: exact create/resume argv including final empty tools element, actual resume ID, text-only prompt, UTF-8 stdin and close, no implicit continue/fork/dynamic flags.
- Process-runner tests: tokenized shell-free launch against local fake child, independent stdout/stderr, exit/signal or platform-equivalent termination fact, pre-start/launch error, idempotent stop, observed stopped fact, and truthful stop failure/unknown-liveness behavior supported by the existing port.
- Parser/session tests: authoritative fixture success and extra fields; plain text; malformed JSON; wrong type; `is_error`; invalid result; missing/empty session; resume mismatch; non-zero exit with/without valid structured facts; no synthesized session/result.
- Existing FakeBackend/Supervisor/CommandProcessor tests remain green; no wire diagnostics leak.
- Boundary checker admits only the authorized files and preserves app/package/import/shared-directory restrictions.
- Focused test, ActorHost suite, Contracts, Runtime Server, integration, boundaries, build, and full verification pass; generated output is cleaned and final Git state is clean after the authorized commit.
- Report records exact commands/counts, Serena usage/friction, decisions within discretion, deviations, remaining exact live combined-resume acceptance, subject identity, and commit SHA.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-implementation-001-process-json-adapter.coding.md`. Commit only authorized implementation/tests/boundary update and Report with message `feat: add Claude Code process adapter`. Leave the worktree clean and report the commit SHA. Self-verification is not independent acceptance or review.
