# CCA-probe-002 Researching Report

- work: researching
- result: completed
- implementation subject: none
- orchestration baseline: `90cb47a379a5f3dedaca4643839f7cf9a9ab28cd`
- lease: `claude-code-researcher-01@1`

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: no product architecture decision; stdin delivery and active child termination were evidenced, but terminal JSON/session behavior and explicit resume continuity remain unproven. No retry or profile change was requested.

## Exact question and corrected probe authority

CCA-probe-001 consumed three local CLI slots because its shell-style argument assembly failed to deliver the positional prompt. This independent corrected probe was authorized to repeat create, explicit resume, active Windows stop, and invalid resume using `.NET ProcessStartInfo.ArgumentList` and UTF-8 redirected stdin.

This Task allowed four additional service-capable Claude CLI launches and at most three additional potentially model-bearing launches. The required order was P1 create, conditional P2 explicit resume, P3 active stop, P4 invalid resume. P2 was conditional on a non-empty structured P1 session ID and was therefore skipped.

## Environment and frozen process profile

- Native executable: `C:\Users\Dreamjiao\AppData\Local\Microsoft\WinGet\Packages\Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe\claude.exe`.
- Metadata check: `2.1.172 (Claude Code)`, matching the required local version.
- Harness: PowerShell `7.6.3` with `.NET ProcessStartInfo.ArgumentList` available. `UseShellExecute=false`, redirected stdin/stdout/stderr, and every Claude option added as a separate `ArgumentList` token.
- Isolation: one newly created directory below `%TEMP%`; no repository or existing project directory.
- Fixed option tokens: `--print`, `--bare`, `--tools`, empty value, `--permission-mode`, `dontAsk`, `--strict-mcp-config`, `--disable-slash-commands`, `--setting-sources`, empty value, `--output-format`, `json`, and `--no-chrome`.
- Prompt channel: prompt was never an argument; the exact fixed prompt was encoded with `[Text.Encoding]::UTF8`, written to redirected stdin, and stdin was closed before observation.
- P3 used one fresh caller-supplied UUID with locally advertised `--session-id`; after stdin close the child was observed for five seconds, then `.Kill()` was used once if still alive.

No credentials, environment-secret values, user Claude configuration, existing sessions, caches, histories, or unrelated files were inspected. No tools, MCP servers, plugins, hooks, interactive prompts, repository data, or external-action requests were used.

## Actual additional invocation evidence

All values below are process/parser observations from the bounded harness. No full transcript or private state was retained.

| Probe | Launched | Elapsed | Process fact | stdin | stdout | stderr | JSON/session/result |
|---|---:|---:|---|---:|---|---|---|
| P1 create | yes | 8089 ms | exit code `0` | 50 UTF-8 bytes | present | absent | not JSON; text `CCA_CREATE_OK`; no session ID |
| P2 explicit resume | no | n/a | skipped because P1 yielded no structured session ID | n/a | n/a | n/a | untested |
| P3 active stop | yes | 5043 ms | alive after 5 s; one `Process.Kill`; exit code `-1`; stop latency about `36 ms` | 222 UTF-8 bytes | absent | absent | no JSON/session/result |
| P4 invalid resume | yes | 8039 ms | exit code `0` | 55 UTF-8 bytes | present | absent | not JSON; text `CCA_INVALID_RESUME`; no session ID |

The corrected harness eliminated the previous missing-input error: P1 and P4 accepted closed stdin and returned the requested text; P3 also remained alive after stdin close. This proves process-level stdin delivery to the print invocation. It does not by itself prove whether the returned text came from a model response or a CLI path that ignored part of the frozen option profile.

Despite `--output-format json` being added as an individual token, P1 and P4 emitted plain text and no session ID. The result is therefore not a valid JSON create response. A likely explanation is that one of the empty-valued variadic options (`--tools` or `--setting-sources`) affected later option interpretation in this local version, but determining that would require a changed profile or retry, both outside this authorization. This is an inference only.

P4 also returned its prompt text with exit code 0 rather than a deterministic invalid-session failure. Because no structured output or session identity was produced, this does not prove that `--resume` was honored, ignored, or treated as a model request. Invalid-resume behavior remains unknown.

## Results by required behavior

