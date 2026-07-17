# CCA-research-001 Claude Code CLI and Session Contract

- owner: ClaudeCodeAdapter external behavior boundary
- follows: Host Gateway walking-skeleton closeout
- affected modules: future ActorHost ClaudeCodeAdapter only; no product implementation
- workflow: W0 researching + Research + Compatibility
- base reason: adapter construction depends on version-sensitive external CLI/session/output behavior not owned by this repository
- repository baseline: `f30ce91`

## Objective

Produce a decision-focused, version-bounded evidence brief for the exact locally installed Claude Code CLI and authoritative upstream behavior needed to design ClaudeCodeAdapter create/resume, output parsing, static launch configuration, cancellation, and failure mapping.

## Scope and authority

- read scope: local Claude executable version and help text, official Anthropic Claude Code documentation/release/source material, accepted AI_block architecture/invariants, current BackendAdapter/Supervisor port, and directly relevant Runtime Contracts
- write scope: `docs/construction/records/claude-code-adapter/reports/CCA-research-001-cli-session-contract.researching.md`
- delegated discretion: choose authoritative primary-source pages and bounded local non-executing help/version commands needed to answer the questions
- tools/external actions: read-only web access to official primary sources; local executable discovery, `--version`, `--help`, and non-executing subcommand help only
- delegation: none

## Prohibited actions

- Do not run `claude -p`, submit a prompt, create/resume/fork a session, contact the Claude model service, consume quota, authenticate, modify account/configuration, install/update packages, or write outside the Report.
- Do not read or expose credentials, tokens, private Claude configuration, conversation content, or unrelated user files.
- Do not implement product code, tests, fixtures, adapter probes, or Contract changes.
- Do not use secondary tutorials as authoritative evidence when official documentation/source is available.
- No Superpowers workflow chaining, Serena memory/onboarding, or `.serena/` inspection.

## Research questions

1. What exact Claude Code version/executable is locally available, and what non-interactive print-mode syntax does its own help advertise?
2. What are the documented create, resume, continue, and fork-session semantics? Which operation accepts an explicit session ID and whether a resumed print invocation exits after one turn?
3. Which output modes are documented (`text`, JSON, stream JSON, or equivalents), where is session identity exposed, and what framing/event/terminal-result guarantees exist?
4. How are ordinary prompt input, system prompt replacement/append, model selection, working directory, environment, and static tool/MCP/Skill configuration supplied?
5. Which flags constrain allowed/disallowed tools, permissions, interaction, and side effects for unattended execution?
6. What are documented exit-code, stderr/stdout, cancellation/signal, timeout, partial-output, and non-zero failure behaviors?
7. Which flags or behaviors are stable/documented for the exact local version, and which are version-sensitive, deprecated, experimental, or absent from authoritative guarantees?
8. Which facts are sufficient to freeze an internal adapter design without a real service call?
9. Which unresolved facts require a Controlled Probe, and what is the minimum probe matrix, expected quota/state effect, success evidence, and cleanup?

## Evidence discipline

- Prefer exact local CLI help for locally installed flag availability and official Anthropic documentation/source for semantic guarantees.
- Record URL/source title, applicable version/date, and whether each result is documented, locally advertised, inferred, or still unknown.
- If official sources conflict with local help, report the conflict rather than choosing silently.
- Do not turn observed/help availability into a stronger guarantee than the evidence supports.

## References

- `runtime-module-architecture-v0.1.md`
- `runtime-system-architecture-v0.1.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `docs/construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md`
- `docs/construction/runbook/project/worker-lease-policy.md`
- `docs/construction/runbook/worker-guides/researcher/lease.md`
- `docs/construction/runbook/worker-guides/researcher/procedures/decision-brief.md`
- `docs/construction/runbook/policies/superpowers-boundary.md`
- `docs/construction/runbook/templates/report.md`

## Acceptance

- The Report answers all nine questions or marks each unresolved item explicitly.
- A compact behavior table separates local-help evidence, official guarantee, inference, and probe requirement.
- The exact local version and source applicability are recorded without exposing private configuration.
- The brief identifies a smallest safe adapter contract and a smallest Controlled Probe proposal, but does not authorize either.
- Only the researching Report is committed.

## Handoff

Write and commit only `docs/construction/records/claude-code-adapter/reports/CCA-research-001-cli-session-contract.researching.md` with message `research: define Claude Code adapter evidence`. Return lease continuity, local version/help availability, key guaranteed behavior, unresolved probe questions, Report commit, and construction implications without making the Orchestrator's final product decision.
