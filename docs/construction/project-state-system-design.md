# Project State System Design

> Status: current construction-system design
>
> Revision: 0.2
>
> Scope: a versioned, progressively disclosed current-state knowledge layer for AI_block Orchestrators and Workers.
>
> This document defines documentation-system semantics. It is not a Runtime product design, implementation task list, source-code specification, or replacement for construction evidence.

## 1. Purpose

`project_state/` is the repository's current-state read model. It gives a newly arriving Orchestrator or Worker enough accurate, task-relevant orientation to enter one module without reconstructing the whole repository from source and historical records.

It answers:

- what a module is intended to own;
- what it actually implements now;
- what it explicitly does not own;
- what is active, blocked, or deliberately deferred;
- what neighboring state, design, evidence, and source must be read next.

It does not attempt to preserve a narrative history. When an implementation approach changes from A to B, the state card describes B. Git history, OpenSpec artifacts, construction records, and closeouts preserve why A changed.

## 2. Authority model

`project_state/` is authoritative only as a navigation and current-state summary. It never overrides the authority that belongs elsewhere.

```text
Product intent and runtime semantics
  -> runtime design documents and accepted OpenSpec specifications

Current module orientation
  -> project_state/

Actual executable behavior
  -> source code, runtime Contracts, and tests

Verification and historical evidence
  -> docs/construction/records/, Git, test reports, closeouts

Future approved work
  -> active OpenSpec changes

Construction process and Worker policy
  -> docs/construction/runbook/
```

If a state card disagrees with its scoped source, Contract, or accepted evidence, the state card is stale. A Worker must flag and reconcile that state; it must not treat the summary as proof that the source behaves as described.

## 3. Context-assembly model

The system is deliberately analogous to a prompt-brick context assembly flow.

```text
project_state/README.md
  -> routes a reader to a bounded module state card
  -> state card routes to direct dependencies and evidence
  -> Worker reads the exact local source and tests in its write scope
```

```text
Root README           routing context
Module README         default module context
Optional future facet current context for one independent question
Records / Git         historical trace
Runbook               operational policy
```

The objective is not to eliminate source reading. It eliminates broad repository archaeology while retaining local-source verification before a change.

Context assembly distinguishes two kinds of reading:

```text
Normative context
  -> exact Runbook, Task, design, Contract, and state-card inputs selected by
     the Orchestrator

Investigative evidence
  -> source, tests, Git, and evidence links a Worker may inspect dynamically
     inside Task read scope
```

Following investigative evidence does not load new instructions, enlarge write
authority, or authorize a neighboring state owner. Missing normative context
returns a bounded load request.

## 4. What counts as a module

A module is the smallest stable responsibility unit that can be independently understood, changed, reviewed, and handed off. It is not automatically a directory, package, class, task, test suite, or OpenSpec change.

A candidate owns a module state card when it has all or most of the following:

1. a distinct responsibility or authoritative state;
2. a clear external boundary, such as a Contract, port, protocol, or supported entry point;
3. independent invariants or lifecycle rules;
4. a realistic independent implementation/review/closeout path;
5. a bounded source area that a Worker can safely enter after reading the card
   and direct neighbors, or an implementation-ready source/test boundary
   confirmed by Coder preflight and explicitly authorized by the Orchestrator.

Directories that merely group code may receive a short routing README, but do not become module state cards solely because they exist on disk.

## 5. Initial module map

The initial state tree is sparse and follows stable architecture boundaries already present in AI_block.

```text
project_state/
├── README.md
├── _meta/
│   ├── authority.md
│   ├── system-map.md
│   └── current-focus.md
├── packages/
│   └── runtime-contracts/
│       └── README.md
└── apps/
    ├── runtime-server/
    │   ├── README.md                 routing node, not a domain card
    │   └── modules/
    │       ├── actor/
    │       │   └── README.md
    │       └── host-gateway/
    │           └── README.md
    ├── actor-host/
    │   └── README.md
    └── runtime-cli/
        └── README.md
```

The first module cards are:

- Runtime Contracts;
- Runtime Server Actor Module;
- Runtime Server Host Gateway;
- ActorHost;
- Runtime CLI.

Project, Package, Run, Graph, and SQLite persistence remain visible in
`_meta/system-map.md` as planned or deferred architecture boundaries. Product
planning alone does not create cards. A boundary receives a card after it
acquires real code, persistent state, or a stable interface, or immediately
before implementation when a READY preflight has established a separately
hand-offable state owner and the Orchestrator authorizes that construction.

## 6. One module, one default README

