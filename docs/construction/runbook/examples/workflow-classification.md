# Workflow Classification Examples

Examples illustrate the decision rules; they do not replace them.

| Construction work | Result | Why |
|---|---|---|
| Rename a private symbol with exact affected paths and deterministic build check | W1 | Mechanical, reversible, no semantic boundary change |
| Fix state transition behavior inside one module | W2 | Changes module behavior and requires implementation judgment |
| Add a package contract consumed by server and host | W3 | Establishes a public cross-owner boundary |
| Verify how the current repository resolves one import | W0 exploring | Read-only local fact finding |
| Confirm an undocumented CLI resume behavior from authoritative upstream evidence | W0 researching, or Research gate on its blocked Task | External fact determines construction |
| Narrow config edit that changes credential handling | W1 or W2 + Security Review | Base follows impact; security trigger independently adds control |
| Internal feature with weak regression coverage | W2 + Independent Test | Independent evidence is concretely needed |
| Public contract about to be consumed by downstream slices | W3 + Early Review | Delayed review would create substantial rework |

## Two useful anti-examples

- Twenty mechanical file edits do not become W3 because the file count is large.
- One small authorization check does not remain W1 merely because the diff is tiny; semantic impact and the Security Review trigger control the workflow.
