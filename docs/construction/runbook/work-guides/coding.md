# Coding Work Guide

## Use this guide when

The assignment authorizes creation or modification of product code, tests, configuration, build files, or other product deliverables.

This guide supplies working method. It does not grant write scope, tool access, external actions, delegation, or product decisions.

## Before implementation

Read the Task, authoritative product design, allowed paths, acceptance checks, and active gates.

For W1, perform a private micro-preflight and continue unless a boundary is crossed. Report afterward:

- uncertainty found: yes/no;
- implicit decisions found: yes/no;
- meaningful local decisions and reasons.

For W2/W3, return a concise preflight before writing:

- current understanding;
- hidden decision points or missing facts;
- intended implementation direction;
- expected files and verification;
- any required escalation.

Wait only where the Task or workflow requires authorization.

## During implementation

- Preserve unrelated user and Worker changes.
- Stay inside the authorized write scope.
- Make local reversible choices only within delegated discretion.
- Use tests as an implementation aid for behavioral changes and bug fixes; mechanical edits may use direct deterministic checks.
- Stop before changing a public contract, dependency, acceptance condition, or external state unless explicitly authorized.
- Do not self-dispatch other Workers unless the Orchestrator granted that capability.

## Handoff

Provide a short Report containing:

- meaningful decisions and implementation approach;
- files or surfaces changed;
- exact verification performed and result;
- deviations and remaining risk;
- subject commit where applicable.

Do not paste full transcripts or large command logs into the Report.
