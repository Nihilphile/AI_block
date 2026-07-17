# CCA-harness-002 Node Probe Runner Gate

- owner: ClaudeCodeAdapter evidence tooling
- follows: CCA-probe-006
- affected modules: none; temporary construction tooling only
- workflow: W1
- base reason: Researcher-authored PowerShell harnesses repeatedly lost or misrouted dynamic evidence; a separate Tester must validate a pinned Node runner before another Claude call.
- implementation/product subject: none
- orchestration baseline: `f35ff8f`

## Objective

Build and self-test one temporary, hash-pinned Node process runner that correctly performs dynamic create→resume substitution and can later execute the unchanged orthogonal Claude profile matrix.

## Scope and authority

- read scope: this Task; Probe-004/005/006 Tasks and Reports; local Node metadata.
- write scope: one collision-resistant temporary harness root below `$env:TEMP`, containing only the Node runner and local fake-child fixtures. The root may remain after successful handoff for a later exact-hash Probe Task.
- delegated discretion: temporary filenames, internal JavaScript function names, and fake fixture organization.
- tools/external actions: Node and local fake child processes; SHA-256 hashing; Git status. No Claude executable, model/service/network, credentials/config/session inspection, repository write/commit, or delegation.
- delegation: none.

## Frozen runner boundary

- Use Node `child_process.spawn(executable, args, { shell: false, cwd, env, stdio: ["pipe", "pipe", "pipe"] })` with an argv array. Never use a shell-built command string.
- The runner must accept executable, exact argv array, cwd, environment delta, UTF-8 stdin text, and watchdog; it must return one plain object containing redacted display argv, exit code/signal, timeout flag, elapsed time, stdout, stderr, JSON parse outcome, result, and session ID.
- Executable argv and display argv are separate arrays. Redaction is applied only to a copied display array after executable argv is frozen.
- Capture stdout/stderr independently, close stdin, and reject/record child launch errors without losing already observed process facts.
- No collection-mutator or logging return value may alter the result shape.

## Required no-service self-tests

1. **Transport case**: fake child receives multiple args including a final empty string, exact Unicode stdin, emits known stdout JSON and stderr marker, and exits non-zero. Assert every field.
2. **Create case**: fake P1 emits root JSON with a generated dynamic `session_id`. Parse it through the production runner result path.
3. **Resume substitution case**: build P2 executable argv from the parsed P1 value. Assert `--resume` is followed by the exact generated value, contains no angle brackets/placeholder/redaction token, and is not a hard-coded duplicate. Fake P2 must independently inspect received argv and return the same session ID plus `resume-eligible` result.
4. **Display redaction case**: prove the display copy redacts the session while executable argv remains unchanged.
5. **Conditional matrix case**: simulate P1 success→P2→P3 success→P4/P5 and separately P1 failure stop and P3 failure stop, proving exact call order/count without Claude.
6. **Cleanup case**: create and delete a separate fake probe-state root and prove `exists_after=false`. Do not delete the successful harness root.

All assertions must pass in one final run. Local iteration is allowed before the final run because no service is contacted.

## Acceptance

Return directly:

- PASS/FAIL and assertion count;
- Node version;
- redacted harness-root path and runner filename;
- SHA-256 of the exact runner file;
- proof of dynamic executable argv versus redacted display argv;
- simulated conditional call ledgers;
- fake cleanup evidence;
- Git-clean evidence;
- `READY` only if the exact persisted runner requires no change before a real Probe.

## Handoff

Do not write the repository or commit. On PASS, retain only the non-secret temporary harness root for a later exact-path/hash authorization. On FAIL, delete it. Never launch Claude Code.
