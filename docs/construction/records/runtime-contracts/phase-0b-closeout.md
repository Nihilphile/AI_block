# Phase 0B Runtime Contracts Closeout

- status: accepted
- accepted through: `6ee909d`
- product implementation through: `549adc0a3ef674a603ed54620612225e673b9533`
- acceptance date: 2026-07-16

## Delivered boundary

Phase 0B establishes the shared in-process Runtime Contracts package used by Runtime Server, Actor Host, Runtime CLI, and tests. It includes:

- inert JSON materialization and strict fail-closed decoding;
- stable identity, version, timestamp, and error contracts;
- recursive Brick Prompt and strict Package/Delivery contracts;
- RFC 8785 canonicalization and SHA-256 Package identity;
- Actor launch, invocation, process-result, and directional Host protocol contracts;
- root-only package exports, TypeScript 7 NodeNext declarations, compatibility fixtures, and workspace boundary enforcement.

No transport, persistence, process supervision, backend adapter, Package routing, Run, Graph, or Claude-specific behavior is implemented in this phase.

## Acceptance evidence

- Coder implementation and self-verification completed for B.1-B.4 and review follow-ups.
- Independent Tester verdict: PASS at `6860384`.
- Module Reviewer verdict: ACCEPT WITH FOLLOW-UP at `2723406`; all three findings were closed by `d22410e`.
- The follow-up test-command regression was corrected by `549adc0` and independently closed by Reviewer report commit `6ee909d`.
- Final verification evidence: `pnpm verify` passed with 9 test files / 58 tests, TypeScript 7 NodeNext type checks, exact runtime/type export probes, three-app built package-root fixture probes, boundary/deep-import checks, cleanup, and Git-clean verification.
- Package-local tests pass from a clean state without requiring or creating `dist`.

## Residual scope

There are no remaining Phase 0B review findings. Approved deferred concerns remain assigned to later phases, including raw transport parsing, authentication, replay/retry/reconnect, persistence and migrations, adapter-specific config validation, Package publication/routing/idempotency, Delivery transitions, Run state, Graph evaluation, quotas, and compatibility negotiation beyond the frozen protocol version.

## Next-stage entry condition

Before authorizing the FakeBackend and Host-Server skeleton, the Controller reloads and reconciles the next construction slice against these product-target documents:

- `runtime-module-concept-v0.2.md`
- `runtime-object-module-v0.3.md`
- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`

Those documents remain product-goal authorities; this closeout records an implementation milestone and does not replace them.
