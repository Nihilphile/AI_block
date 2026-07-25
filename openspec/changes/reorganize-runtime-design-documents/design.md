## Context

AI_block currently keeps six Runtime design documents at the repository root:

- `runtime-module-architecture-v0.1.md`
- `runtime-module-concept-v0.2.md`
- `runtime-object-module-v0.3.md`
- `runtime-system-architecture-v0.1.md`
- `runtime-actor-template-and-brick-design-v0.1.md`
- `runtime-project-persistence-and-definition-brick-authoring-design-v0.1.md`

Together they contain confirmed cross-module semantics, target-stage distinctions, accepted future boundaries, product-design drafts, proposed migrations, unresolved decisions, superseded formulations, and historical rationale. Their root placement does not expose those distinctions, so a reader can mistake older or tentative material for current authority.

`project_state/` now supplies bounded current implementation orientation, but its authority is intentionally summary-only. It remains at the repository root and does not replace product designs, accepted OpenSpec specifications, Runtime Contracts, source, tests, or construction evidence. This change therefore adds a separate Runtime design knowledge system instead of expanding Project State or introducing a product North Star.

The migration is documentation-only. It reorganizes design knowledge and selected current links without changing Runtime source, tests, Contracts, dependencies, lockfiles, executable behavior, product APIs, completed OpenSpec archives, or historical construction evidence.

## Goals / Non-Goals

**Goals:**

- Establish one canonical `docs/design/README.md` route that explains design authority, status, and where to read next.
- Publish a compact current Runtime invariant kernel containing only confirmed cross-module semantics and explicit target-stage distinctions.
- Reconcile future Runtime material into exactly five independently readable files while preserving accepted-future, draft, proposed, and open status.
- Preserve the complete bodies of all six root Runtime design sources under `docs/design/history/runtime/` with their original filenames.
- Preserve every original root path as a compatibility shim for current and historical readers.
- Update only current Project State references and `docs/construction/phase-1-architecture-invariants.md` to canonical design paths.
- Define an ordered, reversible migration with content-integrity and link verification.

**Non-Goals:**

- Creating a product North Star or moving `project_state/` under `docs/`.
- Treating Project State as product-semantic authority or as a future-work plan.
- Creating a separate Project-and-Actor future design or a separate model-selection design.
- Selecting unresolved product behavior for Run recovery, Graph execution, Host recovery, session continuity, or Project deactivation.
- Accepting Package-as-Brick as the current Package model.
- Freezing draft Project/Brick persistence details or authorizing persistence implementation.
- Rewriting completed OpenSpec changes, historical Tasks, Plans, Reports, closeouts, or embedded historical paths.
- Changing Runtime source, tests, Contracts, dependencies, lockfiles, product behavior, or completed change archives.
- Creating implementation tasks as part of this planning step.

## Decisions

### 1. Use one fixed Runtime design topology

The canonical Runtime design tree will be:

```text
docs/design/
├── README.md
├── current/
│   └── runtime-invariants.md
├── future/
│   ├── project-persistence-and-brick-authoring.md
│   ├── package-and-delivery.md
│   ├── run-and-invocation.md
│   ├── actor-host-lifecycle-and-recovery.md
│   └── graph-and-policy.md
└── history/
    └── runtime/
        ├── runtime-module-architecture-v0.1.md
        ├── runtime-module-concept-v0.2.md
        ├── runtime-object-module-v0.3.md
        ├── runtime-system-architecture-v0.1.md
        ├── runtime-actor-template-and-brick-design-v0.1.md
        └── runtime-project-persistence-and-definition-brick-authoring-design-v0.1.md
```

The migration creates exactly five files under `docs/design/future/`. Actor creation, Host launch, and `model_id` transport belong in `actor-host-lifecycle-and-recovery.md`; they do not justify separate Project-and-Actor or model-selection files. Project semantics appear in `project-persistence-and-brick-authoring.md` only to the extent needed to define persistence ownership, typed namespaces, workspace prerequisites, and Definition Brick authoring.

This question-oriented split is preferred over retaining a chronology-oriented root set because readers can load one bounded subject without importing every historical decision. A single consolidated replacement document was rejected because it would recreate the mixed-status ambiguity and broad reading cost of the current layout.

### 2. Define authority by layer, not by document age

`docs/design/README.md` is the canonical design catalog and reader route. It explains the layers and their status vocabulary, but it does not independently define Runtime behavior.

The design layers have these authorities:

