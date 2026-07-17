# CCA-probe-005 Validated Orthogonal Session Profile Report

- work: testing
- result: failed
- implementation subject: none
- orchestration baseline: a6944a2
- lease: claude-code-researcher-01@1

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: retain P1 ordinary JSON evidence; reject the P2 result as harness-invalid; stop without retry or substitute profile; do not infer bare/P4/P5 behavior.

## Work and evidence

Lease continuity was confirmed as `claude-code-researcher-01@1`. The required files were read in the specified order. Starting HEAD was `a6944a28f8757b9345c35b2dce02a92380d917d5`, with a clean worktree. Metadata-only version verification confirmed local Claude Code `2.1.172 (Claude Code)`.

The validated process shape was used for the launched calls: `.NET ProcessStartInfo`, `UseShellExecute=false`, tokenized `ArgumentList`, redirected UTF-8 stdin/stdout/stderr, stdin close before wait, bounded observation, and scalar `PSCustomObject` assertion before the P1 session condition. A temporary cwd and temporary `CLAUDE_CONFIG_DIR` were used; inherited environment values were not enumerated or copied, and normal user configuration/state was not inspected.

### Ordered call ledger

| Call | Redacted argv shape | Prompt | Evidence |
|---|---|---|---|
| P1 ordinary JSON create | `--print`, `--output-format`, `json` | UTF-8 stdin, fixed create prompt, 58 bytes | 4,919 ms; exit `0`; stdout present; stderr absent; structured JSON parsed. Root keys included `type`, `subtype`, `is_error`, duration/timing fields, `num_turns`, `result`, `stop_reason`, `session_id`, cost/usage fields, permission/terminal fields, and `uuid`. `result` was a string with `CCA_PROFILE_CREATE_OK`; `session_id` was a non-empty string. Scalar assertion passed and branch was `resume-eligible`. |
| P2 ordinary explicit resume | `--print`, `--resume`, `<P1_SESSION_ID>`, `--output-format`, `json` | UTF-8 stdin, fixed resume prompt, 58 bytes | 2,654 ms; exit `1`; stdout absent; stderr present. The harness mistakenly passed the literal redacted token `<SESSION_ID>` instead of the retained real P1 ID. Claude rejected it locally as not a UUID/session title. This is not valid explicit-resume evidence and must not be interpreted as a product failure. |
| P3 bare-only JSON create | `--print`, `--bare`, `--output-format`, `json` | Not run | The harness stopped after the invalid P2 construction. |
| P4 bare plus empty setting sources | `--print`, `--bare`, `--output-format`, `json`, `--setting-sources`, `<EMPTY_ARG>` | Not run | No call. |
| P5 bare plus empty tools | `--print`, `--bare`, `--output-format`, `json`, `--tools`, `<EMPTY_ARG>` | Not run | No call. |

The P1 result was a scalar `PSCustomObject`, not an array, and its session-property branch was evaluated only after that assertion. P1 is valid evidence that ordinary create under the temporary cwd/config produced terminal JSON with a result and session ID on local 2.1.172 using the configured backend. P2 is invalid as a resume test because the harness failed to retain the unredacted ID separately from its report-safe representation. The P2 empty-stdout parser flag was also not semantically usable; the authoritative observations are stdout absent, stderr present, exit 1, and the local invalid-token diagnostic.

## Verification or result

### Budget

- This Task incremental budget: `2/5` service-capable invocations launched.
- Potentially model-bearing count: both launched conservatively count against the authorized budget; P2 visibly failed local argument validation before a model request, but no private provider state was inspected.
- P1 and P2 ran; P3, P4, and P5 did not run. No retry, alternate spelling, sixth call, process-stop probe, tool/MCP/plugin/hook action, or external action occurred.
- Prior actual service-capable calls recorded in this lease were 9 through probe-004; cumulative service-capable count after this Task is 11.

### Cleanup

The exact generated temporary root was removed after observation. Redacted root shape: `<TEMP>\\cca-probe-005-a2666071fe8d43b983654936a8ae694d`. Post-cleanup check: `exists_after=false`. Only the temporary cwd/config root was targeted. Normal user-level Claude state, credentials, configuration, history, and existing sessions were not inspected or modified.

### Evidence conclusion

1. **Ordinary create:** confirmed for this environment/profile. `--print --output-format json` returned parseable structured JSON with `result` and a usable `session_id`.
2. **Ordinary resume:** unproven. The only P2 call used a harness placeholder rather than the real P1 ID and therefore tested invalid local parsing, not session lookup or provider behavior.
3. **Bare difference:** unproven; P3 was not launched.
4. **Empty setting sources/tools:** unproven; P4 and P5 were not launched.
5. **Provider separation:** P1 proves the CLI/client JSON serializer and session metadata path can operate through the configured environment, but does not isolate provider semantics from client behavior. The P1 response was potentially model-bearing under the authorization; no model/provider request trace was inspected.

The minimum evidence-backed profile now includes ordinary tokenized `--print --output-format json` with UTF-8 stdin and close, and it supports retaining the returned session ID for a future explicitly authorized resume test. It does not support `--resume`, `--bare`, `--setting-sources` empty, or `--tools` empty as validated implementation behavior. No final architecture decision is made.

## Context and tool integrity

Only the native Claude CLI calls authorized by this Task were launched. No authentication, installation/update, secret/config/history/session inspection, network research, product-code operation, delegation, or stop probe occurred. The temporary environment was isolated through a fresh cwd/config root without fallback to normal user configuration. The fresh five-call budget is not reset by the failed P2; two slots are consumed and no retry is authorized.

## Deviations and remaining risk

- The scalar-return fix itself passed for P1, but the harness retained only a redacted session field and reused that redaction for P2 argv. A future run requires a new authorization delta and a corrected in-memory `session_id` field; no repair call is allowed here.
- Because the harness stopped after P2, no evidence was collected for bare mode or either final empty variadic/scalar profile.
- The report intentionally does not modify earlier evidence or resume implementation authority.