| Behavior | Status for local `2.1.172` with configured DeepSeek backend | Narrow conclusion |
|---|---|---|
| stdin delivery | process-level proven | UTF-8 bytes reached the redirected stdin path, stdin closed cleanly, and the CLI no longer reported missing input. Semantic model consumption is not independently proven. |
| P1 terminal JSON create | not proven | P1 exited 0 with plain text and no session ID; no JSON schema or create-session binding can be inferred. |
| P2 explicit resume continuity | not run; unknown | Correctly gated off because P1 had no structured session ID. |
| P3 active process stop | partially proven | A still-running child survived five seconds after stdin close and was terminated once with `Process.Kill` in about 36 ms. This is not proof of cancelling an active model turn or of transcript resumability. |
| P4 invalid resume | not proven | Exit 0/plain text does not establish explicit resume semantics or invalid-ID handling under the frozen profile. |
| stdout/stderr separation | observed for these outcomes | P1/P4 were stdout-only; P3 had neither stream. Success-path diagnostic separation remains unproven. |

## Incremental and cumulative budget

| Scope | Service-capable launches | Potentially model-bearing launches | Evidence |
|---|---:|---:|---|
| CCA-probe-001 | 3/4 | 3/3 slots launched; no model request evidenced | P1/P3/P4 failed at local missing-input validation; P2 skipped |
| CCA-probe-002 | 3/4 | 3/3 slots launched | P1/P4 may have reached a model-capable path; P3 was killed before a terminal result; exact request status is unknown |
| Cumulative actual launches | 6 | 6 potentially model-bearing slots launched across the two separate authorizations | No further invocation is authorized in this Task |

No automatic retry occurred. The unused fourth service-capable slot in CCA-probe-002 was not consumed.

## Construction implication and recommendation

The corrected harness proves that `.NET ProcessStartInfo.ArgumentList` plus closed UTF-8 stdin avoids the probe-001 missing-input failure. It does not prove that the frozen suppression profile is compatible with local `2.1.172` JSON output or session flags: P1/P4 produced plain text and no session IDs, and P2 could not run.

The first Windows ClaudeCodeAdapter profile should therefore:

1. use the native executable directly and `.NET ProcessStartInfo.ArgumentList` with one token per option;
2. deliver the ordinary prompt through UTF-8 stdin, then close stdin before waiting;
3. capture stdout, stderr, process exit/kill/timeout, and JSON parsing as independent facts;
4. require a parsed session ID before persisting a created backend session or attempting explicit resume;
5. avoid `--continue` and fork, and treat empty-valued variadic suppression flags as compatibility-sensitive until separately resolved by authorized evidence.

This is a bounded evidence recommendation, not product implementation authority or the final Orchestrator architecture decision. A further probe changing the empty-option profile or retrying P1/P4 would require a new `PROBE_AUTHORITY_REQUEST`/authorization delta.

## Verification, cleanup, and tool integrity

- Lease continuity confirmed before action: `claude-code-researcher-01@1`, same research Worker, expected epoch `1`.
- Incremental budget consumed: `3/4` additional service-capable launches and `3/3` additional potentially model-bearing launches; P2 was not launched; no retry.
- Cumulative across CCA-probe-001 and CCA-probe-002: six service-capable child launches. CCA-probe-001 recorded no model request evidence; CCA-probe-002 P1/P4 request status remains unknown and P3 was terminated before a terminal result.
- Metadata-only checks: native executable/version and `.NET ArgumentList` availability; not counted against the service-capable budget.
- The exact newly created `%TEMP%` directory was removed and verified with `exists_after=False`.
- User-level Claude history/session state was not located, inspected, modified, or deleted. Any normal throwaway history residue remains within the Task's permitted boundary.
- No product code, tests, dependencies, prior Report, configuration, credentials, or unrelated files were modified.
- Repository started at `90cb47a379a5f3dedaca4643839f7cf9a9ab28cd` on `main` with clean status. Only this Report is authorized for writing.

## Deviations and remaining risk

No authorized boundary was exceeded. P1/P4 did not produce terminal JSON or session IDs, so create schema, explicit resume continuity, and invalid-resume behavior remain unproven. P3 proves only child-process termination, not backend cancellation semantics. No additional service call is made without a new authorization delta.
