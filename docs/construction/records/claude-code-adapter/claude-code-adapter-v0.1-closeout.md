# ClaudeCodeAdapter v0.1 Closeout

- status: accepted
- closed by: Orchestrator
- architecture/evidence closeout: `bb3157c`
- implementation decisions/task: `5af419b`
- product implementation subject: `153362823422f32431cba00000f7debd248f9f36`
- independent deterministic acceptance: `ee87f3645132a213d25d222859a9d32e9b818d16`
- independent module review: `96a3162f6b38c6b528d55343497aac2b6c73659e`
- live product acceptance: `dfd25e28b1d5687634da780c7f6a6e15546d1bb9`

## Accepted outcome

ClaudeCodeAdapter v0.1 is accepted behind the existing ActorHost BackendAdapter/Supervisor port. The slice implements a Host-generic Node native-process boundary and a Claude-specific zero-tool JSON/session profile without changing Runtime Contracts or existing Server/Host lifecycle ownership.

The implementation is accepted through deterministic suites, independent review, and a real product-path create→explicit-resume run against local Claude Code `2.1.172` with the configured DeepSeek-compatible backend.

## Accepted capabilities

### Process boundary

- native `child_process.spawn` with tokenized argv and `shell:false`;
- UTF-8 stdin followed by close;
- independent stdout/stderr, launch, exit/signal, explicit stop, and liveness facts;
- idempotent stop behavior without automatic-timeout synthesis;
- injectable Host-generic runner with deterministic local fake-child coverage.

### ClaudeCodeAdapter

- exact `claude-code` backend config validation with absolute executable and metadata-only version check;
- supported local compatibility target `2.1.172`;
- initialization creates no model conversation;
- exact P5 zero-tool create profile using `--bare`, terminal JSON, and one final empty tools argv element;
- explicit returned-ID resume with no `--continue` or synthesized session identity;
- fail-closed root JSON/result/error/session validation and resume-ID equality;
- text-only root prompt, empty system prompts, and empty tool providers as an explicit v0.1 subset;
- unsupported config/prompt/provider/version and malformed/error/session outcomes map through existing redacted Host fault paths.

## Evidence

Independent deterministic acceptance passed:

```text
Focused Claude adapter   1 file  / 26 tests
ActorHost                5 files / 80 tests
Runtime Contracts        9 files / 58 tests
Runtime Server           2 files / 20 tests
Integration              1 file  / 5 tests
```

The focused tests are included in the ActorHost count; the broad independent total remains 163 tests. Build, typecheck, boundary checks, clean-state verification, and full `pnpm verify` passed. Frozen install was already up to date and did not modify versioned files.

Module Review returned `PASS WITH RISKS` with no actionable findings. Its risks were approved deferred scope rather than defects.

Live product acceptance imported and used the built committed ClaudeCodeAdapter and NodeProcessRunner:

- create: approximately 3.95 seconds, non-empty structured session, `exited(0)`;
- explicit resume: approximately 3.56 seconds, exact same session ID, `exited(0)`;
- two model-capable calls consumed, no retry or third call;
- temporary cwd/config/session/controller root removed; generated output cleaned; final Git state clean.

## Corrected research record

Earlier plain-text probe outcomes were caused by defective one-off PowerShell harness argument/result handling and do not describe Claude Code behavior. The authoritative pinned Node matrix proved ordinary JSON create/resume, bare JSON, bare plus empty setting sources, and bare plus empty tools on local `2.1.172`. No hard version rejection or DeepSeek incompatibility remains.

## Deferred scope

- non-empty system prompts, composite prompts, tools/MCP/Skills, and dynamic permissions/config;
- versions/profiles other than the accepted `2.1.172` target and compatibility negotiation;
- automatic timeout, graceful cancellation, partial output, stopped-session resume, stream-json, continue, and fork;
- credential lifecycle and normal user-level Claude state management;
- application startup/adapter registry wiring;
- ActorTemplate/ActorConfigSnapshot/Actor, Package/Delivery, Run Engine, persistence, CLI Direct Actor integration, recovery, and Graph.

## Next construction boundary

The next module should return to the Direct Actor path rather than expand Claude features. The Orchestrator should choose and Task one narrow slice that supplies authoritative Actor/Package/Run state to the already accepted Host path. Adapter startup wiring should occur only when the owning Actor/Host bootstrap configuration is defined.

This closeout does not authorize the next module, Graph, dynamic tools, or broader reliability work.