| Layer | Authority and use |
|---|---|
| `docs/design/current/runtime-invariants.md` | Canonical design statement for confirmed current cross-module semantics and explicit target-stage distinctions. |
| `docs/design/future/*.md` | Status-preserving product design input for future changes; never evidence of current implementation and never implementation authorization by itself. |
| `docs/design/history/runtime/*.md` | Complete provenance sources and historical rationale; not a current decision surface unless a canonical current/future file explicitly carries a statement forward with status. |
| Six root compatibility shims | Path compatibility and routing only; no independent semantic authority. |
| `project_state/` | Root-level navigation and concise current implementation orientation only. |
| Accepted OpenSpec specifications and approved product designs | Normative product intent within their accepted scope. |
| Runtime Contracts, source, and tests | Actual supported values and executable behavior. |
| Construction records, closeouts, Reports, Plans, Tasks, and Git | Verification and historical evidence. |

When sources disagree, explicit current direction and accepted specifications govern their scope; Runtime Contracts, source, and tests govern actual behavior; the current invariant kernel records only reconciled cross-module semantics. Historical age alone never grants precedence.

An alternative in which `project_state/` becomes the only current design source was rejected because it would violate its summary-only authority and blur design intent with implementation orientation.

### 3. Use an explicit status taxonomy

The router, invariant kernel, and future documents will use the following meanings consistently:

| Status | Meaning |
|---|---|
| **Confirmed current** | Accepted evidence or the current Contract boundary establishes the cross-module rule at the stated scope. |
| **Target-stage distinction** | A deliberate difference between current slices, Direct Actor MVP, later reliability/Graph stages, or the broader system target; it is not a claim that the target is implemented. |
| **Accepted future boundary** | The intended owner, direction, or sequencing for later product design; it is not current behavior or implementation authorization. |
| **Product design draft** | A coherent future design direction whose details remain subject to acceptance and narrowing. |
| **Proposed** | A candidate change that has not displaced the accepted baseline and requires its own approval and migration design. |
| **Open** | An unresolved decision that the reorganization must preserve without selecting. |
| **Superseded** | Historical material replaced by a newer explicit decision; retained only for provenance unless deliberately reopened. |
| **Historical source** | Preserved original content that explains provenance but is not itself the canonical current route. |
| **Compatibility route** | A shim that preserves a path and points elsewhere; it carries no design semantics. |

Future files must label claims at section or decision level wherever mixed status could otherwise be inferred. The phrase “accepted future” must not be shortened to an unqualified “accepted” when that could be read as current or implemented.

### 4. Admit only a narrow invariant kernel

A statement may enter `docs/design/current/runtime-invariants.md` only when all of the following are true:

1. It governs a cross-module value, ownership, dependency, identity, lifecycle boundary, or process interaction.
2. Current Runtime Contracts, accepted closeout evidence, scoped source/tests, or an explicit newer accepted design decision supports it at the stated boundary.
3. Its scope and limit can be stated without implying unimplemented end-to-end behavior.
4. It is not merely a missing implementation, fixture detail, deferred intent, draft choice, open question, or historical narrative.
5. Any difference between a confirmed current slice and a later target is marked as a target-stage distinction.

The kernel may therefore include boundaries such as Contracts-only shared schemas, the current immutable Package Head plus exactly one root `BrickPrompt` Body, Delivery-owned routing state, Template-to-Snapshot compilation, Host separation from Template compilation, lazy backend-session creation, Host identity/protocol facts proven by the walking skeleton, and inward-facing module dependencies. It must state bounded confirmation rather than claiming a complete Direct Actor Runtime.

Implementation absences stay in Project State, future work stays in the focused future designs, and detailed chronology stays in history. Copying the mixed “current plus deferred” lists from an old source into the kernel was rejected because it would semantically promote unimplemented behavior.

### 5. Preserve future status inside each focused file

Each future file begins with its authority, status legend, owner, inputs, outputs, “not owned here” list, inherited current constraints, accepted future boundaries, draft/proposed material, and open questions.

Content is allocated as follows:

| File | Owned content and required status treatment |
|---|---|
| `project-persistence-and-brick-authoring.md` | Project prerequisite and typed resource namespaces, Server-owned persistence boundaries, Definition Brick aggregate/revisions, authoring, transactions, and recovery. The document remains a **product design draft**; physical schema, bootstrap, data location, concurrency, backup/export, and authoring details remain draft or open. |
| `package-and-delivery.md` | Immutable Package constraints, Package workflow, provenance, publication idempotency, Delivery state/acknowledgement, visibility, and retention seams. The current Head plus exactly one root `BrickPrompt` Body and Delivery-owned routing are an inherited accepted baseline. **Package-as-Brick remains proposed only** and cannot replace that baseline without a separate Contracts and record-migration change. |
| `run-and-invocation.md` | DirectRun, Actor lease ownership, Invocation closure, waiting/wake-up, cancellation, completion, and the interface later used by GraphRun. Unresolved retry, failure, recovery, correlation, timeout, and lease-release behavior remains **open**. |
| `actor-host-lifecycle-and-recovery.md` | Actor creation from an accepted Snapshot, Actor/Pool/session identity, first-class `model_id` launch transport, LaunchSpec/adapter compatibility, Host startup and one-Actor/one-Host lifecycle, heartbeat/reconnect, replay/outbox, reconstruction, and failure handling. Actor creation, Host launch, and model-selection seams are kept here; unresolved recovery and session-continuity choices remain **open**. |
| `graph-and-policy.md` | GraphTemplate/revision, GraphInstance references, GraphRun lease acquisition, Nodes/Connections, routing context, and policy snapshot/grants. Graph follows Direct Actor; queueing, partial activation, replacement, retry, policy timing, and advanced Graph semantics remain **open** or explicitly later-stage. |

