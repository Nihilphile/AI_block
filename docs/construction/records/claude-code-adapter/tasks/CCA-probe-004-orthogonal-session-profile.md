# CCA-probe-004 Orthogonal Print and Session Profile

- owner: ClaudeCodeAdapter evidence
- follows: CCA-research-002
- affected modules: none; evidence only
- workflow: W2 plus Controlled Probe gate
- base reason: Official behavior and prior strict-profile evidence conflict; one-factor comparisons are required before implementation decisions resume.
- implementation/product subject: none
- orchestration baseline: `5f57be6`

## Objective

Empirically separate ordinary `-p` JSON/session behavior from `--bare`, empty setting-source, and empty tool-list interactions on local Claude Code `2.1.172` with the configured DeepSeek-compatible backend.

## Scope and authority

- read scope: this Task; explicitly loaded Controlled Probe procedure and CCA-research-002 Report; local native Claude Code metadata/help; process/stdout/stderr/session facts created by this Task; Git status and the exact Report path.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-probe-004-orthogonal-session-profile.researching.md` plus one new temporary probe root below `$env:TEMP` containing only a temporary cwd and temporary `CLAUDE_CONFIG_DIR`.
- delegated discretion: collision-resistant temporary names/UUIDs; bounded redaction/summarization; implementation of the same tokenized `.NET ProcessStartInfo` harness.
- tools/external actions: at most five service-capable Claude CLI invocations, all conservatively potentially model-bearing; read-only help/version; local process observation; Git add/commit limited to the Report. No installation/update, authentication change, credential/private-config/existing-session inspection, product code/test execution, or delegation.
- delegation: none.

## Frozen decisions and escalation

### Isolation and common process method

- Create one probe root below `$env:TEMP`, with distinct `cwd` and `config` children. Set `CLAUDE_CONFIG_DIR` for every child to the new temporary config path and use the new temporary cwd for every call.
- Inherit existing environment values without enumerating, printing, copying, or modifying secret values. Do not import credentials or settings from the user's normal Claude directory. If temporary config plus inherited non-interactive environment cannot authenticate, stop and report; do not fall back to user config.
- Use the same native `2.1.172` executable. Metadata-only version mismatch stops before a service-capable call.
- Use `.NET ProcessStartInfo`, `UseShellExecute=false`, redirected stdin/stdout/stderr, and one `ArgumentList` token per argument. Write the exact fixed prompt through UTF-8 stdin and close stdin before waiting.
- Fixed create prompt: `Reply with exactly CCA_PROFILE_CREATE_OK and nothing else.`
- Fixed resume prompt: `Reply with exactly CCA_PROFILE_RESUME_OK and nothing else.`
- Per-call watchdog: 20 minutes, accounting for a potentially slow DeepSeek response. A timeout consumes the slot and is not retried.
- Do not add permission, MCP, slash-command, Chrome, system-prompt, model, settings-file, session-ID, or other flags not listed for that call.

### Ordered orthogonal calls

Every launched print process consumes one of five slots even on local/auth/parser failure. No retry or alternative spelling is authorized.

1. **P1 ordinary JSON create**
   - argv: `--print --output-format json`
   - prompt: fixed create prompt via stdin.
   - Required observation: exit/streams, JSON parse, bounded root keys/types, `result`, and non-empty `session_id`.
   - If no usable structured session ID is produced, stop the entire sequence. Do not fabricate an ID and do not run P2–P5.

2. **P2 ordinary explicit resume**
   - argv: `--print --resume <P1_SESSION_ID> --output-format json`
   - prompt: fixed resume prompt via stdin.
   - Required observation: explicit ID acceptance, JSON parse, returned session-ID equality, result, exit/streams.
   - P2 failure does not by itself prevent the independent P3 bare comparison, provided no profile change or retry is needed.

3. **P3 bare-only JSON create**
   - argv: `--print --bare --output-format json`
   - prompt: fixed create prompt via stdin.
   - No settings/tools empty override.
   - Compare framing/session evidence directly with P1.
   - If P3 does not produce usable terminal JSON and session ID, stop; do not run P4/P5. This isolates `--bare` or its auth/simple-mode interaction as the first changed factor.

4. **P4 bare plus empty setting sources**
   - argv tokens: `--print`, `--bare`, `--output-format`, `json`, `--setting-sources`, then one final empty argv element.
   - prompt: fixed create prompt via stdin.
   - The empty value is final so it cannot consume a later option. Do not use equals-empty or another representation.
   - Compare only against P3.

5. **P5 bare plus empty tools**
   - argv tokens: `--print`, `--bare`, `--output-format`, `json`, `--tools`, then one final empty argv element.
   - prompt: fixed create prompt via stdin.
   - The empty value is final so it cannot consume a later option. Do not use equals-empty or another representation.
   - Compare only against P3.

P4 and P5 use separate create sessions but the same temporary cwd/config root. They are sequential to keep provider timing and state evidence easy to compare. Do not run them concurrently.

### State, cleanup, and forbidden actions

- Session/history state created under the temporary config root is authorized and must be removed only by deleting the exact probe root after all authorized observations.
- Do not locate, inspect, modify, or delete normal user-level Claude state.
- No real tools, MCP/plugins/hooks, repository-content prompts, external-action prompts, fork, continue, stream-json, process-stop probe, product writes, retries, or sixth call.
- Do not modify earlier Tasks/Reports or the current evidence closeout.
- If a required action exceeds these boundaries, return `PROBE_AUTHORITY_REQUEST`; do not improvise.

## References

- `docs/construction/records/claude-code-adapter/reports/CCA-research-002-print-session-profile-matrix.researching.md`
- `docs/construction/runbook/procedures/controlled-probe.md`

## Acceptance

- Report actual incremental and cumulative call budgets and which conditional calls ran.
- For every launched call, report exact redacted argv shape, elapsed time, exit, stdout/stderr presence, JSON parse, bounded root keys/types, result/session relation, and model-request uncertainty.
- State whether ordinary create/resume works and whether `--bare`, empty setting sources, or empty tools changes framing/session behavior.
- Separate CLI/client serialization/session behavior, authentication/config isolation, and DeepSeek provider behavior.
- Report exact temporary-root cleanup and permitted/observed residual state without inspecting normal user state.
- Identify which prior conclusions are confirmed or withdrawn and the precise implementation profile now supported by evidence.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-probe-004-orthogonal-session-profile.researching.md`. Commit only that Report with message `research: verify Claude print session profiles`. Leave the worktree clean and report the commit SHA. Do not resume implementation authority.
