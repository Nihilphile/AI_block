# CCA-live-acceptance-001 Product Adapter Combined Resume Report

- work: testing
- result: completed
- implementation subject: `153362823422f32431cba00000f7debd248f9f36`
- orchestration baseline: `2ac782efc293e7d9a3c18ef7d5c4e9df894c87b3`
- independent acceptance: `ee87f3645132a213d25d222859a9d32e9b818d16`
- module review: `96a3162f6b38c6b528d55343497aac2b6c73659e`
- lease: `claude-code-probe-tester-01@1`

## Verdict

`PASS`

## Decisions

- uncertainty found: yes
- implicit decisions found: no
- decisions made or escalation requested: accept the exact combined P5 create/resume path through the built product adapter for local Claude Code `2.1.172`; retain explicitly deferred broader features as outside this acceptance.

## Work and evidence

Lease continuity was confirmed for the independent Tester role, epoch `@1`, with accepted product subject unchanged at `153362823422f32431cba00000f7debd248f9f36`. Starting orchestration HEAD was `2ac782efc293e7d9a3c18ef7d5c4e9df894c87b3`; the starting worktree was clean.

The repository was built with `pnpm build`. The temporary controller imported the built committed modules directly:

- `apps/actor-host/dist/backend/claude-code-adapter.js`
- `apps/actor-host/dist/backend/process-runner.js`

It instantiated `new ClaudeCodeAdapter(new NodeProcessRunner())`, supplied the exact Contract-shaped launch/invocation objects, and did not reconstruct argv, parsing, session handling, or process control. The controller used one temporary working directory and one temporary `CLAUDE_CONFIG_DIR`; it did not enumerate or print inherited environment values or inspect normal user state.

Product initialization completed successfully through the adapter's metadata-only version path. The local executable reported the supported Claude Code `2.1.172` version as observed by product initialization. Launch spec used adapter `claude-code`, exactly one absolute executable config field, empty system prompts, empty tool providers, and the temporary absolute working directory.

## Product call evidence

The fixed prompts were sent through the product adapter as root text Bricks:

- P1: `Reply with exactly CCA_ADAPTER_CREATE_OK and nothing else.`
- P2: `Reply with exactly CCA_ADAPTER_RESUME_OK and nothing else.`

| Call | Product path | Elapsed | Session | Completion process | Result |
|---|---|---:|---|---|---|
| P1 create | `ClaudeCodeAdapter.start(create)` → built `NodeProcessRunner` | 3,950 ms | non-empty, redacted as `<SESSION_ID>` | `exited(0)` | product terminal JSON/session observation succeeded |
| P2 resume | `ClaudeCodeAdapter.start(resume(actual P1 session))` → built `NodeProcessRunner` | 3,559 ms | non-empty; returned ID equaled P1 ID | `exited(0)` | product terminal JSON/session observation succeeded |

The product's exact combined profile remained enforced: create uses `--print --bare --output-format json --tools <final empty argv element>`, and resume inserts the actual stored P1 session immediately after `--resume` before the same bare/output/tools suffix. No direct CLI invocation, alternate profile, shell command, or separate harness was used. The adapter's parser accepted the structured success subset and exposed only the session/process facts through its Contract-facing completion; raw stdout/stderr and session values were not copied into the Report.

P2 ran only after P1 had a non-empty session and `exited(0)`. Both calls completed normally, so no product stop call was needed; the controller's finally path would have called product `stop()` once only for an unsettled live execution. No retry or third call occurred.

## Verification or result

- Model/service-capable budget: `2/2` used; P1 and P2 only.
- P1 session gate: passed.
- P2 exact resume/session-equality gate: passed.
- Product initialization/version gate: passed.
- Product process facts: both calls `status=exited`, `exit_code=0`; no timeout, signal, launch fault, or fixed/redacted fault.
- No real Claude call occurred during the initial controller import failure; it was corrected before P1 and consumed no slot.

## Cleanup

- Exact acceptance root `C:\Users\DREAMJ~1\AppData\Local\Temp\cca-live-acceptance-001-5175bdf8c49c4861984886d7e05bd34b` was removed after evidence materialization and verified absent.
- `pnpm clean` passed after the live probe and removed generated build output.
- Final Git status was clean after the authorized Report commit.
- No normal user config, credentials, history, sessions, or other user state was inspected or modified.

## Context and tool integrity

Only the built product `ClaudeCodeAdapter` and `NodeProcessRunner` executed the two service-capable calls. No product/test/source edit, dependency update, network research, reviewer, repair, direct CLI fallback, or delegation occurred. The only repository write was this Report.

## Deviations and remaining risk

- The first controller attempt failed before model launch because Windows ESM import requires a `file://` URL for an absolute path. The temporary controller was corrected once; no call slot was consumed and no product file changed.
- This proves the exact combined P5 create/resume flow for the local `2.1.172` environment and fixed prompts. Automatic timeout, cancellation, stopped-session resume, other versions, non-empty providers/tools, and broader integration remain explicitly deferred.
