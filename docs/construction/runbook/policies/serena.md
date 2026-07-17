# Serena LSP Worker Policy

Serena is an LSP/IDE operation layer for this repository. Git diff, TypeScript, tests, boundary probes, and the final worktree remain authoritative. The no-memory policy is mandatory.

## Allowed non-memory capabilities

- Project/config: `initial_instructions`, `activate_project`, `get_current_config`.
- Discovery and file reads: `list_dir`, `find_file`, `read_file`.
- Search and symbols: `search_for_pattern`, `get_symbols_overview`, `find_symbol`, `find_declaration`, `find_referencing_symbols`, `find_implementations`.
- Diagnostics: `get_diagnostics_for_file`.
- Symbol mutation: `insert_before_symbol`, `insert_after_symbol`, `replace_symbol_body`, `rename_symbol`, `safe_delete_symbol`.
- Text/file mutation: `create_text_file`, `replace_content`, `replace_in_files`.
- Optional command/UI operations: `execute_shell_command`, `open_dashboard`.

Use only capabilities that are active, Task-authorized, and materially useful. Serena does not expand Task authority.

## Prohibited memory behavior

- Never call `read_memory`, `write_memory`, `list_memories`, memory check/refresh operations, or any other memory API.
- Do not run onboarding to create or refresh memory metadata.
- Never inspect, edit, stage, or traverse `.serena/`.
- Do not treat Serena project state or memory as repository truth.

## Serena-first working method

1. Read the Task and activate the project. Confirm active project and tools with `get_current_config`; do not read memory.
2. Inventory only authorized or relevant directories. Exclude `.serena/`, generated output, and dependencies from searches.
3. Start code navigation with symbol overview. Retrieve a symbol body before symbol replacement, and query declarations/references before changing a public or shared symbol.
4. Use diagnostics as a quick local signal, never as a substitute for TypeScript or tests.
5. For repeated identical edits, use a guarded dry run and expected occurrence count before applying.
6. Use symbol-aware mutation only when the change is naturally represented as a symbol. Do not rename, delete, or query implementations merely to exercise a capability.
7. Use ordinary patch/file tools for Markdown, JSON, deterministic fixture data, and non-symbolic edits. Use ordinary terminal commands for Git, pnpm, TypeScript, Vitest, and boundary probes.
8. Inspect the ordinary Git diff after Serena mutations and finish with the Task's authoritative verification.

## Repository experience

Useful observed behavior:

- symbol navigation can constrain an edit to a known function;
- declaration/reference analysis exposes shared dependency shape;
- guarded multi-file replacement makes repeated edits auditable.

Known friction:

- an export-only root index may have an empty symbol overview; use pattern search or file read;
- Windows paths may be returned with backslashes;
- Serena line numbers may be zero-based;
- project activation should be confirmed before symbol work;
- Windows CLI output containing Unicode may require `PYTHONUTF8=1` or `PYTHONIOENCODING=utf-8`.

## Handoff

When Serena materially contributed to construction, report the operations used, useful effects, friction, fallbacks, and any capability deliberately not used. Confirm that no `.serena/` content was inspected or staged and that Git/tests supplied final evidence.
