## ADDED Requirements

### Requirement: Canonical design routing and status catalog
The repository SHALL provide `docs/design/README.md` as the canonical Runtime design entry point, and that catalog SHALL distinguish current invariants, focused future designs, preserved history, compatibility routes, and Project State's summary-only role using an explicit status and authority taxonomy.

#### Scenario: New reader selects a design route
- **WHEN** a reader opens `docs/design/README.md` with a current, future, or historical Runtime design question
- **THEN** the catalog routes the reader to the matching canonical layer and explains whether that layer is current, target-stage, accepted future, draft, proposed, open, historical, or compatibility-only

#### Scenario: Canonical tree is inspected
- **WHEN** the Runtime design tree is enumerated after migration
- **THEN** it contains `README.md`, `current/runtime-invariants.md`, exactly the five required files under `future/`, and the six original filenames under `history/runtime/`

### Requirement: Current invariant kernel admission
`docs/design/current/runtime-invariants.md` SHALL contain only confirmed current cross-module semantics and explicit target-stage distinctions supported at their stated boundary by current Contracts, scoped source/tests, accepted evidence, or an explicit newer accepted design decision. It MUST exclude implementation absences, deferred intent, draft or open choices, and detailed historical narrative.

#### Scenario: Confirmed cross-module rule is admitted
- **WHEN** a candidate rule has current supporting authority, crosses a module or process boundary, and states its bounded confirmation without implying unimplemented end-to-end behavior
- **THEN** the invariant kernel may record the rule with its scope and evidence boundary

#### Scenario: Non-invariant material is reviewed
- **WHEN** a candidate statement describes a missing implementation, deferred capability, draft choice, open decision, or historical chronology
- **THEN** it is excluded from the invariant kernel and routed to Project State, a focused future file, or preserved history as appropriate

#### Scenario: Current and target stages differ
- **WHEN** a broader system target or later Graph/reliability stage differs from the confirmed current slice or Direct Actor MVP
- **THEN** the kernel labels the difference as a target-stage distinction and does not claim the target is implemented

### Requirement: Exact focused future design boundaries
The Runtime design knowledge system SHALL provide exactly these five future files: `project-persistence-and-brick-authoring.md`, `package-and-delivery.md`, `run-and-invocation.md`, `actor-host-lifecycle-and-recovery.md`, and `graph-and-policy.md`. It MUST NOT create a separate Project-and-Actor future file or a separate model-selection file.

#### Scenario: Actor launch seams are allocated
- **WHEN** Actor creation, Host launch, Actor/Pool/session identity, `model_id` transport, LaunchSpec compatibility, or Host lifecycle/recovery material is reconciled
- **THEN** that material is placed in `actor-host-lifecycle-and-recovery.md`

#### Scenario: Project semantics are allocated
- **WHEN** Project semantics are required to explain persistence ownership, typed namespaces, workspace prerequisites, or Definition Brick authoring
- **THEN** those semantics are placed in `project-persistence-and-brick-authoring.md` without creating a combined Project-and-Actor design

### Requirement: Focused future status preservation
Every focused future file SHALL distinguish inherited current baselines and accepted future boundaries from product-design drafts, proposed migrations, and open decisions. A future file MUST NOT silently redefine a current invariant or present future material as implemented behavior or implementation authorization.

#### Scenario: Package alternatives are classified
- **WHEN** Package design material is reconciled
- **THEN** the immutable Package Head plus exactly one Body containing one root `BrickPrompt` and Delivery-owned routing remain the inherited accepted baseline, while Package-as-Brick remains proposed only

#### Scenario: Persistence material is classified
- **WHEN** Project and Definition Brick persistence/authoring material is reconciled
- **THEN** the file identifies it as a product design draft and preserves undecided physical schema, bootstrap, transaction, recovery, and authoring details as draft or open

#### Scenario: Run Graph or recovery behavior is unresolved
- **WHEN** source designs offer vocabulary or options without an accepted choice for Run failure/recovery, Graph execution/policy, Host recovery, or session continuity
- **THEN** the owning future file labels the decision open instead of selecting or promoting it

