---
module: Runtime CLI
implementation_state: partial
work_state: deferred
source_roots:
  - apps/runtime-cli/src/
test_roots: []
---

# Runtime CLI

## Intent

Runtime CLI is a stateless Client of the Runtime Server API. It may provide user-facing sugar, but semantic Actor input still becomes a Package. It must not read Server persistence directly, import Server implementation internals, or invoke ActorHost directly.

## Implemented today

The current package contains only `apps/runtime-cli/src/main.ts`, a type-only Runtime Contracts consumer fixture exporting `RuntimeContractsConsumerFixture`. It has no executable entrypoint, argument parser, command dispatch, Server transport, authentication/discovery, output/error convention, Package creation path, Run status path, or result subscription. The package has no test root or package-local test script; the current scoped TypeScript check passes.

## Boundary and dependencies

The only current dependency direction is Runtime CLI → `@ai-block/runtime-contracts`. The future Client boundary is CLI → Server API → Server-owned state. The Server API surface and first supported command are not accepted in the current source, so this card does not invent commands or a transport Contract.

## Current condition

The workspace/type-consumer fixture is present, but the user-facing CLI surface is deferred. This is not a runtime failure or blocker; a meaningful CLI slice requires an explicitly accepted Client–Server API boundary and first command.

## Read next

- [Root state route](../../../project_state/README.md), [authority](../../../project_state/_meta/authority.md), and [system map](../../../project_state/_meta/system-map.md)
- [CLI source](../../../apps/runtime-cli/src/) and [package metadata](../../../apps/runtime-cli/package.json)
- [Runtime Contracts card](../../../project_state/packages/runtime-contracts/README.md)
- [Runtime module architecture](../../../runtime-module-architecture-v0.1.md) for Client boundary intent
- [Runtime system architecture](../../../runtime-system-architecture-v0.1.md) for process topology intent

## Evidence

- Source: [`apps/runtime-cli/src/`](../../../apps/runtime-cli/src/)
- Configuration: [`apps/runtime-cli/package.json`](../../../apps/runtime-cli/package.json) and [`apps/runtime-cli/tsconfig.json`](../../../apps/runtime-cli/tsconfig.json)
- Test condition: no `apps/runtime-cli/test/` directory exists in the current fork; TypeScript-only verification is the current evidence
