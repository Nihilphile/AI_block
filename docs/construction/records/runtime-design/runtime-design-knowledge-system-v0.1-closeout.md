# Runtime Design Knowledge System v0.1 Closeout

## Record authority

- **Outcome:** Accepted documentation migration.
- **Date:** 2026-07-26 (Asia/Shanghai).
- **Authority:** Evidence-only and non-authoritative for product design.
- **Semantic limit:** This record stores construction, verification, acceptance, review, non-change, and archive-status evidence only. It does not define, select, or change Runtime semantics, Contracts, APIs, behavior, configuration, or future product decisions.
- **Change:** `reorganize-runtime-design-documents`.

This new closeout records only this migration. It does not replace or amend any completed or historical closeout, Task, Plan, Report, or OpenSpec evidence.

## Accepted scope

The accepted change is a documentation-only Runtime design knowledge system:

- `docs/design/README.md` is the canonical design router and status catalog.
- `docs/design/current/runtime-invariants.md` is the bounded current cross-module invariant kernel.
- `docs/design/future/` contains exactly five status-preserving future files:
  - `project-persistence-and-brick-authoring.md`
  - `package-and-delivery.md`
  - `run-and-invocation.md`
  - `actor-host-lifecycle-and-recovery.md`
  - `graph-and-policy.md`
- `docs/design/history/runtime/` contains byte-identical copies of the six original Runtime design bodies.
- The six original repository-root paths remain as uniform, non-authoritative compatibility shims.
- Only the baseline-identified current links under `project_state/**` and `docs/construction/phase-1-architecture-invariants.md` were migrated to canonical design routes.
- `project_state/` remains at repository root and remains a summary-and-routing layer only.
- `project_state/_meta/current-focus.md` routes readers to the accepted documentation system without choosing or authorizing a Runtime implementation slice.

No North Star, separate Project-and-Actor future file, or separate model-selection file was created.

## Independent acceptance and semantic review

| Activity | Result | Actionable findings |
|---|---|---:|
| Phase 7.1 independent acceptance against the capability specification | PASS | 0 |
| Phase 7.2 independent semantic and architecture review | PASS | 0 |

The independent acceptance exercised current, future, history, and legacy-root reader routes. The semantic review covered invariant admission, semantic promotion, duplicate authority, exact five-file allocation, history integrity, shim compatibility, bounded link edits, Project State authority, protected evidence, and no-Runtime impact.

For Phase 7.3, the combined finding set is empty. Therefore:

- no focused repair was required or performed;
- no affected risk-focused check existed to rerun;
- no repair-triggered focused re-review was required;
- the two independent PASS results establish that no actionable finding remained.

The necessary conclusions are retained in this closeout; interpreting it does not depend on continued access to temporary review reports.

## Original and preserved-history integrity

All six history copies matched the original pre-shim byte baseline both before root replacement and at independent acceptance.

| Original root source | Preserved history body | Bytes | SHA-256 | Result |
|---|---|---:|---|---|
| `runtime-module-architecture-v0.1.md` | `docs/design/history/runtime/runtime-module-architecture-v0.1.md` | 19581 | `47ef19e9dbadc1426d1ef64461d1de00673488b45d87ec832380228831c8cb38` | PASS |
| `runtime-module-concept-v0.2.md` | `docs/design/history/runtime/runtime-module-concept-v0.2.md` | 18926 | `108409b2f5a8395e187d995c10b9c7dddd5dfe1ebaa0c45ab11dafd01ac45198` | PASS |
| `runtime-object-module-v0.3.md` | `docs/design/history/runtime/runtime-object-module-v0.3.md` | 10703 | `2adf27da9700d0e8f604e3d93f5ae562d07e350462d28837a1fbe45e6ce0a489` | PASS |
| `runtime-system-architecture-v0.1.md` | `docs/design/history/runtime/runtime-system-architecture-v0.1.md` | 16642 | `d05d6220b1d86d82abf113b206396da16e7e6b6e51dff87d6cdab500974adc3a` | PASS |
| `runtime-actor-template-and-brick-design-v0.1.md` | `docs/design/history/runtime/runtime-actor-template-and-brick-design-v0.1.md` | 39531 | `cd30c72d88e3a159eb2980072b2eb14e76f2ec6705327831544484932ef9290d` | PASS |
| `runtime-project-persistence-and-definition-brick-authoring-design-v0.1.md` | `docs/design/history/runtime/runtime-project-persistence-and-definition-brick-authoring-design-v0.1.md` | 26531 | `66ee18e0b06e3a1fe9d95345f1a362cbfcaff48818e3a38494fe318fb28b3a38` | PASS |

