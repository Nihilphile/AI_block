# AI_block Construction Runbook

## Purpose

This Runbook is a catalog of composable construction-context Bricks. The Orchestrator selects the exact Bricks loaded for a Worker lease and for each dispatch. A directory name, role name, file reference, or neighboring file never causes automatic loading.

This is a construction-system experiment informed by AI_block's Prompt Brick ideas. It does not change the Runtime product model or make construction files into product Runtime objects.

The repository's current-state route is [`project_state/README.md`](../../../project_state/README.md). It is a bounded navigation layer: load the root state README and the exact target module card for a task, then inspect the authorized source, Contracts, tests, and evidence. Project State summaries never override those authorities or the Runbook's procedure rules.

## Context composition model

```text
Worker context
  = lease-scoped Bricks loaded once
  + dispatch-scoped Bricks selected now
  + Task-specific authority and decision deltas
```

### Lease scope

Lease Bricks remain active for one coherent Worker context lease. They are loaded when the Worker is created, reset, assigned a new role/state owner, or explicitly given a new lease epoch. They are not reloaded for every Task.

Typical lease Bricks:

- project Worker policy;
- one role profile;
- construction safety ceilings;
- Serena no-memory safety when relevant;
- Superpowers orchestration boundary.

### Dispatch scope

Dispatch Bricks are selected for one Task, phase, or evidence action. Load only what is needed now.

Typical dispatch Bricks:

- the concrete Task;
- the root Project State README and exact target module state card;
- a preflight, implementation, testing, or reviewing procedure;
- an active specialized gate;
- an exact design or finding needed by the Task;
- a tool operation guide;
- a Report template at handoff.

### Task-specific delta

Baseline, read/write scope, state semantics, error codes, security decisions, acceptance scenarios, commit message, and scope expansion remain in the Task or an explicit Orchestrator authorization delta. They are not generalized into reusable procedures.

## Explicit loading rule

The Orchestrator owns all normative context selection.

```text
- no directory-wide loading;
- no sibling discovery;
- no transitive loading from References;
- no role-name-based auto-loading;
- no Worker self-expansion of normative context.
```

Task `References` are audit pointers, not load directives. If a Worker needs an unlisted normative file, it returns a bounded `LOAD_REQUEST` with the path, reason, and blocked decision.

### Project State dispatch rule

Every task dispatch names these exact repository-relative paths in its `load:` set:

```text
project_state/README.md
project_state/<target-module-card>/README.md
<task and current procedure>
```

`<target-module-card>` is a concrete card path, never a glob or directory. Add a neighboring card only when the Task crosses that module's declared boundary, and name the relevant Contract or interface evidence in the same load set. A routing node is not a substitute for the target card.

This rule does not prevent repository investigation. Task `read scope` authorizes dynamic navigation of source, tests, configuration, and Git evidence. `load` controls instructions and decision context, not every source file read.

## Dispatch form

### Establish a lease

```yaml
lease:
  id: actor-host-coder-01
  epoch: 1
  load_once:
    - docs/construction/runbook/project/worker-lease-policy.md
    - docs/construction/runbook/worker-guides/coder/lease.md
    - docs/construction/runbook/policies/serena-safety.md
    - docs/construction/runbook/policies/superpowers-boundary.md
```

### Dispatch a preflight

```yaml
reuse_lease: actor-host-coder-01
expected_epoch: 1
load:
  - project_state/README.md
  - project_state/apps/actor-host/README.md
  - docs/construction/records/<module>/tasks/<task>.md
  - docs/construction/runbook/worker-guides/coder/procedures/preflight.md
action: preflight only
```

### Authorize implementation

```yaml
reuse_lease: actor-host-coder-01
expected_epoch: 1
load:
  - project_state/README.md
  - project_state/<target-module-card>/README.md
  - <Task path>
  - docs/construction/runbook/worker-guides/coder/procedures/implementation.md
action: IMPLEMENTATION_AUTHORIZED
decision_delta:
  - <Task-specific closed decision>
```

