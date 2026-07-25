# Runtime Module Architecture v0.1

> Status: design approved for written review
>
> Scope: module boundaries, deployable processes, Direct Actor MVP, and implementation sequencing
>
> Technology baseline: TypeScript, Node.js, SQLite, local HTTP/SSE, and ActorHost WebSocket

This document turns the existing Runtime Object Model and Runtime System Architecture into an implementable module architecture. It is authoritative for module ownership and MVP scope. Where it conflicts with older documents on Graph binding or Package body shape, this document records the newer decision.

## 1. Architecture outcome

The runtime is a modular monolith on the Server side with a separate process for every ActorHost.

There are three deployable programs:

```text
runtime-cli
runtime-server
actor-host × N
```

The system has five product capabilities:

1. Server–Host execution architecture
2. Actor construction from typed Bricks
3. Package storage and information flow
4. Run lifecycle coordination
5. Graph orchestration

Graph is not part of the first MVP. The MVP proves the complete Direct Actor path first.

## 2. Architectural invariants

1. `Project` is the top-level ownership and resource boundary.
2. `ActorTemplate` is compiled into an immutable `ActorConfigSnapshot`.
3. `ActorHost` never reads or assembles an `ActorTemplate`.
4. One Actor has one long-lived ActorHost while its Project Runtime is active.
5. An ActorHost may launch many short-lived Claude Code `-p` processes over time.
6. A Claude Code session can survive the exit of an individual `-p` process.
7. The first real Package creates the backend session; Host startup only prepares the execution environment.
8. Every Client-to-Actor and Actor-to-Actor semantic input is a Package.
9. Every Package has exactly one Body, and that Body is exactly one root `BrickPrompt`.
10. A composite Package body is represented by a root composite `BrickPrompt`, not multiple Package bodies.
11. A Package body can enter ordinary model input but cannot become a `BrickSysPrompt`.
12. Tools, Skills, MCP servers, backend, and System Instructions are fixed by the Actor snapshot for the ActorHost lifetime.
13. Graph- or Run-specific policy may restrict a static tool endpoint, but cannot add tools beyond the Actor snapshot.
14. ActorHosts never route Packages directly to other ActorHosts.
15. Server is authoritative for Package storage, routing, Run state, Actor lease, and wake-up decisions.
16. A waiting Actor remains leased to its current Run even when no Claude Code process is running.
17. A GraphInstance stores Node-to-Actor references but does not reserve those Actors.
18. A GraphRun atomically acquires its GraphInstance Actors when the Run starts.
19. Modules may mutate only the state they own.
20. Infrastructure adapters may depend on domain/application modules; domain modules do not depend on HTTP, WebSocket, SQLite, or Claude Code details.

## 3. Deployable process boundaries

### 3.1 Runtime CLI

The CLI is a stateless Client of the Server API. It does not read Server persistence directly and does not invoke ActorHost directly.

Initial command surface:

```text
server start
project create
project activate
actor create
run --actor <actor-id> --prompt <text>
run --actor <actor-id> --package <package-id>
run status <run-id>
package get <package-id>
actor trace <actor-id>
```

`--prompt` is only CLI sugar. The CLI or Server first converts the text into a Package, so there is no second input path that bypasses Package semantics.

### 3.2 Runtime Server

The Server is one local daemon and the only authoritative coordinator. It exposes:

- local HTTP commands for CLI operations
- SSE for Run and Actor status updates
- one WebSocket endpoint for all ActorHosts
- one SQLite-backed persistence boundary

The Server is a modular monolith: modules use in-process typed interfaces but cannot directly mutate each other's tables or repositories.

### 3.3 ActorHost

Each ActorHost represents exactly one Actor. It contains two principal components:

```text
ActorHost
├── ServerConnection
│   ├── registration and authentication
│   ├── heartbeat and reconnect
│   ├── command and Package reception
│   ├── ACK handling
│   └── local Inbox/Outbox
│
└── BackendSupervisor
    ├── realize ActorLaunchSpec
    ├── prepare Skill/MCP/Tool configuration
    ├── launch and stop Claude Code processes
    ├── create or resume backend sessions
    ├── monitor process facts
    └── report session and process state
```

ActorHost does not decide Graph routing, Run completion, Package permissions, or Actor wake-up conditions.

## 4. Runtime Contracts

`Runtime Contracts` is a small shared package imported by Server modules, ActorHost, CLI, and tests. It contains schemas and value types only; it owns no persistence or business workflow.

It defines:

