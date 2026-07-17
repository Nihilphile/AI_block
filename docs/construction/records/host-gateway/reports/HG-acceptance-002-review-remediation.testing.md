# HG-acceptance-002 Host Boundary Remediation — Testing Report

- work: testing
- result: completed
- subject: implementation `865b6a8`; orchestration baseline `e7b9bf4`
- verdict: PASS

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: all four HG-review-001 findings accepted as closed; no product, test, or configuration failure observed

## Work and evidence

The subject gate passed: HEAD was exactly `e7b9bf4`, the starting worktree was clean, and `git diff --name-status 865b6a8..e7b9bf4` contained only this Task file. Runtime Contracts are unchanged in implementation subject `865b6a8`.

Finding 1 — authenticated ActorHost identity binding: **CLOSED / PASS**. Focused tests assert receipt ACK followed by one stable `actor_host.identity_mismatch` HostFault, with zero adapter initialize/start calls for mismatched Initialize and Start payloads. Valid initialization and later valid Gateway commands remain usable.

Finding 2 — backend promise failures and liveness: **CLOSED / PASS**. Session, completion, and asynchronous stop rejection tests assert one terminal HostFault, no false `InvocationResult`/`stopped` fact, cleared active lifecycle, faulted quarantine, and rejection of later starts. Combined session/completion rejection asserts one fault only. Failure messages are mapped to stable codes rather than exposed diagnostics.

Finding 3 — concurrent initialization: **CLOSED / PASS**. Same-config concurrent initialization invokes the adapter once and both callers resolve from the shared reservation; conflicting identity/configuration is rejected before adapter work and cannot replace the reserved configuration. ACKs precede readiness/fault facts.

Finding 4 — Gateway terminal transport cleanup: **CLOSED / PASS**. Mismatched Initialize/Start is rejected before message-ID/timestamp allocation, sequence mutation, pending registration, or send, while the connection remains live. Provider and generated-envelope failures remove logical state, request physical termination once, tolerate termination exceptions, redact credentials/diagnostics, and permit fresh registration. Loopback tests assert exactly one close event.

## Verification or result

- Focused `pnpm test:actor-host`: **PASS**, 4 files / 47 tests, including test type-check.
- Focused `pnpm test:runtime-server`: **PASS**, 2 files / 20 tests, including test type-check.
- Clean-state `pnpm clean` then `pnpm run test:integration`: **PASS**, build/type checks and 1 file / 5 accepted real-loopback FakeBackend scenarios.
- `pnpm check:boundaries`: **PASS**.
- Full `pnpm verify`: **PASS**. Frozen install, build/types, Contracts 9 files / 58 tests, ActorHost 4 / 47, Runtime Server 2 / 20, integration 1 / 5, boundary checks, cleanup, and final Git-clean verification all passed.
- Before this Report was created, the worktree was clean. The Report is the only intended tracked change and the only file committed.

## Deviations and remaining risk

The focused concurrent-initialization tests verify reservation and shared-promise ordering; they do not independently construct two separate adapter completions in opposite order. Source inspection confirms conflicting calls are rejected before adapter invocation and same-config calls share one in-flight promise, so no competing completion can replace the reservation.

Coverage remains bounded to the six required remediation behaviors and the walking-skeleton regression surface. Deferred persistence/recovery, reconnect/replay/outbox, heartbeat, remote Host, token issuance/rotation/revocation, daemon composition, Run/Package/Graph behavior, and real Claude execution remain outside this acceptance.
