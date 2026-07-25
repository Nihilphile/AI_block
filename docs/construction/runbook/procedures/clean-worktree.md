---
kind: procedure
scope: dispatch
audience: all-workers
authority: method-only
---

# Clean Worktree Procedure

## Start

- Confirm expected repository, branch/HEAD, and Task subject.
- Inspect tracked and untracked changes without deleting them.
- If unrelated changes overlap the authorized write set, stop and report the conflict.
- A Task may explicitly allow known pre-existing paths; do not stage or modify them.

## Verification

- Use deterministic cleanup commands already owned by the repository.
- Distinguish ignored generated output from tracked/untracked source changes.
- Verify only authorized files changed before staging.
- Stage explicit paths, never a broad accidental worktree set.

## Handoff

Return starting state, generated-output cleanup, final authorized diff, and
whether the worktree is clean after the Task commit through the declared output
mode. Never obtain cleanliness by deleting or reverting user work.
