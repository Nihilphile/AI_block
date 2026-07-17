# CCA-research-002 Print, Session, and Isolation Profile Matrix Report

- work: researching
- result: completed
- implementation subject: none
- orchestration baseline: 5d8a280
- lease: claude-code-researcher-01@1

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: correct the prior over-generalization; do not treat the strict-profile result as the ordinary print/session contract; require one orthogonal baseline comparison before implementation architecture is finalized.

## Work and evidence

### Version and source applicability

The local native executable is `2.1.172 (Claude Code)`. Local metadata/help was read without invoking a prompt or model request. The exact local `--bare` help is:

```text
--bare                                Minimal mode: skip hooks, LSP, plugin
                                     sync, attribution, auto-memory,
                                     background prefetches, keychain reads,
                                     and CLAUDE.md auto-discovery. Sets
                                     CLAUDE_CODE_SIMPLE=1. Anthropic auth is
                                     strictly ANTHROPIC_API_KEY or
                                     apiKeyHelper via --settings (OAuth and
                                     keychain are never read). 3P providers
                                     (Bedrock/Vertex/Foundry) use their own
                                     credentials. Skills still resolve via
                                     /skill-name. Explicitly provide context
                                     via: --system-prompt[-file],
                                     --append-system-prompt[-file], --add-dir
                                     (CLAUDE.md dirs), --mcp-config,
                                     --settings, --agents, --plugin-dir.
```

The local help also advertises `--print`, `--resume`, `--output-format text|json|stream-json`, `--tools <tools...>`, and `--setting-sources <sources>`. It does not document empty-value syntax, variadic termination, option-order rules, or any rule that makes `--bare` force text output or disable transcript/session metadata.

Current official documentation is newer than 2.1.172 and must be version-qualified. It says that all CLI options work with `-p`, that `--bare` skips auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and `CLAUDE.md`, and that `--output-format json` returns structured JSON containing the result, session ID, and metadata. It documents an explicit `--resume` flow by extracting `.session_id` from a JSON print result. These are current documented guarantees, not a complete compatibility guarantee for 2.1.172:

- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless) — `-p`, bare mode, stdin, JSON output, and resume examples.
- [CLI reference](https://code.claude.com/docs/en/cli-usage) — current `--bare` description and CLI option applicability.
- [Environment variables](https://code.claude.com/docs/en/env-vars) — `CLAUDE_CONFIG_DIR`, custom endpoints, and provider-related compatibility variables.
- [Claude Code features in the Agent SDK](https://code.claude.com/docs/en/agent-sdk/claude-code-features) — explicit empty `settingSources` semantics and its isolation gaps; SDK evidence is analogous, not a direct CLI parser guarantee.
- [Upstream CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) — the 2.1.51 entry describes `CLAUDE_CODE_SIMPLE` as stripping session memory, skills/custom agents, MCP tools, hooks, and `CLAUDE.md` loading. “Session memory” is not proof that transcript persistence or result metadata is disabled.

### Flag and interaction matrix

| Flag/profile | Semantics supported by evidence | Version applicability and isolation boundary |
|---|---|---|
| `-p` / `--print` | Non-interactive print mode; stdin is a supported input path. | Local help and prior stdin probes confirm availability. Current docs say all CLI options work with it. |
| `--output-format json` | Current docs guarantee structured result/session metadata; local help exposes `json`. | Ordinary 2.1.172 behavior was not tested. The strict profiles produced plain text, so that result cannot invalidate the ordinary contract. |
| `--resume <id>` | Current docs show explicit ID resume, scoped to the same project directory. | Local strict-profile P2 never had a valid ID; invalid-resume behavior was therefore not established. No evidence says bare intentionally ignores resume. |
| `--bare` / `CLAUDE_CODE_SIMPLE=1` | Local help: minimal startup, selected discovery/auth skips, and sets simple mode. Current docs: skips hooks, skills, plugins, MCP, auto memory, and `CLAUDE.md`; only explicit flags take effect. | Exact 2.1.172 implementation has a source conflict: local help says skills still resolve by `/skill-name`, while current docs say skills auto-discovery is skipped. Neither source says JSON, session IDs, persistence, or resume are disabled. |
| `--setting-sources <sources>` | Local help: comma-separated `user, project, local` source selector. Current SDK docs define an empty list as disabling those three sources. | Empty CLI spelling (`--setting-sources=` or a separate empty argv) is not documented by an authoritative 2.1.172 CLI source. Managed policy and global config are separate gaps in the SDK documentation. |
| `--tools <tools...>` | Local help: variadic list; `""` disables built-in tools, `default` enables all, or named tools select a set. | Exact terminator and Windows empty-token behavior are unknown. A variadic option is unsafe to combine with later options until locally isolated. `--tools=` was not documented or isolated. |
| `--strict-mcp-config` | Local help: restrict MCP to explicit `--mcp-config`. | It addresses MCP configuration, not hooks, skills, project settings, output framing, or session persistence. It was bundled in prior probes. |
| `--disable-slash-commands` | Local help exposes the flag. | It addresses slash-command handling only; no evidence it changes JSON/session framing. It was bundled in prior probes. |
| `--no-chrome` | Local help exposes the flag. | It addresses Chrome integration only; no evidence it changes JSON/session framing. It was bundled in prior probes. |
| `--permission-mode dontAsk` | Local help exposes the scalar mode; current docs say `dontAsk` denies unapproved tools rather than prompting. | Permission behavior is orthogonal to output/session framing unless a prompt requires a denied tool. Keep it out of the first baseline. |
| `CLAUDE_CONFIG_DIR=<temp>` | Official docs say it relocates settings, credentials, session history, and plugins under the specified directory. | This is the best documented config/session-state isolation mechanism for a future probe. It does not remove managed policy, and using a temp directory may require already-provided non-interactive authentication; no credentials should be inspected or created. |
| `ANTHROPIC_BASE_URL` / DeepSeek-compatible endpoint | Official env docs describe endpoint/proxy routing and provider-specific compatibility controls. | Provider can affect authentication, API schema, streaming, model response, or timeout behavior. No primary source says it controls the local `--output-format` serializer or transcript lookup. Treat provider causality as a low-confidence alternative. |

### Strongest explanation of prior plain-text results

The strongest supported conclusion is narrower than the earlier report: probes 002 and 003 established that the particular strict profiles returned plain text even when stdin was correctly redirected and, in probe 003, even when `--setting-sources=` and `--tools=` were placed at the end. They did not establish that ordinary `claude -p --output-format json` on 2.1.172 fails, nor that 2.1.172 never emits a session ID.

The leading explanation is an unisolated local 2.1.172 interaction in the strict bundle—most plausibly simple/bare-mode behavior, a suppression flag, or parser handling of an empty variadic/scalar value. Confidence is medium for “the bundle is causal” and low for any single culprit. The probe-003 result weakens the narrower hypothesis that only a later `--output-format` was swallowed by a preceding separate empty variadic value, because output-format preceded both equals-empty tokens, but it does not prove the equals form is accepted as an empty value or that the parser preserved every token.

The DeepSeek-compatible backend is a plausible secondary confounder only after a normal local profile is tested. Its response/API compatibility could cause request failure or content differences, but the documented JSON wrapper, session ID extraction, and local transcript lookup are Claude Code client behavior. There is no authoritative evidence that DeepSeek intentionally changes those flags to text mode. The observed stdout could also be a model response rather than a serializer result; the prior probes did not prove a model request independently of the returned text.

### Prior-probe disposition

- Probe-001 shell-style argv failure remains valid as a launch/argument-construction failure. It is not evidence about Claude Code session behavior.
- Probe-002 correctly established UTF-8 stdin delivery, process acceptance, and a one-shot Windows `Kill` stop result. Its plain-text result is valid only for its exact strict profile; the separate empty `--tools` value remains a parser confounder.
- Probe-003 correctly established that its equals-empty strict profile still returned plain text and no session ID. It did not prove that `--tools=` or `--setting-sources=` is a documented or accepted empty value, and it did not test ordinary print mode.
- The prior broad conclusion that local 2.1.172 generally does not return a session ID is withdrawn. The evidence-backed statement is: “the tested strict profiles did not yield JSON/session evidence.”
- Probe-002 P3 remains sufficient as the existing MVP process-stop observation; this research does not add or repeat a stop probe.

## Verification or result

### Smallest non-executed orthogonal Controlled Probe proposal

No invocation was executed in this task. The smallest useful comparison is five potentially model-bearing calls, all launched from the same newly created temporary working directory and with the same short prompt that requests a fixed harmless text response. Set one fresh temporary `CLAUDE_CONFIG_DIR` for the sequence, do not inspect or copy credentials, and remove only the temporary directory afterward. Do not use `--no-session-persistence`, because the first two calls must test the session contract. A call that returns no usable ID must not be followed by a resume call using a fabricated ID.

1. **Normal create baseline** — `--print --output-format json`, prompt through UTF-8 stdin, no `--bare`, no empty variadic/scalar flags. Expected: one model request; if successful, JSON with `result` and `session_id`; one temporary transcript/session record.
2. **Normal explicit resume** — same directory and config directory; `--print --resume <session_id> --output-format json`, prompt through stdin. Expected: one model request and a structured result if call 1 produced an ID; confirms the ordinary client/session contract.
3. **Bare-only create** — baseline create plus `--bare`, with no `--setting-sources` or `--tools` overrides. Expected: one model request. Compare JSON/session output with call 1; current docs predict no loss of JSON/session behavior, while local 2.1.172 applicability is the open question.
4. **Bare plus setting-source empty** — call 3 plus exactly one empty setting-source representation selected by a separately authorized parser test; do not simultaneously add `--tools` or other strict flags. Expected: one model request; isolates source-selection effect. The representation must be treated as unknown until the local parser accepts it without consuming the next option.
5. **Bare plus tools empty** — call 3 plus exactly one documented/locally verified empty tools representation; no setting-source override. Expected: one model request; isolates tool-list effect. If call 3 has a usable ID, an explicit-resume variant may be authorized later, but it is not part of this minimum five-call plan.

Calls 1–3 are the decisive comparison against bare/provider interaction. Calls 4–5 are only needed if call 3 succeeds and the strict profile still needs factor isolation. `CLAUDE_CONFIG_DIR` and the temporary cwd isolate ordinary/user/project state as far as the public documentation permits; managed policy and provider endpoint remain external variables and must be recorded as unknown, not inspected. Cleanup is limited to the temporary cwd/config directory; no user history or session discovery is permitted.

### Construction implications

1. The adapter contract should first target ordinary `-p` + `--output-format json` and explicit `--resume`, while marking exact 2.1.172 compatibility as pending the baseline comparison.
2. Do not make `--bare`, `--setting-sources`, `--tools`, and the other suppression flags one indivisible “safe profile.” Their isolation goals overlap but are not equivalent, and the empty-value forms are not source-backed for this CLI version.
3. Preserve `.NET ProcessStartInfo.ArgumentList` tokenization and stdin closure. Keep variadic options last only when their parser termination has evidence; ordering alone cannot make an undocumented empty value safe.
4. Keep DeepSeek compatibility separate from local CLI/session evidence. A provider-specific adapter decision requires an authorized comparison, not inference from the strict-profile plain text.
5. Implementation authority should remain paused for the strict profile until the normal baseline is observed or the remaining incompatibility is explicitly accepted as a version limitation.

## Context and tool integrity

Lease continuity was confirmed as `claude-code-researcher-01@1`. This task used only the already-authorized local metadata/help evidence and read-only official/upstream documentation. No `claude -p`, prompt/session/model-service operation, authentication, installation/update, private configuration, credential, history, session inspection, process-stop probe, delegation, or product-code operation was performed. Only the specified report is written.

## Deviations and remaining risk

- Current official docs and upstream notes are not a byte-for-byte 2.1.172 specification; all claims above are version-qualified.
- Public sources do not settle 2.1.172 Windows parsing of `--tools=` or `--setting-sources=`. That remains a controlled-probe question.
- The report deliberately does not make the final architecture decision or authorize the proposed probes.
