# CCA-probe-003 Equals-Empty JSON Resume Controlled Probe

- owner: ClaudeCodeAdapter evidence
- follows: CCA-probe-002
- affected modules: none; evidence only
- workflow: W2 plus Controlled Probe gate
- base reason: CCA-probe-002 proved stdin and process stop but independent empty argv values likely prevented later JSON/session flags from being honored.
- implementation/product subject: none
- orchestration baseline: 9d9ef89

## Objective

Close the remaining terminal JSON and explicit session-resume questions using a final Windows-compatible profile that encodes empty setting/tool selections as single `--option=` tokens rather than independent empty argv elements.

## Scope and authority

- read scope: this Task; explicitly loaded Controlled Probe procedure; CCA-research-001 and CCA-probe-001/002 Reports; metadata-only local help/version; process/stdout/stderr facts produced by this probe; Git status and the exact Report path.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-probe-003-equals-empty-json-resume.researching.md` and one newly created throwaway directory below the current user's temporary directory.
- delegated discretion: choose collision-resistant temporary names/UUIDs; implement the same bounded `.NET ProcessStartInfo` harness; redact or summarize bounded output evidence.
- tools/external actions: local shell/process inspection; local Claude Code executable; at most three additional service-capable Claude CLI invocations, all conservatively counted as potentially model-bearing; normal Git status/diff/add/commit limited to the Report. Read-only help/version and non-Claude local harness checks do not consume the three slots.
- delegation: none.

## Frozen decisions and escalation

### Final argument/input profile

- Use a new throwaway directory below `$env:TEMP` and the same native Claude Code `2.1.172` executable. Stop before service calls if the version changed.
- Use `.NET ProcessStartInfo` with `UseShellExecute=false`, redirected stdin/stdout/stderr, and one `ArgumentList` entry per token. Prompt bytes use UTF-8 redirected stdin and stdin is closed before waiting.
- Exact common token order is:
  1. `--print`
  2. `--bare`
  3. `--permission-mode`
  4. `dontAsk`
  5. `--strict-mcp-config`
  6. `--disable-slash-commands`
  7. `--output-format`
  8. `json`
  9. `--no-chrome`
  10. optional probe-specific session flag and value
  11. `--setting-sources=`
  12. `--tools=`
- `--setting-sources=` and `--tools=` are each one non-empty argv token containing an equals sign; do not split either into an option plus empty element. Do not reorder, remove, or substitute these controls.
- Do not inspect or modify credentials, secrets, user Claude configuration, existing sessions, caches, histories, or unrelated files. Do not locate or delete user-level Claude records. Normal throwaway history residue remains authorized.

### Invocation budget and sequence

This is a fresh, non-transferable maximum of three launches and the final compatibility probe under the current architecture decision. Every launch consumes one slot. No automatic retry or alternate profile is authorized.

1. **P1 create** — no session flag; stdin `Reply with exactly CCA_CREATE_OK and nothing else.`; terminal JSON. Watchdog: 20 minutes.
2. **P2 explicit resume** — only if P1 returns a non-empty structured session ID; add `--resume`, then the exact P1 ID before the final two equals-empty tokens; stdin `Reply with exactly CCA_RESUME_OK and nothing else.`; terminal JSON. Watchdog: 20 minutes.
3. **P4 invalid resume** — add `--resume`, then a fresh nonexistent UUID before the final two equals-empty tokens; stdin `Reply with exactly CCA_INVALID_RESUME and nothing else.`; terminal JSON. Watchdog: 2 minutes.

Do not repeat the stop probe. CCA-probe-002 is accepted as sufficient MVP evidence that the Adapter can terminate a live child and observe a process-stop fact; graceful backend cancellation, partial output, and stopped-session resumability remain deferred.

P4 may run after P1/P2 failure only with the exact unchanged common profile. If any result requires changed flags, a retry, private-state inspection, or a fourth launch, stop and report the compatibility limit. Do not request another probe merely to make the expected result pass.

### Forbidden actions

- No product/source/test/config/dependency changes; no stream-json, fork, continue, TUI, tools, MCP/plugins/hooks, authentication/update/backend changes, repository-content prompts, retries, alternate process control, or cleanup outside the throwaway directory.
- Do not amend earlier probe Reports.
- No fourth service-capable invocation and no alternate empty-value representation.

## References

- `docs/construction/records/claude-code-adapter/reports/CCA-research-001-cli-session-contract.researching.md`
- `docs/construction/records/claude-code-adapter/reports/CCA-probe-001-json-session-process.researching.md`
- `docs/construction/records/claude-code-adapter/reports/CCA-probe-002-stdin-session-process.researching.md`
- `docs/construction/runbook/procedures/controlled-probe.md`

## Acceptance

- Report incremental and cumulative invocation/model-bearing budgets across all three Tasks.
- For each launched probe, report elapsed time, exit fact, stdout/stderr presence, JSON parse result, bounded schema/key evidence, session-ID relation, and narrow conclusion.
- Determine whether equals-empty tokens preserve isolation controls while allowing `--output-format json` and `--resume` to be honored on local `2.1.172`.
- Keep process, streams, parser, session, and model-result facts separate.
- Report temporary-directory cleanup and permitted residual history without inspecting user-level state.
- Freeze one first-Adapter Windows profile or a precise local-version incompatibility; no further probe recommendation is required for this milestone.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-probe-003-equals-empty-json-resume.researching.md`. Commit only that Report with message `research: close Claude Code JSON resume probe`. Leave the worktree clean and report the commit SHA. This Task is an Orchestrator-owned authorization artifact and is not part of the Worker's Report commit.
