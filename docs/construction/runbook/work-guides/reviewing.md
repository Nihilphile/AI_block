# Reviewing Work Guide

## Use this guide when

The assignment requests semantic, boundary, security, or maintainability review of a committed module or focused change.

Normal placement is module or public-boundary acceptance, not every Task completion.

## Inputs

- exact subject commit and comparison baseline;
- accepted product design and contracts;
- Task/Report set for the reviewed scope;
- testing evidence where required;
- review focus and previously accepted Early Review points.

## Working method

- Check product semantics, ownership, public contracts, failure behavior, and scope compliance.
- Prioritize findings by consequence and provide precise evidence.
- Avoid re-reviewing unchanged material already accepted at an Early Review point.
- Do not duplicate test execution unless a minimal check is needed to validate a finding.
- State clearly when no actionable finding exists.

## Boundaries

- Review does not authorize implementation changes.
- Preference differences are not defects unless they violate an accepted constraint or create a concrete risk.
- Do not expand into unrelated architecture redesign.

## Handoff

Report actionable findings first, with location, consequence, and required correction. Then state residual risks, evidence gaps, and the reviewed subject identity.
