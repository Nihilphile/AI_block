# ClaudeCodeAdapter Evidence Closeout

- status: accepted with local compatibility gate
- closed by: Orchestrator
- architecture baseline: `6b98d44`
- research baseline: `76e7240`
- controlled probe evidence: `e5dd2a7`, `9d9ef89`, `9a7ee56`
- local executable evidence: Claude Code `2.1.172`

## Accepted outcome

The ClaudeCodeAdapter research gate is complete. Evidence is sufficient to implement the Host-local process, input, parsing, session-observation, stop, and compatibility-failure boundary without inventing backend behavior.

The evidence does not establish a usable structured session contract for the currently installed Claude Code `2.1.172` under the required isolated non-interactive profile. This is an accepted compatibility limit, not permission to fall back to implicit session selection or plain-text session synthesis.

## Proven construction facts

- one backend Invocation is one short-lived native Claude Code print process;
- prompt input can be delivered through redirected UTF-8 stdin and stdin must be closed before completion observation;
- Windows launch should use a native executable plus tokenized `.NET ProcessStartInfo.ArgumentList`, never a shell-built command string;
- stdout, stderr, exit, kill/stop, timeout, parser outcome, model result, and observed session ID are independent facts;
- a live child can be terminated with one Host-owned process stop operation and its termination observed promptly;
- first Invocation is create with no implicit continuation; later Invocation may resume only an explicit stored session ID;
- session identity may come only from successfully parsed structured backend output;
- `--continue` and fork remain outside the MVP.

## Frozen compatibility limit

Three bounded profiles were tested against local `2.1.172`. The first failed before prompt delivery. The corrected stdin profiles returned plain text and no session ID despite requesting terminal JSON; explicit resume therefore could not be proven. Empty argument serialization was improved, but the final isolated profile still did not expose a dependable JSON/session contract.

For this local version/profile, the Adapter must not:

- treat plain text as a successful session-bearing InvocationResult;
- synthesize a session ID from a process ID, caller UUID, prompt, working directory, or remembered CLI state;
- use directory-relative `--continue` as a substitute for explicit resume;
- silently remove isolation controls to make JSON output appear;
- trigger a real model probe during ordinary initialization.

## Approved implementation boundary

The next slice may implement a concrete ClaudeCodeAdapter behind the existing ActorHost BackendAdapter/Supervisor port with:

1. immutable launch-spec validation and metadata-only executable/version inspection at initialization;
2. an injectable process boundary suitable for deterministic tests without a real Claude service;
3. tokenized argv, redirected UTF-8 stdin, independent stdout/stderr capture, bounded completion observation, and idempotent stop;
4. terminal JSON parsing and session extraction as an explicit success requirement;
5. deterministic compatibility/parser/process failures when required structured facts are absent;
6. exact create versus explicit-resume command construction;
7. no Runtime Contracts change, dependency addition, CLI update, real-service acceptance call, stream-json, dynamic tool installation, Graph, Package, Run, or recovery expansion without a new Task.

The implementation may be accepted through deterministic process fixtures even though the local live executable remains compatibility-gated. A later separately authorized decision may upgrade Claude Code or approve another backend/profile. This slice must make the unsupported live state truthful rather than pretending to complete the Direct Actor path.

## Preflight decisions still required

Before product writes, the Coder must identify:

- the exact existing BackendAdapter/Supervisor extension point and ownership surface;
- whether current internal/wire faults can represent unsupported structured output without changing Runtime Contracts;
- the minimal process-runner abstraction and test fixture strategy;
- where static launch arguments and output/session parsing belong;
- how initialization, one active Invocation, stop, and quarantined/unknown-liveness behavior compose with existing state;
- any dependency or public Contract pressure, which remains escalation-only.

## Deferred scope

- a supported live Claude Code structured session profile;
- graceful backend cancellation, partial output, stopped-session resumability, and stream-json;
- Claude Code upgrade/installation and backend/model reconfiguration;
- credential lifecycle and user-level Claude state management;
- reconnect/recovery, Actor/Package/Run/persistence/CLI integration, and Graph.

## Next construction boundary

Run one Coder preflight against the accepted ActorHost implementation and this closeout. Product implementation begins only after the Orchestrator resolves its hidden decisions and issues `IMPLEMENTATION_AUTHORIZED`.
