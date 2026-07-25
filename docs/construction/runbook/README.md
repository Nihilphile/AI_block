# AI_block Construction Runbook

## Purpose

This Runbook is a catalog of reusable construction-context Bricks. Keep a
Brick only when its stable, high-quality information will be consumed often
enough to replace repeated prompting or prevent a concrete failure. The
Orchestrator selects exact Bricks for a Worker lease and dispatch; a directory
name, role name, file reference, or neighboring file never causes automatic
normative loading.

This is a construction-system experiment informed by AI_block's Prompt Brick ideas. It does not change the Runtime product model or make construction files into product Runtime objects.

The repository's current-state route is
[`project_state/README.md`](../../../project_state/README.md). It is a bounded
navigation layer: declare one existing-module card or one new-module parent
route, then inspect authorized source, Contracts, tests, and evidence. Project
State summaries never override those authorities or the Runbook's procedure
rules.

## Context composition model

```text
Worker context
  = lease-scoped Bricks loaded once
  + bounded Project State context
  + dispatch-scoped method/evidence Bricks selected now
  + Task file or inline Task-specific authority delta
```

### Lease scope

Lease Bricks remain active for one coherent Worker context lease. They are loaded when the Worker is created, reset, assigned a new role/state owner, or explicitly given a new lease epoch. They are not reloaded for every Task.

Typical lease Bricks:

- project Worker policy;
- Project State context policy;
- one role profile;
- construction safety ceilings;
- Serena no-memory safety when relevant;
- Superpowers orchestration boundary.

### Dispatch scope

Dispatch Bricks are selected for one Task, phase, or evidence action. Load only what is needed now.

Typical dispatch Bricks:

- the concrete Task;
- a preflight, implementation, testing, or reviewing procedure;
- an active specialized gate;
- an exact design or finding needed by the Task;
- a tool operation guide;
- a Report template only when `output_mode: file`.

### Task-specific delta

Baseline, read/write scope, state semantics, error codes, security decisions,
acceptance scenarios, commit instruction, and scope expansion remain in a
durable Task or an explicit inline authorization delta. W2/W3 work, public
boundaries, new state owners, cross-context authority, and independent
acceptance use a committed Task. Bounded W0/W1 work may use an inline delta.
These details are not generalized into reusable procedures.

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

Every product dispatch declares `state_context` according to
[`project/project-state-policy.md`](./project/project-state-policy.md).
Existing-module work names one exact target card. New-module preflight names
the nearest parent route and intended card path; the Orchestrator creates the
initial card only after READY and before implementation authorization.

Normative Runbook/design/Task context remains manifest-selected. Inside Task
read scope, Workers may investigate source, tests, Contracts, Git, and evidence
links without gaining new instructions or write authority.

## Dispatch form

Use the canonical
[`templates/load-manifest.md`](./templates/load-manifest.md). It covers lease
creation, existing/new module state context, durable or inline authority,
action, and output mode. Non-authoritative worked compositions live only in
[`examples/dispatch-composition.md`](./examples/dispatch-composition.md).
Loading a Brick never grants more authority than the Task or inline delta.

## Directory map

```text
runbook/
├── README.md
├── catalog.md
├── project/
│   ├── orchestrator-profile.md
│   ├── worker-lease-policy.md
│   └── project-state-policy.md
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

Product architecture, milestone plans, real Tasks, product/state commits, and
evidence Reports remain outside the Runbook.

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
| Accepted construction records, focused evidence Reports, commits, and Git | Verification and historical evidence |
| Active OpenSpec changes | Approved future-work planning |
| Project and lease policies | Long-lived ceilings and defaults |
| Procedure or operation policy | Method for assigned work |
| Template | Output shape only |
| Declared output (`reply`, `commit`, or `file`) | Work and evidence actually produced |

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

For product construction, the Worker also reads the declared `state_context`.
It then investigates only the source/test/evidence surface allowed by Task read
scope. If a card disagrees with scoped evidence, the Worker reports the
mismatch and does not treat the card as proof.

## State-card maintenance and facet rule

The reusable lifecycle and role ownership live only in
[`project/project-state-policy.md`](./project/project-state-policy.md); role
guides do not repeat them.

Each module keeps one default `README.md` card. Add a future facet such as `interfaces.md`, `lifecycle.md`, or `persistence.md` only when Workers routinely load that subject independently or the README can no longer remain a compact orientation layer. File length alone is not a split trigger, and this activation creates no facet files.

## Compatibility

Historical paths under `work-guides/`, `ai-block-project-profile.md`, `policies/serena.md`, and `policies/superpowers.md` remain compatibility entry points. New dispatches use the composable paths in `catalog.md`.
