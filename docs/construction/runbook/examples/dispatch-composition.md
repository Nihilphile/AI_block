# Dispatch Composition Examples

Examples are non-authoritative. Paths are explicit Prompt Bricks; no directory is loaded.

## New ActorHost Coder lease

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

## W3 preflight using Serena

```yaml
reuse_lease: actor-host-coder-01
expected_epoch: 1
load:
  - docs/construction/records/actor-host/tasks/HOST-example-001.md
  - docs/construction/runbook/worker-guides/coder/procedures/preflight.md
  - docs/construction/runbook/policies/serena-operations.md
action: preflight only
```

The Worker may inspect source inside Task read scope. It may not load every Coder procedure or follow all Task References.

## Implementation after preflight

```yaml
reuse_lease: actor-host-coder-01
expected_epoch: 1
load:
  - docs/construction/runbook/worker-guides/coder/procedures/implementation.md
  - docs/construction/runbook/procedures/scope-escalation.md
action: IMPLEMENTATION_AUTHORIZED
decision_delta:
  - preserve receipt-only ACK
  - use existing Runtime Contract error surface
```

## Independent Tester

```yaml
lease:
  id: host-boundary-tester-01
  epoch: 1
  load_once:
    - docs/construction/runbook/project/worker-lease-policy.md
    - docs/construction/runbook/worker-guides/tester/lease.md
    - docs/construction/runbook/policies/superpowers-boundary.md

load:
  - docs/construction/records/host-gateway/tasks/HG-acceptance-example.md
  - docs/construction/runbook/worker-guides/tester/procedures/acceptance.md
  - docs/construction/runbook/procedures/subject-identity.md
action: independent testing
```
