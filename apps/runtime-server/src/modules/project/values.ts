import {
  BackendBrickBodySchema,
  BrickPromptBodySchema,
  BrickSysPromptBodySchema,
  DefinitionBrickRevisionSchema,
  DefinitionBrickSummarySchema,
  ProjectRecordSchema,
  RuntimeConfigBrickBodySchema,
  ToolsetBrickBodySchema,
  computeDefinitionBrickDigest,
  decodeContract,
  type BrickKind,
  type DefinitionBrickBody,
  type DefinitionBrickDigest,
  type DefinitionBrickRevision,
  type DefinitionBrickSummary,
  type HumanReadableId,
  type PositiveRevision,
  type ProjectId,
  type ProjectRecord,
} from "@ai-block/runtime-contracts";

export function canonicalDefinitionBrickBody(
  kind: BrickKind,
  body: unknown,
): DefinitionBrickBody | undefined {
  const schema = kind === "sys_prompt"
    ? BrickSysPromptBodySchema
    : kind === "prompt"
      ? BrickPromptBodySchema
      : kind === "backend"
        ? BackendBrickBodySchema
        : kind === "toolset"
          ? ToolsetBrickBodySchema
          : RuntimeConfigBrickBodySchema;
  const decoded = decodeContract(schema, body);
  return decoded.ok ? decoded.value as DefinitionBrickBody : undefined;
}

export const runtimeContractsDefinitionBrickDigest = {
  compute(
    kind: BrickKind,
    body: DefinitionBrickBody,
  ): DefinitionBrickDigest {
    return computeDefinitionBrickDigest(kind, body);
  },
};

export function decodeStoredProject(
  value: unknown,
  expectedProjectId: ProjectId,
): ProjectRecord | undefined {
  const decoded = decodeContract(ProjectRecordSchema, value);
  if (!decoded.ok || decoded.value.project_id !== expectedProjectId) return undefined;
  return decoded.value;
}

export function decodeStoredSummary(
  value: unknown,
  expectedProjectId: ProjectId,
  expectedBrickId?: HumanReadableId,
): DefinitionBrickSummary | undefined {
  const decoded = decodeContract(DefinitionBrickSummarySchema, value);
  if (!decoded.ok || decoded.value.project_id !== expectedProjectId) return undefined;
  if (expectedBrickId !== undefined && decoded.value.brick_id !== expectedBrickId) return undefined;
  return decoded.value;
}

export function decodeStoredRevision(
  value: unknown,
  summary: DefinitionBrickSummary,
  expectedRevision?: PositiveRevision,
): DefinitionBrickRevision | undefined {
  const decoded = decodeContract(DefinitionBrickRevisionSchema, value);
  if (!decoded.ok) return undefined;
  const revision = decoded.value;
  if (
    revision.project_id !== summary.project_id
    || revision.brick_id !== summary.brick_id
    || revision.kind !== summary.kind
    || (expectedRevision !== undefined && revision.revision !== expectedRevision)
  ) {
    return undefined;
  }
  return structuredClone(revision) as DefinitionBrickRevision;
}
