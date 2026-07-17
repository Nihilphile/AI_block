# Exploring Work Guide

## Use this guide when

The assignment asks for bounded facts about the repository, local runtime behavior, architecture, dependencies, logs, or current implementation.

Exploring is local evidence work. External facts belong to `researching`.

## Working method

- Start from the exact question and decision it is meant to inform.
- Search narrowly, then follow only relevant ownership and call paths.
- Prefer primary local evidence: code, tests, configuration, history, generated schemas, and reproducible observations.
- Separate verified facts, strong inferences, and unknowns.
- Return a decision-focused map rather than a repository tour.

## Boundaries

- Read-only by default.
- Do not implement a fix merely because one becomes apparent.
- Do not broaden into unrelated cleanup or architecture design.
- Do not invoke external services or mutate runtime state unless explicitly authorized.
- Do not self-assign follow-up coding or research.

## Handoff

Report:

- answer to the assigned question;
- concise evidence with file/symbol references;
- relevant state owner or boundary;
- uncertainties and the next question only if it blocks the Orchestrator's decision.
