# Actor and Host Lifecycle and Recovery

> Overall status: **accepted future boundary** with **target-stage distinctions** and **open launch/recovery decisions**.
>
> Authority: future product-design input only, not implementation authorization. It does not prove current Actor creation, Host startup, recovery, or `model_id` launchability.

## Read contract

- **Owner:** future Actor lifecycle plus the Server/ActorHost launch, liveness, and recovery boundary.
- **Inputs:** accepted immutable Snapshot, Actor/Project identity, launch credentials/workspace, InvocationSpec, and durable Server facts.
- **Outputs:** Actor and ActorPool state, ActorLaunchSpec, Host registration/initialization commands, process/session facts, and reconciliation outcomes.
- **Not owned here:** Project persistence/Brick authoring, Package routing, Run completion, Graph policy, or Client API design.

Current construction and Host protocol constraints are inherited from the [Runtime invariant kernel](../current/runtime-invariants.md).

## Inherited current baseline

- ActorTemplate compilation yields an immutable, self-contained Snapshot with static configuration and provenance.
- ActorHost does not compile Templates or Bricks.
- Host initialization is distinct from backend-session creation.
- Backend invocations are short-lived, one active invocation is enforced, and explicit session resume is supported.
- The Host Gateway baseline binds identity, generation, sequence, receipt ACKs, pending commands, and fact delivery through ports.
- ActorHosts do not route Packages to one another or decide Run/Graph lifecycle.

## Accepted future boundaries

1. Actor creation consumes an accepted Snapshot and creates immutable Actor configuration identity plus ActorPool membership and session/trace references.
2. One active Actor is represented by one dedicated ActorHost identity while its Project Runtime requires the Host.
3. Server-side Actor lifecycle builds Host execution input; ActorHost realizes that input and reports facts without acquiring Server domain authority.
4. Host startup prepares static environment and capability ceiling. The first real Invocation creates a backend session; later Invocations may explicitly resume it.
5. Server owns Host spawn/reconciliation policy, credentials, desired state, and the decision to wake, stop, quarantine, reconstruct, or replace a Host.
6. Heartbeat/reconnect is a Direct Actor reliability boundary; durable replay/outbox, Server restart reconciliation, automatic reconstruction, and a complete crash matrix are later reliability work.

## Open decisions

### Launch

- How frozen Snapshot `model_id` becomes first-class launch configuration.
- Whether `ActorLaunchSpec` is versioned to carry `model_id` directly or launchability is resolved through another typed compatibility contract.
- Which owner wires the executable Host startup and adapter registry.
- How Project/Actor/Host-instance identity, token, workspace, backend selection, and capability inputs are supplied and validated.
- What launch-compatibility failure means for Actor and Run state.

These `model_id` and launch seams remain in this file; they do not create a separate model-selection design.

### Recovery

- Minimum heartbeat and reconnect handshake required for Direct Actor MVP.
- Higher-generation replacement, sequence reconciliation, replay, durable outbox, and pending-Hello liveness.
- Server restart reconstruction and which Host/session facts are durable versus reconstructible.
- Run/lease/session outcomes for Host disconnect, backend process death, invalid session, failed resume, quarantine, and Server restart.
- Whether a backend session survives Graph changes, Actor rebind, or Host replacement.
- Graceful versus forced Project Runtime deactivation for active/waiting Actors and Hosts.

No recovery matrix outcome is selected here. In particular, ActorHost never resumes autonomously because an inbox contains a Package; Server/Run authority decides wake-up and sends a new Invocation.
