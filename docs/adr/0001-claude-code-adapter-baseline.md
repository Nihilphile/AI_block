# ADR-0001: Claude Code Adapter Baseline

## Status

Accepted for Direct Actor MVP planning. Empirical probes remain required before the real adapter is accepted.

## Context

ActorHost keeps a logical Actor alive while individual Claude Code `-p` processes are short-lived. Claude-specific behavior must remain inside `ClaudeCodeAdapter` and must not leak into generic Runtime Contracts.

The decision is based on a read-only Researcher report against the installed Claude Code 2.1.172 capability surface and official primary documentation. Version drift between local CLI help and current online documentation is expected.

## Decisions

1. MVP uses non-interactive `-p` execution with structured `json` completion output.
2. Streaming output is deferred until a product requirement needs live deltas.
3. Runtime generates and persists an explicit Actor session ID; it never uses directory-relative “continue latest” behavior for routing.
4. Every invocation sets an explicit working directory, and the working directory is retained with the session record.
5. Actor `BrickSysPrompt` content is appended to the Claude Code default System Instruction by default. Full replacement is a separate explicit mode and cannot be combined with append mode.
6. Tool, Skill, MCP, permission, model, and System Instruction choices are static in `ActorConfigSnapshot` but are physically re-applied by ActorHost whenever it starts a short-lived Claude Code process.
7. MCP configuration is explicit and strict for managed Actors; ActorHost does not depend on ambient user or project MCP discovery.
8. Permission bypass mode is outside the MVP. Managed Actors use an explicit permission profile and tool policy.
9. Parent-process exit, structured completion, session identity, and failure report are separate facts. A zero process exit alone does not prove semantic completion.
10. Windows executable resolution, cancellation, and process-tree cleanup belong exclusively to the Claude Code backend adapter.
11. Generic Runtime Contracts describe backend-neutral launch, invocation, completion, failure, and session concepts. Claude CLI flags and event shapes remain private adapter types.

## Required controlled probes

Before the real Claude Code adapter is accepted, delegated workers must provide evidence for:

- explicit session creation and later resume
- local JSON success and failure shapes
- Windows executable invocation without shell-string construction
- explicit working-directory behavior
- appended System Instruction behavior
- strict MCP loading and permission behavior
- interrupted-process and descendant cleanup behavior
- UTF-8 multiline input and large-output handling

Probe execution that may consume model quota requires explicit user authorization. FakeBackend remains the deterministic default for automated tests.

## Consequences

- Phase 0 Contracts can proceed without depending on unresolved Claude-specific behavior.
- Real ActorHost integration is gated by controlled probe evidence.
- Updating Claude Code requires re-running the adapter compatibility probes rather than silently trusting newer online documentation.
