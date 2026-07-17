# CCA-probe-007 Pinned Node Session Matrix Report

- work: testing
- result: completed
- implementation subject: none
- orchestration baseline: e4e3dbb
- lease: claude-code-probe-tester-01@1

## Decisions

- uncertainty found: yes
- implicit decisions found: no
- decisions made or escalation requested: accept the ordinary and bare JSON/session profiles observed on local Claude Code 2.1.172; retain empty setting-source/tools results as observed CLI behavior, while keeping provider semantics separate from client/session evidence.

## Work and evidence

The pinned runner gate passed before any service-capable launch:

- exact path: `C:\Users\DREAMJ~1\AppData\Local\Temp\ai-block-cca-harness-gate-e655e73394214dfc9e84395b850a3532\runner.js`
- required and observed SHA-256: `99F76DEBF39DBED50840E49CDAA6F8DBB07C19D23FC28866D37A45091260B8A3`
- runner was not edited, copied, regenerated, or wrapped; the exact file's `runChild` path was used.
- metadata-only executable check: `2.1.172 (Claude Code)`.

A fresh temporary probe root was used with distinct `cwd` and `config` children. Every child received only the temporary `CLAUDE_CONFIG_DIR` delta, inherited environment values without enumeration, and exact UTF-8 stdin. The runner used tokenized `child_process.spawn` with `shell:false`, separate stdout/stderr, stdin close, and a 1,200,000 ms watchdog.

### Ordered call ledger

All five authorized calls launched sequentially. The displayed argv below redacts only the P1 session value; the executable P2 argv held the actual parsed P1 session ID.

| Call | Redacted argv | Elapsed | Exit/signal/timeout | Streams | JSON/result/session evidence |
|---|---|---:|---|---|---|
| P1 | `--print`, `--output-format`, `json` | 5,261 ms | `0` / `null` / `false` | stdout yes, stderr no | parsed; result `CCA_PROFILE_CREATE_OK`; non-empty session ID |
| P2 | `--print`, `--resume`, `<SESSION_ID>`, `--output-format`, `json` | 3,292 ms | `0` / `null` / `false` | stdout yes, stderr no | parsed; result `CCA_PROFILE_RESUME_OK`; returned session matched P1 |
| P3 | `--print`, `--bare`, `--output-format`, `json` | 30,813 ms | `0` / `null` / `false` | stdout yes, stderr no | parsed; result `CCA_PROFILE_CREATE_OK`; non-empty session ID |
| P4 | `--print`, `--bare`, `--output-format`, `json`, `--setting-sources`, `<EMPTY_ARG>` | 3,591 ms | `0` / `null` / `false` | stdout yes, stderr no | parsed; result `CCA_PROFILE_CREATE_OK`; non-empty session ID |
| P5 | `--print`, `--bare`, `--output-format`, `json`, `--tools`, `<EMPTY_ARG>` | 2,998 ms | `0` / `null` / `false` | stdout yes, stderr no | parsed; result `CCA_PROFILE_CREATE_OK`; non-empty session ID |

Each parsed root had the same bounded key set: `api_error_status`, `duration_api_ms`, `duration_ms`, `fast_mode_state`, `is_error`, `modelUsage`, `num_turns`, `permission_denials`, `result`, `session_id`, `stop_reason`, `subtype`, `terminal_reason`, `time_to_request_ms`, `total_cost_usd`, `ttft_ms`, `ttft_stream_ms`, `type`, `usage`, `uuid`. Their observed types were respectively `null, number, number, string, boolean, object, number, array, string, string, string, string, string, number, number, number, number, string, object, string`.

The P2 pre-launch assertion verified that `--resume` was immediately followed by the actual P1 session ID and contained no placeholder. The runner's separate display copy showed `<SESSION_ID>` only. P2 returned the same session ID and the expected resume result.

## Verification or result

The fresh incremental budget was `5/5` service-capable invocations. The prior recorded cumulative count was `11`; this task leaves the cumulative count at `16`. No retry, sixth call, alternate empty spelling, extra flag, stop probe, fork, continue, or fallback to normal user config occurred.

Ordinary create and explicit resume are confirmed for this isolated local 2.1.172 profile. `--bare` preserved structured JSON and session metadata in P3. The final empty `--setting-sources` and empty `--tools` argv forms also returned structured JSON and session metadata in P4/P5. These observations establish CLI/client framing and session continuity under the configured environment; they do not independently identify provider-side behavior or prove that no model request occurred. No secrets, credentials, normal-user config, history, or existing sessions were inspected.

### Cleanup

In the authorized `finally` cleanup:

- fresh probe root `C:\Users\DREAMJ~1\AppData\Local\Temp\cca-probe-007-633804dfa29b4bcc995b9437e7b91d5a` was deleted and verified `exists_after=false`;
- pinned harness root `C:\Users\DREAMJ~1\AppData\Local\Temp\ai-block-cca-harness-gate-e655e73394214dfc9e84395b850a3532` was deleted and verified `exists_after=false` after evidence was materialized;
- no repository path other than this Report was changed.

## Context and tool integrity

Lease continuity remained `claude-code-probe-tester-01@1`. The only service-capable process launches were the five exact authorized P1–P5 calls through the pinned Node runner. No network operation, installation/update, credential/config/session inspection, delegation, product-code execution, or harness modification occurred.

## Deviations and remaining risk

- The initial local controller attempt failed to load the runner due to a Windows path-escape error and launched zero Claude calls; it was corrected before P1 and did not consume budget.
- Provider-specific behavior remains unisolated; results are client/session observations under the configured backend.
