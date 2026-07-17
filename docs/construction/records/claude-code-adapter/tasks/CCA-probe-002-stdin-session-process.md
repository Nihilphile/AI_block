# CCA-probe-002 Stdin Session and Process Controlled Probe

- owner: ClaudeCodeAdapter evidence
- follows: CCA-probe-001
- affected modules: none; evidence only
- workflow: W2 plus Controlled Probe gate
- base reason: CCA-probe-001 consumed three local CLI slots on an argv prompt-delivery error without reaching model/session behavior.
- implementation/product subject: none
- orchestration baseline: e5dd2a7

## Objective

Repeat the four bounded Claude Code behavior probes with a frozen Windows process harness that passes every option through `.NET ProcessStartInfo.ArgumentList` and delivers each fixed prompt through UTF-8 stdin, closing stdin before observation.

## Scope and authority

- read scope: this Task; explicitly loaded Controlled Probe procedure; CCA-research-001 and CCA-probe-001 Reports; local `claude --help` and `claude --version`; process/stdout/stderr facts produced by this probe; Git status and the exact Report path.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-probe-002-stdin-session-process.researching.md` and one newly created throwaway directory below the current user's temporary directory.
- delegated discretion: choose collision-resistant temporary names/UUIDs; implement an in-memory/temporary PowerShell or .NET child-process harness; redact or summarize bounded output evidence.
- tools/external actions: local shell/process inspection; local Claude Code executable; at most four additional service-capable Claude CLI invocations; at most three additional invocations that may submit a model request; normal Git status/diff/add/commit limited to the Report. Read-only `--help`/`--version` and non-Claude local harness checks do not consume this Task's four slots.
- delegation: none.

## Frozen decisions and escalation

### Corrected process/input profile

- Use a newly created throwaway working directory below `$env:TEMP`; do not probe from the repository or another existing project.
- Use the same native local Claude Code `2.1.172` executable. Stop before service calls if metadata proves it changed.
- Construct the child with `.NET ProcessStartInfo`; set `UseShellExecute = false`, redirect stdin/stdout/stderr, and add every CLI token separately through `ProcessStartInfo.ArgumentList`. Do not build one shell/command-line string and do not use `Start-Process -ArgumentList`.
- Do not pass the prompt as a positional argument. After process start, write only the exact fixed prompt to redirected stdin using UTF-8, then close stdin before waiting or stopping.
- Preserve the CCA-probe-001 isolation profile as separately added tokens: `--print`, `--bare`, `--tools`, empty value, `--permission-mode`, `dontAsk`, `--strict-mcp-config`, `--disable-slash-commands`, `--setting-sources`, empty value, `--output-format`, `json`, and `--no-chrome`. Session flags are added only where the probe requires them.
- A non-Claude local harness check may verify that the process helper preserves an empty argv token and exact UTF-8 stdin before P1. It must not inspect private state or write outside the throwaway directory.
- Do not inspect or modify credentials, environment-secret values, user Claude configuration, existing sessions, caches, histories, or unrelated files. Do not locate or delete user-level Claude records; normal throwaway session-history residue remains authorized.

### Additional invocation budget and order

CCA-probe-001 used three failed local invocations and evidenced no model request. This Task grants a fresh, non-transferable maximum of four additional service-capable invocations and three potentially model-bearing invocations. Every launched Claude print/session process consumes one slot even on local error. Never retry automatically.

1. **P1 create / model-capable** — stdin `Reply with exactly CCA_CREATE_OK and nothing else.`; terminal JSON; no resume/session flag. Watchdog: 20 minutes.
2. **P2 explicit resume / model-capable** — stdin `Reply with exactly CCA_RESUME_OK and nothing else.`; terminal JSON; explicit non-empty P1 session ID; same throwaway cwd. Watchdog: 20 minutes.
3. **P3 active stop / model-capable** — stdin a fixed harmless request for a long reasoning response; terminal JSON; fresh caller-supplied UUID if locally supported. Close stdin, verify the child is still running after 5 seconds, invoke `.Kill()` once, and record stop latency and process/stream/parser facts. Do not use a second termination method. Total watchdog: 2 minutes.
4. **P4 invalid resume / expected local failure** — stdin `Reply with exactly CCA_INVALID_RESUME and nothing else.`; explicit newly generated nonexistent UUID; terminal JSON. Watchdog: 2 minutes.

P2 remains conditional on P1 yielding a non-empty structured session ID. P3/P4 may continue after an earlier evidence failure only if the frozen harness/profile remains unchanged and no retry or new decision is needed.

### Forbidden actions and escalation

- All forbidden actions from CCA-probe-001 remain in force: no product changes, stream-json, fork, continue, TUI, tools, MCP/plugins/hooks, authentication/update/backend changes, repository-content prompts, extra attempts, second stop mechanism, or cleanup outside the exact throwaway directory.
- Do not amend or overwrite the CCA-probe-001 Report.
- Return `PROBE_AUTHORITY_REQUEST` before a fifth additional invocation, fourth potentially model-bearing invocation, changed argument/input profile, retry, private-state inspection, broader cleanup, or any unlisted write/action.

## References

- `docs/construction/records/claude-code-adapter/reports/CCA-research-001-cli-session-contract.researching.md`
- `docs/construction/records/claude-code-adapter/reports/CCA-probe-001-json-session-process.researching.md`
- `docs/construction/runbook/procedures/controlled-probe.md`

## Acceptance

- Report actual additional and cumulative two-Task invocation budgets.
- For each launched probe, report elapsed time, exit/termination fact, stdout/stderr presence, terminal JSON parse result, session-ID relation, and only the narrow supported adapter conclusion.
- Prove or explicitly fail to prove stdin delivery, JSON create schema, explicit resume continuity, active process stop behavior, and invalid-resume behavior.
- Keep process, stream, parser, session, and model-result facts distinct.
- Report temporary-directory cleanup and permitted residual user-level history state without inspecting that state.
- Recommend the first ClaudeCodeAdapter Windows argument/input/parser/process profile; do not implement it.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-probe-002-stdin-session-process.researching.md`. Commit only that Report with message `research: verify Claude Code stdin session behavior`. Leave the worktree clean and report the commit SHA. This Task is an Orchestrator-owned authorization artifact and is not part of the Worker's Report commit.
