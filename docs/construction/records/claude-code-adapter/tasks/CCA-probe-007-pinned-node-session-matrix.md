# CCA-probe-007 Pinned Node Session Matrix

- owner: ClaudeCodeAdapter evidence
- follows: CCA-harness-002
- affected modules: none; evidence only
- workflow: W2 plus Controlled Probe gate
- base reason: The independent Tester produced a 32-assertion Node runner with correct dynamic session substitution and a pinned hash.
- implementation/product subject: none
- orchestration baseline: `8f93d56`

## Objective

Use the exact self-tested Node runner to complete the ordinary create/resume and bare/settings/tools orthogonal matrix without modifying the harness.

## Scope and authority

- read scope: this Task; explicitly loaded Probe-004/005/006 Tasks and Reports, Research-002 Report, Controlled Probe procedure; exact pinned temporary runner; local Claude metadata/help and facts produced by this Task; Git status and exact Report path.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-probe-007-pinned-node-session-matrix.testing.md`; one fresh temporary probe-state root below `$env:TEMP`; the existing exact harness root only for final cleanup.
- delegated discretion: collision-resistant probe-state name and bounded output redaction only.
- tools/external actions: Node runner plus a fresh maximum of five service-capable Claude CLI invocations, all potentially model-bearing; local process observation; read-only hash/version; Git add/commit limited to the Report. No delegation, harness modification, install/update, auth change, private-state inspection, product code/test action, or unrelated network research.
- delegation: none.

## Pinned runner gate

- Exact runner path: `C:\Users\DREAMJ~1\AppData\Local\Temp\ai-block-cca-harness-gate-e655e73394214dfc9e84395b850a3532\runner.js`.
- Required SHA-256: `99F76DEBF39DBED50840E49CDAA6F8DBB07C19D23FC28866D37A45091260B8A3`.
- Before any Claude launch, verify the exact file exists and its SHA-256 matches case-insensitively. If either check fails, stop with zero calls.
- Do not edit, regenerate, copy, wrap, or substitute the runner. Use the same dynamic executable-argv and separate display-argv paths that passed the 32 assertions.

## Frozen environment and sequence

- Native executable: `C:\Users\Dreamjiao\AppData\Local\Microsoft\WinGet\Packages\Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe\claude.exe`; require metadata version `2.1.172 (Claude Code)` before service calls.
- Create one fresh probe-state root with `cwd` and `config` children; set child `CLAUDE_CONFIG_DIR` to the temporary config path.
- Inherit existing environment without enumerating, printing, copying, or changing secret values. Never fall back to normal user config.
- UTF-8 stdin prompts:
  - create calls: `Reply with exactly CCA_PROFILE_CREATE_OK and nothing else.`
  - resume: `Reply with exactly CCA_PROFILE_RESUME_OK and nothing else.`
- Per-call watchdog: 20 minutes. Every launched child consumes one slot; no retry or alternate spelling.

Execute sequentially:

1. P1: `--print --output-format json`.
2. P2, only with actual parsed P1 session: `--print --resume <runtime session value> --output-format json`.
3. P3: `--print --bare --output-format json`.
4. P4, only if P3 yields JSON/session: tokens `--print`, `--bare`, `--output-format`, `json`, `--setting-sources`, final empty string.
5. P5, only if P3 yields JSON/session: tokens `--print`, `--bare`, `--output-format`, `json`, `--tools`, final empty string.

- P1 no session stops P2–P5. P2 behavioral failure may continue to P3. P3 no session stops P4/P5.
- Assert before P2 launch that executable argv contains the actual P1 ID immediately after `--resume`, while only the display copy contains `<SESSION_ID>`.
- No sixth call, retry, extra flag, equals-empty representation, stop probe, user-config fallback, fork, continue, or stream-json.

## Cleanup

- In `finally`, delete and verify absence of the exact fresh probe-state root.
- After all evidence is materialized outside the harness root, delete and verify absence of the exact pinned harness root.
- Do not inspect or delete normal user-level Claude state.

## Acceptance

- Report runner hash gate and actual call ledger.
- For every launched call: elapsed, exit/signal/timeout, stdout/stderr presence, JSON parse, bounded root keys/types, result, session continuity, executable/display argv distinction, and provider uncertainty.
- Determine ordinary create/resume behavior, bare-only effect, and conditional empty setting/tool effects.
- Correct the prior strict-profile interpretation and freeze the minimum evidence-backed Adapter profile.
- Report incremental and cumulative service-capable calls, exact cleanup checks for both roots, and Git-clean evidence.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-probe-007-pinned-node-session-matrix.testing.md`. Commit only that Report with message `test: verify Claude session profile matrix`. Leave the worktree clean and report the commit SHA. Do not authorize implementation.
