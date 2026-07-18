# ClaudeCodeAdapter v0.1 Construction Decisions

- status: implementation approved
- owner: ActorHost / ClaudeCodeAdapter
- authoritative evidence: `be380eb`
- preflight lease: `claude-code-adapter-coder-01@1`

## Supported compatibility target

- Adapter ID: `claude-code`.
- v0.1 supports the observed native Claude Code version `2.1.172` exactly. Initialization performs metadata-only `<executable> --version` and rejects an unparseable or different version; expanding the table requires later evidence.
- `ActorLaunchSpec.backend.config` is exactly `{ "executable": "<absolute native path>" }`. The field is required and unknown fields are rejected.
- Initialization validates configuration, executable/version, and working directory without a model request or empty conversation.

## Supported launch-spec and Invocation subset

- `system_prompts` must be empty. Non-empty system instructions are rejected rather than silently ignored; system-prompt transport is deferred.
- `tool_providers` must be empty. Non-empty providers are rejected.
- Invocation prompt must be a non-empty root text BrickPrompt. Composite/other prompt kinds are rejected before launch.
- Session mode is only `create` or explicit `resume(session_id)` from the existing Contract.
- Caller-supplied argv, environment, model, settings, MCP/plugin, timeout, permission, or compatibility overrides are rejected/not part of config.

## Exact argv and input profile

Use Node `child_process.spawn(executable, args, { shell: false })` through an injectable Host-generic process runner. Prompt text is written as UTF-8 stdin and stdin is closed.

Create executable argv is exactly:

```text
--print
--bare
--output-format
json
--tools
<one final empty string argv element>
```

Resume executable argv is exactly:

```text
--print
--resume
<explicit Invocation session ID>
--bare
--output-format
json
--tools
<one final empty string argv element>
```

The empty tools value is a separate final argv element, not `--tools=`. No `--continue`, fork, stream-json, settings-source override, permission mode, extra suppression flag, prompt argument, or shell command string is added.

Probe-007 directly observed the create profile and separately observed explicit returned-ID resume. The exact combined resume argv is implemented from those orthogonal facts and must receive one later exact live acceptance check after deterministic implementation acceptance.

## Structured result and session

- Terminal stdout must parse as one root JSON object.
- v0.1 success requires `type === "result"`, `is_error === false`, string `result`, and non-empty string `session_id`.
- Extra observed metadata fields do not affect success and never become wire diagnostics.
- Create accepts the non-empty returned session ID.
- Resume requires returned `session_id` to equal the requested ID.
- Never synthesize session identity from process ID, prompt, cwd, caller UUID, or remembered CLI state.

## Process and fault decisions

- The process-runner seam is Host-generic: executable/argv/cwd/stdin, independent stdout/stderr, exit/signal, launch error, and idempotent explicit stop. Claude argv and JSON parsing stay in ClaudeCodeAdapter.
- Malformed/plain-text output, wrong `type`, `is_error !== false`, or invalid/missing `result` is a completion observation failure; no InvocationResult.
- Missing/empty session or resume-session mismatch is a session observation failure; no InvocationResult.
- Non-zero exit with otherwise valid structured success/session remains an observed InvocationResult with `process.exited(exit_code)`; Server owns semantic outcome.
- Non-zero exit without valid structured facts follows the parser/session failure above.
- Explicit stop becomes `process.stopped` only after child termination is observed. Stop rejection or unknown liveness follows existing adapter-stop failure/quarantine behavior.
- Automatic timeout remains deferred and is never represented as stopped.
- No Runtime Contract or wire fault code changes. Existing fixed/redacted HostFault messages remain authoritative.

## Deferred

- non-empty system prompts, composite prompts, tools/MCP/Skills, dynamic permissions or config;
- other Claude versions/profiles and compatibility negotiation;
- automatic timeout, graceful cancellation, partial output, stopped-session resume, stream-json, continue, and fork;
- real-service implementation tests, credential management, normal user config/session state;
- Actor/Package/Run/persistence/CLI/Graph integration.
