# HOST-backend-001 Coder Report

- task: `HOST-backend-001 FakeBackend Supervisor Skeleton`
- authorization: `250b7c1` clarification; implementation authorized by Controller
- implementation commit: same-as-report
- status: implemented and verified

## Scope and changed paths

Implemented only the authorized ActorHost backend boundary, deterministic fake, focused tests, test configuration, root verification wiring, boundary topology updates, and the ActorHost Vitest lock importer.

Changed paths:

- `apps/actor-host/package.json`
- `apps/actor-host/tsconfig.test.json`
- `apps/actor-host/src/backend/adapter.ts`
- `apps/actor-host/src/backend/supervisor.ts`
- `apps/actor-host/src/backend/fake-backend.ts`
- `apps/actor-host/test/backend/backend-supervisor.test.ts`
- `package.json`
- `pnpm-lock.yaml` (ActorHost Vitest importer only)
- `scripts/check-workspace-boundaries.mjs`
- this Coder Report

Unchanged: `apps/actor-host/src/main.ts`, Runtime Contracts, other applications, runtime dependencies, architecture/design documents, and prior records.

## Internal API decisions

`BackendAdapter` is a Host-internal port. It accepts `ActorLaunchSpec` during initialization and an `InvocationSpec` during start. Start returns either a `LaunchFailedProcessFact` or a running `BackendInvocationExecution`.

The running execution exposes:

- `session: Promise<BackendSessionId | undefined>` for prompt session discovery;
- `completion: Promise<BackendInvocationCompletion>` for the first settled process fact;
- `stop()` for backend-specific cancellation.

`BackendSupervisor.start()` returns immediately with a read-only `SupervisedInvocation` containing separate `session` and final `InvocationResult` promises. Lifecycle rejections are module-local typed results. No lifecycle rejection is represented as a transport envelope, Runtime Contract error envelope, Server Run state, or Package event.

The supervisor verifies adapter ID and ActorHost identity, owns only local active-invocation/session facts, emits empty package refs and `completion_requested: false` for this slice, and leaves Run/Actor/Server authority to later modules.

## Lifecycle model

```text
uninitialized → ready → running → ready
                         │
                         └→ stopping → ready
```

- Initialization failure leaves `uninitialized`.
- Launch failure leaves `ready` without an active execution.
- A second start while `running` or `stopping` returns `busy` and does not touch the active execution.
- Wrong-invocation stop returns `invocation_mismatch` without touching the active execution.
- Same-identity initialization is idempotent; a different project, actor, or immutable snapshot identity is rejected.
- The first settled backend completion fact wins a stop/natural-completion race.

## FakeBackend and test ownership

`FakeBackend` uses a concrete scripted sequence of launch failure, pending, or completed steps. Pending executions are completed only through the fake's explicit `complete()` control. Stop resolves a pending execution with the frozen `StoppedProcessFact`. Session IDs and invocation/session directives are deterministic and recorded by the fake.

Fake controls are not part of `BackendAdapter`. Tests use no sleeps, timers, random IDs, real processes, filesystem processes, network, or wall-clock assertions.

## RED/GREEN evidence

RED evidence:

- Before backend implementation, the focused Vitest suite failed during module resolution because the authorized `src/backend` implementation files were absent.
- After the initial implementation, runtime behavior passed but the no-emit test check correctly failed until the normal root build supplied the package-root Runtime Contracts declarations.

GREEN evidence before commit:

- `pnpm build`: passed.
- `pnpm check:types`: passed.
- `pnpm test:contracts`: 9 files / 58 tests passed, including Runtime Contract public type checks.
- `pnpm --filter @ai-block/actor-host test`: 1 file / 8 tests passed and `tsc --project tsconfig.test.json --noEmit` passed.
- `pnpm check:boundaries`: passed, including manifests, source/test topology, package-root probes, cleanup probes, and artifact checks.

Final root evidence:

- `pnpm verify`: passed. This included frozen install, initial Git-clean assertion, build, Runtime Contracts tests and static checks, ActorHost tests and no-emit static check, boundary probes, cleanup, Git-clean verification, and final diff cleanliness.

## Serena and fallback record

Used Serena non-memory operations for project activation, full authority/task reads, file discovery, symbol overview, file reads, and pattern search. Used ordinary PowerShell/Git reads for authoritative worktree, commit, package, lockfile, build, and verification evidence. No Serena memory calls and no `.serena/` inspection were performed.

## Deviations and concerns

None. The only dependency change is the exact pinned `vitest` development dependency for ActorHost and its corresponding lockfile importer entry. `main.ts` and Runtime Contracts remain unchanged.
