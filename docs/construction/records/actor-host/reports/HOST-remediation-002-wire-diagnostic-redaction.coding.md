# HOST-remediation-002 ActorHost Wire Diagnostic Redaction — Coder Report

- task: `HOST-remediation-002 Wire Diagnostic Redaction`
- authorization: exact `IMPLEMENTATION_AUTHORIZED` plus one-path `SCOPE_EXPANSION_AUTHORIZED`
- baseline: `3f092356d058b13a3c207627e230e121a49aa3ff`
- result: implemented
- commit subject: `fix: redact actor host wire diagnostics`
- commit SHA: returned in the final handoff

## Result

Implemented ActorHost-only wire diagnostic redaction without changing Runtime Contracts, Runtime Server, identity, ACK, quarantine, concurrency, or Server behavior.

HostFaults are normalized at the final `ActorHostCommandProcessor` outbound mapping boundary. Supervisor rejection text is fixed locally before it reaches the wire, and the final boundary also protects direct/future HostFault construction paths with a stable-code mapping and generic fallback.

The existing `launch_failed` InvocationResult path is also normalized: its stable process error code is preserved, its message is fixed, and optional diagnostic details are dropped.

## Exact wire mapping

- `actor_host.initialization_failed` → `Backend adapter initialization failed.`
- `actor_host.session_observation_failed` → `Backend session observation failed.`
- `actor_host.completion_observation_failed` → `Backend completion observation failed.`
- `actor_host.adapter_stop_failed` → `Backend adapter stop failed.`
- `actor_host.quarantined` → `BackendSupervisor is quarantined after an Invocation failure.`
- `actor_host.identity_mismatch` → fixed authenticated-identity failure text; no dynamic diagnostic text
- other existing ActorHost-local lifecycle codes → fixed local messages
- unexpected HostFault code → `ActorHost operation failed.`
- `backend.launch_failed` process error → `Backend process launch failed.` with `details` omitted

Contract error code, category, retryability, schema version, and correlation ID behavior remain unchanged where applicable. No raw `Error.message`, backend diagnostic, command line, workspace path, token, credential, stderr, or provider text is copied into a wire-visible error message.

## Tests and evidence

- ActorHost: 4 files / 54 tests passed, including TypeScript test checks.
- Contracts: 9 files / 58 tests passed, including contract type checks.
- Build: passed.
- Integration: 1 file / 5 tests passed, including the authorized launch-failure assertion update.
- Workspace boundaries: passed.
- `git diff --check`: passed before commit.

Focused secret-bearing tests cover initialization, session, completion, stop, unexpected future lifecycle codes, and launch failure. They assert ACK/fact ordering, exact fixed messages, exactly-one-fault/quarantine behavior, no false InvocationResult, whole-envelope `JSON.stringify` absence of the marker, and launch-failure `details` removal.

The expanded integration assertion at `tests/integration/host-walking-skeleton/host-walking-skeleton.test.ts` now expects exactly `Backend process launch failed.`, preserves `backend.launch_failed`, and asserts the raw synthetic diagnostic and optional details are absent.

## Changed paths

- `apps/actor-host/src/backend/supervisor.ts`
- `apps/actor-host/src/server-connection/command-processor.ts`
- `apps/actor-host/test/backend/backend-supervisor.test.ts`
- `apps/actor-host/test/server-connection/command-processor.test.ts`
- `apps/actor-host/test/server-connection/server-connection.test.ts`
- `tests/integration/host-walking-skeleton/host-walking-skeleton.test.ts` — authorized scope expansion, existing launch-failure scenario only
- this Report

No other path was modified. Runtime Contracts remain frozen.

## Serena and fallback record

Serena non-memory project activation/configuration, symbol overviews, symbol-body navigation, pattern search, and diagnostics were used to trace every Host payload constructor, the Host payload union, error-envelope shapes, and serialized transport path. No memory APIs, onboarding, or `.serena/` inspection occurred.

Ordinary `rg`, PowerShell, Git, pnpm, and `apply_patch` supplied authoritative document, diff, test, and verification evidence. Source/test edits used `apply_patch` per repository editing policy; no Serena mutation was used. Serena diagnostics exposed only pre-existing nonblocking TypeScript hints outside this change's behavior.

## Deviations and remaining risk

The only scope expansion was the explicitly authorized integration-test path and the existing launch-failure assertion. No Contract or production integration boundary changed.

Raw backend diagnostics are intentionally discarded rather than stored. Transport failure text remains private connection state and is not included in Host payloads. A quarantined Host still requires reconstruction/restart after unknown backend liveness, as defined by HOST-remediation-001. Independent W2 security review and independent testing remain required.
