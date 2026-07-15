# Construction Workflow Thickness Reference

> Scope: software construction orchestration only. This document does not define how the product is designed.

## 1. Purpose

This reference exists to remove unnecessary construction ceremony.

The goal is not to make every Task pass through the strongest process. The goal is to select the thinnest workflow that is sufficient for the Task's actual impact and risk, while preserving explicit escalation when new facts appear.

The decision model therefore uses:

```text
base workflow level
+ independently triggered gates
= minimum sufficient construction workflow
```

It does not ask an LLM to assign an intuition-based numeric risk score.

### 1.1 Authority and related records

This document is authoritative for construction workflow levels, add-on gates, and Reviewer placement.

- `docs/construction/task-report-audit.md` is authoritative for Task IDs, Task/Report ownership, and Git-tracked audit records.
- `development-orchestration-runbook-v0.1.md` remains authoritative for Worker roles, model selection, context control, and communication mechanics.
- approved product architecture, designs, and ADRs remain authoritative for product decisions.

If an older construction rule applies the same approval, Tester, or Reviewer requirement unconditionally, the classification and gate rules in this document determine whether that ceremony is required. Product ambiguity still returns to the product-design authority; workflow classification never resolves it.

## 2. Core rules

1. Impact range determines the base level.
2. Binary risk questions may only add gates or increase control; they never cancel an existing requirement.
3. Every added Worker, approval round-trip, or separate artifact must name its concrete trigger.
4. “This is important” and “to be safe” are not sufficient triggers by themselves.
5. A gate already satisfied by the base workflow is not added a second time.
6. A separable high-risk slice is split into its own Task instead of making unrelated work heavier.
7. The Coder may escalate a Task but may not downgrade the Controller's classification.
8. Product ambiguity is not solved by construction ceremony. Construction stops and returns the missing decision to the appropriate design authority.
9. Real external actions, such as deployment, publishing, sending messages, spending quota, or mutating an external system, always require the applicable explicit action authorization regardless of workflow level.
10. Reuse the same Coder across related Tasks within one module when its context remains coherent; changing Coder resets module-scoped delegation calibration.

## 3. Output form

A classification is recorded as a base level plus only the gates that add something not already implied:

```text
W1
W1 + Compatibility
W2 + Research
W2 + Security Review
W3 + Recovery
```

The Task file records the chosen classification, the concrete base-level reason, the binary gate triggers that evaluated to yes, and any gate-specific acceptance evidence. It does not copy every checklist question whose answer was no.

## 4. Base-level decision tree

Answer in order:

```text
Does the Task modify product code or a product deliverable?
├─ No  → W0
└─ Yes
   ↓
Does it establish or change a public boundary,
cross more than one state owner,
or require multiple slices whose shared interface or
compatibility order must be controlled across integration?
├─ Yes → W3
└─ No
   ↓
Does it add or change behavior, state, or structure inside one module,
rather than perform a fully specified mechanical edit?
├─ Yes → W2
└─ No
   ↓
Are the outcome and write scope exact,
is the change reversible,
and is verification direct and deterministic?
├─ All yes → W1
└─ Any no  → W2
```

File count is not a classification rule. A mechanical rename across several files may remain W1; a one-file lifecycle or state-machine change may be W2.

## 5. Default workflows

### W0 — Direct construction support

Use for read-only investigation, status reporting, and Controller-owned construction records that do not modify the product.

Default workflow:

- bounded architecture/construction-record read-back, status checks, and small factual inspection are handled directly by the Controller;
- no delegated Task/Report pair is required;
- perform a proportionate read-back or diff check when a construction record changes;
- no Coder, Tester, or Reviewer by default.

Deep product-code or log investigation remains delegated to an Explorer when doing it directly would displace the Controller's architecture and orchestration context. External technical facts remain Research work. A delegated W0 evidence task uses a minimal Task/Report pair when its result will authorize or materially constrain later construction.

Product design work is outside this classification rather than being treated as W0.

### W1 — Lightweight autonomous construction

Use for a narrow, reversible, fully specified product change with direct verification and no public-boundary effect.

Default workflow:

- Controller writes a minimal Task with an exact write scope and acceptance checks;
- Coder performs an autonomous micro-preflight without waiting for a second authorization round-trip;
- Coder implements, runs targeted self-verification, and writes a minimal Report;
- Task, Coder Report, and implementation enter Git together;
- no separate design, implementation plan, Researcher, independent Tester, or Reviewer by default.

The micro-preflight is reported retrospectively:

```text
uncertainty found: yes | no
implicit decisions found: yes | no
decisions made: <short list or none>
reason: <short explanation>
```

