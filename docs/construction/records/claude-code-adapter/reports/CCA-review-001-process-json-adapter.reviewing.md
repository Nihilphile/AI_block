# CCA-review-001 Process and JSON Adapter Module Review

- work: reviewing
- result: completed
- implementation subject: `153362823422f32431cba00000f7debd248f9f36`
- orchestration baseline: `65d4e3572110694e22f60f48e8391bdee095966c`
- independent evidence: `ee87f3645132a213d25d222859a9d32e9b818d16`
- comparison range: `bb3157c44e814a946a715597b43b98c7f96f5f33..153362823422f32431cba00000f7debd248f9f36`
- lease: `claude-code-adapter-reviewer-01@1`

## Verdict

`PASS WITH RISKS`.

No actionable product, test, boundary, security, or composition finding was identified in the frozen implementation subject. The accepted implementation composes truthfully with the existing BackendAdapter and BackendSupervisor contracts for the reviewed v0.1 subset.

## Findings

None.

The review specifically checked the tokenized `spawn` boundary and `shell:false`, UTF-8 stdin close, independent stdout/stderr capture, launch/exit/signal/stop/unknown-liveness handling, shared terminal observation, session extraction and resume-ID equality, exact create/resume argv, fail-closed initialization and parser behavior, non-zero exit preservation, and boundary-checker admission. No preference-only or deferred-scope item is reported as a defect.

## Work and evidence

- Subject identity was fixed to the implementation commit above. `bb3157c..1533628` contains only the authorized adapter/process-runner source, deterministic focused tests, implementation records, and the workspace boundary topology update. Later orchestration commits, including `ee87f36` and `65d4e35`, were not treated as product subject changes.
- Serena non-memory navigation was used for symbol overviews, focused symbol bodies, references, and diagnostics in `apps/actor-host/src/backend/process-runner.ts`, `apps/actor-host/src/backend/claude-code-adapter.ts`, the existing adapter/supervisor ports, and the relevant Runtime Contracts. Ordinary Git/rg reads supplied authoritative diff and history evidence.
- `NodeProcessRunner.start` passes tokenized argv, `cwd`, `shell: false`, and piped stdio to native `spawn`; `NodeProcessExecution` shares one completion observation, preserves process facts, closes UTF-8 stdin, and makes stop idempotent while resolving it only after observed termination.
- `ClaudeCodeAdapter` validates the frozen config and supported input subset before model launch, performs metadata-only version inspection, constructs the exact frozen create/resume argv, parses only the required terminal JSON subset, never synthesizes session identity, and rejects resume-session mismatch.
- `ClaudeCodeExecution` shares the terminal observation between `session` and `completion`; malformed/error/partial/session-invalid observations therefore reach the existing Supervisor quarantine paths without an `InvocationResult`. Valid structured output preserves non-zero process exit facts.
- Boundary topology admits exactly the two new source files and the focused adapter test file; no Runtime Contract, dependency, startup wiring, or unrelated file changed in the product subject.

## Verification or result

- `pnpm --filter @ai-block/actor-host exec vitest run test/backend/claude-code-adapter.test.ts`: passed, 1 file / 26 tests.
- `pnpm build`: passed; run only to provide existing build artifacts required by read-only checks, with no install or dependency update.
- `pnpm --filter @ai-block/actor-host run test:types`: passed after the build.
- `pnpm check:boundaries`: passed after the build.
- `pnpm clean`: passed; generated build output was removed.
- `git diff --check bb3157c..1533628`: passed.
- The initial typecheck and boundary attempts failed only because the clean workspace lacked Runtime Contracts/application `dist` artifacts; the same checks passed after the existing build command. No source workaround was applied.

## Context and tool integrity

Lease continuity was established as `claude-code-adapter-reviewer-01@1` for the independent Reviewer role, with review authority only and accepted subject `1533628`. No delegation was used. Serena initial instructions and project activation were used; Serena memory APIs, memory listing/reading, onboarding, and `.serena/` were not used.

No product or test file was modified. No real Claude executable, model, service, network, credential, user configuration, user session state, dependency installation, or full verification wrapper was invoked. Focused tests used only local deterministic Node fake children.

## Deviations and remaining risk

- Exact combined live create/resume acceptance remains deferred by the frozen decision/evidence scope; this is an evidence residual, not a finding against the deterministic implementation subject.
- Automatic timeout, graceful cancellation, partial output, stopped-session resumability, non-empty system/tool providers, other Claude versions, and startup/integration registration remain explicitly deferred and are not claimed as supported by this implementation.
- Review Report commit SHA is reported in the final handoff as the commit containing this Report (`same-as-report`).
