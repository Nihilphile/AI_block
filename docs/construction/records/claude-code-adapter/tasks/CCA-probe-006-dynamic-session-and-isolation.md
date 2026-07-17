# CCA-probe-006 Dynamic Session and Isolation Matrix

- owner: ClaudeCodeAdapter evidence
- follows: CCA-probe-005
- affected modules: none; evidence only
- workflow: W2 plus Controlled Probe gate
- base reason: Probe-005 proved ordinary JSON create but passed a literal session placeholder to P2; dynamic session substitution must be gated before the remaining comparison.
- implementation/product subject: none
- orchestration baseline: `2dea877`

## Objective

Verify ordinary explicit resume and then isolate bare/settings/tools behavior, using a pre-service assertion that the actual P1 session ID—not a display placeholder—is passed to P2.

## Scope and authority

- read scope: this Task; explicitly loaded Probe-004/005 Tasks and Reports, Controlled Probe procedure, and Research-002 Report; local metadata/help and this Task's process facts; Git status and exact Report path.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-probe-006-dynamic-session-and-isolation.researching.md` plus one exact temporary probe root below `$env:TEMP`.
- delegated discretion: collision-resistant temporary names and bounded redaction only.
- tools/external actions: local fake-child preflight plus a fresh maximum of five service-capable Claude CLI invocations, all potentially model-bearing; local process observation; Git add/commit limited to the Report. No delegation, install/update, auth change, private-state inspection, product code/test action, or unrelated network research.
- delegation: none.

## Frozen pre-service gate

Before launching Claude:

1. Run the already validated scalar harness against a local fake P1 that returns JSON with a generated non-placeholder session ID.
2. Feed that parsed value into the same function that constructs P2 argv.
3. Assert all of the following:
   - the result is one `PSCustomObject`, not an array;
   - parsed session ID is non-empty;
   - P2 argv contains `--resume` followed immediately by the exact parsed session ID;
   - P2 argv contains no literal `<SESSION_ID>`, angle bracket, placeholder label, redaction token, or separately hard-coded session value;
   - the redacted display copy may replace the value only after the executable argv is fully constructed and asserted;
   - fake P2 receives the exact generated session ID and returns the expected resume branch.
4. If any assertion fails, stop with zero Claude calls. Do not repair and continue in the same Task.

## Frozen real-call sequence

- Use the exact temporary cwd/config isolation, inherited-environment privacy boundary, native `2.1.172` executable, tokenized `.NET ProcessStartInfo`, UTF-8 stdin, 20-minute watchdog, prompts, and cleanup rules from CCA-probe-004.
- Use a fresh probe root because Probe-005 correctly removed its temporary session state.
- Fresh maximum: five calls. Every launch consumes one slot. No retry or changed profile.

1. P1 ordinary create: `--print --output-format json`.
2. P2 ordinary resume: construct runtime argv using the exact parsed P1 session ID: `--print --resume <actual runtime value> --output-format json`. The angle-bracket form exists only in this prose; it must never appear in executable argv.
3. P3 bare-only create: `--print --bare --output-format json`.
4. P4, only if P3 yields structured session evidence: bare plus `--setting-sources` and one final empty argv element.
5. P5, only if P3 yields structured session evidence: bare plus `--tools` and one final empty argv element.

- P1 failure stops all later calls. P2 behavioral failure may continue to P3. P3 failure stops P4/P5.
- P4/P5 remain sequential and independent create calls.
- No sixth call, retry, alternate empty syntax, extra flag, normal-user-config fallback, stop probe, or modification of prior evidence.

## Acceptance

- Report the no-service dynamic-session gate and prove actual-versus-redacted argv separation.
- Retain bounded P1–P5 evidence required by CCA-probe-004 for each launched call.
- Confirm ordinary create/resume session continuity and isolate `--bare`, then conditionally empty settings/tools.
- Report incremental/cumulative budgets and distinguish harness, CLI/session, authentication/config, and provider facts.
- Prove exact probe-root cleanup with `exists_after=false`; do not inspect normal user state.
- Freeze the minimum evidence-backed Adapter profile and correct prior over-generalizations without another retry recommendation.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-probe-006-dynamic-session-and-isolation.researching.md`. Commit only that Report with message `research: verify Claude resume and isolation flags`. Leave the worktree clean and report the commit SHA. Do not resume implementation authority.
