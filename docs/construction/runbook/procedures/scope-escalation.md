---
kind: procedure
scope: dispatch
audience: all-workers
authority: method-only
---

# Scope Escalation Procedure

When required work crosses authorized scope:

1. stop before modifying the new path, boundary, dependency, Contract, or external state;
2. preserve authorized in-progress work without reverting unrelated changes;
3. report the exact additional scope, why it is required, and which acceptance check is blocked;
4. state whether current changes are safe to retain while waiting;
5. wait for explicit `SCOPE_EXPANSION_AUTHORIZED`, a replacement Task, or cancellation.

Do not pre-apply the requested expansion. Authorization is additive only where the Orchestrator says so; all unchanged Task constraints remain active.
