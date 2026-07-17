# CCA-probe-006 Dynamic Session and Isolation Matrix Report

- work: testing
- result: failed
- implementation subject: none
- orchestration baseline: c118989
- lease: claude-code-researcher-01@1

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: fail the mandatory zero-service dynamic-session gate; launch zero Claude calls; do not repair/retry the gate or continue with P1–P5 in this Task.

## Work and evidence

Lease continuity was confirmed as `claude-code-researcher-01@1`. The required files were read in the specified order. Starting HEAD was `c1189899f6dae3364fb24ee32b366aac10332d8c`, with a clean worktree.

The mandatory pre-service gate used only a local Node fake child and one temporary root below `$env:TEMP`. It did not start the Claude executable, `claude -p`, a model request, or a network operation. The fake harness used `.NET ProcessStartInfo`, `UseShellExecute=false`, tokenized `ArgumentList`, redirected UTF-8 stdin/stdout/stderr, closed stdin, and returned scalar `PSCustomObject` records with collection mutation output suppressed.

### Gate observations

| Gate step | Evidence | Result |
|---|---|---|
| Fake P1 create | Generated non-placeholder UUID `2bc5ff1e-6714-420d-b5fa-f92c406f5507` was emitted in fake JSON and parsed as a non-empty session ID. Exit `0`, stdout present, JSON parsed, scalar result assertion passed. | PASS |
| Runtime P2 argv construction | Constructed token order was `--print`, `--resume`, actual generated session ID, `--output-format`, `json`; no placeholder was present in the executable token array. The separate display copy replaced the ID only afterward with `<SESSION_ID>`. | PASS |
| Fake P2 exact receive/branch | Fake P2 failed to return parseable JSON/expected branch. It exited `9` with stderr; the local fake-child argument transport did not safely carry the CLI-like tokens through the Node `-e` invocation. | FAIL |

Because the gate requires the fake P2 to receive and echo the exact generated session ID, the gate as a whole failed. The P2 construction assertion alone is insufficient to authorize a real call. This is a local gate/harness failure and is not evidence about Claude Code resume behavior.

## Verification or result

### Budget

- Zero-service gate fake-child calls: `2`.
- Claude service-capable calls: `0/5`.
- P1–P5 real sequence: none launched; ordinary create/resume, bare, empty settings, and empty tools remain untested by this Task.
- Cumulative service-capable count remains `11` from prior probe Tasks; this Task adds zero.
- No retry, alternate fake-child transport, real Claude call, sixth call, process-stop probe, tool/MCP/plugin/hook action, or external action occurred.

### Cleanup

The exact gate root was removed and verified absent. Redacted root shape:

`<TEMP>\\cca-probe-006-gate-18dc590d2e324e2886b22b93b1c0a82e`

Post-cleanup result: `exists_after=false`. No normal user configuration, credentials, history, sessions, or other user state was inspected or modified. No repository temporary files were created.

### Evidence conclusion

The prior valid P1 ordinary-create evidence remains unchanged, but this Task adds no real-call evidence. The dynamic session substitution gate must be treated as not ready: although the runtime argv was correctly constructed and redacted only for display, the fake P2 end-to-end receive/branch assertion failed. No conclusion may be drawn here about ordinary explicit resume or any isolation flag.

## Context and tool integrity

Only local file reads, Git status, and the authorized zero-service Node fake-child gate were performed. The Claude executable was not launched. No authentication, installation/update, secret/config/history/session inspection, network research, product-code operation, delegation, or process-stop probe occurred. The gate failure was honored immediately.

## Deviations and remaining risk

- The fake P2 transport needs a separately authorized correction before any future real probe; this Task explicitly forbids repair-and-continue after gate failure.
- No real P1–P5 evidence was collected, so no Adapter profile decision is advanced by this Task.
