# Phase 1 Architecture Invariants

> Scope: construction guardrails for the FakeBackend and Direct Actor walking skeleton.
>
> This file is a compact construction anchor. It does not replace the product-target architecture documents.

## 1. Product-target authorities

The next construction phase must remain traceable to:

- [the Runtime design catalog](../design/README.md) for authority and status routing;
- [current Runtime invariants](../design/current/runtime-invariants.md) for confirmed cross-module guardrails and explicit target-stage distinctions;
- [Run and Invocation](../design/future/run-and-invocation.md) plus [Graph and Policy](../design/future/graph-and-policy.md) for status-labeled future domain concepts;
- [Actor/Host lifecycle and recovery](../design/future/actor-host-lifecycle-and-recovery.md) for status-labeled process topology and lifecycle boundaries.

When wording differs:

1. [Current Runtime invariants](../design/current/runtime-invariants.md) governs the explicitly reconciled current decisions, including strict single Package Body, immutable ActorConfigSnapshot, Delivery-owned routing metadata, Host initialization/session separation, and lazy backend-session creation.
2. [Run and Invocation](../design/future/run-and-invocation.md) and [Graph and Policy](../design/future/graph-and-policy.md) preserve domain concepts not superseded by those current decisions, while retaining accepted-future and open status.
3. [Actor/Host lifecycle and recovery](../design/future/actor-host-lifecycle-and-recovery.md) preserves deployable-process, communication-direction, and Host-lifecycle intent as status-labeled future material.
4. The [design catalog](../design/README.md) routes historical intent without granting it current authority; older `GraphActivation` terminology does not override the `GraphTemplate` → `GraphInstance` → `GraphRun` and DirectRun distinctions.

## 2. Whole-system invariants

- Project is the top-level ownership, resource, permission, and lifecycle boundary.
- Server is the authoritative control plane for Project, Actor, Package, Run, lease, routing, wake-up, and persisted state.
- Runtime CLI is a stateless Client of Server APIs; it never invokes ActorHost or persistence directly.
- Every Actor has one dedicated, long-lived ActorHost while its Project Runtime is active.
- Every ActorHost represents exactly one Actor and actively connects to the Server's shared Host endpoint.
- ActorHosts never route Packages directly to other ActorHosts.
- Backend invocations are short-lived; Actor, ActorHost, and backend session reference are longer-lived.
- A waiting Actor remains leased to its Run even when no backend process is alive.
- Prompt instructions and LLM state claims are not security or lifecycle authority.

## 3. Actor construction invariants

- Typed Bricks form an ActorTemplate, which the Actor Module compiles into an immutable ActorConfigSnapshot.
- ActorHost never reads, compiles, or assembles ActorTemplate or Bricks.
- ActorHost receives only an ActorLaunchSpec derived from the immutable snapshot.
- BrickSysPrompt, backend configuration, tool/Skill/MCP environment, and Actor capability ceiling are static for the ActorHost lifetime.
- Package bodies and resolved invocation prompts are dynamic.
- Tools are realized by Host/backend launch configuration; they are not simulated by prompt text.

## 4. Package and invocation invariants

- Every semantic Client-to-Actor and Actor-to-Actor input is a Package.
- Every Package has one immutable Head and exactly one Body.
- The Body is exactly one root BrickPrompt; multiple inputs compose into a root composite BrickPrompt rather than multiple Package bodies.
- Package Body may enter ordinary model input but can never become BrickSysPrompt/System Instruction.
- Package routing state belongs to Delivery, not mutable Package identity.
- Actor Module composes ordered accepted Packages into one InvocationSpec; ActorHost does not perform semantic Package composition.
- ActorTrace records session IDs, Invocation references, and accepted/emitted Package references without duplicating Package bodies or becoming event sourcing.

## 5. Host and backend invariants

- ActorHost contains two principal concerns: ServerConnection and BackendSupervisor.
- Backend-specific command lines, session extraction, output parsing, exit interpretation, and resume behavior stay behind a Backend Adapter.
- Host initialization prepares the execution environment but does not create an empty backend conversation.
- The first real Package-driven Invocation uses session `create` and establishes the backend session.
- Later Invocations use session `resume` with the Actor's stored session ID.
- A backend process may exit while ActorHost remains connected and the Actor remains waiting or idle.
- BackendSupervisor reports process and session facts; it does not decide Run completion, Package routing, Graph progress, or wake-up.
- Server decides whether a completion request and process facts complete, wait, fail, or resume an Invocation.
- FakeBackend must exercise the same Host-side port and lifecycle semantics intended for ClaudeCodeAdapter; it must not introduce a separate fake-only execution path.

## 6. Module ownership and dependency invariants

- Runtime Contracts owns schemas and value types only; Phase 0B is frozen unless a later approved contract change explicitly reopens it.
- Actor Module owns ActorTemplate, ActorConfigSnapshot, Actor, ActorPool, Invocation composition, and ActorTrace.
- Package Module owns immutable Package, PackageStore, Delivery, provenance, and publication idempotency.
- Host Gateway owns live Host connections, generations, heartbeats, commands, and ACK reconciliation.
- Run Engine owns Run, ActorInvocation, Actor leases, state transitions, waiting, wake-up, failure, and cancellation.
- Graph Module is deferred until the Direct Actor path is proven.
- ActorHost owns Host-local connection and backend process realization, not Server domain state.
- Infrastructure may depend inward on module interfaces; domain/application modules do not depend on HTTP, WebSocket, SQLite, or Claude-specific implementation details.
- Modules mutate only their owned state.

## 7. Phase 1 sequencing constraints

Construction remains sequential even though the architecture permits parallel module work:

1. establish a deterministic FakeBackend through the real ActorHost backend port;
2. prove BackendSupervisor initialization, create/resume, process facts, cancellation, and single-active-invocation behavior without Claude Code;
3. establish the Server-Host walking skeleton and protocol handling against the FakeBackend;
4. add focused ClaudeCodeAdapter behavior probes before relying on undocumented CLI/session behavior;
5. build Actor, Package, Run Engine, persistence, and CLI integration toward the Direct Actor acceptance path;
6. add reliability hardening;
7. implement Graph only after Direct Actor is proven.

No Phase 1 slice may silently pull in Graph execution, Actor-to-Actor delegation, multiple active Project behavior, dynamic tools, fork, remote Host, or full recovery semantics.

## 8. First-slice acceptance boundary

The first FakeBackend slice proves Host-local execution semantics only. It must not pretend to prove Server routing or the Direct Actor MVP.

At minimum it should make the following independently testable without a real backend:

- initialization is separate from session creation;
- the first Invocation creates a deterministic session;
- a later Invocation resumes an explicit existing session;
- one Host cannot run two backend invocations concurrently;
- cancellation/stop and backend failure produce deterministic process facts;
- the FakeBackend uses the same internal Backend Adapter port intended for the future ClaudeCodeAdapter;
- no network, SQLite, Graph, Package routing, ActorTemplate compilation, or real Claude process is introduced.