Loading a Brick never grants more authority than the Task and current authorization delta.

## Directory map

```text
runbook/
├── README.md
├── catalog.md
├── project/
│   ├── orchestrator-profile.md
│   └── worker-lease-policy.md
├── orchestration/
├── worker-guides/
│   └── <role>/
│       ├── lease.md
│       └── procedures/
├── procedures/
├── policies/
├── templates/
└── examples/
```

- `orchestration/`: Orchestrator decision references; not default Worker context.
- `project/`: AI_block-specific Orchestrator and Worker lease profiles.
- `worker-guides/`: role-specific lease profiles and dispatch procedures.
- `procedures/`: role-independent, Task-independent dispatch procedures.
- `policies/`: role-independent safety ceilings and optional operation guides.
- `templates/`: output or record shapes loaded only when used.
- `examples/`: non-authoritative composition examples.

Product architecture, milestone plans, and real Task/Report records remain outside the Runbook.

## Brick metadata

Reusable Bricks declare:

```yaml
kind: catalog | worker-profile | procedure | policy | template | project-profile
scope: lease | dispatch | on-demand | orchestrator
audience: <role or audience>
authority: constraint-only | method-only | none
```

Metadata helps the Orchestrator compose context. It never causes automatic loading.

## Authority order

| Source | Governs |
|---|---|
| Explicit user direction | Current authority and exceptions |
| Approved product design, Contract, or ADR | Product meaning |
| Orchestrator Task and authorization delta | Current Worker authority |
| Source code, Runtime Contracts, and tests | Executable behavior and supported current surface |
| `project_state/` | Bounded current orientation and navigation only; never proof or authority over the rows above |
| Accepted construction records, Reports, and Git | Verification and historical evidence |
| Active OpenSpec changes | Approved future-work planning |
| Project and lease policies | Long-lived ceilings and defaults |
| Procedure or operation policy | Method for assigned work |
| Template | Output shape only |
| Report | Work and evidence actually produced |

No profile, procedure, policy, template, or load directive enlarges Task authority.

## Lease continuity

Reuse avoids repeated lease loading only while the Worker can confirm its lease identity, epoch, role/state owner, authority model, and current accepted subject. A Worker reports `LEASE_RELOAD_REQUIRED` rather than guessing when continuity is uncertain.

Technical context-window usage and compaction are not exposed reliably. The operational check is semantic lease integrity, defined in `orchestration/worker-context-leases.md`.

## Orchestrator loading route

For a new construction decision, load only:

1. this entry point and `catalog.md` when composition rules are not already active;
2. `project/orchestrator-profile.md` once for the Orchestrator context;
3. the relevant orchestration references;
4. the concrete Task/design evidence needed to compose a lease or dispatch.

## Worker loading route

A Worker reads, in order:

1. the explicit `lease.load_once` list when establishing or reloading a lease;
2. the current dispatch `load` list;
3. the inline `action` and Task-specific delta.

It reads no other normative Runbook file unless the Orchestrator adds it to a later load list.

For a product or construction task, the dispatch `load` list also includes the root Project State README and the exact target module card. The Worker then reads only the local source/test roots and direct-neighbor cards needed by the declared write scope. If the card disagrees with scoped evidence, the Worker reports the mismatch and does not treat the card as proof.

## State-card maintenance and facet rule

The Orchestrator owns root routing, the cross-module map, current focus, and accepted/deferred summaries. A Coder updates only directly affected module cards when authorized. A Tester reports observed mismatches without rewriting implementation claims. A Reviewer checks changed cards against the accepted implementation and evidence.

Each module keeps one default `README.md` card. Add a future facet such as `interfaces.md`, `lifecycle.md`, or `persistence.md` only when Workers routinely load that subject independently or the README can no longer remain a compact orientation layer. File length alone is not a split trigger, and this activation creates no facet files.

## Compatibility

Historical paths under `work-guides/`, `ai-block-project-profile.md`, `policies/serena.md`, and `policies/superpowers.md` remain compatibility entry points. New dispatches use the composable paths in `catalog.md`.
