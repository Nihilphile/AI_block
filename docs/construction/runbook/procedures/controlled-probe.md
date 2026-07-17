---
kind: procedure
scope: dispatch
audience: researcher | tester
authority: method-only
---

# Controlled Probe

Use this procedure only when the Task explicitly authorizes a stateful, costly, quota-consuming, or real-service probe. This procedure does not grant that authority by itself.

## Before the first external action

- Restate the exact invocation, request, time, state, and write budgets from the Task.
- Confirm the target executable/service, isolated working directory, fixed safe inputs, and cleanup boundary.
- Distinguish metadata-only checks such as local help/version from model- or service-capable invocations.
- Stop with `PROBE_AUTHORITY_REQUEST` if a required retry, credential/config inspection, broader state cleanup, or additional service call is not already authorized.

## During the probe

- Count every service-capable invocation when it is launched, including argument errors, cancellation, timeout, and failed resume attempts.
- Do not retry automatically or replace a failed probe with a different one.
- Preserve process, stdout, stderr, parser, timeout, cancellation, and observed state facts separately.
- Record bounded evidence needed for the decision; do not copy secrets, credentials, raw private configuration, full transcripts, or large logs into the repository.
- Do not turn empirical probe authority into product implementation authority.

## Cleanup and handoff

- Clean only the exact temporary state authorized by the Task.
- Do not alter user-level credentials, configuration, caches, histories, or pre-existing sessions unless the Task names the exact state and action.
- Report consumed budgets, residual state, cleanup evidence, deviations, and which questions remain unproven.
- Stop after the Report and authorized commit; do not run follow-up probes without a new authorization delta.
