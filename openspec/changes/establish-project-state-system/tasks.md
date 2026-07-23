## 1. State-system foundation

- [ ] 1.1 Reconcile the durable Project State System design with current accepted closeouts, OpenSpec status, source roots, and construction records; record any scope mismatch before creating state cards.
- [ ] 1.2 Create the root `project_state/README.md` and `_meta/authority.md`, `_meta/system-map.md`, and `_meta/current-focus.md` according to the approved current-view and authority model.
- [ ] 1.3 Validate that root/meta routing distinguishes product designs, current state, executable truth, evidence/history, future plans, and construction procedure without duplicating a roadmap or historical narrative.

## 2. Initial module state cards

- [ ] 2.1 Create the Runtime Contracts state card with current Contract scope, source/test roots, accepted evidence, explicit boundaries, and deferred compatibility work.
- [ ] 2.2 Create the Runtime Server Actor Module state card with the accepted reference-only ActorTemplate result, Definition Brick/Template/Snapshot boundaries, remediation closure, and deferred Direct Actor path.
- [ ] 2.3 Create the Runtime Server Host Gateway state card with its current implemented boundary, source/test roots, evidence, and known deferred scope.
- [ ] 2.4 Create the ActorHost state card with current lifecycle/adapter scope, source/test roots, accepted evidence, and deferred execution behavior.
- [ ] 2.5 Create the Runtime CLI state card with its current status, stateless-Client boundary, source/test roots, and deferred command surface.
- [ ] 2.6 Add only routing nodes needed to reach the five cards; do not create empty cards for planned Project, Package, Run, Graph, or unimplemented infrastructure modules.

## 3. Construction integration

- [ ] 3.1 Add the Project State System design to the construction navigation and define its authority relative to the Runbook, Task records, Reports, OpenSpec, designs, source, and tests.
- [ ] 3.2 Extend the load-manifest and dispatch guidance so a new task explicitly loads the root state README plus its target module card, adding neighbor cards only for declared boundary crossings.
- [ ] 3.3 Update Coder, Tester, Reviewer, and Orchestrator guidance with scoped state-card read/write/reconciliation duties and stale-state escalation behavior.
- [ ] 3.4 Define the future facet-splitting rule as an on-demand decision, retaining one default README per module for this activation.

## 4. Verification and closeout

- [ ] 4.1 Perform an independent documentation acceptance pass that follows the new-Orchestrator and bounded-Worker load routes against the initial cards, current code roots, accepted evidence, and active OpenSpec state.
- [ ] 4.2 Review authority separation, module-card accuracy, update-scope discipline, stale-state handling, and absence of Runtime product/dependency changes.
- [ ] 4.3 Record acceptance evidence, residual risks, adoption guidance, and any later reconciliation work in a Project State System closeout without archiving unrelated Runtime changes.
