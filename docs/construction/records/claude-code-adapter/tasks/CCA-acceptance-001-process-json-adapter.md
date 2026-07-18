# CCA-acceptance-001 Process and JSON Adapter Acceptance

- owner: independent evidence for ActorHost / ClaudeCodeAdapter
- follows: CCA-implementation-001
- affected modules: ActorHost; workspace boundary checker; repository verification
- workflow: W2 independent acceptance
- base reason: The implementation adds native process, parser, session, stop, and version/config boundaries and requires evidence independent of the Coder.
- implementation/product subject: `153362823422f32431cba00000f7debd248f9f36`
- orchestration baseline: same

## Objective

Independently verify that the committed ClaudeCodeAdapter v0.1 implements the frozen zero-tool process/session profile truthfully without a real Claude/model invocation or boundary regression.

## Scope and authority

- read scope: implementation subject and diff from `bb3157c`; authorized source/test/boundary files; existing Adapter/Supervisor/CommandProcessor behavior and tests needed to verify composition; Runtime Contracts read-only; implementation Report; final decisions/evidence closeout; root scripts/manifests/lockfile needed for verification.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-acceptance-001-process-json-adapter.testing.md` only.
- delegated discretion: add no product tests; choose bounded read-only diagnostics and test filters needed to confirm or falsify acceptance.
- tools/external actions: Git/diff; existing local test/build/typecheck/boundary/clean/full verification commands including `pnpm verify`; local fake child processes already used by tests. No real Claude executable/model/service, auth/config/session inspection, product edit, dependency/lockfile change, install outside the repository's existing frozen verification command, network research, or delegation.
- delegation: none.

## Frozen acceptance boundary

- Subject is exactly `1533628`; do not test or accept uncommitted follow-up changes.
- Do not edit implementation/tests/boundary scripts. Findings are reported, not repaired.
- No real Claude process or model call. Confirm tests cannot accidentally resolve or launch the user's Claude executable.
- Runtime Contracts and existing BackendAdapter/Supervisor/CommandProcessor public behavior remain frozen.
- Full `pnpm verify` is explicitly authorized. Record whether its frozen install modifies versioned files or requires unavailable network; do not repair installation state.
- Preserve generated-output cleanup and final Git-clean state after committing only the Report.

## Acceptance

Independently check:

1. authorized diff/write-set only, no dependency/manifest/Contract/interface expansion;
2. Node runner uses executable plus argv array and `shell:false`, closes UTF-8 stdin, separates streams, and has truthful launch/exit/signal/stop/liveness behavior;
3. Adapter initialization strictly validates exact backend config, absolute executable/cwd, metadata-only exact `2.1.172`, empty system prompts/providers, and does not create a model session;
4. create/resume argv exactly match the P5 decision, including actual resume ID and one final empty tools argv element;
5. text-only prompt and unsupported Brick/config/provider/version paths fail before Invocation launch;
6. JSON parser requires the frozen success subset, accepts extra metadata, rejects plain/malformed/error/wrong-type/missing result, and never leaks raw diagnostics;
7. create session extraction and resume-ID equality; no synthesized session;
8. non-zero/launch/stop/unknown-liveness paths produce only truthful existing process/fault behavior and no false InvocationResult;
9. fake child tests are deterministic, isolated, cleaned, and cannot contact Claude/network/user state;
10. boundary checker admits only the authorized topology and retains prior prohibitions;
11. focused suite, full ActorHost, Contracts, Runtime Server, integration, build/typecheck, boundaries, clean, and full `pnpm verify` results with counts;
12. final worktree clean except the authorized Report before its commit, then clean after commit.

Return PASS, FAIL, or PASS WITH RISKS. A failure must include exact evidence and state owner. Deferred exact live combined-resume acceptance and automatic timeout are not failures against this Task.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-acceptance-001-process-json-adapter.testing.md`. Commit only that Report with message `test: accept Claude Code process adapter`. Leave the worktree clean and report subject/report commit SHAs. Do not implement repairs or start review.
