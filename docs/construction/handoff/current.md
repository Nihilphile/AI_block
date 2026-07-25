---
status: active
updated_at: 2026-07-26T05:21:54+08:00
repository_subject: 438805a92ee82f110ecb1c6d31b9f91c19b9bc54
handoff_record: self
branch: main
working_tree_at_subject: clean
remote_sync_at_subject: ahead-of-origin-main-by-12
next_product_slice: project-application-preflight
---

# Current Orchestrator Handoff

This is the single live Orchestrator-to-Orchestrator handoff for AI_block.
Overwrite it in place when intentionally pausing, handing off, or materially
changing the next step; Git preserves its history. Do not create dated handoff
files.

This file is navigation and execution-continuity input only. The incoming
Orchestrator must verify it against Git, OpenSpec, Project State, accepted
designs, Contracts, source, tests, and construction evidence. Those sources
override this handoff when they disagree.

## Current milestone

The persistence-first product change is active and its Contract-first slice is
accepted. Additive Project/Definition Brick application Contracts passed
independent acceptance and Early Review at implementation subject `7d3eca4`.

The next action is an exact W3 Project application/in-memory Task followed by
Coder preflight only. SQLite remains a later separately authorized slice.

## Product baseline

- The latest accepted product slice is the Project/Definition Brick Runtime
  Contract boundary at `7d3eca4`. It defines application values only and does
  not prove persistence or authoring behavior.
- The prior accepted implementation slice is the reference-only
  ActorTemplate/ActorConfigSnapshot construction core.
- Runtime Contracts, Host Gateway, BackendSupervisor, FakeBackend,
  ClaudeCodeAdapter, and bounded ActorHost connection/command slices exist.
- There is no end-to-end path that creates an Actor, launches its Host, sends a
  Package, and receives the Actor's reply.
- Production Project/Brick persistence and authoring, Actor creation and launch,
  Runtime CLI behavior, Package workflow, recovery, and Graph execution remain
  unimplemented or deferred.

## Workspace baseline

- `166b1ac261c9d1a783339541ff7415581d87f7e4` committed and pushed the Runtime
  Design Knowledge System, North Star, and the earlier handoff record.
- `7d3eca44f2b89011f9c979e1a6f6d3bad9018008` is the immutable accepted Contract
  implementation subject. Independent testing passed at `2d98178`; Early Review
  accepted it with no actionable finding at `438805a`.
- The prerequisite checker allowlist repair is isolated at `705f9eb`; it
  changes construction tooling, not Runtime behavior.
- At `438805a`, the worktree was clean and `main` was 12 commits ahead of
  `origin/main`. This handoff update is a later orchestration-only record.

## Recommended next product slice

**Status: Contract slice accepted; Project application slice next.**

The bounded slice is explicit Project bootstrap plus Definition Brick
create/revise/archive/read/list/history, durable exact revision resolution, and
an adapter to the existing Actor resolver. It uses built-in `node:sqlite` with
Node `>=24.15 <25` and no third-party SQLite runtime dependency.

ActorTemplate/Snapshot production persistence remains excluded, as do Actor
creation, Host launch, CLI/HTTP, Package/Delivery, Run/Invocation, recovery
automation, backup/export, and Graph.

## Decisions closed and next gate

- Persistence-first is selected for the next product slice.
- The Project module owns the minimal Project prerequisite plus Definition Brick
  aggregates/revisions for this slice.
- Shared Runtime Contracts define typed application values, not HTTP/CLI/file
  transport.
- The physical substrate is built-in `node:sqlite`; the supported floor becomes
  Node `>=24.15 <25`.
- The database path is explicit and Server-owned; no platform default or
  Project-repository placement is introduced.
- The remaining busy-timeout, same-process serialization, schema layout, and
  source/test-root choices are delegated implementation-preflight decisions
  within the accepted design.

## Active execution state

- Active Worker or lease: none.
- Active implementation, test, or review subject: none.
- Completed/retired leases:
  - `project-persistence-explorer-01@1`
  - `project-persistence-researcher-01@1`
  - `runtime-contracts-coder-02@1`
  - `workspace-boundary-debugger-01@1`
  - `runtime-contracts-tester-02@1`
  - `runtime-contracts-reviewer-02@1`
- Active product OpenSpec change:
  `build-project-and-definition-brick-persistence`; 4/4 planning artifacts
  complete, implementation tasks 4/30.
- Paused product task: creation and dispatch of the Project
  application/in-memory W3 Task and Coder preflight.

## Administrative queue

- `build-project-and-definition-brick-persistence`: planning complete and
  valid; Contract tasks `2.1`–`2.4` complete and accepted; 26 tasks remain;
  unarchived.
- `reorganize-runtime-design-documents`: 24/24 complete; closeout complete;
  committed, pushed, and unarchived.
- `establish-project-state-system`: 16/16 complete; closeout complete;
  unarchived.
- `build-reference-only-actor-template`: 20/20 complete; closeout complete;
  unarchived.
- Current accepted orchestration subject `438805a` is committed locally and not
  pushed at this handoff subject. Archiving and pushing remain separate actions.

## Active user directions

- Resume product progress instead of allowing documentation work to replace it.
- Advance construction steadily and serially rather than developing major
  modules in parallel.
- Preserve the main Orchestrator's context for architecture, direction,
  critical decisions, and Worker orchestration.
- For module-level Worker construction, perform preflight first and wait for
  Orchestrator authorization before implementation.
- Use standard Worker speed rather than speed mode; time pressure is low.
- Preserve Project State role ownership: the Orchestrator owns root routing,
  system map, current focus, and cross-module accepted/deferred summaries;
  Coders update only directly affected module cards under Task authority;
  Testers report mismatches; Reviewers verify changed cards against the exact
  subject.

## Load next

Read only:

1. `docs/construction/handoff/current.md`
2. `docs/NORTH_STAR.md`
3. `project_state/README.md`
4. `project_state/_meta/authority.md`
5. `project_state/_meta/system-map.md`
6. `project_state/_meta/current-focus.md`
7. `docs/design/README.md`
8. `docs/design/current/runtime-invariants.md`
9. `project_state/apps/runtime-server/modules/actor/README.md`
10. `project_state/packages/runtime-contracts/README.md`
11. `openspec/changes/build-project-and-definition-brick-persistence/proposal.md`
12. `openspec/changes/build-project-and-definition-brick-persistence/design.md`
13. `openspec/changes/build-project-and-definition-brick-persistence/specs/project-definition-brick-persistence/spec.md`
14. `openspec/changes/build-project-and-definition-brick-persistence/tasks.md`
15. `docs/design/future/project-persistence-and-brick-authoring.md`

Do not load the full future-design or history trees.

## First actions

1. Verify the branch, repository subject, handoff-record commit, worktree,
   remote state, and active OpenSpec status.
2. Create and commit the exact W3 Project application/in-memory Task, including
   the new-card creation trigger and root/meta Project State exclusion.
3. Dispatch a Coder for preflight only. Review the returned construction map,
   close delegated implementation choices, and issue a separate authorization
   before any product write.
