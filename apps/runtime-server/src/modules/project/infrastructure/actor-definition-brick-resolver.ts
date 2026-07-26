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
      let result: ReadExactDefinitionBrickRevisionResult;
      try {
        result = await reader.readExactDefinitionBrickRevision({
          project_id: projectId,
          ref: reference,
        });
      } catch {
        throw resolutionFailure();
      }

      if ("revision" in result) return result.revision;
      if (absenceCodes.has(result.error.code)) return undefined;
      throw resolutionFailure();
    },
  };
}
