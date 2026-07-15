# RC-compat-001 Coder Report

- role: coder
- result: completed
- subject commit: same-as-report

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: Kept B.1-B.3 schemas, semantics, dependencies, lockfile, and root exports unchanged. Added one deterministic compatibility fixture module and focused test, added identical type-only package-root consumers to all three private applications, extended only the package type-test input, and hardened the existing boundary checker with exact B.4 topology, documentation, root-runtime export, package-root type, deep-import, and cross-workspace probes. The root `package.json` did not need modification because its existing `pnpm verify` already runs the package test, build, boundary, clean, and Git-clean gates.

## Work and evidence

Implemented the authorized B.4 compatibility slice:

- Added representative B.1-B.3 JSON fixtures and positive JSON round-trip/negative fail-closed tests under `packages/runtime-contracts/test/compatibility/`.
- Added type-only, behavior-free `@ai-block/runtime-contracts` root consumers to runtime-server, actor-host, and runtime-cli.
- Added package-root consumer documentation in `packages/runtime-contracts/README.md`.
- Extended the deterministic package type-test command without changing dependencies or the lockfile.
- Hardened `scripts/check-workspace-boundaries.mjs` with exact compatibility topology, app source checks, documentation checks, exact runtime export auditing, package-root type probes, and existing cause-specific negative probes. No handwritten source parser was introduced.
- Added `docs/construction/serena-lsp-worker-guide.md` with the actual B.2-B.4 stateless, no-memory Serena workflow and fallback guidance.
- No B.1-B.3 source or public semantic changes, no application runtime behavior, no transport/process/workflow/Claude behavior, and no `.serena/` access or staging.

TDD evidence:

- RED: the first focused run failed one suite with zero tests because the new compatibility test intentionally referenced the not-yet-created `./fixtures.js` module.
- GREEN: after adding the fixture module, the focused compatibility run passed 1 file and 2 tests. The subsequent package test passed 9 files and 57 tests, including the explicit TypeScript 7.0.2 NodeNext type compile.
- Boundary RED/GREEN: the pre-hardening checker rejected the new compatibility topology and type-only app consumers; after the checker update, `pnpm build` and `pnpm check:boundaries` passed. The boundary probe also caught Windows CRLF normalization and two exact runtime-export spelling/list omissions, which were corrected before final verification.
- Final verification: `pnpm verify` passed at the subject commit, including frozen install, build, 9 Contract/compatibility test files with 57 tests, type checks, boundary/export/deep-import probes, clean checks, and Git-clean verification.

## Serena capability matrix

No Serena memory function was called. The following matrix covers every exposed non-memory capability category relevant to this environment.

| Exposed capability | Use in B.4 | Benefit, friction, and fallback |
|---|---|---|
| `initial_instructions`, `activate_project`, `get_current_config` | Used. Read the tool manual, activated `AI_block`, and checked active/inactive tools. | Confirmed the stateless LSP context and prevented accidental memory use. Activation output listed memories, but none were read or acted on. |
| `list_dir`, `find_file`, `read_file` | Used for Runtime Contracts topology, app entry discovery, and package manifest reading. | Efficient bounded discovery. Ordinary reads remained the fallback for large deterministic fixtures and JSON/Markdown review. |
| `search_for_pattern` | Used for root/deep-import references, empty app entries, and forbidden relative-import patterns, excluding `.serena/`. | Fast repository-wide candidate search. It returned broad construction-record matches, so ordinary `rg` was used for final focused diff inspection. |
| `get_symbols_overview` | Used on the checker and package hash source. | Mapped functions/constants without loading unrelated bodies. Export-only root index returned an empty overview; `read_file`/`rg` was the fallback for the exact export list. |
| `find_symbol` | Used to retrieve `checkSources` with its body before mutation. | Made the symbol replacement scoped and auditable; body retrieval was required before `replace_symbol_body`. |
| `find_declaration`, `find_referencing_symbols` | Used for `decodeContract` declaration and references. | Confirmed the existing validation/hash relationship; no public-contract edit was needed. |
| `find_implementations` | Not used. | B.4 has no implementation hierarchy or interface implementation needing this query; it was not forced. |
| `get_diagnostics_for_file` | Used on all three app entries before and after edits. | Provided a quick clean signal; TypeScript/build remained authoritative. |
| `replace_symbol_body` | Used to update the existing checker `checkSources` function after retrieval. | Precise parser-free mutation of a real B.4 symbol; ordinary Git diff and boundary tests validated it. |
| `create_text_file` | Used to create the focused compatibility test first, then the Serena guide. | Natural for new files with complete known content and directly supported the RED-first sequence. |
| `replace_in_files` | Used with `dry_run=true` and an expected-count guard, then applied to the three identical empty app entries. | Safely performed the repeated type-only consumer edit and showed occurrence previews; Git diff/build verified the result. |
| `replace_content` | Used for a precise guide wording correction after the checker required explicit `no-memory` and `Git/tests-authoritative` terms. | Appropriate for a small non-symbolic documentation replacement; no broad rewrite was used. |
| `insert_before_symbol`, `insert_after_symbol` | Not used. | No new function insertion was naturally required; the checker change was a whole-symbol replacement plus deterministic patches. |
| `rename_symbol`, `safe_delete_symbol` | Not used. | No rename, dead-symbol removal, or public refactor was authorized or needed. |
| `execute_shell_command` | Not used. | Ordinary terminal execution is the authoritative path for Git, pnpm, TypeScript, Vitest, and boundary verification and gives clearer process control. |
| `open_dashboard` | Not used. | No UI inspection was relevant. |
| `onboarding` | Not used. | The project was already onboarded; invoking it would be unnecessary metadata work and conflicts with the no-memory/stateless policy. |
| Inactive `delete_lines`, `get_diagnostics_for_symbol`, `insert_at_line`, `replace_lines`, JetBrains tools, query-project tools, `restart_language_server`, and `serena_info` | Not used. | These capabilities were inactive or unnecessary under the active LSP backend; no product change was manufactured to exercise them. |
| Serena task-adherence/completion check | Not exposed. | Completion evidence came from ordinary Git diff, TypeScript, tests, boundary checks, and `pnpm verify`. |

Ordinary-tool fallbacks were limited to non-symbolic Markdown/JSON/fixture edits, raw CRLF/export inspection, Git/diff review, and authoritative verification commands. No memory read/write/check/refresh or onboarding-memory operation was performed, and `.serena/` was never inspected or staged.

Recommendation: retain Serena-first navigation and safe, meaningful text/symbol mutation for later Workers, but require ordinary Git/tests-authoritative verification, explicit scope checks, and a strict no-memory policy on every Task.

## Deviations and remaining risk

None.
