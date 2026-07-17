# Testing Work Guide

## Use this guide when

The assignment requests independent verification of a committed implementation or integrated deliverable.

## Inputs

Testing should receive:

- exact subject commit or artifact;
- acceptance conditions and active gates;
- relevant design/contract references;
- known environment constraints;
- explicit permission if test files themselves may be modified.

## Working method

- Treat the subject as immutable unless write permission is explicit.
- Verify observable behavior and relevant failure paths.
- Run the smallest credible suite first, then the required integrated checks.
- Distinguish product failure, test failure, environment failure, acceptance ambiguity, and insufficient evidence.
- Retain concise reproducible evidence.

## Boundaries

- Do not fix product code.
- Do not approve your own test modifications as independent evidence.
- Do not review implementation style unless it directly invalidates behavior or testability.
- Do not transfer a result to a materially different subject commit.

## Handoff

Report subject identity, checks performed, results, failure classification, evidence location, coverage limits, and remaining risk.