W1 autonomy covers only local, reversible decisions that do not change public behavior or exceed the Task write scope.

### W2 — Standard module construction

Use for a bounded feature, bug fix, or refactor that changes behavior, state, or internal structure within one state-owning module.

Default workflow:

- Controller writes the Task; no separate implementation plan is required by default;
- Coder returns a full preflight and waits for one explicit implementation authorization;
- Controller resolves material decisions and freezes the write scope and acceptance checks;
- Coder implements with appropriate tests, self-verifies, and writes its Report;
- no independent Tester or per-Task Reviewer by default;
- add them only through an applicable gate or a module-acceptance requirement.

Closely related internal steps may share one authorization. Per-file or per-function authorization is not required.

### W3 — Controlled multi-boundary construction

Use when construction establishes or changes a public boundary, crosses state owners, or requires coordinated slices whose shared interface or compatibility order must be controlled across integration. Multiple ordinary implementation steps inside one state-owning module do not become W3 merely because there is more than one step.

Default workflow:

- Controller writes the Task and a short construction plan covering ownership, sequence, interfaces, and acceptance;
- Coder performs a full preflight;
- unresolved decisions are closed before their dependent slice begins;
- implementation is authorized in meaningful slices rather than one authorization per file;
- Coder tests and reports each authorized Task;
- an independent Tester verifies the integrated deliverable or module milestone;
- Reviewer is not added after every slice; normal Review occurs once at module acceptance.

A W3 plan is a bounded execution map, not a line-by-line command script and not a duplicate product design.

## 6. Add-on gates

Each gate is activated by a binary question. If the answer is no, the gate is not added.

### Research

Trigger:

> Does the current Task depend on an external behavior, version, interface, or factual claim that is not already established by authoritative evidence or a controlled local fact?

Effect:

- a Researcher returns a decision-focused brief;
- implementation waits only when that fact blocks the active write;
- research does not expand into unrelated technology review;
- once the blocking fact is closed, the gate ends.

### Controlled Probe

Trigger:

> Are documents insufficient, making an empirical probe necessary, and can that probe consume quota, contact a real service, or change external state?

Effect:

- obtain explicit authorization before the probe;
- bound inputs, cost, state changes, and success criteria;
- retain the result as evidence for the construction decision;
- do not turn a probe into an unapproved product integration.

### Compatibility

Trigger:

> Does the Task add or upgrade a runtime dependency, toolchain, supported runtime, serialized format, protocol version, or externally consumed compatibility surface?

Effect:

- use exact versions where the project requires them;
- verify the relevant compatibility evidence;
- verify reproducible installation, lockfile behavior, and affected build/runtime consumers;
- add Research only if compatibility facts are genuinely unresolved.

An ordinary already-approved test-only tool does not automatically trigger a broad dependency investigation.

### Independent Test

Trigger for W1 or W2:

> Does the change affect a public behavior, have a regression surface not credibly covered by Coder self-tests, or alter security, concurrency, persistence, or recovery behavior?

Effect:

- an independent Tester verifies the committed implementation;
- the Tester classifies failures and retains detailed evidence;
- the Tester does not review implementation style or approve its own test changes.

W3 already includes independent integrated testing, so the gate is not recorded twice.

### Early Review

Trigger:

> Would waiting until module acceptance create substantial rework risk because a public contract is about to be consumed, security/concurrency/migration semantics must be frozen, Workers disagree, tests cannot resolve the issue, or repeated rework or scope drift has appeared?

Effect:

- Reviewer examines the affected boundary before downstream work proceeds;
- later module review uses that accepted point as a baseline and avoids re-reviewing unchanged material.

### Security Review

Trigger:

> Does the Task change authentication, authorization, credentials, secrets, executable capabilities, sandboxing, or a trust boundary?

Effect:

- perform threat-oriented independent testing and Review;
- verify privilege and failure behavior, not only the happy path;
- Security Review implies Independent Test and Review and does not add duplicate Workers when those roles are already present.

Merely editing a file located near authentication code does not trigger this gate unless security behavior changes.

### Recovery

Trigger:

> Can the Task transform or destroy persisted state, perform a non-idempotent destructive action, or leave the system difficult to restore after failure?

Effect:

- define backup, checkpoint, rollback, or forward-recovery behavior before the risky step;
- obtain the applicable explicit authorization immediately before an irreversible action;
- independently verify preconditions and postconditions;
- Recovery implies Independent Test and Review.

Reading persisted state or adding an unused storage abstraction does not by itself trigger Recovery.

## 7. Reviewer placement

The default Reviewer position is module acceptance, not Task completion.

