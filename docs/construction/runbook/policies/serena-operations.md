---
kind: policy
scope: dispatch
audience: workers-using-serena
authority: method-only
---

# Serena Non-memory Operations

Use only when explicitly loaded for the current dispatch and inside Task authority.

## Allowed capabilities

- project/config: initial instructions, activation, current config;
- discovery/read: directory listing, file finding, file reads;
- symbols/search: overview, declaration, reference, implementation, pattern search;
- diagnostics: file diagnostics as a local signal;
- mutation: symbol insert/replace/rename/safe delete and guarded text/file operations when authorized;
- optional shell/dashboard operations only when Task-authorized.

## Working method

1. Read the Task and call Serena initial instructions.
2. Activate the project and confirm config; do not onboard or read memory.
3. Inventory only Task-relevant paths, excluding `.serena/`, dependencies, and generated output.
4. Prefer symbol overview and focused bodies for code navigation.
5. Query declarations/references before changing shared/public symbols.
6. Retrieve a symbol body before replacing it.
7. Use guarded dry runs and expected counts for repeated text edits.
8. Use ordinary patch tools for Markdown, JSON, fixtures, and non-symbolic edits.
9. Use normal Git, pnpm, TypeScript, Vitest, and boundary commands for authoritative evidence.
10. Inspect the ordinary Git diff after Serena mutations.

## Known friction and fallback

- export-only indexes may have empty symbol overviews; use pattern search or file read;
- Windows paths may use backslashes and line numbers may be zero-based;
- Unicode CLI output on Windows may require `PYTHONUTF8=1` or `PYTHONIOENCODING=utf-8`;
- when output truncates or a file is non-symbolic, use bounded `rg`, PowerShell, or ordinary read/patch operations.

Record only material Serena effects or fallback-relevant friction through the
declared output mode. Confirm that memory, onboarding, and `.serena/` were not
used when that integrity fact matters to acceptance.