- identifiers and version fields
- Brick schemas
- Package, PackageHead, PackageRef, and Delivery schemas
- ActorLaunchSpec
- InvocationSpec and InvocationResult
- Host commands, Host reports, ACKs, and error codes
- public state enums

It must not contain:

- repositories or database access
- Graph traversal
- ActorTemplate compilation
- process management
- Server orchestration

Contract changes require architecture review because they affect independently developed modules.

## 5. Server modules

### 5.1 Project Module

Owns:

- Project metadata
- Project desired state: active or inactive
- Project Runtime activation state
- Project resource namespace

Responsibilities:

- create and load Projects
- activate and deactivate a Project Runtime
- request ActorHost reconciliation for active Projects
- enforce Project ownership at module entry points

It does not manage Claude Code processes or Package routing.

### 5.2 Actor Module

Owns:

- Brick definitions and version references
- ActorTemplate
- ActorConfigSnapshot
- Actor
- ActorPool membership and Actor availability
- ActorTrace
- backend session reference associated with an Actor

Internal components:

```text
ActorCompiler
  ActorTemplate → validation → ActorConfigSnapshot

LaunchSpecBuilder
  ActorConfigSnapshot → ActorLaunchSpec

InvocationComposer
  ActorConfigSnapshot + input Packages + RunContext
  → InvocationSpec
```

The Actor Module performs semantic composition. It determines the ordered `BrickSysPrompt` set, static tool environment, and how accepted Package bodies become one invocation root `BrickPrompt`.

Primary interface:

```text
compileTemplate(templateId) -> ActorConfigSnapshot
createActor(snapshotId) -> Actor
getActor(actorId) -> ActorView
buildLaunchSpec(actorId) -> ActorLaunchSpec
composeInvocation(actorId, packageRefs, runContext) -> InvocationSpec
appendTraceInput(actorId, invocationId, sessionId, packageRefs)
appendTraceOutput(actorId, invocationId, sessionId, packageRefs)
```

ActorTrace is a historical index, not an event-sourcing system. It records:

- every backend session ID used by the Actor
- every Invocation and its session ID
- accepted Package IDs or refs
- emitted Package IDs or refs

Trace references PackageStore content; it does not duplicate Package bodies.

### 5.3 Package Module

Owns:

- PackageStore
- immutable Package records
- PackageRef
- Delivery and delivery acknowledgement
- Package provenance and lineage
- Package publication idempotency

Package shape:

```text
Package
├── Head
│   ├── package_id
│   ├── package_type
│   ├── schema_version
│   ├── project_id
│   ├── created_by
│   ├── created_at
│   ├── content_hash
│   └── provenance
└── Body: BrickPrompt
```

The Head describes Package identity and semantic origin. Mutable routing information belongs to Delivery, not to Package identity.

Primary interface:

```text
createPackage(headDraft, body) -> Package
getPackage(packageId) -> Package
getPackages(packageRefs) -> Package[]
publishFromActor(actorContext, packageDraft, idempotencyKey) -> Package
createDelivery(packageRef, routeContext) -> Delivery
ackDelivery(deliveryId, actorContext)
listInbox(actorId, runId) -> Delivery[]
```

The MVP exposes a restricted local Actor Package MCP through ActorHost:

```text
package.publish
runtime.complete
```

The MCP never gives the LLM a Server credential. ActorHost attaches the authoritative Actor, Run, and Invocation identity.

### 5.4 Host Gateway Module

Owns:

- live ActorHost connections
- Actor-to-ActorHost registry
- connection generation and heartbeat state
- pending Host commands and ACK state
- desired ActorHost initialization state

Responsibilities:

- authenticate ActorHost registration
- ensure one Host represents one Actor
- send `InitializeActorHost`
- send `StartInvocation`, `StopInvocation`, and `ShutdownHost`
- receive session reports, process facts, completion requests, and Package publication requests
- reconcile reconnecting Hosts with Server desired state

It does not assemble ActorTemplate or decide when a Run should advance.

### 5.5 Run Engine

Owns:

- Run
- ActorInvocation
- Actor leases held by Runs
- Run and Invocation state transitions
- waiting conditions and wake-up decisions
- Run-level error, cancellation, and completion state

DirectRun flow:

```text
Actor ID + input Package refs
→ acquire Actor lease
→ ActorModule.composeInvocation
→ HostGateway.startInvocation
→ collect Package refs and Host facts
→ complete, wait, fail, or cancel
```

Run Engine coordinates modules only through their typed interfaces. It cannot write Actor, Package, Graph, or Host tables directly.

### 5.6 Graph Module

The Graph Module is implemented after the Direct Actor MVP.

Owns:

- GraphTemplate and revisions
- GraphInstance
- Node definitions
- Node-to-Actor references
- Connections
- GraphPolicy
- Graph evaluation state required by a GraphRun

Object sequence:

```text
GraphTemplate
  + complete Node-to-Actor bindings
  → GraphInstance with graph_id

GraphInstance
  + input Packages
  → GraphRun
```

A GraphInstance binding is a reference, not a reservation. Run Engine acquires all required Actor leases at GraphRun start. If any required Actor cannot be acquired, the first Graph version rejects the Run without partially starting it. Queueing is deferred until after the first Graph version.

Graph Module returns orchestration decisions such as:

```text
invoke(nodeId, actorId, packageRefs)
wait(condition)
complete(resultPackageRefs)
fail(reason)
```

It never launches ActorHost or backend processes directly.

## 6. Dependency direction

The allowed Server dependency direction is:

```text
Runtime Contracts
    ↑
Project / Actor / Package / Graph / Host Gateway
    ↑
Run Engine
    ↑
Server Application and Control API
```

Persistence adapters implement repository interfaces owned by each module. The Server Application is the composition root and owns no domain state.

Forbidden dependencies include:

- Actor Module importing Host process implementation
- Host Gateway parsing ActorTemplate
- Package Module deciding Graph routes
- Graph Module invoking ActorHost directly
- Run Engine directly updating another module's database tables
- ActorHost connecting to another ActorHost

## 7. Actor and Invocation composition

Actor construction is static after snapshot creation:

```text
typed Bricks
→ ActorTemplate
→ ActorCompiler
→ immutable ActorConfigSnapshot
→ Actor
```

Initial Brick families:

- `BrickSysPrompt`: content authorized for System Instruction
- `BrickPrompt`: renderable ordinary model input
- `BackendBrick`: Claude Code backend configuration
- `ToolBrick`: Skills, MCP servers, built-in tools, and launch environment
- Trace initialization: creates an empty ActorTrace for the Actor instance

`BrickSysPrompt`, backend, and tools are static for the ActorHost lifetime. Package bodies and resolved invocation prompts are dynamic.

Multiple accepted Packages are composed into exactly one invocation root `BrickPrompt`, normally a composite BrickPrompt. Package order and rendering are decided by the Actor Module's InvocationComposer, not by ActorHost.

## 8. ActorHost lifecycle

### 8.1 Host initialization

```text
Project Runtime activates Actor
→ Server starts ActorHost
→ Host registers actor_id
→ Host Gateway validates binding
→ Actor Module builds ActorLaunchSpec
→ Host Gateway sends InitializeActorHost
→ Host prepares workspace, Skills, MCP, and tools
→ Host reports ready
```

This phase does not create an empty backend conversation.

### 8.2 First real Invocation

```text
input Package arrives
→ Run Engine creates DirectRun and ActorInvocation
→ Actor Module composes InvocationSpec
→ Host receives StartInvocation(session=create)
→ Host launches Claude Code -p
→ Host records returned session ID
→ Host reports session ID to Server
```

### 8.3 Waiting and resume

```text
Claude Code process exits after requesting or waiting for more work
→ ActorHost remains connected
→ backend session ID remains stored
→ Actor remains leased to its Run
→ Server receives a matching Package
→ Run Engine decides to wake the Actor
→ Host receives StartInvocation(session=resume)
→ Host launches a new Claude Code --resume ... -p process
```

ActorHost may buffer acknowledged local messages for reconnect safety, but it cannot autonomously resume merely because its Inbox contains a Package.

## 9. Persistence and state ownership

The MVP uses SQLite behind module-owned repository interfaces. A single physical database is allowed, but table ownership remains strict.

| State | Owning module |
|---|---|
| Project desired state | Project Module |
| ActorTemplate, snapshot, Actor, ActorTrace, session ref | Actor Module |
| Package, PackageRef, Delivery | Package Module |
| Run, ActorInvocation, Actor lease | Run Engine |
| GraphTemplate, GraphInstance, GraphPolicy | Graph Module |
| Host connection and command ACK state | Host Gateway |

Runtime Contracts owns no state.

## 10. Direct Actor MVP

### 10.1 Included

- TypeScript and Node.js workspace
- Runtime Contracts package with runtime schema validation
- local Server daemon
- one Project at a time
- Project activation
- minimal ActorTemplate compilation
- ActorConfigSnapshot and Actor creation
- `BrickSysPrompt`, `BrickPrompt`, `BackendBrick`, and `ToolBrick`
- strict Package Head plus one BrickPrompt Body
- SQLite persistence
- one ActorHost per Actor
- ActorHost WebSocket registration, heartbeat, and reconnect handshake
- ActorHost initialization from ActorLaunchSpec
- Claude Code backend adapter
- first Package creates the session
- later Invocation resumes the existing session
- DirectRun and one-Actor lease
- busy Actor returns a stable rejection in the first version
- minimal `package.publish` and `runtime.complete` Actor tools
- ActorTrace session and Package reference history
- CLI commands required for the end-to-end acceptance path
- automated contract, unit, and integration tests