No focused future file may silently redefine a current invariant. If it needs a current constraint, it links to the invariant kernel and marks the statement as an inherited baseline. This prevents duplicate authority while keeping each future file independently understandable.

The alternative five-file split suggested by chronology—especially a combined Project-and-Actor file—was rejected because Actor launch and recovery decisions cross the Actor/Host boundary, while only Project semantics needed by persistence belong with Project/Brick authoring.

### 6. Preserve all six original bodies as immutable history

Each root source is copied byte-for-byte to `docs/design/history/runtime/<original-filename>`. No header, link, status banner, front matter, line ending, embedded path, or historical wording is rewritten inside the preserved body. Provenance and supersession guidance live in `docs/design/README.md`, not inside the copy.

Before any root source is replaced, the migration records the byte length and SHA-256 digest of all six originals in execution output, creates the six history files, and verifies that each destination has the same byte length and digest. A root file may become a shim only after its matching history copy passes both checks.

Regenerating history by extracting selected sections was rejected because omissions or editorial cleanup would destroy provenance and make content-preservation unverifiable.

### 7. Keep all six root paths as uniform compatibility shims

Every original root filename remains present as a short Markdown shim. Each shim:

- identifies itself as a compatibility route rather than a design authority;
- sends current readers to `docs/design/README.md`;
- sends historical readers to its exact matching `docs/design/history/runtime/<original-filename>`;
- contains no copied design decisions or alternate summary that could drift.

Uniform shims are retained even where no current Markdown link was found, because the six root names form one public repository documentation surface and may be used by external bookmarks, scripts, or historical prose.

### 8. Apply a bounded current-link and historical-link policy

Only references to the six old root designs in these current surfaces are rewritten:

- `project_state/**`
- `docs/construction/phase-1-architecture-invariants.md`

Broad product-design references route to `docs/design/README.md`. Claims specifically about confirmed current cross-module semantics route to `docs/design/current/runtime-invariants.md`. A link whose reading question is wholly owned by one future file may route to that exact file only when its label and surrounding text preserve future/draft/open status.

Those current surfaces must not link to a root shim or directly to a history copy after migration.

All other repository references remain unchanged, including completed OpenSpec changes, historical Tasks, Plans, Reports, closeouts, and embedded absolute or root-relative historical paths. Their old paths continue to work through the shims. This is deliberate compatibility, not an incomplete bulk migration.

Bulk-rewriting all old filename occurrences was rejected because it would alter historical evidence and erase the path context under which that evidence was produced.

### 9. Preserve Project State location and authority

`project_state/` remains at repository root. Its README and authority metadata continue to say that it is authoritative only for navigation and concise current-state orientation. Current link updates may improve its route into `docs/design/`, but must not copy future plans into state cards or make state-card summaries override designs, specifications, Contracts, source, tests, or accepted evidence.

No North Star is created or implied as a prerequisite for using Project State or the design router.

### 10. Keep the migration outside Runtime behavior

The implementation diff is limited to the new `docs/design/` tree, six root shims, the selected current Project State links, `docs/construction/phase-1-architecture-invariants.md`, the exact new closeout path `docs/construction/records/runtime-design/runtime-design-knowledge-system-v0.1-closeout.md`, and this active OpenSpec change's planning artifacts. It must contain no change under Runtime source/test/Contract areas and no dependency, lockfile, generated-runtime, product API, or executable configuration change.

The new closeout stores only this migration's construction and acceptance evidence: original/history hashes, link/tree/status checks, review and validation results, exact non-changes, and archive status. It has no product-design authority and must not define or change Runtime semantics. Creating this new evidence record does not authorize edits to any existing completed or historical closeout; those records remain unchanged.

No completed OpenSpec change is edited or archived. The reorganization changes how readers locate design knowledge, not any Runtime value or behavior.

## Risks / Trade-offs

