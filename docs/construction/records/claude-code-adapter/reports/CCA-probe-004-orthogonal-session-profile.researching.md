# CCA-probe-004 Orthogonal Print and Session Profile Report

- work: testing
- result: failed
- implementation subject: none
- orchestration baseline: 5206fea
- lease: claude-code-researcher-01@1

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: stop after the single authorized P1 launch; do not retry or substitute a profile; ordinary/session and isolation conclusions remain unproven by this Task.

## Work and evidence

Lease continuity was confirmed. The required files were read in the specified order. The starting repository was `5206feab0afa1c3745438d3ec778e4e3ad263b9c`, with a clean worktree. Metadata-only verification found the expected native Claude Code version `2.1.172 (Claude Code)` at the previously established native executable path.

The probe harness created one collision-resistant root below `$env:TEMP`, with only `cwd` and `config` children. Every child process inherited the existing environment and received only the temporary `CLAUDE_CONFIG_DIR`; no environment values, credentials, user configuration, normal history, or existing sessions were inspected or copied. The fixed prompt was written through UTF-8 redirected stdin and stdin was closed. The process used `.NET ProcessStartInfo`, `UseShellExecute=false`, redirected stdin/stdout/stderr, and one `ArgumentList` token per argument.

### Ordered call ledger

| Call | Redacted argv shape | Prompt path | Result |
|---|---|---|---|
| P1 ordinary JSON create | `--print`, `--output-format`, `json` | UTF-8 stdin: `CCA_PROFILE_CREATE_OK` fixed-response prompt | Launched and counted as service-capable/potentially model-bearing. The inline harness entered its conditional stop path before P2. Its stdout/stderr, exit code, JSON parse, root keys/types, result, and session relation were not returned to the parent process. |
| P2 ordinary explicit resume | `--print`, `--resume`, `<P1_SESSION_ID>`, `--output-format`, `json` | Not run | Correctly skipped; no safely retained P1 ID. |
| P3 bare-only JSON create | `--print`, `--bare`, `--output-format`, `json` | Not run | Correctly skipped because the sequence stopped before P2/P3. |
| P4 bare plus empty setting sources | `--print`, `--bare`, `--output-format`, `json`, `--setting-sources`, `<EMPTY_ARG>` | Not run | Correctly skipped. |
| P5 bare plus empty tools | `--print`, `--bare`, `--output-format`, `json`, `--tools`, `<EMPTY_ARG>` | Not run | Correctly skipped. |

The P1 process was launched once and the conditional sequence terminated without a second invocation. The missing P1 evidence is a harness-observation failure, not evidence that P1 returned plain text, failed authentication, failed parsing, or lacked a session ID. The harness appended the result object to a PowerShell generic list without suppressing the list method’s integer return value; the caller therefore received an array, and the session-ID property test took the stop branch. No alternative profile or retry is authorized, so this cannot be repaired by another call in this Task.

## Verification or result

### Budget

- This Task incremental budget: `1/5` service-capable invocations launched; `0/4` additional calls launched; `P1` is conservatively counted as potentially model-bearing.
- Conditional calls launched: P1 only. P2–P5: zero.
- Prior probe actuals recorded earlier in this lease were 3 (probe-001), 3 (probe-002), and 2 (probe-003); including this P1, the cumulative service-capable invocation count is 9. This Task adds no model request classification beyond conservatively counting P1 as potentially model-bearing.
- No retry, sixth call, process-stop probe, tool/MCP/plugin/hook action, or external action occurred.

### Cleanup

The harness executed its `finally` cleanup against the exact generated probe root, recursively removing only that root after the P1 observation path. Because the harness returned before printing its summary object, the generated path and a post-delete existence check were not surfaced to the parent. No normal user-level Claude state was inspected or modified. No repository temporary files were created.

### Evidence conclusion

This Task produced no valid P1 response evidence and therefore does not answer whether ordinary `--print --output-format json` creates a structured session or whether `--resume`, `--bare`, `--setting-sources` empty, or `--tools` empty changes framing. The prior research conclusion remains the only supported one: strict-profile failures must not be generalized to ordinary 2.1.172 print/session behavior.

The exact supported implementation profile is consequently unchanged: use tokenized `ProcessStartInfo.ArgumentList`, UTF-8 stdin followed by close, and explicit JSON/session handling only as a pending contract. Do not promote the strict isolation bundle to an implementation guarantee from this failed probe.

## Context and tool integrity

No `claude -p` shell wrapper, authentication, installation/update, credential/config/history/session inspection, product-code operation, delegation, or stop probe was performed. The one service-capable native CLI launch used only the Task-fixed prompt and temporary cwd/config isolation. The single P1 slot is consumed; no automatic retry is permitted by the Task.

## Deviations and remaining risk

- P1 evidence was lost by the inline harness’s PowerShell return-value bug. This is a test-harness defect, not a Claude Code behavior conclusion.
- The exact temporary root path and post-cleanup existence result were not emitted, although cleanup was invoked in `finally`; normal user state was intentionally not searched to compensate.
- A future rerun requires a new authorization delta because the current Task forbids retries/alternative profiles and its P1 budget is consumed.
