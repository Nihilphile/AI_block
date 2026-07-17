# HOST-remediation-002 Wire Diagnostic Redaction

- owner: ActorHost
- follows: HG-review-002
- affected modules: ActorHost only
- workflow: W2 + Security Review + Independent Test
- base reason: this is a bounded ActorHost behavior correction, while wire-visible credential/diagnostic handling independently triggers security evidence and review
- product baseline: `d963b8e`

## Objective

Ensure backend- and initialization-originated diagnostics never cross the Host protocol boundary in `HostFault.message`, while preserving stable failure codes, truthful lifecycle behavior, and useful fixed failure-class messages.

## Scope and authority

- read scope: ActorHost supervisor/command processing and focused tests, Runtime Contracts HostFault shape, remediation/review evidence, and directly relevant Git history
- anticipated implementation scope after authorization: affected ActorHost backend/server-connection source and focused ActorHost tests plus the Task Report
- preflight write scope: none
- final Report path: `docs/construction/records/actor-host/reports/HOST-remediation-002-wire-diagnostic-redaction.coding.md`
- delegated discretion after authorization: private fixed-message mapping/helper placement and deterministic secret-bearing test fixture organization
- tools/external actions: local repository tools and deterministic tests only; Serena non-memory LSP operations are allowed
- delegation: none

## Frozen decisions

- `HostFault.code` remains the stable machine-readable discriminator; Runtime Contracts and existing code literals do not change.
- Wire-visible `HostFault.message` for initialization, session observation, completion observation, and stop failure is fixed by failure class and must never include caught `Error.message`, stderr, command line, workspace path, token, credential, or provider diagnostic.
- Current scope does not add a local diagnostic store, logger, telemetry sink, or persistence behavior. Raw caught diagnostic text is discarded after local classification unless an already-existing private non-wire mechanism can retain it without new scope.
- Identity mismatch, quarantine, ACK ordering, exactly-one terminal fault, and supervisor lifecycle semantics from `HOST-remediation-001` remain unchanged.
- No public schema/export, Runtime Server, root integration, Run/Package/Graph, persistence, recovery, or Claude behavior changes.

## Preflight gate

Before editing, report:

1. every path where caught/backend-provided text can reach `HostFault.message` or another outbound Host payload;
2. exact existing stable code literals and proposed fixed non-sensitive message for each relevant failure class;
3. smallest mapping/enforcement point that prevents future adapters from bypassing redaction;
4. whether any current private local diagnostic channel exists and whether it should remain untouched;
5. expected source/test files within anticipated scope;
6. focused secret-bearing RED/GREEN tests for initialization, session, completion, and stop rejection, including serialized outbound-message assertions;
7. relevant regression and full verification commands;
8. any Contract, observability, or ownership decision that cannot be made locally;
9. READY or BLOCKED recommendation.

Do not edit until the Orchestrator returns exact `IMPLEMENTATION_AUTHORIZED`.

## Constraints and escalation

- Do not merely redact known token formats; raw diagnostics must be excluded by construction.
- Do not expose diagnostics through a different Host payload, metadata field, log added by this Task, or test-only production branch.
- Do not modify Runtime Contracts, Runtime Server, root integration/tooling, design, Runbook, prior Tasks, or prior Reports.
- No subagents, Superpowers workflow chaining, Serena memory/onboarding, or `.serena/` inspection.
- Escalate any need to change stable error codes, add a public diagnostic field, or write outside the final authorized scope.

## References

- `runtime-module-architecture-v0.1.md`
- `docs/construction/phase-1-architecture-invariants.md`
- `docs/construction/runbook/ai-block-project-profile.md`
- `docs/construction/runbook/work-guides/coding.md`
- `docs/construction/runbook/orchestration/specialized-gates.md`
- `docs/construction/runbook/policies/serena.md`
- `docs/construction/runbook/policies/superpowers.md`
- `docs/construction/records/host-gateway/reports/HG-review-002-remediation-closeout.reviewing.md`
- `docs/construction/records/actor-host/reports/HOST-remediation-001-boundary-safety.coding.md`

## Acceptance after implementation authorization

- Secret-bearing Error text for initialize/session/completion/stop never appears in structured or serialized outbound Host facts.
- Each failure retains its existing stable code and a deterministic fixed non-sensitive message.
- Lifecycle state/fault count and ACK ordering remain as previously accepted.
- Focused ActorHost tests and full repository verification pass.
- Only finally authorized paths and the coding Report are committed.

## Handoff

After implementation authorization, write the coding Report using current Runbook semantics and commit only authorized paths with a commit message supplied by the Orchestrator.
