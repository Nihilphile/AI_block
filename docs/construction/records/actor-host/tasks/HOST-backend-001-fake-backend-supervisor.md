# HOST-backend-001 FakeBackend Supervisor Skeleton

- owner: ActorHost
- follows: none
- affected modules: ActorHost; Runtime Contracts as a read-only dependency
- workflow: W2
- base reason: this Task establishes bounded lifecycle behavior and an internal backend boundary inside one state-owning module
- triggered gates: none
- product baseline: `6b98d44`

## Objective

Establish the real ActorHost backend port, a deterministic FakeBackend implementation, and the first BackendSupervisor lifecycle slice so Host behavior can be developed and tested without Claude Code.

## Architecture authorities

- `docs/construction/phase-1-architecture-invariants.md`
- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`
- accepted Runtime Contracts and Phase 0B closeout

## Write scope

The Coder may modify only:

- `apps/actor-host/package.json`
- `apps/actor-host/tsconfig.json`
- `apps/actor-host/src/backend/**`
- `apps/actor-host/test/backend/**`
- `package.json`
- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/actor-host/reports/HOST-backend-001-fake-backend-supervisor.coder.md`

Do not modify `apps/actor-host/src/main.ts`, Runtime Contracts, another app/package, dependencies, the lockfile, architecture/design files, or prior construction records.

## Required directory responsibility

Keep the new tree domain-specific and shallow:

```text
apps/actor-host/
├── src/backend/       # backend port, supervisor, fake implementation
└── test/backend/      # focused behavior tests and test helpers
```

Do not create generic `common`, `shared`, `core`, `utils`, or catch-all files. Do not expose ActorHost as a shared workspace library.

## Frozen behavior

- ActorHost realizes only an `ActorLaunchSpec`; it never reads or assembles ActorTemplate, Bricks, Package bodies, or Graph state.
- Host initialization and backend session creation are distinct. Initializing BackendSupervisor must not create a session or execute an Invocation.
- BackendAdapter is a Host-internal port. FakeBackend and future ClaudeCodeAdapter must use the same port; there is no fake-only supervisor path.
- The supervisor executes the session mode explicitly carried by `InvocationSpec`: `create` establishes a session; `resume` uses its explicit session ID.
- Exactly one backend Invocation may be active for the ActorHost. A concurrent start is rejected deterministically and does not disturb the active Invocation.
- Cancellation/stop targets only the active Invocation and is observable through deterministic process facts/outcome.
- Backend failure and launch failure are represented deterministically without inventing Server Run-state authority.
- BackendSupervisor may expose Host-local process/session facts suitable for later ServerConnection mapping, but it does not create transport envelopes, assign WebSocket sequence/generation, route Packages, decide Run completion, or wake Actors.
- FakeBackend uses deterministic externally controlled steps or scripts; tests must not depend on real time, random IDs, network, filesystem processes, or sleeps.
- No real Claude executable, child process, WebSocket, HTTP, SQLite, MCP, AgentControlTool, Graph, Package routing, ActorTemplate compiler, or Run Engine behavior is introduced.
- Runtime Contracts are imported only from `@ai-block/runtime-contracts` package root.
- Root verification must execute ActorHost tests; a separately green package command that is absent from `pnpm verify` is insufficient.
- Serena memory and `.serena/` inspection are prohibited. Non-memory Serena LSP/IDE functions are allowed when useful; Git, TypeScript, tests, and ordinary diffs remain authoritative.
- `docs/construction/superpowers-temporary-authorization.md` governs the Coder. It performs the Task preflight and authorized implementation only; it does not start brainstorming, rewrite the plan, dispatch subagents, request review, or perform independent review.

## Coder preflight gate

Before editing, report:

1. current ActorHost package/test/build topology and exact expected changed files;
2. the proposed BackendAdapter and BackendSupervisor public-to-module API shapes, including ownership of session and process facts;
3. the proposed internal lifecycle/state model and legal/illegal transitions;
4. the deterministic FakeBackend control model and how tests avoid timing races;
5. how cancellation, launch failure, backend failure, create, resume, and concurrent-start rejection map to existing Runtime Contract facts without giving Host Server authority;
6. how ActorHost tests enter root `pnpm verify` while preserving clean/dist and boundary checks;
7. every implicit decision, missing fact, or scope conflict, with a recommendation for Controller confirmation.

Do not edit until the Controller returns exact `IMPLEMENTATION_AUTHORIZED` with the internal API and state decisions closed.

## Required behavior coverage

At minimum, focused tests must prove:

- initialization does not start FakeBackend or create a session;
- start before initialization is rejected;
- a `session:create` Invocation establishes and reports a deterministic session;
- a `session:resume` Invocation uses the supplied session ID;
- a second concurrent Invocation is rejected without cancelling or replacing the first;
- explicit cancellation/stop reaches the active fake Invocation and produces deterministic facts;
- deterministic launch failure and backend non-success outcome are distinguishable;
- supervisor returns to the correct state after success, failure, and cancellation;
- no test relies on wall-clock delay or a real process.

## Acceptance

- The internal port is narrow enough for a future ClaudeCodeAdapter without embedding fake-specific controls in production-facing interfaces.
- BackendSupervisor owns Host-local execution state only and respects all frozen behavior above.
- The FakeBackend provides deterministic test control through test-owned configuration or handles.
- `pnpm --filter @ai-block/actor-host test` passes from a clean state.
- Root `pnpm verify` runs Runtime Contracts and ActorHost tests, build/type checks, workspace boundaries, cleanup, and Git-clean verification.
- No Runtime Contracts, application entrypoint, dependency, or lockfile change occurs.
- The Coder Report records RED/GREEN evidence, internal API decisions, state transitions, verification, Serena non-memory use/fallbacks, and deviations.
- Commit only authorized paths with message `feat: add fake backend supervisor skeleton`.