### 10.2 Explicitly excluded

- Graph execution
- automatic Actor-to-Actor delegation
- multiple active Projects
- dynamic Tool installation
- light fork or full fork
- cross-machine ActorHost
- automatic Actor replacement
- complex permission administration
- Package garbage collection
- full crash-recovery matrix
- event-sourced Trace
- partial Graph activation

These exclusions are deliberate sequencing decisions, not incomplete requirements.

## 11. MVP acceptance path

The MVP is accepted only when this full path passes automatically and manually:

1. Start the local Server daemon.
2. Create and activate one Project.
3. Create an Actor from a minimal ActorTemplate.
4. Server starts and initializes the Actor's ActorHost without creating an empty Claude Code conversation.
5. Execute `run --actor <id> --prompt <text>`.
6. The text becomes an immutable input Package with one BrickPrompt Body.
7. Run Engine acquires the Actor lease and creates an ActorInvocation.
8. Actor Module composes one InvocationSpec.
9. ActorHost launches Claude Code and creates the first backend session.
10. The Actor publishes a result Package and requests completion through the restricted Host bridge.
11. Server persists the result Package, completes the Invocation and Run, and releases the Actor lease.
12. ActorTrace contains the session ID plus input and output Package refs.
13. A second DirectRun for the same Actor resumes the existing backend session.
14. The CLI can retrieve Run status, result Package, and ActorTrace.
15. Contract, unit, and integration test suites pass.

## 12. Error handling required by the MVP

The MVP must return stable typed errors for:

- invalid or incompatible ActorTemplate
- ActorHost unavailable
- Actor busy
- Package not found or content hash mismatch
- Host initialization failure
- Claude Code executable missing
- backend session creation failure
- backend resume failure
- Host disconnect during Invocation
- invalid Package publication request
- Invocation timeout or non-zero backend exit

The first version may fail a Run rather than automatically recover, but failure state and diagnostic facts must be persisted.

## 13. Testing requirements

The Runtime implementation requires:

- Contract schema tests for all cross-process messages
- ActorCompiler and InvocationComposer unit tests
- Package immutability, hash, provenance, and idempotency tests
- Run and ActorInvocation state-transition tests
- Host Gateway protocol and reconnect tests
- ActorHost tests against a deterministic fake backend
- end-to-end Direct Actor tests using the fake backend
- an opt-in real Claude Code smoke test that is not required for the deterministic default suite

Development-agent roles, authorization gates, and execution workflow are construction concerns and are specified separately in `development-orchestration-runbook-v0.1.md`.

## 14. Delivery phases

### Phase 0: Contract freeze

Define and test the minimal Brick, Package, ActorLaunchSpec, InvocationSpec, and Host Protocol schemas.

### Phase 1: Walking skeleton

In parallel:

- Actor compiler and InvocationComposer against fixtures
- Server–Host–Claude Code `-p` path using a hand-authored LaunchSpec
- PackageStore and restricted Package bridge
- DirectRun and CLI against mocked module interfaces

### Phase 2: Direct Actor integration

Replace fixtures and mocks with real module interfaces, then pass the complete MVP acceptance path.

### Phase 3: Reliability hardening

Add command ACK, idempotency, Host outbox, reconnect reconciliation, and Server restart recovery.

### Phase 4: Graph

Implement GraphTemplate, GraphInstance, Node-to-Actor bindings, GraphRun, Package routing, and GraphPolicy on top of the proven Direct Actor runtime.

## 15. Compatibility notes for earlier documents

The following newer decisions should be synchronized into the older object and system architecture documents later:

1. Graph binding is split into GraphTemplate, bound GraphInstance, and GraphRun. GraphInstance stores Actor references; GraphRun acquires leases.
2. Package has a strict single Body whose type is one root `BrickPrompt`.
3. Package routing metadata belongs to Delivery rather than mutable Package identity.
4. ActorTemplate is assembled from typed Bricks and compiled into ActorConfigSnapshot.
5. ActorHost initializes from ActorLaunchSpec and creates the backend session lazily on the first real Package.
6. ActorTrace is a historical index of session IDs, Invocations, and Package refs; Trace Events are deferred.
