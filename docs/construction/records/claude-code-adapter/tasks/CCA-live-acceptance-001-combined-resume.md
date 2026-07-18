# CCA-live-acceptance-001 Product Adapter Combined Resume

- owner: independent live evidence for ActorHost / ClaudeCodeAdapter
- follows: CCA-review-001
- affected modules: ActorHost runtime behavior; no product write
- workflow: W2 plus Controlled Probe gate
- base reason: Deterministic acceptance and review passed; the only near-term compatibility risk is the exact implemented P5 resume combination through the product Adapter.
- implementation/product subject: `153362823422f32431cba00000f7debd248f9f36`
- independent acceptance: `ee87f3645132a213d25d222859a9d32e9b818d16`
- module review: `96a3162f6b38c6b528d55343497aac2b6c73659e`

## Objective

Use the committed, built ClaudeCodeAdapter and NodeProcessRunner—not a separate CLI harness—to perform one real create and one explicit resume against local Claude Code `2.1.172`, proving the exact combined P5 profile and session continuity.

## Scope and authority

- read scope: subject source/tests/build output and package metadata needed to instantiate the committed Adapter; final v0.1 decisions; implementation/acceptance/review Reports; Git status.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-live-acceptance-001-combined-resume.testing.md`; one temporary acceptance root below `$env:TEMP` containing cwd, config, and a temporary controller script.
- delegated discretion: temporary identities/references that satisfy existing Contracts, temporary filenames, and bounded redaction.
- tools/external actions: existing build/typecheck/clean commands; exact built product Adapter/runner; at most two service-capable Claude invocations, both potentially model-bearing; Git add/commit limited to the Report. No product/test edit, dependency/install/update, auth change, credential/private-state inspection, unrelated network research, or delegation.
- delegation: none.

## Frozen live boundary

- Verify repository product subject `1533628` is still the implementation under test; later commits must be docs/Reports only.
- Build using existing repository commands. Import and instantiate the built committed ClaudeCodeAdapter and real NodeProcessRunner. Do not reimplement argv, parsing, session handling, or process control in the temporary controller.
- Native executable is the established local `claude.exe`; metadata initialization must observe exact `2.1.172` through product code.
- Create one exact temporary root with:
  - Actor working directory;
  - temporary `CLAUDE_CONFIG_DIR`;
  - temporary controller script importing built product output.
- Set the controller process environment so product child processes inherit only the temporary `CLAUDE_CONFIG_DIR` delta plus existing environment. Do not enumerate/print/copy secrets and never fall back to normal user config.
- LaunchSpec uses adapter ID `claude-code`, backend config containing only the native executable, empty system prompts, and empty tool providers.
- Invocation prompts are non-empty root text Bricks with harmless fixed text:
  - create: `Reply with exactly CCA_ADAPTER_CREATE_OK and nothing else.`
  - resume: `Reply with exactly CCA_ADAPTER_RESUME_OK and nothing else.`
- P1 uses `session.mode=create`. Await and record product session/completion facts. Require non-empty session and exited code 0 before P2.
- P2 uses `session.mode=resume` with the exact P1 session. Await product session/completion and require returned equality and exited code 0.
- Per-call watchdog controlled outside the Adapter: 20 minutes. A timeout consumes the call and permits only process cleanup, not retry.
- No third call, retry, alternate flags/profile, direct CLI fallback, continue/fork/stream-json, stop probe, or user-config fallback.

## Cleanup

- In `finally`, stop any still-live product execution through its product stop path once, then clean only the exact temporary acceptance root.
- Run repository clean for generated output and verify final Git state.
- Do not inspect/delete normal user-level Claude state; the temporary config root must contain and remove the created acceptance session.

## Acceptance

- Prove the controller imported and used built product Adapter/runner rather than reconstructing CLI behavior.
- Report initialization/version, create session/completion process fact, resume session equality/completion process fact, elapsed times, call budget, and any fixed/redacted faults.
- Confirm exact product decisions remained enforced: empty tools/system prompts, text prompt, no implicit continuation, structured session only.
- Prove temporary root removal, generated-output cleanup, and Git-clean state.
- Return PASS or FAIL. A failure must distinguish product defect, local compatibility, authentication/provider, controller, or environment evidence.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-live-acceptance-001-combined-resume.testing.md`. Commit only that Report with message `test: verify live Claude adapter resume`. Leave the worktree clean and report product/evidence/review/report SHAs. Do not repair or start the next module.