## Tree, link, status, diff, and validation evidence

- **Tree:** PASS. The canonical tree contains one catalog, one current kernel, exactly five named future files, and exactly six named history files.
- **Reader routes:** PASS. Current readers route to canonical current paths, future readers receive status-preserving and non-authorization guidance, history readers reach exact preserved bodies, and every legacy root path routes to both the catalog and its exact history body.
- **Independent link scan:** PASS. The acceptance scan checked 24 in-scope Markdown files and 162 local Markdown links, including anchors, with 0 unresolved targets.
- **Shim compatibility:** PASS. All six shims use the same routing-only shape, retain their original paths, and carry no independent Runtime design semantics.
- **Status and authority:** PASS. Confirmed current, target-stage, accepted future, product-design draft, proposed, open, historical, compatibility-only, and Project State summary-only boundaries remain distinct.
- **High-risk seams:** PASS. Package-as-Brick remains proposed only; persistence remains a product design draft; `model_id` launchability, Run failure/recovery, Graph behavior/policy, Host recovery, and session continuity remain open where not accepted.
- **Protected evidence:** PASS. Completed OpenSpec changes and historical Tasks, Plans, Reports, closeouts, and embedded historical paths were unchanged.
- **Pre-closeout validation:** PASS. `openspec validate --all --json` reported 3 valid changes and 0 failures.
- **Whitespace:** PASS. `git diff --check` reported no whitespace error; Git's LF-to-CRLF working-copy notices were informational only.

Final handoff verification after creating this closeout and reconciling current focus also passed:

- the exact canonical tree remained 13 files: one catalog, one current kernel, five future files, and six history files;
- all six history byte lengths and SHA-256 digests still matched the table above;
- all six root shims still matched the uniform routing-only template;
- all 33 changed Markdown files were scanned, covering 161 local links and 4 anchor-bearing links, with 0 broken targets or anchors;
- the final diff contained exactly 34 authorized paths: 15 tracked modifications and 19 untracked additions, with 0 path outside the frozen allowed-write set;
- Runtime/Contracts/tests/dependency/lockfile/product-behavior/config changes: 0;
- protected completed or historical evidence changes: 0;
- `project_state/README.md` remained unchanged;
- `openspec status --change reorganize-runtime-design-documents` reported the spec-driven change and all 4 planning artifacts complete;
- `openspec validate --all --json` reported 3 passed, 0 failed;
- `git diff --check` exited with code 0 and reported no whitespace errors; it produced only 15 informational LF-to-CRLF working-copy warnings.

## Exact non-changes

This documentation migration made no change to:

- Runtime source or generated Runtime code;
- Runtime tests or test behavior;
- Runtime Contracts or shared schema values;
- dependencies, dependency manifests, or lockfiles;
- product APIs or executable behavior;
- executable or generated configuration;
- persisted product data or migration logic;
- completed OpenSpec changes or archives;
- existing completed or historical construction records and closeouts;
- historical Tasks, Plans, Reports, or embedded historical paths;
- the root location or summary-only authority of `project_state/`;
- `project_state/README.md`.

## Residual open product seams

Acceptance of this documentation system does not resolve or authorize implementation of:

- first-class `model_id` launch transport or LaunchSpec/adapter compatibility;
- heartbeat, reconnect, replay, outbox, restart, or Host reconstruction guarantees;
- Run failure, waiting, retry, timeout, recovery/rebind, or lease-release behavior;
- Graph queueing, partial activation, replacement, retry, connection evaluation, or policy timing;
- Package-as-Brick or any required Contracts and persisted-record migration;
- Project bootstrap, data location, physical schema, transaction, recovery, backup/export, or authoring choices;
- backend-session continuity across Graph changes, Host replacement, or failed resume.

These remain status-labeled inputs for later explicit product decisions.

## Archive status

No OpenSpec archive command was run. The change remains unarchived, and archiving is a separate explicit action requiring separate authorization.
