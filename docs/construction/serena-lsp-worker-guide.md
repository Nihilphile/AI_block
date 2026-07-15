# Serena LSP Worker Guide

This guide records the stateless B.2-B.4 construction experience for this repository. Serena is an LSP/IDE operation layer; Git/tests-authoritative means Git diff, TypeScript, tests, boundary probes, and the final worktree decide correctness. The no-memory policy is mandatory.

## Non-memory capability map

The active non-memory capability groups are:

- Project/config: `initial_instructions`, `activate_project`, `get_current_config`.
- Discovery and file reads: `list_dir`, `find_file`, `read_file`.
- Search and symbols: `search_for_pattern`, `get_symbols_overview`, `find_symbol`, `find_declaration`, `find_referencing_symbols`, `find_implementations`.
- Diagnostics: `get_diagnostics_for_file`.
- Symbol mutation: `insert_before_symbol`, `insert_after_symbol`, `replace_symbol_body`, `rename_symbol`, `safe_delete_symbol`.
- Text/file mutation: `create_text_file`, `replace_content`, `replace_in_files`.
- Optional command/UI operations: `execute_shell_command`, `open_dashboard`.

The environment may also expose inactive line-editing, JetBrains, query-project, and language-server restart operations. Use them only when they are actually active and materially useful. No memory function is part of this workflow: never call `read_memory`, `write_memory`, `list_memories`, memory check/refresh operations, or any other memory API. Do not run onboarding to create or refresh memory metadata.

## Actual B.4 operations

The following operations were used in this construction:

- `initial_instructions`, `activate_project`, and `get_current_config` established the active project and capability set without reading memory.
- `list_dir` inventoried the Runtime Contracts source/test topology; `find_file` located the three app entries; `read_file` read the package manifest.
- `search_for_pattern` located package-root/deep-import references and the empty app entries while excluding `.serena/`.
- `get_symbols_overview` mapped the boundary checker and package hash symbols. `find_symbol` retrieved `checkSources` with its body before editing. `find_declaration` and `find_referencing_symbols` traced `decodeContract`. `get_diagnostics_for_file` checked all three app entries.
- `create_text_file` created the focused compatibility test before its fixture module, producing the expected RED.
- `replace_in_files` first ran a guarded dry run and then replaced the identical empty app entries with the authorized type-only root-consumer fixture.
- `replace_symbol_body` updated the checker `checkSources` function after body retrieval, making the source-shape assertion precise and parser-free.
- `replace_content` made a small, exact wording correction in this guide after the checker required explicit `no-memory` and `Git/tests-authoritative` terms.

The following active capabilities were deliberately not forced: `find_implementations` because B.4 has no implementation hierarchy; `insert_before_symbol` and `insert_after_symbol` because no new function insertion was needed; `rename_symbol` and `safe_delete_symbol` because no rename or dead-symbol removal was authorized; `execute_shell_command` because ordinary terminal execution is the repository authority; `open_dashboard` because no UI inspection was needed; and `onboarding` because the project was already onboarded and its metadata/memory path is prohibited. Inactive JetBrains, line-editing, query-project, and language-server restart operations were not used because they were unavailable or unnecessary. No Serena task-adherence/completion capability was exposed; Git and `pnpm verify` provide the completion evidence.

Observed benefit: symbol navigation constrained the checker edit to one known function, reference analysis showed the existing decoder/hash dependency shape, and the guarded multi-file replacement made the repeated app fixture change auditable.

Observed friction: a symbol overview of an export-only root index can be empty; use `search_for_pattern` or `read_file` for export lists. Windows paths are returned with backslashes and Serena line numbers are zero-based. Serena can report the project as active while an earlier context did not have it active, so check configuration before symbol work.

## Serena-first workflow

1. Read the task and activate the project. Confirm the active project and tools with `get_current_config`; do not read memory.
2. Use `list_dir` and `find_file` only within authorized or relevant directories. Use `search_for_pattern` with explicit exclusions for `.serena/`, generated output, and dependencies.
3. Start code navigation with `get_symbols_overview`. Use `find_symbol` without a body for candidates, then retrieve a body before `replace_symbol_body`. Use declaration and reference queries before changing a public or shared symbol.
4. Use diagnostics as a fast local signal, never as a substitute for TypeScript or tests.
5. Write focused tests first. For new text files, `create_text_file` is appropriate when the path and complete content are known. For repeated identical edits, use `replace_in_files` with `dry_run=true`, inspect occurrence IDs, then apply with an expected-count guard.
6. Use symbol-aware mutation only for a real code change. Do not rename, delete, or query implementations merely to exercise a capability. Review the ordinary Git diff after every Serena mutation.
7. Use ordinary patch/file tools for Markdown, JSON, deterministic fixture data, and changes that are not naturally represented as symbols. Use ordinary terminal commands for Git, pnpm, TypeScript, Vitest, and boundary probes.
8. Finish with focused tests, package type tests, build, boundary checks, `git diff --check`, and repository `pnpm verify`. A Serena success response never replaces these gates.

## Scope and safety

Serena does not expand Task authority. Never inspect, edit, stage, or traverse `.serena/`. Stage only the Task paths and the assigned Coder Report. Keep application compatibility fixtures type-only and import `@ai-block/runtime-contracts` only from its package root. Do not add a dependency, lockfile edit, production export, transport behavior, or parser.

## Windows considerations and fallbacks

Use repository-relative paths with forward slashes in Serena calls when possible. Expect backslashes in results and normalize only in comparison/reporting. Use ordinary PowerShell or `rg` when Serena cannot represent a non-symbolic operation, when exact JSON/Markdown content is clearer, or when running authoritative verification. If any Serena CLI command involving external output is ever used, configure UTF-8 output; this Task intentionally performs no memory check or memory operation.

## Future Worker checklist

- [ ] Read the Task, accepted design, and prior reports.
- [ ] Confirm project/config; do not call memory.
- [ ] Inventory only authorized paths and relevant symbols.
- [ ] Write focused RED tests before implementation.
- [ ] Prefer Serena navigation and safe, meaningful symbol/text mutation.
- [ ] Use ordinary tools for fixtures, docs, Git, and verification.
- [ ] Inspect ordinary diff and confirm no `.serena/` content is staged.
- [ ] Run focused tests, build, boundaries, and `pnpm verify`.
- [ ] Report actual Serena operations, friction, fallbacks, unused capabilities, and the final recommendation.
