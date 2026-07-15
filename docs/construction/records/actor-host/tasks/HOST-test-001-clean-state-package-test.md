# HOST-test-001 Clean-state ActorHost Package Test

- owner: ActorHost
- follows: HOST-transport-002
- affected modules: ActorHost test command; Runtime Contracts build as a prerequisite only
- workflow: W1
- base reason: this is an exact reversible manifest-script correction with direct deterministic verification and no product behavior change
- triggered gates: none
- product baseline: `6f2944d`

## Objective

Make `pnpm --filter @ai-block/actor-host test` pass after `pnpm clean` by explicitly building the ActorHost workspace dependency before its existing test command.

## Write scope

The Coder may modify only:

- `apps/actor-host/package.json`
- `docs/construction/records/actor-host/reports/HOST-test-001-clean-state-package-test.coder.md`

## Frozen implementation

- Add an ActorHost `pretest` lifecycle script that runs the existing Runtime Contracts package build through pnpm workspace filtering.
- Do not change the existing ActorHost test body, test files, source, Runtime Contracts source/config, root scripts, dependencies, or lockfile.
- The prerequisite may create Runtime Contracts `dist` as a normal local build artifact. Root cleanup remains authoritative and must remove generated output.
- Do not introduce environment flags, aliases, source-import substitution, conditional skip logic, or another test path.
- No Serena memory or `.serena/` inspection. Temporary Superpowers role restrictions apply.

## Acceptance

- `pnpm clean` succeeds.
- Without a separate manual build, `pnpm --filter @ai-block/actor-host test` succeeds and runs all existing ActorHost tests and the no-emit check.
- The prerequisite builds only the Runtime Contracts dependency required by ActorHost tests.
- `pnpm verify` passes and leaves generated output cleaned and the worktree clean after commit.
- No dependency or lockfile change occurs.
- Commit only authorized paths with message `test: make actor host tests clean-state safe`.
