# Dispatch Composition Examples

Examples are non-authoritative. Paths are explicit Prompt Bricks; no directory
or referenced sibling is loaded automatically.

## New Coder lease

```yaml
lease:
  id: runtime-project-coder-01
  epoch: 2
  load_once:
    - docs/construction/runbook/project/worker-lease-policy.md
    - docs/construction/runbook/project/project-state-policy.md
    - docs/construction/runbook/worker-guides/coder/lease.md
    - docs/construction/runbook/policies/serena-safety.md
    - docs/construction/runbook/policies/superpowers-boundary.md
```

## New-module W3 preflight

```yaml
reuse_lease: runtime-project-coder-01
expected_epoch: 2
state_context:
  root: project_state/README.md
  target:
    kind: new
    parent_route: project_state/apps/runtime-server/README.md
    card_create_target: project_state/apps/runtime-server/modules/project/README.md
  neighbors: []
authority:
  mode: task
  task: docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md
load:
  - docs/construction/runbook/worker-guides/coder/procedures/preflight.md
  - docs/construction/runbook/policies/serena-operations.md
action: preflight
output_mode: reply
```

After READY, the Orchestrator creates the initial Project card with Intent,
stable boundary, exclusions, planned/active state, and empty roots.

## Implementation after preflight

```yaml
reuse_lease: runtime-project-coder-01
expected_epoch: 2
state_context:
  root: project_state/README.md
  target:
    kind: existing
    card: project_state/apps/runtime-server/modules/project/README.md
  neighbors:
    - project_state/packages/runtime-contracts/README.md
authority:
  mode: task
  task: docs/construction/records/project-persistence/tasks/PP-application-001-project-brick-application.md
load:
  - docs/construction/runbook/worker-guides/coder/procedures/implementation.md
  - docs/construction/runbook/procedures/scope-escalation.md
action: IMPLEMENTATION_AUTHORIZED
output_mode: commit
decision_delta:
  - consume the accepted Runtime Contracts digest helper
```

The product commit contains source, tests, the candidate module-card update,
and a concise evidence body. It does not require a separate coding Report.

## Independent Tester

```yaml
lease:
  id: project-boundary-tester-01
  epoch: 1
  load_once:
    - docs/construction/runbook/project/worker-lease-policy.md
    - docs/construction/runbook/project/project-state-policy.md
    - docs/construction/runbook/worker-guides/tester/lease.md
    - docs/construction/runbook/policies/superpowers-boundary.md

state_context:
  root: project_state/README.md
  target:
    kind: existing
    card: project_state/apps/runtime-server/modules/project/README.md
  neighbors:
    - project_state/packages/runtime-contracts/README.md
authority:
  mode: task
  task: docs/construction/records/project-persistence/tasks/PP-application-acceptance-001-project-brick-application.md
load:
  - docs/construction/runbook/worker-guides/tester/procedures/acceptance.md
  - docs/construction/runbook/procedures/subject-identity.md
action: independent testing
output_mode: file
```

## Lightweight W1 state correction

```yaml
reuse_lease: runtime-project-coder-01
expected_epoch: 2
state_context:
  root: project_state/README.md
  target:
    kind: existing
    card: project_state/apps/runtime-server/modules/project/README.md
  neighbors: []
authority:
  mode: inline
  delta:
    objective: correct one stale evidence link
    write_scope:
      - project_state/apps/runtime-server/modules/project/README.md
    acceptance:
      - the link resolves
      - git diff --check passes
load:
  - docs/construction/runbook/worker-guides/coder/procedures/implementation.md
action: implementation
output_mode: commit
```