- **[Semantic promotion] Draft, proposed, open, or target-stage content could be rewritten as current truth.** → Apply the invariant admission checklist, require local status labels in every future file, and verify the known high-risk seams: Package-as-Brick, persistence, `model_id` launchability, recovery, Graph, and Run failure behavior.
- **[Duplicate authority] The router, invariant kernel, future files, Project State, and shims could all restate the same rule differently.** → Give each layer one role, keep the router and shims non-semantic, make Project State summary-only, and have future files link to inherited current constraints rather than redefine them.
- **[Historical corruption] Moving sources could drop sections, normalize text, or “fix” embedded references.** → Use byte-preserving copies and compare both byte length and SHA-256 before replacing any root body.
- **[Compatibility masking] Shims let stale historical paths continue to appear current.** → Make every shim visibly non-authoritative and route current readers first to the canonical catalog while preserving the exact historical route.
- **[Link drift] Bounded link updates could miss a current reader surface or accidentally rewrite evidence.** → Scan only `project_state/**` and `docs/construction/phase-1-architecture-invariants.md` for the six names, verify their canonical targets, and separately confirm that historical/evidence files have no diff.
- **[Future files mistaken for authorized work] A coherent future design can look implementation-ready even when choices remain open.** → Put status and non-authorization language at each file's entry, retain open questions in their owning file, and rely on later accepted OpenSpec changes for implementation authority.
- **[Focused split creates cross-file dependencies] Readers may need more than one future design for a cross-cutting change.** → Give each file explicit inputs, outputs, and “not owned here” links while retaining one router and avoiding duplicated semantics.

## Migration Plan

1. **Preflight and inventory**
   - Confirm the six root sources exist.
   - Record their byte lengths and SHA-256 digests.
   - Inventory references to the six filenames, classifying the allowed current-link surfaces separately from untouched historical/evidence surfaces.

2. **Preserve history before changing routes**
   - Create `docs/design/history/runtime/`.
   - Copy all six root bodies under their original filenames without transformation.
   - Compare every destination's byte length and SHA-256 with its original and stop on any mismatch.

3. **Create canonical design routes**
   - Create `docs/design/README.md`.
   - Create `docs/design/current/runtime-invariants.md` using the admission criteria.
   - Create exactly the five named future files with their status taxonomy and ownership boundaries.
   - Review the package baseline, Package-as-Brick proposal, persistence draft, and open Run/Graph/recovery seams for status preservation.

4. **Install compatibility shims**
   - Replace each root body with its uniform compatibility shim only after its history verification succeeds.
   - Resolve both links in each shim: the current route and its exact historical body.

5. **Update bounded current links**
   - Rewrite references to the six old root designs only under `project_state/**` and in `docs/construction/phase-1-architecture-invariants.md`.
   - Verify those references resolve to the router, invariant kernel, or an appropriately status-preserving focused future file.
   - Confirm completed OpenSpec changes and historical Tasks, Plans, Reports, closeouts, and embedded paths are unchanged.

6. **Verify the migration**
   - Assert the exact canonical tree and exactly five future files.
   - Re-run history length/digest checks against the recorded originals.
   - Check every root shim contains both required routes and no independent design summary.
   - Check the allowed current surfaces contain no link to a root shim or history copy.
   - Check all unchanged historical references still resolve through the root shims.
   - Inspect the diff to prove there is no Runtime source/test/Contract/dependency/lockfile/product behavior or completed-change-archive impact.
   - Run `openspec validate --all --json`.

### Rollback

If history verification fails, stop before replacing any root body. If a later step fails, first restore each root body from its already verified history copy and verify its recorded byte length and SHA-256. Then revert the bounded current-link edits and remove the new canonical routing/current/future files. Keep the verified history copies until root restoration has been confirmed; they are the rollback source of truth during the migration. Because the change has no Runtime behavior or data migration, rollback requires no executable, database, Contract, dependency, or lockfile action.

## Open Questions

There are no unresolved structural choices for this documentation migration. The following product questions must remain visibly open in their owning future files and must not be answered by the reorganization:

- How `model_id` becomes first-class launch configuration and how LaunchSpec/adapter compatibility is versioned.
- Which minimum heartbeat/reconnect behavior gates Direct Actor MVP and which replay/outbox/restart guarantees remain later reliability work.
- How Run failure, waiting, retry, recovery/rebind, timeout, and Actor lease release behave for each failure class.
- How Graph queueing, partial activation, replacement, retry, connection evaluation, and policy snapshot timing work.
- Whether Package-as-Brick is wanted at all and, if so, what Contracts compatibility and persisted-record migration would be required.
- Which Project bootstrap, data location, transaction, source-metadata, recovery, backup/export, and authoring decisions complete the persistence draft.
- Whether and when Actor backend sessions survive Graph changes, Host replacement, or failed resume.

These open product seams do not block writing the two planning artifacts, but tasks and implementation readiness remain outside this step.
