# RC-host-001 Coder Report

- role: coder
- result: completed
- subject commit: same-as-report

## Decisions

- uncertainty found: yes
- implicit decisions found: yes
- decisions made or escalation requested: Applied the Controller-frozen B.3 wire shapes exactly: generic adapter/provider launch wrappers, ActorLaunchSpec, create/resume session directives, InvocationSpec, process facts, InvocationResult, the exact `1.0.0` Host protocol envelope, directional payload unions, ACK/correlation fields, publication/completion requests, session reports, and host faults. Kept adapter configuration as validated B.1 inert `JsonObject` and did not add transport, process, workflow, or Claude behavior. No external Research remained open.

## Work and evidence

Implemented B.3 actor and Host schemas, root exports, focused actor/host tests, package type-test coverage, and B.3 workspace-boundary topology checks. All schemas use TypeBox 1.3.6 and compile through the Ajv main export. Because embedding the existing recursive B.1 schema definitions in multiple B.3 branches creates duplicate Ajv references, the B.3 adapter/provider and fault helpers use unique private recursive definition names while preserving the approved public JSON/error shapes.

TDD evidence:

- RED: the first focused actor/host run failed all 6 tests because the new public schemas were not yet exported and Ajv received `undefined` schemas.
- GREEN: the focused actor/host run passed 2 files and 6 tests; `pnpm test:contracts` passed 8 files and 55 tests, including the explicit TypeScript 7.0.2 NodeNext test compile.
- Compatibility/build: `pnpm build` passed; every public B.3 schema compiled and validated with the Ajv main export, including recursive nested configurations and fault details.
- Boundary: `pnpm check:boundaries` passed with exact B.3 manifests, source/test topology, package-root exports, and existing B.1/B.2 boundary probes.
- Final verification: `pnpm verify` passed at the subject commit, including frozen install, build, focused tests, boundary checks, clean checks, and Git-clean verification.

## Serena construction-tool evaluation

- Availability: Serena MCP was available; the existing project at `F:\AI_project\AI_block` was activated for this task.
- Navigation: used `find_symbol` with the function body for `uniqueErrorEnvelopeSchema` to inspect the precise B.3 helper before refactoring.
- Mutation: used Serena `replace_symbol_body` on that helper to insert the `detailsSchema` symbol and reuse it in the optional `details` field. The operation returned `OK`; the ordinary Git diff was reviewed and the same focused/full tests, type checks, build, and boundary checks remained green.
- Concrete benefit: symbol-aware navigation and replacement targeted one implementation body without broad text matching, while preserving the approved schema shape.
- Friction: the first resumed-context symbol query reported that no Serena project was active; explicit project activation resolved it. No `.serena/` content was inspected or staged, and no memory check was needed for this task.
- Recommendation: keep Serena symbol-aware navigation and mutation enabled for later Runtime Contracts tasks, with ordinary Git diff review and the normal test gates as mandatory validation.

## Deviations and remaining risk

None.
