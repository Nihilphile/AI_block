# CCA-preflight-001 ClaudeCodeAdapter Boundary Preflight

- owner: ActorHost / ClaudeCodeAdapter
- follows: CCA-probe-003
- affected modules: ActorHost; Runtime Contracts read-only
- workflow: W2
- base reason: A new backend implementation crosses process, session, parser, stop, and wire-fault boundaries while the current live CLI is compatibility-gated.
- implementation/product subject: `949e742`
- orchestration baseline: `9a7ee56`

## Objective

Return an implementation-ready decision brief for the smallest truthful ClaudeCodeAdapter slice behind the existing BackendAdapter/Supervisor port, without writing product code.

## Scope and authority

- read scope: `apps/actor-host/src/**`, `apps/actor-host/test/**`, ActorHost package/TypeScript configuration, relevant `packages/runtime-contracts/src/**` and tests, root workspace scripts/boundary checks needed to determine verification, Git history/diff/status, and only the explicitly loaded architecture/evidence/Runbook files.
- write scope: none.
- delegated discretion: local code navigation, symbol/reference analysis, test inventory, and implementation-shape recommendations that do not change approved architecture or public Contracts.
- tools/external actions: Serena non-memory LSP/IDE operations; bounded `rg`, Git, TypeScript/package metadata inspection; no real Claude process, model call, network research, installation, update, authentication, credential/config/session inspection, or destructive command.
- delegation: none.

## Frozen decisions and escalation

- The evidence closeout is the implementation boundary: terminal JSON plus structured session ID is required for create success; plain text/no-session is a compatibility failure.
- Initialization performs no model invocation and creates no empty conversation.
- Each Invocation launches one short-lived process; create has no resume flag; resume uses only the supplied explicit session ID.
- Use tokenized native process launch and UTF-8 stdin; preserve process, stream, parser, session, completion, timeout, and stop facts separately.
- No implicit `--continue`, fork, stream-json, dynamic tools/MCP/plugins, CLI update, real-service test, Actor/Package/Run/Graph work, dependency addition, public Runtime Contract change, or unrelated cleanup.
- Runtime Contracts Phase 0B is frozen. If a truthful compatibility/parser fault cannot be represented through existing internal/wire behavior, report the exact pressure and alternatives; do not edit the Contract.
- Existing security decisions remain: no raw backend diagnostics on the wire; no false InvocationResult; unknown liveness must not become ready/running success.
- Preflight only. Do not create files, edit source/tests/docs, run a real backend, or commit.

## References

- `docs/construction/records/claude-code-adapter/claude-code-adapter-evidence-closeout.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`

## Acceptance

Return:

1. the exact current BackendAdapter/Supervisor interfaces and state owner touched;
2. a proposed file-level source/test write set with reasons and directory placement;
3. the smallest process-runner seam and whether it should be Claude-specific or Host-generic;
4. initialization, create, resume, completion, parser/session extraction, stop, timeout, and concurrent-invocation flow;
5. exact CLI argument/input ownership, including where immutable launch controls are compiled;
6. existing error/fault mapping available for launch, process, malformed JSON, missing session, and unsupported local profile;
7. any hidden Contract, dependency, platform, security, or state-machine decisions requiring Orchestrator resolution;
8. deterministic focused tests and full regression/boundary commands, with no real Claude service;
9. expected Serena operations, friction/fallbacks, and confirmation that memory/onboarding/`.serena/` remain unused;
10. `READY` or `BLOCKED`, with a bounded `LOAD_REQUEST` or decision list if needed.

## Handoff

Return the preflight brief directly to the Orchestrator. Do not write a Report file or commit. Wait for an exact `IMPLEMENTATION_AUTHORIZED` dispatch.
