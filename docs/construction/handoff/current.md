---
status: active
updated_at: 2026-07-26T04:14:16+08:00
baseline_commit: 9e31e0b0ab3b73f06d23471d3f97a48ad45fad91
branch: main
working_tree: dirty
recommended_product_slice: candidate
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

The North Star has been drafted from the direction confirmed with the user.
Review its wording, then select the next product construction slice. No new
product implementation is authorized yet.

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

## Workspace baseline and dirty delta

- Before this handoff file, the working tree contained 34 documentation-system
  changes: 15 tracked modifications and 19 untracked files.
- Those changes implement Runtime Design Knowledge System v0.1. Its OpenSpec
  tasks are 24/24 complete, independent acceptance and semantic review passed,
  and its closeout exists.
- The 34-file documentation reorganization is not committed, pushed, or
  archived. This handoff file, `docs/NORTH_STAR.md`, and the North Star route
  added to `docs/design/README.md` are later post-closeout increments and must
  not be mistaken for content covered by that change's independent acceptance.

## Recommended next product slice

**Status: candidate, not authorized.**

Project-local persistence plus Definition Brick authoring is the current
recommendation. It gives the existing reference-only ActorTemplate module a
real way to create, resolve, preserve, and recover its inputs before Actor
creation and Host launch are attempted.

## Decisions immediately triggered

- Confirm the wording of `docs/NORTH_STAR.md`; its authority is long-term
  product direction, not current Runtime semantics or implementation.
- Confirm or reject persistence-first as the next product slice.
- If persistence-first is selected, bound the minimum physical store,
  bootstrap, revision, transaction, concurrency, and recovery semantics.
- Keep Actor launch, Runtime CLI, end-to-end Package flow, recovery automation,
  and Graph behavior outside that slice unless separately authorized.

## Active execution state

- Active Worker or lease: none.
- Active implementation, test, or review subject: none.
- Active product OpenSpec change: none.
- Paused product task: selection of the next construction slice, pending review
  of the North Star wording.

## Administrative queue

- `reorganize-runtime-design-documents`: 24/24 complete; closeout complete;
  uncommitted, unpushed, and unarchived.
- `establish-project-state-system`: 16/16 complete; closeout complete;
  unarchived.
- `build-reference-only-actor-template`: 20/20 complete; closeout complete;
  unarchived.
- Archiving, committing, and pushing remain separate explicit actions.

## Active user directions

- Review the newly drafted North Star, then resume product-slice selection.
- Resume product progress instead of allowing documentation work to replace it.
- Advance construction steadily and serially rather than developing major
  modules in parallel.
- Preserve the main Orchestrator's context for architecture, direction,
  critical decisions, and Worker orchestration.
- For module-level Worker construction, perform preflight first and wait for
  Orchestrator authorization before implementation.
- Use standard Worker speed rather than speed mode; time pressure is low.

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

Do not load the full future-design or history trees before the North Star and
next construction question identify which focused file is needed.

## First actions

1. Verify the branch, baseline commit, working-tree delta, and OpenSpec status.
2. Review `docs/NORTH_STAR.md` with the user and revise only the wording or
   directional boundaries they change.
3. After the user confirms the next product slice, create or update the scoped
   OpenSpec change and only then authorize implementation.
