---
kind: procedure
scope: dispatch
audience: all-workers
authority: method-only
---

# Subject Identity Procedure

Use when testing or reviewing an implementation subject after later
orchestration-record commits exist.

1. Record the exact implementation commit or artifact under examination.
2. Record the current orchestration HEAD separately.
3. Verify the range between them contains only explicitly allowed construction records.
4. Stop with `SUBJECT_MISMATCH` if product, test, configuration, dependency, or tooling content changed outside the accepted subject.
5. Name both identities in the declared evidence output; never silently
   transfer evidence to a later subject.

Task authoring after an implementation commit does not create an infinite subject chain: the implementation subject remains fixed, while the Task commit is the orchestration baseline.
