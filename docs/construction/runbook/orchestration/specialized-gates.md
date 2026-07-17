# Specialized Gates

Load this file when a classification question indicates that the base workflow may be insufficient. Record only gates whose binary trigger is true.

## Research

Trigger: Does the work depend on an unresolved external behavior, version, interface, or factual claim?

Effect: assign bounded `researching` work and return a decision-focused evidence brief. Wait only when the missing fact blocks the active write.

## Controlled Probe

Trigger: Are documents insufficient, and can an empirical probe consume quota, contact a real service, or mutate external state?

Effect: obtain explicit authorization, bound cost and state effects, define success criteria, and retain the result as evidence.

## Compatibility

Trigger: Does the work change a runtime dependency, toolchain, supported runtime, serialized format, protocol version, or externally consumed compatibility surface?

Effect: verify exact relevant versions, reproducibility, and affected consumers. Add Research only when facts remain unresolved.

## Independent Test

Trigger for W1/W2: Does the change affect public behavior, lack credible self-test coverage, or alter security, concurrency, persistence, or recovery behavior?

Effect: assign `testing` against the committed subject. W3 already includes integrated independent testing.

## Early Review

Trigger: Would waiting for normal module acceptance cause substantial rework because a boundary is about to be consumed, sensitive semantics must freeze, Workers disagree, tests cannot settle the issue, or repeated drift has appeared?

Effect: assign focused `reviewing` before dependent construction continues. Later review need not repeat unchanged accepted material.

## Security Review

Trigger: Does the work change authentication, authorization, credentials, secrets, executable capabilities, sandboxing, or a trust boundary?

Effect: require threat-oriented independent testing and review. Verify privilege and failure behavior, not only happy paths.

## Recovery

Trigger: Can the work transform or destroy persisted state, perform a non-idempotent destructive action, or leave the system difficult to restore?

Effect: define rollback or forward recovery before the risky step, authorize irreversible actions at the point of execution, and independently verify preconditions and postconditions.

## Gate discipline

- A gate adds only the control it names.
- A control already supplied by the base workflow is not duplicated.
- “Important” and “to be safe” are not valid triggers.
- Gates do not grant a Worker authority beyond its Task.
