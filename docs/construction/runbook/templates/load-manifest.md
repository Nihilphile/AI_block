---
kind: template
scope: on-demand
audience: orchestrator
authority: none
---

# Worker Load Manifest Template

## Establish or reload a lease

```yaml
lease:
  id: <state-owner-role-id>
  epoch: <positive integer>
  load_once:
    - docs/construction/runbook/project/worker-lease-policy.md
    - docs/construction/runbook/project/project-state-policy.md
    - <role lease Brick>
    - <only applicable lease safety policy>
```

## Existing-module dispatch

```yaml
reuse_lease: <lease-id>
expected_epoch: <integer>

state_context:
  root: project_state/README.md
  target:
    kind: existing
    card: project_state/<target-module>/README.md
  neighbors: []

authority:
  mode: task | inline
  task: <Task path when mode is task>
  delta: <exact inline objective/scope/acceptance when mode is inline>

load:
  - <current procedure>
  - <only active gate/policy/design context>

action: <preflight | implementation | testing | reviewing | other exact action>
output_mode: reply | commit | file
```

## New-module preflight

```yaml
reuse_lease: <lease-id>
expected_epoch: <integer>

state_context:
  root: project_state/README.md
  target:
    kind: new
    parent_route: project_state/<parent>/README.md
    card_create_target: project_state/<new-module>/README.md
  neighbors: []

authority:
  mode: task
  task: <Task path>

load:
  - <preflight procedure>

action: preflight
output_mode: reply
```

After READY, the Orchestrator creates the initial card and implementation
switches to `target.kind: existing`.

## Optional authorization delta

```yaml
decision_delta:
  - <closed Task-specific decision>
scope_delta:
  - <exact additive path/action>
```

## Rules

- Paths are repository-relative and ordered.
- No glob, directory, sibling, or transitive normative loading.
- `state_context` follows the loaded Project State policy.
- Investigative source/test/Git/evidence reading stays inside Task read scope.
- A Task or inline delta grants authority; the manifest and loaded Bricks do
  not.
- `output_mode` is explicit. `file` names its exact Report path in authority;
  `commit` uses the authorized deliverable plus structured commit body.
- If a loaded file is missing or lease continuity is uncertain, stop with
  `LOAD_REQUEST` or `LEASE_RELOAD_REQUIRED`.
