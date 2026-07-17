---
kind: policy
scope: lease
audience: all-workers
authority: constraint-only
---

# Serena Safety Ceiling

Serena is a non-authoritative LSP/IDE operation layer. Git diff, TypeScript, tests, boundary probes, and the final worktree remain authoritative.

The no-memory policy is mandatory:

- never call memory read/write/list/check/refresh APIs;
- never run onboarding to create or refresh project memory;
- never inspect, edit, stage, traverse, or rely on `.serena/`;
- never treat Serena project state as repository truth;
- Serena never enlarges Task read/write/tool authority.

This lease Brick does not instruct a Worker to use Serena. Load `serena-operations.md` only for a dispatch where non-memory Serena operations are useful.
