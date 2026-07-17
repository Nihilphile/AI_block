# CCA-probe-001 JSON Session and Process Controlled Probe

- owner: ClaudeCodeAdapter evidence
- follows: CCA-research-001
- affected modules: none; evidence only
- workflow: W2 plus Controlled Probe gate
- base reason: Real Claude Code service calls and local session-state creation are required to close version-specific adapter behavior.
- implementation/product subject: none
- orchestration baseline: 76e7240

## Objective

Produce bounded empirical evidence for local Claude Code `2.1.172` covering terminal JSON create, explicit session-ID resume, Windows process termination, and invalid resume behavior, without changing product code or inspecting private Claude state.

## Scope and authority

- read scope: this Task; explicitly loaded Runbook Bricks and prior CCA research report; local `claude --help` and `claude --version`; process/stdout/stderr facts produced by this probe; Git status and the exact Report path.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-probe-001-json-session-process.researching.md` and one newly created throwaway directory below the current user's temporary directory.
- delegated discretion: choose collision-resistant temporary names/UUIDs; derive exact locally advertised flag spellings; choose a Windows child-process API that exposes start, termination, exit, stdout, and stderr facts; redact or summarize bounded output evidence.
- tools/external actions: local shell/process inspection; local Claude Code executable; at most four service-capable Claude CLI invocations; at most three invocations that may submit a model request; normal Git status/diff/add/commit limited to the Report. Read-only `--help` and `--version` calls do not consume the four-invocation budget.
- delegation: none.

## Frozen decisions and escalation

### Probe environment

- Use a newly created throwaway working directory below `$env:TEMP`; do not run a probe from the repository or another existing project.
- Use the native local Claude Code `2.1.172` executable identified by CCA-research-001, unless a metadata-only version check proves that exact executable no longer exists or no longer has that version. If it differs, stop before a service-capable invocation.
- Do not inspect or copy credentials, environment-secret values, user Claude configuration, existing conversation/session files, caches, or unrelated user files.
- Suppress tools, MCP servers, plugins, hooks, interactive permission prompts, and project/local settings using only locally advertised command-line/settings controls and temporary empty configuration where required. Do not edit user configuration. If the local CLI cannot establish this profile without inspecting private configuration, stop with `PROBE_AUTHORITY_REQUEST` before the first service-capable invocation.
- Fixed prompts contain no repository data, secrets, personal data, code, or external-action request.
- Claude Code may retain two or three throwaway records in its normal user-level session history. This residual state is authorized. Do not locate, inspect, edit, or delete user-level Claude state.

### Invocation budget and order

Every launched command using print/session execution capability counts against the four-invocation budget even if it fails before contacting the backend. Never retry automatically. Run in this order and stop if a prerequisite fails:

1. **P1 create / model-capable** — terminal JSON output, no resume flag, prompt: `Reply with exactly CCA_CREATE_OK and nothing else.` Capture process exit, stdout/stderr classification, parseability, result text, and session ID. Watchdog: 20 minutes.
2. **P2 explicit resume / model-capable** — same throwaway working directory and explicit P1 session ID, terminal JSON output, prompt: `Reply with exactly CCA_RESUME_OK and nothing else.` Capture the same facts and session-ID continuity. Watchdog: 20 minutes.
3. **P3 stop / model-capable** — fresh caller-supplied UUID if locally supported; terminal JSON mode; fixed prompt requesting a long harmless reasoning response. Start the child, confirm it remains running briefly, request termination through one chosen Windows process-control method, then record stop latency, exit/termination fact, stdout/stderr presence and parse state. Do not wait for a completed model response merely to obtain partial output. Watchdog from launch to forced cleanup: 2 minutes.
4. **P4 invalid resume / expected local failure** — explicit newly generated nonexistent UUID, terminal JSON output, short fixed safe prompt. Record exit, streams, parser surface, latency, and whether any evidence suggests a model request or new session. Watchdog: 2 minutes.

P2 must not run unless P1 yields a non-empty structured session ID. P3 and P4 may run after a P1/P2 evidence failure only if doing so does not require a retry, changed command profile, or scope expansion; explain the decision in the Report.

### Forbidden actions

- No product source/test/config/dependency changes.
- No stream-json probe, fork, `--continue`, interactive/TUI invocation, tool call, MCP/plugin installation, authentication change, Claude Code update, model/backend reconfiguration, or prompt using repository content.
- No extra attempt to clarify ambiguous output, resume a stopped session, or test a second termination mechanism.
- No deletion outside the exact throwaway working directory.
- Do not include full raw model transcripts, private paths beyond the already documented executable path, secrets, environment dumps, or raw user configuration in the Report.

### Escalation

Return `PROBE_AUTHORITY_REQUEST` before exceeding any invocation/model/time/write/state boundary. Include the blocked question, evidence already obtained, proposed exact additional action, and incremental side effect. Do not infer that the user's low-cost DeepSeek backend removes the invocation cap.

## References

- `docs/construction/records/claude-code-adapter/reports/CCA-research-001-cli-session-contract.researching.md`
- `docs/construction/runbook/procedures/controlled-probe.md`

## Acceptance

- Report the exact command shape with prompts and sensitive/default state redacted; local executable version; isolation and suppression controls; and actual budget consumed.
- For each launched probe, report elapsed time, exit/termination fact, stdout/stderr presence, JSON parse result, observed session ID relation, and the narrow adapter conclusion supported.
- Keep process facts distinct from parser/model-result facts, including timeout or cancellation.
- Report throwaway-directory cleanup and explicitly identify permitted residual user-level session-history state.
- State which of create/resume/stop/invalid-resume behavior is proven, contradicted, or still unknown for local `2.1.172` with the configured DeepSeek backend.
- End with a recommendation for the first ClaudeCodeAdapter argument/parser/process profile; do not implement it.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-probe-001-json-session-process.researching.md`. Commit only that Report with message `research: probe Claude Code session process behavior`. Leave the worktree clean and report the commit SHA. The Task and reusable procedure are Orchestrator-owned authorization artifacts and are not part of the Worker's Report commit.
