# CCA-review-001 Process and JSON Adapter Module Review

- owner: independent review for ActorHost / ClaudeCodeAdapter
- follows: CCA-acceptance-001
- affected modules: ActorHost; workspace boundary checker
- workflow: W2 focused module review
- base reason: The accepted slice owns native process, parser, session, stop/liveness, and diagnostic boundaries and is now stable at one implementation subject.
- implementation/product subject: `153362823422f32431cba00000f7debd248f9f36`
- independent evidence: `ee87f3645132a213d25d222859a9d32e9b818d16`
- orchestration baseline: same

## Objective

Perform one read-only security/correctness module review of the frozen ClaudeCodeAdapter v0.1 subject and determine whether the slice can close or needs bounded remediation.

## Scope and authority

- read scope: implementation subject and `bb3157c..1533628` diff; authorized source/test/boundary files; existing Adapter/Supervisor/CommandProcessor code and tests needed to reason about composition; Runtime Contracts read-only; decisions/evidence closeout; implementation and acceptance Reports; Git history/status.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-review-001-process-json-adapter.reviewing.md` only.
- delegated discretion: choose bounded symbol/reference/targeted-test checks needed to support findings.
- tools/external actions: Serena non-memory operations; Git/rg; existing focused tests or typecheck as read-only confirmation. No product/test edit, real Claude/model/service, credentials/config/session inspection, dependency/install, broad network research, or delegation.
- delegation: none.

## Frozen review boundary

- Review exactly subject `1533628`; later Task/Report commits are orchestration evidence, not product changes.
- Do not implement repairs, add tests, or rewrite design. Report actionable findings with state owner and evidence.
- Runtime Contracts, existing BackendAdapter/Supervisor/CommandProcessor public behavior, and the v0.1 P5 zero-tool decisions are frozen unless a finding proves they cannot compose truthfully.
- Deferred exact live combined-resume acceptance, automatic timeout, graceful cancellation, partial output, non-empty tools/system prompts, and other versions are not findings unless implementation falsely claims them.
- No real Claude process or user-level state access.

## Review questions

1. Does the Node runner always use tokenized argv and `shell:false`, and are Windows paths/empty final args/stdin handled without command injection or loss?
2. Are launch error, exit, signal, explicit stop, idempotency, and unknown-liveness races represented truthfully without hangs, double resolution, or false stopped/success facts?
3. Can listener ordering, stream completion, parser promise sharing, or concurrent session/completion observation produce unhandled rejection, duplicate HostFault, false InvocationResult, or stuck Supervisor state?
4. Does initialization fail closed on config/version/cwd/system/tool/prompt boundaries without starting a model process?
5. Are create/resume args exact, and can a session be synthesized, mismatched, leaked, or resumed implicitly?
6. Does JSON validation reject wrong/error/partial shapes while accepting only the frozen subset and keeping extra/raw backend diagnostics off the wire?
7. Are non-zero exit and stop paths consistent with existing process facts and Server authority?
8. Do fake-child tests actually exercise production runner semantics, remain deterministic/clean, and avoid real Claude/network/user state?
9. Did the boundary-checker update admit only the intended files without weakening prior architecture constraints?
10. Are there missing high-value tests or implementation defects material enough to block module closeout?

Classify findings by severity, exact path/symbol, consequence, and minimal remediation owner. Return PASS, PASS WITH RISKS, or FAIL. Distinguish defects from approved deferred scope.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-review-001-process-json-adapter.reviewing.md`. Commit only that Report with message `review: assess Claude Code process adapter`. Leave the worktree clean and report subject/evidence/report commit SHAs. Do not repair or start another phase.
