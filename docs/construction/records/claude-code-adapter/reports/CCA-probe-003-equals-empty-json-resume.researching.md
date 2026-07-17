# CCA-probe-003 Researching Report

- work: researching
- result: completed
- implementation subject: none
- orchestration baseline: `a2354662a1c77bf18897cfce3dac030e9e9b20ff`
- lease: `claude-code-researcher-01@1`

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: freeze a local-version compatibility limit; do not recommend another probe and do not select a product architecture.

## Exact question and final authorization

This final probe tested whether local Claude Code `2.1.172` honors terminal JSON and explicit session flags when the empty isolation selections are encoded as single `--setting-sources=` and `--tools=` tokens. The required order was P1 create, conditional P2 explicit resume, and P4 invalid resume. P3 was deliberately not repeated.

The Task authorized at most three additional service-capable launches, all conservatively counted as potentially model-bearing, with P1/P2 20-minute watchdogs, P4 a 2-minute watchdog, UTF-8 stdin only, no retry, and no alternate profile.

## Environment and exact profile

- Executable: native `C:\Users\Dreamjiao\AppData\Local\Microsoft\WinGet\Packages\Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe\claude.exe`.
- Metadata check: `2.1.172 (Claude Code)`, unchanged.
- Harness: PowerShell `7.6.3`, `.NET ProcessStartInfo.ArgumentList`, `UseShellExecute=false`, redirected stdin/stdout/stderr, one token per argument.
- Isolation: one new throwaway directory below `%TEMP%`; no repository or existing project directory.
- Common tokens, in exact order:

```text
--print
--bare
--permission-mode dontAsk
--strict-mcp-config
--disable-slash-commands
--output-format json
--no-chrome
--setting-sources=
--tools=
```

For P2/P4, `--resume <session-id>` was inserted immediately before the final two equals-empty tokens. Prompts were not arguments: each fixed prompt was encoded as UTF-8, written to redirected stdin, and stdin was closed before waiting.

## Actual probe evidence

| Probe | Launched | Elapsed | Process fact | stdin | stdout/stderr | Parser/session/result |
|---|---:|---:|---|---:|---|---|
| P1 create | yes | 6106 ms | exit `0`, no timeout | 50 UTF-8 bytes | stdout present; stderr absent | plain text `CCA_CREATE_OK`; JSON false; no session ID |
| P2 explicit resume | no | n/a | skipped because P1 produced no structured session ID | n/a | n/a | untested |
| P4 invalid resume | yes | 8076 ms | exit `0`, no timeout | 55 UTF-8 bytes | stdout present; stderr absent | plain text `CCA_INVALID_RESUME`; JSON false; no session ID |

The equals-empty representation eliminated the previous missing-input error, but it did not produce terminal JSON. Both P1 and P4 returned the requested text with exit 0 and no session metadata. This proves process-level stdin delivery and proves that the child completed, but it does not prove whether the text was a model result or a CLI path that ignored some session/output options.

P4 did not produce a deterministic invalid-session error. Because no structured output or session identity was present, the result cannot distinguish honored `--resume`, ignored `--resume`, or another local profile behavior. P2 was correctly not launched.

## Findings and compatibility limit

| Question | Finding |
|---|---|
| Does `--setting-sources=` plus `--tools=` preserve the intended isolated JSON profile? | Not demonstrated. The profile accepted stdin but still emitted plain text, not JSON. |
| Is JSON create/session binding proven? | No. P1 returned no JSON and no session ID. |
| Is explicit resume continuity proven? | No. P2 was gated off. |
| Is invalid-resume behavior proven? | No. P4 returned plain text exit 0 rather than a classified invalid-session result. |
| Is P3 still needed for MVP process stop? | No. CCA-probe-002's five-second live child plus single `Process.Kill` is accepted as sufficient narrow MVP process-stop evidence; graceful cancellation and stopped-session resumability remain outside the evidence. |

The precise frozen limit is: for local Claude Code `2.1.172`, the tested non-interactive profile with `--bare`, `dontAsk`, strict empty MCP, slash-command suppression, no Chrome, `--setting-sources=`, `--tools=`, and `--output-format json` is not an evidence-backed JSON/session contract. It may be a version/profile incompatibility, but the probe does not identify which option causes the plain-text behavior. No further probe is authorized or recommended merely to make the expected result pass.

## Construction implication

The first ClaudeCodeAdapter cannot safely persist a backend session ID or implement explicit resume from this evidence. It may freeze the process boundary and stdin/termination handling already proven, but JSON parsing/session binding must remain an explicit compatibility failure for `2.1.172` under this isolated profile. The adapter must not synthesize a session ID from text, process ID, or caller UUID, and must preserve plain-text/no-session outcomes as distinct backend facts.

This is a local compatibility finding, not a final product architecture decision and not implementation authority.

## Incremental and cumulative budget

| Task | Service-capable launches | Potentially model-bearing launches | Result |
|---|---:|---:|---|
| CCA-probe-001 | 3/4 | 3/3 launched; no request evidenced | P1/P3/P4 local missing-input failure; P2 skipped |
| CCA-probe-002 | 3/4 | 3/3 launched | P1/P4 plain text, request status unknown; P3 killed before terminal result; P2 skipped |
| CCA-probe-003 | 2/3 | 2/3 launched | P1/P4 plain text, request status unknown; P2 skipped |
| Cumulative actual launches | 8 | 8 potentially model-bearing slots launched across the three Tasks | No fourth/further call made |

No automatic retry, alternate profile, P3 repeat, private-state inspection, or authority expansion occurred.

## Verification, cleanup, and tool integrity

- Lease continuity confirmed before action: `claude-code-researcher-01@1`, same Worker and expected epoch `1`.
- Native executable/version matched `2.1.172` immediately before the probe.
- The exact new `%TEMP%` throwaway directory was removed and verified with `exists_after=False`.
- User-level Claude history, sessions, credentials, configuration, caches, and secrets were not located, inspected, modified, or deleted. Any normal throwaway history residue remains within the authorized boundary.
- No product code, prior Report, tests, dependencies, or unrelated files were changed.
- Repository started at `a2354662a1c77bf18897cfce3dac030e9e9b20ff` on `main` with clean status. Only this Report is authorized for writing.

## Deviations and remaining risk

None in authorized scope. Terminal JSON, session ID extraction, explicit resume continuity, and invalid-resume classification remain unavailable for the tested local `2.1.172` profile. The milestone now freezes that compatibility limit rather than extending probing.
