import type { ProjectDefinitionBrickError } from "@ai-block/runtime-contracts";

export type ProjectApplicationErrorResult = Readonly<{
  error: ProjectDefinitionBrickError;
}>;

export class ProjectOperationAbort extends Error {
  public constructor(public readonly operationError: ProjectDefinitionBrickError) {
    super(operationError.code);
  }
}

export function abortProjectOperation(error: ProjectDefinitionBrickError): never {
  throw new ProjectOperationAbort(error);
}

export function projectNotFoundError(): ProjectDefinitionBrickError {
  return { code: "project_not_found", category: "not_found" };
}

export function definitionBrickAlreadyExistsError(): ProjectDefinitionBrickError {
  return { code: "definition_brick_already_exists", category: "conflict" };
}

export function definitionBrickNotFoundError(): ProjectDefinitionBrickError {
  return { code: "definition_brick_not_found", category: "not_found" };
}

export function definitionBrickRevisionNotFoundError(): ProjectDefinitionBrickError {
  return { code: "definition_brick_revision_not_found", category: "not_found" };
}

export function definitionBrickRevisionConflictError(): ProjectDefinitionBrickError {
  return { code: "definition_brick_revision_conflict", category: "conflict" };
}

export function definitionBrickArchivedError(): ProjectDefinitionBrickError {
  return { code: "definition_brick_archived", category: "conflict" };
}

export function definitionBrickInvalidCandidateError(): ProjectDefinitionBrickError {
  return { code: "definition_brick_invalid_candidate", category: "validation" };
}

export function definitionBrickIntegrityError(): ProjectDefinitionBrickError {
  return { code: "definition_brick_integrity_error", category: "integrity" };
}

export function persistenceFailureError(): ProjectDefinitionBrickError {
  return { code: "persistence_failure", category: "persistence" };
}

export function errorResult(error: ProjectDefinitionBrickError): ProjectApplicationErrorResult {
  return { error };
}
