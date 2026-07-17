---
kind: report
scope: testing
---

# HG-acceptance-003 Wire Diagnostic Redaction — Testing Report

- work: testing
- result: completed
- implementation subject: `949e742`
- repository acceptance baseline: `d73bc90`
- orchestration baseline: `b29d2f9`
- lease: `host-boundary-tester-01@1`
- verdict: **PASS**

## Decisions

- uncertainty found: no
- implicit decisions found: no
- decisions made or escalation requested: wire-redaction finding accepted as closed; prior lifecycle/security behavior remains green

## Work and evidence

Subject identity passed: HEAD was `b29d2f9`, the starting worktree was clean, and `949e742..b29d2f9` contained only the accepted Runbook/boundary-check migration commit `d73bc90` and this acceptance Task. No product, test, dependency, or tooling content changed after implementation subject `949e742`.

Security evidence:

1. Initialization, session, completion, and stop rejection paths: **PASS**. Secret-bearing diagnostics produce their stable failure codes and fixed non-sensitive messages.
2. Complete serialized Host envelopes: **PASS**. Tests assert `JSON.stringify` output contains none of the injected token, credential, workspace path, command line, stderr, or provider markers.
3. Unknown HostFault mapping: **PASS**. The deterministic unexpected-code seam maps to the fixed generic `ActorHost operation failed.` message.
4. `backend.launch_failed`: **PASS**. The process error code is preserved, the message is fixed to `Backend process launch failed.`, `details` is omitted, and the raw diagnostic is absent from the outbound result.
5. Lifecycle/security preservation: **PASS**. ACK precedes semantic facts; exactly one terminal fault is emitted; quarantine blocks later adapter starts; and no false `InvocationResult` is emitted for rejection paths.

## Verification or result

- `pnpm test:actor-host`: **PASS**, 4 files / 54 tests, including test type-check.
- Clean-state `pnpm clean` then `pnpm run test:integration`: **PASS**, build/type checks and 1 file / 5 accepted walking-skeleton scenarios.
- `pnpm test:contracts`: **PASS**, 9 files / 58 tests and contract type checks.
- `pnpm test:runtime-server`: **PASS**, 2 files / 20 tests and Runtime Server type checks.
- `pnpm check:boundaries`: **PASS**.
- Full `pnpm verify`: **PASS**. Frozen install, build/types, Contracts 9/58, ActorHost 4/54, Runtime Server 2/20, integration 1/5, boundary checks, cleanup, and final Git-clean verification all passed.
- Before this Report was created, the worktree was clean. The Report is the only authorized tracked change and the only file committed.

## Context and tool integrity

Lease continuity remained `host-boundary-tester-01@1`. Work used local Git, PowerShell, `rg`, pnpm, TypeScript, Vitest, and synthetic loopback integration only. No delegation, subagents, Serena, memory/onboarding, `.serena/`, Superpowers chaining, real Claude invocation, or external service was used.

## Deviations and remaining risk

No acceptance deviation or failure classification applies. Coverage is limited to ActorHost wire redaction, prior Host lifecycle/security remediations, and the accepted walking-skeleton regression surface. Deferred token issuance/rotation/revocation, pending-Hello liveness, reconnect/replay/outbox, heartbeat, persistence/recovery, daemon composition, remote Hosts, Run/Package/Graph behavior, and real Claude execution remain outside scope.
