## ADDED Requirements

### Requirement: Current-state routing tree
The repository SHALL contain a root `project_state/` tree that provides progressively disclosed routing for current architecture and module state. The tree SHALL include a root README plus authority, system-map, and current-focus metadata documents. It SHALL remain sparse and SHALL NOT require one state file per source or test directory.

#### Scenario: New Orchestrator begins orientation
- **WHEN** a new Orchestrator reads `project_state/README.md`
- **THEN** it can identify the authority hierarchy, current system map, active focus, and the bounded module card to load next

#### Scenario: Planned module has no implementation
- **WHEN** a module is only planned or deferred and has no stable independently hand-offable implementation boundary
- **THEN** it is represented in the system map without requiring an empty module state card

### Requirement: Default module state card
Each initial module state card SHALL be a self-contained README located under the sparse state tree and SHALL include module identity, implementation state, work state, source roots, test roots, Intent, Implemented today, Boundary and dependencies, Current condition, Read next, and Evidence.

#### Scenario: Worker receives a module task
- **WHEN** a Worker loads the root state README and a target module README
- **THEN** the Worker can identify the module's current responsibility, actual implemented scope, direct boundaries, condition, source/test entry points, and additional required reading without broad repository exploration

#### Scenario: Intent differs from implementation
- **WHEN** a broader Runtime design describes a capability that the target module has not implemented
- **THEN** the module card identifies that capability as deferred, planned, or absent rather than presenting it as implemented behavior

### Requirement: Current-view maintenance
Project State cards SHALL describe accepted current reality rather than maintain an implementation timeline. A change that alters observable behavior, ownership, dependency direction, supported Contract/protocol surface, lifecycle semantics, current condition, or source/test entry points SHALL reconcile the directly affected card before acceptance.

#### Scenario: Implementation strategy is replaced
- **WHEN** an accepted implementation approach is replaced by a different approach
- **THEN** the affected card describes only the new current approach and links to historical evidence rather than retaining a detailed old-versus-new narrative

#### Scenario: Worker discovers stale state
- **WHEN** a Worker finds that a loaded state card disagrees with scoped source, Contract, or accepted evidence
- **THEN** the Worker reports the mismatch and the Orchestrator decides whether the current scope authorizes reconciliation or requires a dedicated state task

### Requirement: Bounded state dispatch and review
Construction task dispatches SHALL name the root state README and target module state card in their `load:` set. Additional cards SHALL be named only when the task crosses a declared module boundary. Review of an affected module SHALL include verification that its state card remains accurate.

#### Scenario: Local module change
- **WHEN** a task modifies only one declared module
- **THEN** its dispatch loads the root state README, that module's README, and the task file without requiring unrelated module cards

#### Scenario: Cross-module interface change
- **WHEN** a task changes a declared boundary between modules
- **THEN** its dispatch names both affected module cards and the relevant Contract or interface evidence

### Requirement: Authority and role boundaries
Project State documentation SHALL remain a current-state summary. It SHALL NOT override source/tests as executable truth, formal product designs as semantic intent, OpenSpec as approved future-work planning, construction records as evidence, or the runbook as procedure. Orchestrators, Coders, Testers, and Reviewers SHALL follow the role ownership defined by the Project State System design.

#### Scenario: Coder updates local state
- **WHEN** a Coder makes an authorized module change that changes the card's statements
- **THEN** the Coder updates only the directly affected module card and does not rewrite unrelated cross-module state

#### Scenario: Reviewer evaluates a state update
- **WHEN** a Reviewer reviews a change that updates a module state card
- **THEN** the Reviewer checks the card against the implementation subject and accepted evidence rather than treating the card as independent proof
