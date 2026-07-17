# CCA-probe-005 Validated Orthogonal Session Profile

- owner: ClaudeCodeAdapter evidence
- follows: CCA-harness-001
- affected modules: none; evidence only
- workflow: W2 plus Controlled Probe gate
- base reason: Probe-004 consumed one call without retaining evidence; the corrected harness has now passed two no-service scalar-result self-tests.
- implementation/product subject: none
- orchestration baseline: `5681989`

## Objective

Execute the unchanged orthogonal P1–P5 print/session profile matrix through the locally validated observation harness and retain complete bounded evidence.

## Scope and authority

- read scope: this Task; explicitly loaded CCA-probe-004 Task, Controlled Probe procedure, CCA-research-002 Report, and Probe-004 Report; local metadata/help and facts created by this Task; Git status and exact Report path.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-probe-005-validated-orthogonal-session-profile.researching.md` plus one new temporary probe root below `$env:TEMP`.
- delegated discretion: collision-resistant temporary names and bounded redaction only.
- tools/external actions: a fresh maximum of five service-capable Claude CLI invocations, all potentially model-bearing; local process observation; read-only help/version; Git add/commit limited to the Report. No delegation, install/update, auth change, private-state inspection, product code/test action, or network research.
- delegation: none.

## Frozen decisions and escalation

- Use the exact P1–P5 arguments, prompts, conditional order, temporary cwd/config isolation, 20-minute watchdogs, cleanup boundary, and forbidden actions defined by CCA-probe-004. Do not alter or retry a profile.
- Use the corrected harness that passed CCA-harness-001:
  - suppress every collection mutator return value with `[void]`;
  - explicitly return one `PSCustomObject`, never an array;
  - retain stdout, stderr, exit, elapsed, JSON parse, result, session, conditional branch, redacted launch shape, and cleanup facts;
  - assert the scalar result shape before evaluating the P1 session condition.
- P1 no usable structured session ID stops P2–P5. P2 failure may continue to P3. P3 no usable structured session ID stops P4/P5. P4/P5 remain sequential.
- The fresh five-call budget does not erase Probe-004's consumed call; report incremental and cumulative actuals.
- No sixth call, retry, alternate empty-value spelling, extra flag, process-stop probe, or fallback to normal user config.
- If the harness scalar assertion fails despite self-test, stop before reading session properties and report; do not retry.

## Acceptance

- Retain all evidence required by CCA-probe-004 for every launched call.
- Identify whether ordinary JSON create/resume works, whether `--bare` changes it, and conditionally whether empty setting sources or tools changes it.
- Separate local CLI/session facts from DeepSeek/provider inference.
- Prove exact temporary-root cleanup with `exists_after=false` and leave normal user state untouched.
- Freeze the minimum evidence-backed Adapter profile or a precise remaining incompatibility without another probe recommendation.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-probe-005-validated-orthogonal-session-profile.researching.md`. Commit only that Report with message `research: close Claude session profile matrix`. Leave the worktree clean and report the commit SHA. Do not resume implementation authority.
