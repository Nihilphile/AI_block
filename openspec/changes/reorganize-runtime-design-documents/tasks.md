## 1. Preflight inventory and write-scope freeze

- [x] 1.1 Capture `git status --short`, identify all pre-existing changes, and stop for reconciliation if any pre-existing change overlaps an authorized migration path.
- [x] 1.2 Confirm the six exact root Runtime design sources, build the source-to-history-to-shim manifest, record each untouched source's byte length and SHA-256 digest, and record the exact repository Markdown reference baseline classified as allowed current references versus protected historical/completed references.
- [x] 1.3 Freeze the allowed write set to `docs/design/**`, the six exact root shim paths, baseline-identified current links under `project_state/**`, `project_state/_meta/current-focus.md`, `docs/construction/phase-1-architecture-invariants.md`, the new Runtime design closeout, and this change's `tasks.md`; also retain a starting path/diff baseline proving Runtime source, tests, Contracts, dependencies, lockfiles, product behavior/configuration, completed OpenSpec changes, and historical evidence are protected.

## 2. Byte-preserving history migration

- [x] 2.1 Create `docs/design/history/runtime/` and copy all six original root design bodies there byte-for-byte, without transformation, under their exact original filenames.
- [x] 2.2 Compare all six history copies with the preflight byte-length and SHA-256 baseline, retain one six-row result table, and prohibit every root replacement unless all six comparisons pass.

## 3. Canonical catalog, current kernel, and five future designs

- [x] 3.1 Create `docs/design/README.md` with canonical current/future/history routes, authority and status taxonomy, compatibility guidance, Project State's root-level summary-only role, and explicit absence of a North Star.
- [x] 3.2 Create `docs/design/current/runtime-invariants.md` with only evidenced current cross-module semantics and explicit target-stage distinctions, excluding implementation absences, deferred intent, draft/open choices, and detailed history.
- [x] 3.3 Create `docs/design/future/project-persistence-and-brick-authoring.md` as a product design draft limited to persistence-relevant Project/Definition Brick semantics, and create `docs/design/future/package-and-delivery.md` with the current Head-plus-one-root-`BrickPrompt` and Delivery-routing baseline while keeping Package-as-Brick proposed only.
- [x] 3.4 Create `docs/design/future/run-and-invocation.md`, `docs/design/future/actor-host-lifecycle-and-recovery.md`, and `docs/design/future/graph-and-policy.md` with their accepted future owner boundaries and unresolved Run/Graph/recovery/session/`model_id` seams explicitly open; verify `docs/design/future/` contains exactly these five named files and no separate Project-and-Actor or model-selection file.

## 4. Uniform root compatibility shims

- [x] 4.1 Only after task 2.2 passes for all six files, replace all six original root bodies with uniform non-authoritative shims routing current readers to `docs/design/README.md` and historical readers to each exact matching `docs/design/history/runtime/<original-filename>`.
- [x] 4.2 Verify all six shims use the same routing shape, resolve both required links, retain every legacy root path, and contain no copied design semantics or competing current summary.

## 5. Bounded current-link migration and Project State reconciliation

- [x] 5.1 Update the baseline-identified old Runtime design links under `project_state/**` as one bounded migration to the catalog, current kernel, or correctly status-labeled future file; make only necessary Project State route/authority reconciliation while keeping `project_state/` at repository root and summary-only.
- [x] 5.2 Update `docs/construction/phase-1-architecture-invariants.md` to canonical current design routes while preserving its conflict-order and target-stage distinctions.
- [x] 5.3 Verify current Project State and phase-1 links target neither root shims nor history copies, and compare the reference baseline/diff to prove completed OpenSpec changes, historical Tasks, Plans, Reports, closeouts, and embedded historical paths remain unchanged and continue to resolve through shims where applicable.

## 6. Risk-focused verification

- [x] 6.1 Verify the exact canonical tree and resolve all links across the catalog, current kernel, exactly five future files, six history files, six shims, migrated Project State surfaces, and `phase-1-architecture-invariants.md`.
- [x] 6.2 Audit semantic status and authority boundaries for invariant admission, target-stage distinctions, Package-as-Brick, persistence, `model_id` launchability, Run/Graph/recovery choices, future non-authorization, Project State summary-only authority, and duplicate-authority risk; repair any status promotion before acceptance.
- [x] 6.3 Recompute all six history byte lengths and SHA-256 digests, verify they still match the original baseline, and verify every unchanged legacy reference traverses a non-authoritative shim to the exact preserved body.
- [x] 6.4 Run whitespace/Markdown checks, audit the diff against the frozen allowed-write set, confirm zero Runtime/Contracts/tests/dependency/lockfile/product-behavior or protected-evidence change, and run `openspec validate --all --json` as pre-acceptance evidence.

## 7. Independent acceptance, review, closeout, and handoff

- [x] 7.1 Perform an independent acceptance pass through current, future, history, and legacy-root reader routes and record PASS or exact actionable findings against the capability spec.
- [x] 7.2 Perform an independent review focused on semantic promotion, duplicate authority, exact five-file allocation, history integrity, shim compatibility, bounded link edits, Project State authority, protected evidence, and no-Runtime impact.
- [x] 7.3 Classify all acceptance/review findings, apply only focused in-scope repairs when required, re-run each affected risk-focused check, and obtain a focused re-review with no remaining actionable finding.
- [x] 7.4 Create `docs/construction/records/runtime-design/runtime-design-knowledge-system-v0.1-closeout.md` with accepted scope, original/history hashes, link/tree/status evidence, validation and review outcomes, residual open product seams, exact non-changes, and archive status; reconcile `project_state/_meta/current-focus.md` to route to the accepted design system without selecting or authorizing product implementation.
- [x] 7.5 Confirm no OpenSpec archive command was run and record that archiving remains a separate explicit action.
- [x] 7.6 Run final `openspec status --change reorganize-runtime-design-documents`, `openspec validate --all --json`, and allowed-write/no-Runtime diff checks, retaining exact outputs in the implementation handoff.
