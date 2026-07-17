# CCA-research-001 Researching Report

- work: researching
- result: completed
- implementation subject: none
- orchestration baseline: `3ae0993be1c20d6717caf19bf4fd7cea27c51d5d`
- lease: `claude-code-researcher-01@1`

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: no product architecture decision; evidence supports an explicit create/resume process adapter, while output-terminal, exit-code, signal, timeout, and partial-output mappings remain probe-gated.

## Exact question and blocked decision

The blocked decision is the external behavior boundary for the future `ClaudeCodeAdapter`: how ActorHost launches one non-interactive Claude Code invocation, creates or resumes a session, obtains the session ID and terminal result, and reports process failure without allowing backend details to leak into Runtime Contracts.

This report is bounded to Claude Code CLI/session behavior. It does not authorize implementation, a real service call, authentication, or a Controlled Probe.

## Local executable and applicability

Local discovery on 2026-07-18 found:

| Evidence | Finding | Classification |
|---|---|---|
| `Get-Command claude -All` / `where.exe claude` | npm shims at `C:\Users\Dreamjiao\AppData\Roaming\npm\claude.ps1` and `claude.cmd`; native executable at `C:\Users\Dreamjiao\AppData\Local\Microsoft\WinGet\Packages\Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe\claude.exe` | local observation |
| `claude --version` | `2.1.172 (Claude Code)` | local observation |
| `claude --help` | advertises `-p/--print`, `--resume`, `--continue`, `--fork-session`, `--output-format text|json|stream-json`, `--input-format text|stream-json`, `--system-prompt`, `--append-system-prompt`, `--model`, `--settings`, `--mcp-config`, `--strict-mcp-config`, `--plugin-dir`, `--tools`, `--allowedTools`, `--disallowedTools`, `--permission-mode`, `--no-session-persistence`, and `--session-id` | local-help availability |

The native WinGet path is the safest executable identity to record in a launch spec; PATH resolution currently exposes multiple shims. No prompt/session/model operation was executed. Only version/help and help-only subcommands (`agents`, `mcp`, `plugin`) were run.

