# AI_block North Star

> Authority: long-term product direction and product-level trade-offs.
>
> This file does not define current Runtime behavior, settle detailed product
> semantics, or authorize implementation. Accepted designs and OpenSpec changes
> govern their approved scope; Runtime Contracts, source, and tests govern
> executable truth.

## Founding thesis

High-capability LLMs already possess substantial planning, decomposition, and
organizational intelligence. A heavy, predetermined Harness can constrain that
intelligence instead of improving it. Lower-cost or less autonomous models often
benefit from much stronger Harness: bounded roles, selected context, tools,
output constraints, workflow gates, and verification.

The control plane and the worker plane therefore need different support:

- a high-autonomy Orchestrator needs rich, timely, verifiable information and
  lightweight composable actions;
- a Worker needs the amount and form of Harness appropriate to its capability,
  cost, role, and current task.

The Orchestrator's central shortage is usually not another mandatory reasoning
procedure. It is information with enough quality, provenance, and relevance to
make a sound decision.

This asymmetry is a design philosophy, not a permanent ranking of model brands
or a requirement that every deployment use weaker Workers.

## Product vision

AI_block is an organization-and-execution Runtime for an Agent Orchestrator.

It gives the Orchestrator the means to turn its understanding of a task into a
real, task-shaped organization of AI Actors: construct suitable Worker
Harnesses, choose models and capabilities, establish collaboration and
information routes, run the resulting organization, observe its state, and
adapt it as new information returns.

The primary user is the Agent Orchestrator. Humans remain the ultimate operator
and authority, while human-facing and programmatic Clients may expose the same
Runtime capabilities.

The shortest statement of the North Star is:

> AI_block lets an Agent Orchestrator rapidly assemble and operate a controlled
> AI organization shaped by the task, rather than forcing the task through a
> prewritten workflow.

## Product promise

AI_block should let an Orchestrator:

- use one Actor directly when one bounded Worker is sufficient;
- assemble multiple Actors into a task-specific Graph when coordination adds
  value;
- build and apply different Harnesses for different Worker models and roles;
- move tasks, information, evidence, and results through explicit Packages;
- grant only the communication, tool, and delegation authority required for the
  current organization;
- treat Actor identity separately from a backend process or model session;
- pause, resume, inspect, and eventually recover execution without turning
  backend process lifetime into product identity;
- preserve useful Actor and Graph definitions for reuse without making a
  pre-existing template mandatory for every task;
- receive enough state and provenance to revise its organization as the task
  evolves.

## Non-negotiable product principles

### Orchestrator-first

The Runtime exposes composable organizational and execution primitives. It does
not replace the Orchestrator's judgment with one built-in theory of how work
must be decomposed.

### Information-rich control plane

The Orchestrator should obtain concise, relevant, inspectable information before
being asked to decide. The Runtime should return state, evidence, references,
and outcomes rather than requiring the Orchestrator to infer them from hidden
shared context.

### Harness where it creates leverage

Harness is applied deliberately to Workers and execution boundaries. More
procedure is not automatically better, and the same Harness is not assumed to
fit every model, role, or task.

### Task-shaped organization

A direct Actor call is a first-class path. Graph orchestration is available when
the task needs it, not a ceremony imposed on all work. Reusable Graphs capture
valuable organizations; they do not become the only organizations the
Orchestrator may create.

### Explicit information and authority flow

Actor collaboration occurs through explicit Package and routing boundaries.
Permissions, delegation, and visibility are enforced by the Runtime rather than
left solely to prompt convention.

### Runtime governance without reasoning takeover

The Runtime owns identity, isolation, lifecycle, delivery, policy enforcement,
resource boundaries, observability, and recovery. These constraints make the
Orchestrator's decisions executable and governable; they do not prescribe its
reasoning process.

### Model and backend plurality

Actor semantics are not the semantics of one vendor, model, CLI, process, or
session. The architecture may optimize for heterogeneous capability and cost,
but it must not collapse Actor identity into a particular backend.

### Progressive complexity

The system should remain useful at the smallest complete level and add
coordination only as needed:

```text
Direct Actor
  -> multiple Actors
  -> Graph-managed collaboration
  -> delegated and adaptive organization
```

## Product boundary

The product includes the Runtime concepts and services required to construct,
instantiate, govern, and execute Actor-based organizations. Project, Actor,
Brick, Package, Run, Graph, Server, Host, and Client belong here when they serve
that Runtime responsibility.

The repository's construction facilities do not belong to the AI_block product:

- `project_state/`;
- the Construction Runbook and Worker Guides;
- Orchestrator handoff files;
- OpenSpec and construction records.

They help build AI_block and may experiment with related ideas, but they are not
Runtime modules or product capabilities. A future Project State Skill would be
a separate product that could be used alongside AI_block.

## What AI_block is not

AI_block is not:

- one mandatory Explorer-Planner-Coder-Reviewer pipeline;
- a fixed low-code workflow editor with Agents inserted into boxes;
- a prompt-only multi-Agent chat convention;
- a process manager whose product identity is a Claude Code or Codex session;
- a system that treats all models as interchangeable or equally autonomous;
- a substitute for the Orchestrator's judgment;
- the Project State or construction-documentation system used by this
  repository.

## Directional success

AI_block is moving toward its North Star when a capable Orchestrator can:

1. obtain the information needed to understand the task and available
   resources;
2. choose the smallest sufficient organization;
3. construct or select suitable Actor Harnesses and collaboration boundaries;
4. execute that organization across heterogeneous models and backends;
5. observe explicit state, evidence, cost, and outcomes;
6. reorganize when new information changes the plan;
7. do so without requiring every workflow to have been encoded in advance.

An implementation that adds more workflow machinery but reduces the
Orchestrator's ability to make informed, task-specific organizational decisions
is moving away from the North Star.
