---
status: active
updated_at: 2026-07-26T04:47:28+08:00
repository_subject: 46f51c15273b19770958bbe74f4c43cce8775ec1
handoff_record: self
branch: main
working_tree_at_subject: clean
remote_sync_at_subject: ahead-of-origin-main-by-1
next_product_slice: planned-not-implemented
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

The North Star and Runtime Design Knowledge System are established. The next
product slice is selected and planned as minimal Project bootstrap plus durable
Definition Brick authoring/history/exact resolution. Its OpenSpec proposal,
design, capability specification, and task plan are complete and validated.

No product implementation has begun. The next action is an exact W3
Contract-first Task followed by Coder preflight only; implementation remains
unauthorized until the Orchestrator reviews that preflight.

## Product baseline

- The last accepted product slice is the reference-only
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
- `46f51c15273b19770958bbe74f4c43cce8775ec1` is the accepted local planning
  subject for the persistence-first slice. It contains the two bounded
  exploration/research Task/Report pairs, all four OpenSpec planning artifacts,
  and the Orchestrator-owned `project_state/_meta/current-focus.md`
  reconciliation.
- At that subject the worktree was clean and `main` was one commit ahead of
  `origin/main`. This handoff update is a later orchestration-only record and
  must not be mistaken for product implementation.

## Recommended next product slice

**Status: selected and planned; implementation not authorized.**

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
- Completed evidence Workers: `project-persistence-explorer-01@1` and
  `project-persistence-researcher-01@1`; both are retired after accepted
  Reports.
- Active product OpenSpec change:
  `build-project-and-definition-brick-persistence`; 4/4 planning artifacts
  complete, implementation tasks 0/30.
- Paused product task: creation and dispatch of the first W3 Contract Task and
  Coder preflight.

## Administrative queue

- `build-project-and-definition-brick-persistence`: planning complete and
  valid; implementation not started; unarchived.
- `reorganize-runtime-design-documents`: 24/24 complete; closeout complete;
  committed, pushed, and unarchived.
- `establish-project-state-system`: 16/16 complete; closeout complete;
  unarchived.
- `build-reference-only-actor-template`: 20/20 complete; closeout complete;
  unarchived.
- Planning subject `46f51c1` is committed locally and not pushed at this
  handoff subject. Archiving and pushing remain separate actions.

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

Do not load the full future-design or history trees. Load the focused Project
persistence future design only when composing the first implementation Task or
reviewing a scope escalation.

## First actions

1. Verify the branch, repository subject, handoff-record commit, worktree,
   remote state, and active OpenSpec status.
2. Create and commit the exact W3 Contract-first Task, including its bounded
   Project State consequence and explicit exclusion set.
3. Dispatch a Coder for preflight only. Review the returned construction map,
   close delegated implementation choices, and issue a separate authorization
   before any product write.