The official [Claude Code changelog](https://code.claude.com/docs/en/changelog) records version `2.1.172` on 2026-06-10. The current official [CLI reference](https://code.claude.com/docs/en/cli-reference), [headless-mode guide](https://code.claude.com/docs/en/headless), and [session guide](https://code.claude.com/docs/en/sessions) are authoritative documentation, but are newer than the local binary. Version-qualified statements below are therefore applied only when the source explicitly includes `2.1.172` or an earlier threshold; otherwise they are documented current behavior needing compatibility confirmation.

## Findings by research question

### 1. Non-interactive syntax

Local help explicitly says `-p/--print` prints the response and exits, and accepts a positional prompt. Official CLI usage documents `claude -p "query"` and `-c -p "query"` as non-interactive invocations. Stdin may also be piped; current docs state that piped stdin is capped at 10 MB from v2.1.128 onward and over-cap input exits non-zero. The ordinary positional prompt is the least uncertain input path for the adapter.

`--input-format stream-json` is locally advertised, but the official documentation provides only the flag-level description and the upstream issue [#24594](https://github.com/anthropics/claude-code/issues/24594) records that its framing/use was undocumented. It is not a safe required dependency for the first adapter contract.

### 2. Create, resume, continue, and fork

The official session guide documents that sessions are saved conversations tied to a project directory. `--continue` selects the most recent conversation in the current directory; `--resume <session-id>` resumes an explicit session ID; `--resume <name>` resolves a name; and `--fork-session` used with `--resume` or `--continue` creates a new session ID while leaving the original unchanged. Sessions created by `claude -p` are not shown in the interactive picker, but can be resumed by explicit ID from the directory in which they were created.

The local contract already models the deterministic subset: `create` versus `resume(session_id)`. `continue` is directory-relative and selection-based, so it should not be used as the Actor's stored-session mechanism. Fork is explicitly outside the MVP architecture and should not be silently introduced.

The print command is documented as one non-interactive query that exits. It is reasonable to infer that a resumed `-p` process performs one requested turn and then exits, but the sources do not provide a stronger backend session-liveness or turn-boundary guarantee. A resumed process exit must not be treated as session destruction.

### 3. Output and session identity

The official headless guide documents:

| Mode | Documented shape | Adapter consequence |
|---|---|---|
| `text` | plain text, default | human-readable only; insufficient by itself for reliable session binding |
| `json` | one structured result containing result text, session ID, and metadata/usage | candidate terminal mode; parse stdout as one JSON value, but still verify diagnostics separation |
| `stream-json` | newline-delimited JSON events | candidate live mode; parse line-by-line and preserve raw/typed event facts |

The docs state that stream mode's last line is a `result` message with final response, cost, and session metadata. They also explicitly state that before v2.1.208 a large piped response could truncate the final line and omit that result message. Local `2.1.172` is before that fix, so a terminal-result-line guarantee is not applicable to the exact binary. Current docs also describe `system/init`, retry events, and `session_id` fields; the capability list on `system/init` requires v2.1.205 and is absent from the local version by threshold.

Documented guarantee: session identity is exposed in structured output/stream metadata. Local observation: the flags are available. Inference: the adapter can bind the first successful parsed session ID and carry it to the Server's `session_report`. Unknown: exact `2.1.172` JSON schemas, whether all fatal paths emit parseable terminal JSON, whether stderr is always diagnostically separate, and whether partial stream output is recoverable after interruption.

### 4. Prompt, system prompt, model, working directory, environment, and static configuration

The local help advertises positional prompt/stdin input, `--system-prompt` replacement, `--append-system-prompt` append, `--model`, `--settings` (JSON file or inline JSON), `--mcp-config`, `--strict-mcp-config`, `--plugin-dir`, `--disable-slash-commands`, and `--bare`. The current CLI reference documents system-prompt replacement and append as per-invocation flags. It also documents `--settings` as a per-session override over settings files and `--strict-mcp-config` as limiting MCP loading to the explicitly supplied config.

The child process working directory is the natural working-directory input; official session documentation makes the directory part of session lookup. The OS environment remains a process-launch concern. The [settings guide](https://code.claude.com/docs/en/settings) documents model settings and project/user/local/managed configuration scopes; the adapter must not discover or copy private configuration as part of this report.

The [MCP guide](https://code.claude.com/docs/en/mcp) documents local, project, and user scopes, project `.mcp.json`, and explicit configuration. The local help's `--bare` description further advertises a minimal mode that skips hooks, LSP, plugin sync, attribution, auto-memory, and `CLAUDE.md` discovery while retaining explicit configuration flags. Whether the runtime should use `--bare` is an Actor snapshot policy decision, not closed by this research.

### 5. Tool, permission, interaction, and side-effect controls

The official [permission guide](https://code.claude.com/docs/en/permissions) distinguishes:

- `--allowedTools`: auto-approves matching tools; it does not by itself remove unlisted tools.
- `--tools`: restricts the built-in tool set; current CLI documentation says MCP tools are not affected.
- `--disallowedTools`: deny rules; a bare tool removes it from the model context, while scoped patterns deny matching calls.
- `--permission-mode dontAsk`: a headless-friendly deny-by-default baseline when approvals are predeclared.
- `--permission-mode bypassPermissions` / `--dangerously-skip-permissions`: bypasses permission prompts and is only suitable for isolated environments; it is not a safe default for an unattended ActorHost.

The local help advertises all of these except the current docs' later aliases/options. This supports a static capability ceiling derived from the Actor snapshot, with explicit allow/deny configuration and no dynamic tool installation. It does not prove that every MCP/plugin/hook side effect is suppressed by a particular combination; that remains a controlled compatibility question.

### 6. Exit, streams, cancellation, timeout, partial output, and failures

Official documentation is incomplete as a top-level process contract. It documents non-zero exit for overlarge piped stdin, structured-output validation errors in newer versions, and request-timeout behavior (current default API request deadline is 10 minutes, adjustable by `API_TIMEOUT_MS`). It documents errors and recovery, but does not provide a stable universal mapping from Claude Code CLI exit codes to semantic categories for the local version. It likewise does not define a signal/CTRL+C contract for `2.1.172`, nor a guarantee that partial stdout is complete or that a cancelled session is resumable at a particular transcript boundary.

The current stream guide's `result`-line caveat is directly material to local `2.1.172`; partial output may exist without a terminal result. The adapter therefore must preserve process facts independently of parser success. A launch failure, non-zero exit, signal, stop request, timeout, parser failure, and observed session ID are separate facts; the Supervisor already has corresponding process-fact variants and failure observation paths.

### 7. Stable versus version-sensitive behavior

The following local/documentation compatibility limits are material:

| Behavior | Applicability to `2.1.172` |
|---|---|
| `-p`, explicit `--resume`, `--continue`, `--fork-session`, text/json/stream-json flags | locally advertised; semantic docs apply, exact payload still unprobed |
| `--system-prompt`, `--append-system-prompt`, `--model`, settings/MCP/tool/permission flags | locally advertised; use exact local spellings |
| stream terminal result line with no known large-output truncation | not guaranteed; fix is documented only from v2.1.208 |
| `system/init.capabilities` feature detection | not applicable; docs require v2.1.205+ |
| `--append-subagent-system-prompt`, `--forward-subagent-text` | not locally advertised; docs require later versions; do not use |
| `manual` permission-mode alias | not applicable; current docs require v2.1.200+ |
| `--max-turns` | current docs advertise it, local help does not; availability is unknown, not absent |
| current docs' later plugin/MCP and background-agent changes | do not back-port without a versioned source or local help |

Official changelog entries also show behavior changing frequently across minor versions. The adapter should be version-gated at launch and keep a compatibility table; the report does not recommend an upgrade or installation.

### 8. Facts sufficient to freeze an internal adapter design

Evidence is sufficient to freeze the following internal boundary without a real service call:

1. Initialization receives the immutable `ActorLaunchSpec`, validates executable/configuration, and does not create an empty conversation.
2. Start receives an `InvocationSpec` and launches exactly one `-p` process with ordinary prompt input, static launch configuration, and either no resume flag for `create` or explicit `--resume <session_id>` for `resume`.
3. The adapter returns asynchronous session observation, completion/process facts, and a stop operation; it never decides Run completion or Package routing.
4. Session IDs are accepted only from structured backend output, never synthesized from a prompt or process ID.
5. stdout/stderr and process termination are captured separately; parser failure cannot erase a signal/non-zero/timeout fact.
6. Fork and directory-relative `continue` are not needed for the MVP contract.

This freezes an internal port shape, not the Orchestrator's final choice of JSON versus stream-json, exact argument policy, or stable error taxonomy.

### 9. Minimum Controlled Probe proposal

No probe was run or authorized. The smallest probe set that would close the remaining construction facts is:

| Probe | Command shape (proposal only) | Expected quota/state effect | Success evidence | Cleanup |
|---|---|---|---|---|
| P1 create | isolated cwd; `claude -p <short prompt> --output-format json` | one model request; one persisted session/transcript | exit 0; parseable JSON; non-empty `session_id`; result and process exit captured | retain ID only for P2; purge the throwaway project/session under explicit probe authority |
| P2 resume | same isolated cwd; `claude -p <short prompt> --resume <P1 id> --output-format json` | one additional request; same session state | exit 0; explicit ID accepted; session ID continuity; no picker | purge the throwaway project/session |
| P3 stream | isolated cwd; short bounded prompt; `--output-format stream-json --verbose --include-partial-messages` | one model request; transcript state | every non-empty stdout line parses independently; session metadata observed; terminal result behavior recorded | purge throwaway session |
| P4 stop/partial | bounded long-running prompt; terminate through the adapter's stop path | one request may be partially billed; transcript may contain an interrupted turn | stop returns; process fact is signal/stopped/non-zero as applicable; partial stdout is classified; no false terminal result | purge session; record whether resume is possible, without retrying automatically |
| P5 invalid resume | isolated cwd; explicit UUID that does not exist | expected no model request, but local lookup behavior must be confirmed | deterministic non-zero/error surface; stdout/stderr separation; no session created | remove only throwaway cwd/state |

P1–P4 require explicit Controlled Probe authority because they contact the model service, consume quota, and create local session state. P5 may still touch local state and should be authorized with the same cleanup boundary. Probe commands must use a throwaway working directory, a fixed safe prompt, no credentials/config inspection, no tools/MCP/plugins, and a bounded process watchdog. A probe must not use `--no-session-persistence` for P1/P2 because that would invalidate the resume question. No probe should test fork unless the Orchestrator reopens the explicitly excluded MVP scope.

## Compatibility limits and construction implications

The current evidence supports a conservative ClaudeCodeAdapter candidate: explicit stored-session IDs; per-invocation `-p`; static launch arguments/configuration; structured output parsing; independent process facts; and no implicit resume, fork, dynamic MCP, or tool installation. It does not support claiming a stable exit-code table, guaranteed terminal result under interruption/large stream output, or a version-independent stream-input protocol.

The existing Runtime Contracts and Supervisor are aligned with these limits: `InvocationSpec` carries `create|resume(session_id)`, `ActorLaunchSpec` carries static system/workspace/backend/tool-provider data, and process facts distinguish exit, signal, stop, and launch failure. The next construction decision should choose the parser/argument profile only after P1–P4 are explicitly authorized and their evidence is recorded. This report makes no final architecture decision.

## Verification and context/tool integrity

- Lease continuity: `claude-code-researcher-01@1`; researcher role; accepted subject `CCA-research-001`; authority remained research-only.
- Normative files were read completely and in the specified order. No directories, sibling Runbook files, Task References, Serena state, credentials, private Claude configuration, conversations, or unrelated user files were inspected.
- Local actions were limited to executable discovery, `--version`, top-level/subcommand help, and read-only source/contract inspection within task scope.
- No `claude -p`, prompt/session/model-service operation, authentication, installation/update, probe, delegation, or implementation was performed.
- Repository started at `3ae0993be1c20d6717caf19bf4fd7cea27c51d5d`, branch `main`, clean. The task record contains an older `f30ce91` repository-baseline field; this report preserves the actual dispatch HEAD as the orchestration baseline.

## Sources

- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference) — current official flag/command reference; version applicability bounded by local help and explicit version notes.
- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless) — official print-mode input/output and stream behavior; contains the pre-v2.1.208 terminal-result caveat.
- [Manage sessions](https://code.claude.com/docs/en/sessions) — official create/resume/continue/fork/session-directory semantics.
- [Configure permissions](https://code.claude.com/docs/en/permissions) — official allow/deny/mode semantics.
- [Claude Code settings](https://code.claude.com/docs/en/settings) and [MCP reference](https://code.claude.com/docs/en/mcp) — official static configuration scopes and MCP behavior.
- [Claude Code changelog](https://code.claude.com/docs/en/changelog) — official version history, including `2.1.172` (2026-06-10), later thresholds, and compatibility drift.
- [Upstream issue #24594](https://github.com/anthropics/claude-code/issues/24594) — primary upstream record of undocumented `--input-format stream-json` framing; used as an uncertainty signal, not as a behavioral guarantee.

## Deviations and remaining risk

None in authorized write scope. Remaining risk is version drift between the local native `2.1.172` executable and current documentation, especially stream terminal results, signal/cancellation, exit codes, timeout/partial-output handling, and exact JSON framing. These are explicitly probe-gated.
