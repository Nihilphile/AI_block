# ClaudeCodeAdapter Evidence Closeout

- status: accepted
- closed by: Orchestrator
- architecture baseline: `6b98d44`
- initial research baseline: `76e7240`
- authoritative session/profile evidence: `be380eb`
- local executable evidence: Claude Code `2.1.172`

## Accepted outcome

The ClaudeCodeAdapter external-behavior gate is complete. Local Claude Code `2.1.172` with the configured DeepSeek-compatible backend supports non-interactive terminal JSON, structured session creation, and explicit session-ID resume in a temporary isolated config and working directory.

The final independent Node probe also shows that `--bare`, a final empty `--setting-sources` value, and a final empty `--tools` value each preserve JSON framing and session metadata when tested orthogonally. Earlier plain-text conclusions are superseded because their PowerShell harnesses did not preserve executable arguments or observations reliably.

## Authoritative proven facts

- ordinary `--print --output-format json` returned a parsed JSON object, the expected result text, and a non-empty `session_id`;
- `--print --resume <actual-session-id> --output-format json` resumed the same session and returned the same ID;
- `--print --bare --output-format json` retained JSON and session metadata;
- adding a final separate empty argument to `--setting-sources` under bare mode retained JSON and session metadata;
- adding a final separate empty argument to variadic `--tools` under bare mode retained JSON and session metadata;
- prompt input works through redirected UTF-8 stdin and stdin close;
- production TypeScript should use the proven equivalent Node boundary: native `child_process.spawn(executable, args, { shell: false })`, tokenized argv, and independent stdout/stderr capture;
- one backend Invocation is one short-lived native print process;
- a live child can be terminated through one Host-owned stop operation and its termination observed promptly;
- first Invocation creates with no implicit continuation; later Invocation resumes only an explicit stored session ID;
- session identity comes only from parsed structured backend output;
- stdout, stderr, exit/signal/stop, timeout, parser outcome, result, and session observation are separate facts;
- `--continue`, fork, stream-json, and resume-after-stop remain outside the MVP.

## Evidence correction

Probe-001 remains evidence of unsafe shell-style Windows argument construction. Probe-002/003 plain-text outcomes apply only to their defective one-off harnesses and cannot define Claude Code behavior. Probe-004/006 correctly stopped on harness gates without producing CLI conclusions. Probe-005 first established ordinary JSON create. Probe-007 is authoritative because an independent Tester used an exact SHA-256-pinned Node runner that passed 32 no-service assertions before executing all five calls.

Do not hard-reject Claude Code `2.1.172`. Do not attribute the old plain-text output to DeepSeek, bare mode, or session incompatibility.

## Observed terminal JSON boundary

All five final calls exposed the same root-key set, including `type`, `subtype`, `result`, `session_id`, `is_error`, `stop_reason`, `terminal_reason`, `usage`, `modelUsage`, duration/TTFT fields, permission denials, cost, and UUID. The Adapter needs only a bounded subset for v0.1 success: a root object, string result, and non-empty string session ID, while preserving process facts independently.

The observations prove these exact orthogonal profiles. They do not prove every possible combination or future Claude version. The implementation Task must choose one minimal observed profile and avoid adding untested flags merely because each flag exists independently.

## Approved implementation boundary

The next slice may implement a concrete ClaudeCodeAdapter behind the existing ActorHost BackendAdapter/Supervisor port with:

1. immutable launch-spec validation and metadata-only executable/version inspection at initialization;
2. an injectable Host-generic Node process boundary suitable for deterministic tests without a real Claude service;
3. tokenized argv, redirected UTF-8 stdin, independent stdout/stderr capture, completion observation, and idempotent explicit stop;
4. terminal JSON parsing, result extraction, and session extraction as explicit success requirements;
5. exact create versus explicit-resume command construction with returned-ID equality on resume;
6. fail-closed parser/session/process behavior without synthesized session IDs or false InvocationResults;
7. no Runtime Contracts change, dependency addition, CLI update, automatic timeout, stream-json, dynamic tool installation, Graph, Package, Run, or recovery expansion without a new Task.

Deterministic fixtures remain the implementation test mechanism. A later acceptance Task may run the exact implemented profile against the local executable; ordinary initialization itself makes no model request.

## Preflight decisions still required

Before product writes, the Coder must reconcile its earlier preflight with the authoritative Probe-007 evidence and identify:

- the minimal exact observed argv profile selected for v0.1, including whether empty tools is required by the accepted launch-spec subset;
- ActorLaunchSpec backend-config validation, system-prompt handling, and supported BrickPrompt/tool-provider subset;
- existing internal/wire fault mapping for malformed JSON, missing/mismatched session, launch/non-zero process, stop, and unknown liveness without Runtime Contract changes;
- the minimal Host-generic process-runner seam and authorized file/boundary-checker write set;
- any remaining exact-profile probe needed before implementation, rather than reopening general Claude behavior research.

## Deferred scope

- combined profiles not observed by Probe-007 and version-specific compatibility negotiation;
- graceful backend cancellation, automatic timeout, partial output, stopped-session resumability, and stream-json;
- non-empty tool/MCP/Skill providers and dynamic permissions;
- credential lifecycle and normal user-level Claude state management;
- reconnect/recovery, Actor/Package/Run/persistence/CLI integration, and Graph.

## Next construction boundary

Return the final evidence delta to the existing ClaudeCodeAdapter Coder lease. Product implementation begins only after the Orchestrator resolves its shortened decision list and issues `IMPLEMENTATION_AUTHORIZED`.
