# HOST-test-002 Boundary Policy for ActorHost Pretest

- owner: workspace boundary verification
- follows: HOST-test-001
- affected modules: ActorHost manifest boundary checker
- workflow: W1
- base reason: this is an exact deterministic checker update required to recognize one already-authorized manifest field
- triggered gates: none
- product baseline: `6022c9c4a2870bf58c6203818fedcb6ff0c64879`

## Objective

Teach the workspace boundary checker to accept only the exact ActorHost clean-state `pretest` prerequisite authorized by HOST-test-001.

## Write scope

The Coder may modify only:

- `scripts/check-workspace-boundaries.mjs`
- `docs/construction/records/actor-host/reports/HOST-test-002-boundary-pretest-policy.coder.md`

## Frozen implementation

- Accept the ActorHost manifest's exact `pretest` value `pnpm --filter @ai-block/runtime-contracts exec tsc -b`.
- Preserve exact checking of the existing ActorHost `test` script and all manifest/dependency/topology rules.
- Do not generalize the checker to accept arbitrary lifecycle scripts, arbitrary package builds, shell chaining, or another workspace dependency.
- Add or retain a deterministic negative probe showing an altered/unexpected ActorHost `pretest` is rejected, if the checker currently has a natural manifest-probe location.
- Do not modify the ActorHost manifest, product/tests, Runtime Contracts, dependencies, lockfile, root scripts, or prior records.
- No Serena memory or `.serena/` inspection. Temporary Superpowers role restrictions apply.

## Acceptance

- Boundary verification accepts the exact authorized ActorHost manifest.
- An absent, altered, broadened, or unexpected `pretest` value is rejected according to the checker's exact manifest policy.
- `pnpm verify` passes at the committed state and leaves the worktree clean.
- Commit only authorized paths with message `test: allow exact actor host pretest boundary`.

## Controller clarification before implementation

The earlier `build` wording was incorrect because Runtime Contracts intentionally has no package-local `build` script. The already committed HOST-test-001 manifest correctly invokes the pinned workspace compiler with `pnpm --filter @ai-block/runtime-contracts exec tsc -b`. That exact command is the only value authorized for the boundary checker.
