# CCA-harness-001 Local Process Harness Self-Test

- owner: ClaudeCodeAdapter evidence tooling
- follows: CCA-probe-004
- affected modules: none; temporary construction tooling only
- workflow: W1
- base reason: Probe-004 lost P1 evidence because PowerShell collection mutation leaked an integer return value into the pipeline.
- implementation/product subject: none
- orchestration baseline: `40a3217`

## Objective

Prove that the exact temporary process-observation harness can return one scalar result containing argv/stdin/stdout/stderr/exit/elapsed/cleanup evidence before it is allowed to launch Claude Code again.

## Scope and authority

- read scope: this Task and CCA-probe-004 Report; local PowerShell/.NET/Node metadata needed for a fake child self-test.
- write scope: one temporary root below `$env:TEMP`, removed before handoff. No repository write.
- delegated discretion: temporary filenames and fake-child implementation details.
- tools/external actions: local PowerShell/.NET and Node process only; Git status. No Claude executable, `claude -p`, model/service/network, credentials/config/session inspection, repository source/test execution, or commit.
- delegation: none.

## Frozen self-test

- Reuse the intended `.NET ProcessStartInfo` shape: `UseShellExecute=false`, tokenized `ArgumentList`, redirected UTF-8 stdin/stdout/stderr, elapsed time, exit observation, and `finally` cleanup.
- Fix the exact PowerShell pipeline bug: suppress every collection mutator return value (for example `[void]$list.Add(...)`) and explicitly return one `[pscustomobject]`. The caller must assert the return value is not an array and has the expected type/properties.
- Launch a local fake child, not Claude. The fake child must:
  - receive multiple argv tokens including one final empty token;
  - receive a fixed UTF-8 stdin payload and close cleanly;
  - emit known stdout JSON;
  - emit a known stderr marker;
  - exit with a chosen non-zero code.
- Parent assertions must prove exact argv preservation including the empty final token, exact stdin, independent stdout/stderr, exact exit code, non-negative elapsed time, scalar return shape, and no leaked collection index.
- Run a second fake-child case with exit zero and parseable stdout JSON so the caller exercises the same conditional property/session branch that failed in Probe-004.
- Create and remove one exact temporary root; surface the redacted root shape and `exists_after=false` to the parent before handoff.
- Build the exact P1 Claude argv/stdin/environment launch specification as data and print its redacted shape, but do not start the Claude executable.
- No retry limit applies to local fake-child self-test iterations, but do not expand beyond fixing the harness assertions.

## Acceptance

Return directly to the Orchestrator:

1. PASS/FAIL for each required observation;
2. scalar result type and property inventory;
3. proof that collection-mutator output is suppressed;
4. exact redacted P1 launch-spec shape without execution;
5. cleanup evidence;
6. whether the harness is READY for a newly authorized Probe Task.

## Handoff

Return the self-test brief directly. Do not write a Report, modify the repository, commit, or launch Claude Code.
