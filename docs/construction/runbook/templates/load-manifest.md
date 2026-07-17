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
    - <project Worker policy>
    - <role lease Brick>
    - <lease safety policy>
```

## Dispatch work

```yaml
reuse_lease: <lease-id>
expected_epoch: <integer>
load:
  - <Task path>
  - <current procedure>
  - <only active gate/policy/design context>
action: <preflight only | implementation | testing | reviewing | other exact action>
```

## Optional Task-specific delta

```yaml
decision_delta:
  - <closed decision>
scope_delta:
  - <exact additive path/action>
```

## Rules

- Paths are repository-relative and ordered.
- No glob, directory, sibling, or transitive loading.
- The manifest selects context but grants no authority beyond Task/delta.
- If a loaded file is missing or the lease is uncertain, stop with `LOAD_REQUEST` or `LEASE_RELOAD_REQUIRED`.
