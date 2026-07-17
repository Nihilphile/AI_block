# CCA-probe-001 Researching Report

- work: researching
- result: completed
- implementation subject: none
- orchestration baseline: `560b0795073db35c5a1ba156e1d8161a5a337c8e`
- lease: `claude-code-researcher-01@1`

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: no product architecture decision; the authorized probe was stopped after the fixed P1/P3/P4 attempts exposed a local argument-delivery failure. No retry or expanded probe authority was requested.

## Exact question and probe authority

This probe was intended to close four version-specific facts for local Claude Code `2.1.172`: terminal JSON create, explicit session-ID resume, Windows process termination, and invalid-resume behavior.

The Orchestrator authorized exactly four ordered service-capable slots, at most three possible model requests, P1/P2 watchdogs of 20 minutes, P3/P4 watchdogs of 2 minutes, and no retries. P2 was conditional on a non-empty P1 session ID. Only P1, P3, and P4 were launched; P2 was correctly skipped.

## Environment and invocation profile

- Executable: native local path already established by CCA-research-001: `C:\Users\Dreamjiao\AppData\Local\Microsoft\WinGet\Packages\Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe\claude.exe`.
- Metadata check immediately before probing: `2.1.172 (Claude Code)`; exact expected version matched.
- Working directory: one newly created collision-resistant directory below `%TEMP%`, represented here as `%TEMP%\\cca-probe-001-<random>`.
- Fixed controls: `--bare`, `--tools ""`, `--permission-mode dontAsk`, `--strict-mcp-config`, `--disable-slash-commands`, `--setting-sources ""`, `--output-format json`, and `--no-chrome`.
- P1/P2 prompt text: `Reply with exactly CCA_CREATE_OK and nothing else.` and `Reply with exactly CCA_RESUME_OK and nothing else.`
- P3 prompt: a harmless long arithmetic/geometry response request, with no tool, file, or external-action request; a caller-supplied UUID was passed through locally advertised `--session-id`.
- P4 prompt: `Reply with exactly CCA_INVALID_RESUME and nothing else.` with a newly generated nonexistent UUID passed to `--resume`.

The profile was intended to suppress tools, MCP, plugins, hooks, interaction, Chrome, slash commands, and standard setting-source discovery without inspecting private configuration. No credentials, user configuration, existing sessions, history files, caches, or unrelated user files were inspected.

## Actual invocation evidence

All stream and parser facts below are process facts from the bounded child-process harness. Output previews are summarized; no full transcript or private state was retained.

| Probe | Launched | Elapsed | Process fact | stdout | stderr | JSON | Session/result |
|---|---:|---:|---|---|---|---|---|
| P1 create | yes | 1551 ms | exit code `1` | absent | present | not parsed | no session ID; no result |
| P2 explicit resume | no | n/a | skipped because P1 had no session ID | n/a | n/a | n/a | untested |
| P3 Windows stop | yes | 1076 ms | still running after 1 s; terminated with `Process.Kill`; observed stop latency about `53 ms`; .NET exit code `-1` | absent | present | not parsed | no session ID; no result |
| P4 invalid resume | yes | 1345 ms | exit code `1` | absent | present | not parsed | no session ID; no result |

P1, P3, and P4 each returned the same local CLI validation surface on stderr:

`Error: Input must be provided either through stdin or as a prompt argument when using --print`

Therefore the CLI did not receive the intended positional prompt argument in any launched attempt. The most likely boundary is the Windows argument serialization around empty-valued variadic options such as `--tools ""` and `--setting-sources ""`, but this is an inference, not a proven root cause. The evidence does not establish that any model request reached DeepSeek; it establishes only that three service-capable child processes were launched and all failed at the same input-validation surface. No automatic retry occurred.

## Results by required behavior

| Behavior | Status for local `2.1.172` | Narrow conclusion |
|---|---|---|
| P1 terminal JSON create | unknown | No JSON or session ID was produced because the prompt was rejected before a valid print invocation. |
| P2 explicit session-ID resume | unknown / not run | Correctly gated off by the task; no session ID existed. |
| P3 Windows stop | partially evidenced | `Process.Kill` terminated a still-running Claude child with approximately 53 ms stop latency, but this was pre-model input validation, not cancellation of an active backend turn. Claude session/transcript cancellation semantics remain unknown. |
| P4 invalid resume | unknown | The failure was missing-input validation, not invalid-session handling. No conclusion about lookup, exit code, or model-request avoidance is justified. |
| stdout/stderr separation | observed locally | All three failures were stderr-only with no stdout. This does not prove the success-path separation contract. |
| terminal JSON schema | unknown | No JSON was emitted. |

## Compatibility and construction implication

The probe contradicts no documented Claude session behavior; it failed before reaching create, resume, or invalid-resume semantics. It does expose a construction risk: a Windows adapter must test its exact argv serialization independently of the service path, especially when passing empty values to variadic CLI flags. The adapter must not interpret these failures as backend launch failure, session failure, or invalid-resume failure without preserving the raw process/parser distinction internally.

The first adapter profile should remain conservative:

1. Invoke the exact native executable directly with a verified Windows argv builder.
2. Put the positional prompt in an unambiguous final argument position and initially avoid empty-valued variadic flags until their local-only serialization is verified.
3. Capture stdout and stderr independently; parse terminal JSON only after process completion, and retain non-zero/kill/timeout facts separately from parser facts.
4. Use no implicit `--continue` or fork. Once a valid create probe exists, use only explicit `--resume <session-id>` for the stored Actor session.

This is a recommendation for the next adapter argument/parser/process profile, not an implementation authorization or final architecture decision. A corrected probe would require a new authorization delta because this Task forbids retries or replacing the failed command profile.

## Verification, cleanup, and tool integrity

- Lease continuity confirmed before action: `claude-code-researcher-01@1`, same ClaudeCodeAdapter research Worker, expected epoch `1`.
- Invocation budget consumed: `3/4` service-capable CLI invocations launched (`P1`, `P3`, `P4`); `1/4` slot remained unused; `P2` was not launched by rule.
- Possible model requests: `0 evidenced`; the same local input-validation error appeared before any JSON/session result. This is not a network-level proof of zero request traffic.
- Metadata-only checks: exact native executable existence and `--version`; not counted against the service-capable budget.
- No product source, tests, dependencies, configuration, credentials, user-level Claude state, existing sessions, or unrelated files were changed or inspected.
- The exact newly created `%TEMP%` throwaway directory was removed after the probes. Cleanup verification reported `exists_after=False`.
- No user-level history/session records were located, inspected, or deleted. The Task permitted residual throwaway history records; none were assessed.
- Repository started at `560b0795073db35c5a1ba156e1d8161a5a337c8e` on `main` with a clean worktree. Only this Report is authorized for writing.

## Deviations and remaining risk

The authorized probe sequence could not test model behavior because the harness command line failed local prompt delivery. No retry, alternate termination mechanism, changed profile, or authority expansion was performed. Create/resume/invalid-resume semantics, successful terminal JSON shape, and active-turn cancellation remain unproven for `2.1.172` with the configured DeepSeek backend.