### Requirement: Intact Runtime design history
The repository SHALL preserve complete, byte-identical copies of all six original root Runtime design bodies under `docs/design/history/runtime/` using their original filenames. The preserved copies MUST NOT rewrite headers, links, status text, line endings, embedded paths, or historical wording.

#### Scenario: Historical body integrity is verified
- **WHEN** each history destination is compared with its root source before the source becomes a shim
- **THEN** its byte length and SHA-256 digest match the recorded original values

#### Scenario: Historical reader opens a canonical source
- **WHEN** a reader follows a history route for any of the six original design names
- **THEN** the exact complete preserved body is available at `docs/design/history/runtime/<original-filename>`

### Requirement: Root path shim compatibility
All six original root Runtime design paths SHALL remain present as compatibility shims. Each shim SHALL identify itself as non-authoritative, route current readers to `docs/design/README.md`, and route historical readers to its exact preserved body without restating design semantics.

#### Scenario: Existing root reference is followed
- **WHEN** an unchanged historical reference or external bookmark opens any original root design path
- **THEN** the shim provides a working current route and a working exact-history route

#### Scenario: Shim authority is reviewed
- **WHEN** a root shim is inspected for semantic content
- **THEN** it contains routing guidance only and cannot be mistaken for a competing current design summary

### Requirement: Current-link and historical-link discipline
References to the six old root designs SHALL be updated only under `project_state/**` and in `docs/construction/phase-1-architecture-invariants.md`, and those current surfaces SHALL route to canonical current design paths rather than root shims or history copies. Completed OpenSpec changes, historical Tasks, Plans, Reports, closeouts, and embedded historical paths MUST remain unchanged and rely on the shims.

#### Scenario: Current references are migrated
- **WHEN** references to the six root design names are scanned under `project_state/**` and in `docs/construction/phase-1-architecture-invariants.md`
- **THEN** each current reference resolves to `docs/design/README.md`, `docs/design/current/runtime-invariants.md`, or a status-appropriate focused future file

#### Scenario: Historical evidence is audited
- **WHEN** completed OpenSpec artifacts and historical Task, Plan, Report, closeout, or embedded paths are compared before and after migration
- **THEN** their contents are unchanged and any retained root design path resolves through its compatibility shim

### Requirement: Project State location and authority preservation
The repository SHALL keep `project_state/` at the repository root and SHALL preserve its authority as bounded navigation and concise current-state orientation only. The migration MUST NOT create a North Star or make Project State override approved designs, accepted specifications, Runtime Contracts, source, tests, or accepted evidence.

#### Scenario: Project State authority is inspected
- **WHEN** a reader opens `project_state/README.md` and `project_state/_meta/authority.md` after link migration
- **THEN** both continue to describe Project State as a summary and routing layer at the repository root

#### Scenario: Future design is routed from Project State
- **WHEN** a Project State card links to future Runtime design material
- **THEN** the link and surrounding context preserve the material's future, draft, proposed, or open status rather than presenting it as current implementation

### Requirement: No Runtime or completed-archive impact
The reorganization SHALL NOT change Runtime source, tests, Contracts, dependencies, lockfiles, product APIs, executable behavior, generated Runtime configuration, or completed OpenSpec change archives. The exact new closeout `docs/construction/records/runtime-design/runtime-design-knowledge-system-v0.1-closeout.md` SHALL store only this migration's construction and acceptance evidence—original/history hashes, link/tree/status checks, review and validation results, exact non-changes, and archive status—and MUST NOT carry product-design authority or define or change Runtime semantics. Creating this new closeout SHALL NOT authorize any change to existing completed or historical closeouts.

#### Scenario: Implementation diff is audited
- **WHEN** the completed reorganization diff is classified by repository area
- **THEN** every change is limited to the canonical design tree, the six root shims, allowed current-link surfaces, this active change's planning artifacts, and `docs/construction/records/runtime-design/runtime-design-knowledge-system-v0.1-closeout.md`, whose content is evidence-only and non-authoritative, while every pre-existing completed or historical closeout remains unchanged

#### Scenario: Runtime verification surface is compared
- **WHEN** Runtime source, test, Contract, dependency, lockfile, executable configuration, and completed OpenSpec archive paths are compared before and after migration
- **THEN** they contain no change caused by this documentation reorganization