- W1 and W2 Tasks receive no per-Task Review by default.
- W3 slices receive no per-slice Review by default.
- related Tasks accumulate and receive one module-level Review against the integrated diff and available Tester evidence.
- Reviewer does not duplicate test execution.
- a focused remediation receives focused re-review rather than an automatic full-module restart.
- a module containing only mechanical W1 changes and no semantic change may waive module Review when the Controller records the reason.
- Early Review is used only when waiting until module acceptance would make later correction materially more expensive.

“Module” follows the state owner, not an arbitrary phase label or every implementation slice. Several Runtime Contracts slices, for example, remain one module review boundary.

## 8. W1 decision reporting and Controller disposition

The Coder Report lists only meaningful implementation decisions, their selected direction, and the reason. It does not enumerate trivial syntax choices.

The Controller classifies each reported decision as:

- **accepted** — matches the intended direction;
- **acceptable alternative** — not the Controller's first preference, but fully satisfies Contract, boundary, quality, and acceptance requirements;
- **correction required** — requires a follow-up construction change;
- **out of authority** — exceeded write scope, changed public semantics, or concealed a material uncertainty.

A preference difference is not automatically a defect.

The Controller records its disposition in the module closeout or a linked correction Task. It does not rewrite the Worker's Report to make the earlier decision appear different.

## 9. Remediation and delegation calibration

Do not calculate a Worker score or a simple error percentage. Evaluate decision impact, coupling, and transparency:

```text
Are all decisions accepted or acceptable alternatives?
├─ Yes → accept the Task and preserve autonomy
└─ No
   ↓
Are all required corrections independent, local, reversible,
and expressible as W1 work?
├─ Yes → create a W1 correction Task;
│        observe only the affected decision category
└─ No
   ↓
Do the mismatches share a mistaken assumption
or require coordinated implementation rework?
├─ Yes → create a W2 correction Task;
│        move the affected decision category to ask-first
└─ No
   ↓
Was there a scope breach, public-semantic drift,
or an unreported material uncertainty?
├─ Yes → suspend W1 autonomy for the current module;
│        reclassify the repair as W2 or W3
└─ No  → choose the smallest sufficient correction
```

One local mismatch among several decisions normally creates only a local W1 correction. Several mismatches caused by one wrong mental model normally create a W2 correction. A single public-contract violation may suspend autonomy even though its count is one.

Delegation calibration is scoped to the same Coder, module, and decision category. It does not become a global judgment of the model. A new Coder or module begins with the default narrow W1 authority.

## 10. Mid-Task escalation and splitting

- A Coder may raise W1 to W2 or W3, but may not lower the assigned level.
- When a new trigger appears, stop before crossing that boundary and report the completed safe state.
- Already completed safe work is not automatically discarded.
- If the risky portion is separable, create a new Task ID for it and keep the original Task thin.
- If it is inseparable, reclassify the remaining work and add only the missing gates.
- Expanding write scope, changing acceptance, adding a dependency, or altering a public interface creates a new authorization boundary.
- A materially new remediation or follow-up receives a new Task ID and links to the earlier Task with `follows`.

## 11. Urgent containment

Urgency does not silently downgrade classification or waive external-action authorization.

When immediate containment is necessary:

- create the smallest reversible containment Task that can stop the harm;
- apply the normal binary classification to that containment rather than to the entire permanent repair;
- record any verification that could not safely run;
- create a linked follow-up Task for permanent repair and deferred evidence;
- do not call temporary containment a completed module acceptance.

## 12. Quick classification checklist

For a new construction Task, the Controller records concise yes/no answers:

```text
BASE
[ ] modifies product code or deliverable?
[ ] changes public boundary, crosses state owners, or coordinates slices?
[ ] changes module behavior, state, or structure?
[ ] exact outcome and scope?
[ ] reversible?
[ ] direct deterministic verification?

GATES
[ ] unresolved external fact blocks construction?             → Research
[ ] costly or stateful empirical probe required?              → Controlled Probe
[ ] compatibility surface changes?                            → Compatibility
[ ] independent evidence required beyond Coder self-tests?    → Independent Test
[ ] waiting for module Review creates material rework risk?   → Early Review
[ ] security or trust behavior changes?                       → Security Review
[ ] persisted state or difficult recovery is involved?        → Recovery
```

The checklist yields a rule-based result. It is not converted into a numeric total.

## 13. Audit records

Task IDs, Task/Report ownership, minimal templates, and Git rules are defined in:

```text
docs/construction/task-report-audit.md
```

The Task records classification and triggers. Worker Reports record decisions, implementation or evidence, verification, deviations, and remaining risk. These records should remain concise; detailed designs, raw logs, and full transcripts stay elsewhere.