Every module begins with exactly one default state card: `README.md` in its matching `project_state/` location.

The card must be independently useful to a new Worker. It contains all information normally needed before the Worker opens scoped source:

```text
Intent
Implemented today
Boundary and direct dependencies
Current condition
Read next
Evidence and source roots
```

The default card must distinguish design intent from current reality. It must not imply that a planned capability is implemented merely because the broader Runtime architecture describes it.

### 6.1 Required card shape

Each module README uses a consistent compact shape:

```md
---
module: <stable module name>
implementation_state: planned | partial | reference-only | functional
work_state: stable | active | blocked | deferred
source_roots:
  - <scoped source path>
test_roots:
  - <scoped test path>
---

# <Module name>

## Intent

## Implemented today

## Boundary and dependencies

## Current condition

## Read next

## Evidence
```

The front matter is intentionally small. It supports fast routing without introducing a second machine-maintained database.

`implementation_state` describes capability maturity. `work_state` describes present attention or constraint. For example, a reference-only Actor Module may be `implementation_state: reference-only` and `work_state: stable`; a planned Graph Module is not automatically a blocker.

For an implementation-ready boundary with no source yet, the Orchestrator uses
`implementation_state: planned`, `work_state: active`, and empty
`source_roots`/`test_roots`. The body must say that implementation is
authorized but not yet present. Intended paths belong in the Task or prose
until they exist.

### 6.2 Current condition vocabulary

- `stable`: no active authorized work and no known immediate blocker;
- `active`: an authorized change is currently modifying the module;
- `blocked`: progress requires a named missing decision, dependency, or external state;
- `deferred`: intentionally outside the current stage, not an active blocker.

Every `blocked` statement must name both the blocking condition and the path that can unblock it. Deferred scope must not be written as a blocker.

### 6.3 Initial-card lifecycle and section ownership

An initial module card is created only after a Coder preflight returns READY
and before the Orchestrator grants implementation authority:

```text
Task and preflight
  -> Orchestrator creates the initial card
  -> Coder implements and reconciles current implementation claims
  -> Tester reports mismatches without editing
  -> Reviewer verifies the candidate card
  -> Orchestrator accepts and updates routing/meta state
```

The Orchestrator authors `Intent`, the stable ownership boundary, dependency
direction, and explicit exclusions. A Coder may not silently redefine them; an
incompatible implementation finding returns to scope or design authority.

The Coder updates `Implemented today`, actual source/test roots, concrete local
dependencies, current implementation condition, and evidence when authorized.
Before acceptance, the card states that implementation is self-verified and
independent acceptance is pending.

The Orchestrator owns the final accepted/deferred condition and all root,
parent-route, system-map, and current-focus reconciliation. These lifecycle
states use the existing front matter and prose; they do not require a second
state database or additional phase fields.

## 7. Progressive disclosure and later splitting

The initial system does not pre-split module cards. A module README contains its essential intent, current implementation, boundaries, condition, read map, and evidence in one place.

A module may later gain a facet file only when its reading decision is genuinely independent. Suitable future examples are:

```text
interfaces.md   only when changing a public Contract or cross-module protocol
lifecycle.md    only when changing state transitions, archive, recovery, or concurrency
persistence.md  only when changing repository, migration, or transaction behavior
```

The split criterion is not file length alone. Split only when Workers routinely need one subject without the others, or when the default card can no longer remain a quickly readable orientation layer.

The module README remains the mandatory entry point after any split and contains an explicit `Read next` map. Design, implementation, and blockers are not split into separate default files because they are normally read together.

## 8. Mapping rules

The tree mirrors source architecture sparsely, not literally.

```text
apps/runtime-server/src/modules/actor/
  <-> project_state/apps/runtime-server/modules/actor/README.md

packages/runtime-contracts/
  <-> project_state/packages/runtime-contracts/README.md
```

The mapping is allowed to be many-source-to-one-card when those paths share one stable responsibility. Test directories are listed in card metadata but do not receive independent state cards merely because they are separate directories.

Cross-cutting concerns remain in `_meta/` until they develop an independent ownership boundary. For example, a future real SQLite subsystem may gain `project_state/infrastructure/persistence/README.md`; it must not be introduced merely to mirror a utility folder.

## 9. Read protocol

### 9.1 New Orchestrator

A new Orchestrator reads:

```text
project_state/README.md
project_state/_meta/authority.md
project_state/_meta/system-map.md
project_state/_meta/current-focus.md
```

It then loads only the cards relevant to the selected module or decision. Product north-star documents, active OpenSpec artifacts, and construction records are loaded through the links supplied by those cards.

