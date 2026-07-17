# CCA-research-002 Print, Session, and Isolation Profile Matrix

- owner: ClaudeCodeAdapter evidence
- follows: CCA-probe-003
- affected modules: none; research only
- workflow: W2 plus external compatibility research
- base reason: Existing probes confounded normal `-p --output-format json --resume` behavior with a strict multi-flag isolation profile, especially `--bare` simple mode.
- implementation/product subject: none
- orchestration baseline: `9a7ee56`

## Objective

Determine which Claude Code `2.1.172` flags or flag interactions caused terminal JSON and explicit resume to appear ineffective, and produce an orthogonal minimum probe matrix that can separate normal print/session behavior from isolation controls and the configured DeepSeek backend.

## Scope and authority

- read scope: prior CCA research/probe Tasks and Reports; local native Claude Code `--help`, subcommand help, and `--version`; official Claude Code documentation/changelog; official/upstream issue or source evidence relevant to exact flags/versions; public documentation for configured custom-backend behavior where directly applicable.
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-research-002-print-session-profile-matrix.researching.md`.
- delegated discretion: choose authoritative primary-source search terms; inspect public upstream issue history; compare current docs with local help/version; build a non-executed orthogonal probe table.
- tools/external actions: read-only web research and local metadata/help commands. No `claude -p`, model/service request, authentication, installation/update, process stop probe, private config/credential/session/history inspection, or product code/test execution.
- delegation: none.

## Frozen questions and escalation

Answer separately for local `2.1.172` and current official documentation:

1. What is the documented minimal command/profile for print-mode terminal JSON, and where/how is `session_id` emitted?
2. What are the exact semantics of `--bare` and `CLAUDE_CODE_SIMPLE=1`? Does either intentionally force text output, disable persistence/session metadata, ignore resume, or otherwise conflict with JSON/session flags?
3. Are `--output-format`, `--resume`, and session persistence client-side Claude Code behaviors or backend/model-provider behaviors? What influence can a DeepSeek-compatible backend plausibly have?
4. What are the exact parser arities and Windows-safe empty-value forms for `--tools` and `--setting-sources`? Can they consume later options or disappear as empty argv values?
5. Does option order matter for `--print [prompt]`, variadic options, `--resume`, and `--output-format` in local `2.1.172`?
6. Which isolation goal is provided by each of `--bare`, `--setting-sources`, `--tools`, `--strict-mcp-config`, `--disable-slash-commands`, `--no-chrome`, and permission mode? Identify overlap and gaps rather than treating them as one bundle.
7. Is there an official way to use a temporary/empty Claude config directory or settings file so JSON/session behavior can be tested without loading user/project configuration and without `--bare`?
8. Which exact prior-probe conclusions remain valid, which were confounded, and which must be withdrawn?

Do not infer local behavior solely from current docs when version applicability is unknown. Label each claim as documented guarantee, local-help fact, upstream implementation/issue evidence, empirical prior-probe fact, or inference.

No real probe is authorized. End with the smallest orthogonal Controlled Probe proposal. Each proposed invocation must change one meaningful factor at a time, specify expected local/user state, and identify whether it can create a model request or session. Prefer a baseline normal JSON create/resume pair followed only by the minimum isolation-factor calls needed to locate the interaction.

If public evidence cannot determine whether `--bare` or the custom backend changes output/session behavior, say so and make that the first controlled comparison rather than guessing.

## References

- `docs/construction/records/claude-code-adapter/reports/CCA-research-001-cli-session-contract.researching.md`
- `docs/construction/records/claude-code-adapter/reports/CCA-probe-001-json-session-process.researching.md`
- `docs/construction/records/claude-code-adapter/reports/CCA-probe-002-stdin-session-process.researching.md`
- `docs/construction/records/claude-code-adapter/reports/CCA-probe-003-equals-empty-json-resume.researching.md`

## Acceptance

- Provide a flag-by-flag semantics and interaction matrix with exact version/source applicability.
- State clearly whether ordinary `-p --output-format json` is expected to emit `session_id`, and distinguish that from the tested strict profile.
- Identify the strongest supported explanation for plain-text output and ignored invalid-resume behavior, with confidence and alternatives.
- Separate CLI/client parsing/session behavior from DeepSeek model-provider behavior.
- Produce a minimum controlled comparison plan with call count, safe prompts, isolation, cleanup, and decision value; do not execute it.
- Recommend how the existing evidence closeout and implementation preflight should be corrected before implementation authority resumes.

## Handoff

Write `docs/construction/records/claude-code-adapter/reports/CCA-research-002-print-session-profile-matrix.researching.md`. Commit only that Report with message `research: isolate Claude Code session flag interactions`. Leave the worktree clean and report the commit SHA.
