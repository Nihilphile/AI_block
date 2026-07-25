# Current Runtime Invariants

> Status: confirmed current cross-module design kernel with explicit target-stage distinctions.
>
> Authority limit: every confirmed-current statement is bounded by current Runtime Contracts, scoped source/tests, and accepted evidence. Target-stage statements are stage markers, not implementation claims.

## Admission rule

A statement belongs here only when it:

1. governs a cross-module value, identity, ownership, dependency, lifecycle boundary, or process interaction;
2. is supported at its stated boundary by current Contracts, scoped source/tests, accepted evidence, or an explicit newer accepted design decision;
3. can be stated without implying broader end-to-end behavior; and
4. is not an implementation absence, deferred intent, draft/open choice, or historical narrative.

Module condition and missing implementation belong in [Project State](../../../project_state/README.md). Accepted-future, draft, proposed, and open material belongs in the [focused future designs](../README.md#focused-future-designs).

## Confirmed current

### Contracts and dependency boundary

1. Runtime Contracts is the sole shared cross-application and cross-process schema/value boundary. It owns validation and serialization, not workflow, persistence, routing, process supervision, or Graph traversal.
2. Runtime identities and Definition Brick/ActorTemplate references are Project-scoped at their Contract and accepted construction boundaries.
3. Applications and infrastructure depend inward through Runtime Contracts and module interfaces. Domain/application code does not depend on HTTP, WebSocket, SQLite, or backend-specific implementation details, and a module mutates only its owned state.

### Package and prompt boundary

4. A Package has one immutable Head and exactly one Body whose value is one root `BrickPrompt`.
5. Composite Package input is represented inside one root composite `BrickPrompt`; it is not represented as multiple Package bodies.
6. Package Body is ordinary model input and cannot become `BrickSysPrompt` or a System Instruction.
7. Mutable route and acknowledgement state belongs to `Delivery`, not to Package identity.

### Actor construction and Host boundary

8. Typed Definition Bricks and ActorTemplates are validated and compiled into immutable, self-contained `ActorConfigSnapshot` revisions with resolved content, provenance, digest, and frozen execution configuration, including `model_id`.
9. Static Snapshot configuration and dynamic Package/Run input remain separate. ActorHost receives Host-side execution configuration and does not read, compile, or assemble ActorTemplate or Definition Bricks.
10. ActorHost separates ServerConnection, BackendSupervisor, and backend-specific adapter concerns. Backend command/session/output behavior stays behind the Backend Adapter boundary.
11. Host initialization prepares the execution environment without creating an empty backend conversation. A real invocation creates or explicitly resumes the backend session.
12. Backend invocations are short-lived, one active invocation is enforced at a time, and an explicit session can be resumed after a backend process exits.

### Host protocol boundary

13. The accepted Host Gateway boundary authenticates and binds Project/Actor/Host-instance identity, enforces generation and directional sequence, sends receipt ACKs, tracks pending commands, injects valid facts through a port, and fails closed on protocol or boundary errors.
14. A Host command ACK confirms receipt, not execution completion. Identity and protocol validation precede backend work, and wire diagnostics are redacted.
15. One registered Host identity represents one Actor at the Host protocol boundary. ActorHosts do not connect to or route Packages directly to other ActorHosts.

## Target-stage distinctions

These distinctions constrain how later designs are read; none is evidence that the target stage is implemented.

1. **Project cardinality:** the broader system target permits one Server to manage multiple active Project Runtimes; Direct Actor MVP acceptance is intentionally one Project at a time.
2. **Graph sequencing:** Graph follows the Direct Actor path. A `GraphInstance` stores Actor references without reserving them; a `GraphRun` is the stage that acquires required Actor leases.
3. **Deployable topology:** the intended process shape is `runtime-cli` → `runtime-server` ↔ `actor-host × N`, while bounded module slices may be accepted before full process composition.
4. **Host reliability:** generation/sequence/receipt-ACK behavior is the accepted walking-skeleton baseline. Heartbeat/reconnect is a later Direct Actor reliability gate; replay, durable outbox, restart reconciliation, and reconstruction belong to a later reliability stage.

## Evidence routes

- [Runtime Contracts state card](../../../project_state/packages/runtime-contracts/README.md)
- [Runtime Server Actor state card](../../../project_state/apps/runtime-server/modules/actor/README.md)
- [Runtime Server Host Gateway state card](../../../project_state/apps/runtime-server/modules/host-gateway/README.md)
- [ActorHost state card](../../../project_state/apps/actor-host/README.md)
- [Runtime Contracts closeout](../../construction/records/runtime-contracts/phase-0b-closeout.md)
- [Reference-only ActorTemplate closeout](../../construction/records/actor-template/reference-only-actor-template-closeout.md)
- [Host Gateway walking-skeleton closeout](../../construction/records/host-gateway/host-gateway-walking-skeleton-closeout.md)
- [ClaudeCodeAdapter closeout](../../construction/records/claude-code-adapter/claude-code-adapter-v0.1-closeout.md)

Detailed chronology remains in construction evidence and [preserved Runtime history](../README.md#preserved-runtime-history), not in this kernel.