### 9.2 Worker task entry

A task dispatch explicitly supplies a bounded state context, for example:

```yaml
state_context:
  root: project_state/README.md
  target:
    kind: existing
    card: project_state/apps/runtime-server/modules/actor/README.md
  neighbors: []
```

Task/procedure/design authority remains in the separate manifest inputs. The
Worker then reads only the local source, tests, Contracts, and direct-neighbor
evidence required by its actual read/write scope. State cards reduce broad
exploration; they do not authorize edits without local evidence.

For a new module whose initial card does not yet exist, preflight instead
receives the root route, nearest existing parent route, and Task. After READY,
the Orchestrator creates the initial card and every implementation/evidence
dispatch names that exact card. A future or speculative design boundary never
creates an empty card merely to satisfy a dispatch shape.

### 9.3 Review entry

A Reviewer loads the target module card, the task, relevant evidence, and the actual diff. Review includes checking whether the card remains true after the change.

## 10. Synchronization and ownership

State cards are maintained as current views, not as append-only reports.

### 10.1 Update triggers

The owning card must be reconciled whenever a change alters any of:

- observable implemented behavior;
- module ownership or dependency direction;
- supported Contract/protocol surface;
- lifecycle, persistence, concurrency, or recovery semantics;
- active blocker, deferred scope, or next-entry condition;
- source/test roots a future Worker must inspect.

Pure formatting, test-only mechanical edits, or internal refactors that do not alter the card's statements need not modify it.

### 10.2 Role responsibilities

```text
Orchestrator
  owns root routing, cross-module map, current focus, and acceptance/defer summaries

Coder
  updates current implementation/evidence claims only on the authorized
  directly affected module card

Tester
  may report an observed mismatch but does not rewrite implementation state

Reviewer
  verifies that an affected card accurately represents the accepted implementation
```

No Worker edits unrelated cards merely to make a broad narrative look cleaner. Cross-module state changes require Orchestrator direction.

### 10.3 Reconciliation rule

If a Worker discovers that a loaded card is stale, it records the mismatch in its handoff. The Orchestrator decides whether the current task has authority to correct the card or whether the mismatch requires a dedicated documentation/state reconciliation task.

No card may invent certainty. A known gap is written as a gap, and an unverified claim is linked to the source or evidence needed to verify it.

## 11. Current view, not history

For a material implementation replacement:

```text
old method A -> new method B
```

the card's `Implemented today` section is rewritten to describe B. It may link to the accepted evidence that introduced B, but does not retain a detailed A-versus-B chronology.

Historical rationale belongs in:

- Git commits and diffs;
- OpenSpec proposal/design/spec/task artifacts;
- construction records, reviews, and closeouts;
- durable runtime design documents when the product decision itself changed.

This prevents a state card from becoming a hidden changelog and keeps its context density high.

## 12. Initial activation scope

The first activation created only the root/meta files and the five initial
module cards. It did not backfill every source directory, rewrite historical
records, or require a complete source audit. Later cards follow the
implementation-ready lifecycle above.

The initial cards are based on accepted closeouts, current source roots, existing product design, and existing construction evidence. Each later construction slice expands or corrects cards incrementally.

## 13. Non-goals

The Project State System does not:

- replace source, tests, Runtime Contracts, or local code inspection;
- replace OpenSpec as future-work planning;
- replace construction records as verification history;
- make broad claims of implementation completeness;
- mirror every source directory or test file;
- generate an automatic code summary;
- add a database, runtime dependency, or build behavior;
- prescribe a product Runtime module boundary that has not yet become real;
- create a requirement to update unrelated state files on every commit.

## 14. Adoption success criteria

The initial adoption succeeds when:

1. a new Orchestrator can identify current architecture, accepted modules, deferred scope, and the next entry point without scanning the full source tree;
2. an existing-module Worker can receive a bounded state context containing a
   root and one module card, while a new-module preflight can enter through the
   root, parent route, and Task without creating speculative state;
3. each initial card cleanly separates intent, current implementation, boundaries, and condition;
4. a Reviewer can determine whether a changed module card matches the accepted implementation;
5. state-card maintenance remains bounded to directly affected modules;
6. the system produces no new product runtime behavior and no duplicate construction history.

## 15. Evolution rule

Future Runbook integration must preserve semantic compression: reusable
construction method belongs in Runbook Bricks, reusable current facts belong
in Project State, Task-specific authority belongs in a Task or inline delta,
and only unique durable evidence belongs in a Report. No artifact or workflow
step is retained merely for ceremony.
