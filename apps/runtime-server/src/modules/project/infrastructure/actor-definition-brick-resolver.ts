import {
  decodeContract,
  ReadExactDefinitionBrickRevisionResultSchema,
} from "@ai-block/runtime-contracts";
import type {
  DefinitionBrickRevision,
  ExactBrickRef,
  ProjectId,
  ReadExactDefinitionBrickRevisionCommand,
  ReadExactDefinitionBrickRevisionResult,
} from "@ai-block/runtime-contracts";

type ProjectExactDefinitionBrickReader = Readonly<{
  readExactDefinitionBrickRevision(
    command: ReadExactDefinitionBrickRevisionCommand,
  ): Promise<ReadExactDefinitionBrickRevisionResult>;
}>;

const absenceCodes = new Set([
  "project_not_found",
  "definition_brick_not_found",
  "definition_brick_revision_not_found",
]);

function resolutionFailure(): Error {
  return new Error("Persisted Definition Brick resolution failed.");
}

export function createProjectDefinitionBrickResolver(
  reader: ProjectExactDefinitionBrickReader,
): Readonly<{
  resolveExact(
    projectId: ProjectId,
    reference: ExactBrickRef,
  ): Promise<DefinitionBrickRevision | undefined>;
}> {
  return {
    resolveExact: async (projectId, reference) => {
      try {
        const result: ReadExactDefinitionBrickRevisionResult = await reader.readExactDefinitionBrickRevision({
          project_id: projectId,
          ref: reference,
        });
        const decoded = decodeContract(ReadExactDefinitionBrickRevisionResultSchema, result);
        if (!decoded.ok) throw resolutionFailure();

        if ("revision" in decoded.value) {
          const { brick, revision } = decoded.value;
          if (
            brick.project_id !== projectId
            || brick.brick_id !== reference.id
            || brick.kind !== revision.kind
            || revision.project_id !== projectId
            || revision.brick_id !== reference.id
            || revision.revision !== reference.revision
          ) {
            throw resolutionFailure();
          }
          return revision as DefinitionBrickRevision;
        }
        if (absenceCodes.has(decoded.value.error.code)) return undefined;
        throw resolutionFailure();
      } catch {
        throw resolutionFailure();
      }
    },
  };
}
