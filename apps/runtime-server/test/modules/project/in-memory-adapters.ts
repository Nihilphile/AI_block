import type {
  CanonicalTimestamp,
  DefinitionBrickId,
  DefinitionBrickRevision,
  DefinitionBrickRevisionId,
  DefinitionBrickSummary,
  HumanReadableId,
  PositiveRevision,
  ProjectId,
  ProjectRecord,
} from "@ai-block/runtime-contracts";
import {
  runtimeContractsDefinitionBrickDigest,
  type DefinitionBrickAppendWriteResult,
  type DefinitionBrickArchiveWriteResult,
  type DefinitionBrickCreateWriteResult,
  type ProjectCreateWriteResult,
  type ProjectModulePorts,
  type ProjectUnitOfWork,
  type ProjectUnitOfWorkPort,
} from "../../../src/modules/project/index.js";

export type InMemoryProjectFailurePoint =
  | "project.create.after_write"
  | "brick.create.after_reserve"
  | "brick.append.after_write"
  | "brick.archive.after_write";

export type InMemoryProjectAdaptersOptions = Readonly<{
  projectIds: readonly ProjectId[];
  brickIds: readonly DefinitionBrickId[];
  revisionIds: readonly DefinitionBrickRevisionId[];
  timestamps: readonly CanonicalTimestamp[];
  failures?: readonly InMemoryProjectFailurePoint[];
}>;

type StoredBrick = {
  summary: DefinitionBrickSummary;
  revisions: DefinitionBrickRevision[];
};

type State = {
  projects: Map<ProjectId, ProjectRecord>;
  namespace: Set<string>;
  bricks: Map<string, StoredBrick>;
};

export type InMemoryProjectAdapters = Readonly<{
  ports: ProjectModulePorts;
  calls: {
    uowRuns: number;
    commits: number;
    rollbacks: number;
    projectWrites: number;
    brickCreates: number;
    brickAppends: number;
    brickArchives: number;
    projectIds: ProjectId[];
    brickIds: DefinitionBrickId[];
    revisionIds: DefinitionBrickRevisionId[];
    clockCalls: number;
  };
  addFailure(point: InMemoryProjectFailurePoint): void;
  listStoredProjects(): readonly ProjectRecord[];
  listStoredBricks(): readonly Readonly<StoredBrick>[];
  corruptSummary(
    projectId: ProjectId,
    brickId: HumanReadableId,
    change: (summary: DefinitionBrickSummary) => DefinitionBrickSummary,
  ): void;
  corruptRevision(
    projectId: ProjectId,
    brickId: HumanReadableId,
    revision: PositiveRevision,
    change: (value: DefinitionBrickRevision) => DefinitionBrickRevision,
  ): void;
}>;

const DEFAULT_UUID = "00000000-0000-4000-8000-000000000001";
const DEFAULT_TIMESTAMP = "2026-07-26T01:02:03.000Z" as CanonicalTimestamp;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function brickKey(projectId: ProjectId, brickId: HumanReadableId): string {
  return `${projectId}\u0000${brickId}`;
}

function namespaceKey(projectId: ProjectId, brickId: HumanReadableId): string {
  return `${projectId}\u0000definition_brick\u0000${brickId}`;
}

function snapshotState(state: State): State {
  return {
    projects: new Map(
      [...state.projects.entries()].map(([projectId, project]) => [projectId, clone(project)]),
    ),
    namespace: new Set(state.namespace),
    bricks: new Map(
      [...state.bricks.entries()].map(([key, brick]) => [key, clone(brick)]),
    ),
  };
}

export function createInMemoryProjectAdapters(
  options: InMemoryProjectAdaptersOptions,
): InMemoryProjectAdapters {
  let state: State = {
    projects: new Map(),
    namespace: new Set(),
    bricks: new Map(),
  };
  const failures = new Set(options.failures ?? []);
  let projectIdIndex = 0;
  let brickIdIndex = 0;
  let revisionIdIndex = 0;
  let timestampIndex = 0;
  const calls = {
    uowRuns: 0,
    commits: 0,
    rollbacks: 0,
    projectWrites: 0,
    brickCreates: 0,
    brickAppends: 0,
    brickArchives: 0,
    projectIds: [] as ProjectId[],
    brickIds: [] as DefinitionBrickId[],
    revisionIds: [] as DefinitionBrickRevisionId[],
    clockCalls: 0,
  };

  const shouldFail = (point: InMemoryProjectFailurePoint): void => {
    if (failures.delete(point)) throw new Error("injected adapter failure");
  };

  const projects = {
    create: async (project: ProjectRecord): Promise<ProjectCreateWriteResult> => {
      calls.projectWrites += 1;
      if (state.projects.has(project.project_id)) return "project_id_conflict";
      state.projects.set(project.project_id, clone(project));
      shouldFail("project.create.after_write");
      return "created";
    },
    find: async (projectId: ProjectId) => {
      const project = state.projects.get(projectId);
      return project === undefined ? undefined : clone(project);
    },
  };

  const definitionBricks = {
    create: async (
      summary: DefinitionBrickSummary,
      revision: DefinitionBrickRevision,
    ): Promise<DefinitionBrickCreateWriteResult> => {
      calls.brickCreates += 1;
      const reservedKey = namespaceKey(summary.project_id, summary.brick_id);
      if (state.namespace.has(reservedKey)) return "already_exists";
      state.namespace.add(reservedKey);
      shouldFail("brick.create.after_reserve");
      state.bricks.set(
        brickKey(summary.project_id, summary.brick_id),
        { summary: clone(summary), revisions: [clone(revision)] },
      );
      return "created";
    },
    findSummary: async (projectId: ProjectId, brickId: HumanReadableId) => {
      const stored = state.bricks.get(brickKey(projectId, brickId));
      return stored === undefined ? undefined : clone(stored.summary);
    },
    listSummaries: async (projectId: ProjectId) => [...state.bricks.values()]
      .filter((stored) => stored.summary.project_id === projectId)
      .map((stored) => clone(stored.summary)),
    findRevision: async (
      projectId: ProjectId,
      brickId: HumanReadableId,
      revision: PositiveRevision,
    ) => {
      const stored = state.bricks.get(brickKey(projectId, brickId));
      const found = stored?.revisions.find((candidate) => candidate.revision === revision);
      return found === undefined ? undefined : clone(found);
    },
    listRevisions: async (projectId: ProjectId, brickId: HumanReadableId) => {
      const stored = state.bricks.get(brickKey(projectId, brickId));
      return stored === undefined ? undefined : stored.revisions.map(clone);
    },
    appendRevision: async (
      revision: DefinitionBrickRevision,
      expectedCurrentRevision: PositiveRevision,
    ): Promise<DefinitionBrickAppendWriteResult> => {
      calls.brickAppends += 1;
      const stored = state.bricks.get(brickKey(revision.project_id, revision.brick_id));
      if (stored === undefined) return "not_found";
      if (stored.summary.status === "archived") return "archived";
      if (stored.summary.kind !== revision.kind) return "kind_mismatch";
      if (stored.summary.current_revision !== expectedCurrentRevision) {
        return "base_revision_conflict";
      }
      stored.revisions.push(clone(revision));
      stored.summary = { ...stored.summary, current_revision: revision.revision };
      shouldFail("brick.append.after_write");
      return "appended";
    },
    archive: async (
      projectId: ProjectId,
      brickId: HumanReadableId,
      expectedCurrentRevision: PositiveRevision,
    ): Promise<DefinitionBrickArchiveWriteResult> => {
      calls.brickArchives += 1;
      const stored = state.bricks.get(brickKey(projectId, brickId));
      if (stored === undefined) return "not_found";
      if (stored.summary.current_revision !== expectedCurrentRevision) {
        return "base_revision_conflict";
      }
      stored.summary = { ...stored.summary, status: "archived" };
      shouldFail("brick.archive.after_write");
      return "archived";
    },
  };

  const currentUnitOfWork: ProjectUnitOfWork = { projects, definitionBricks };
  const unitOfWork: ProjectUnitOfWorkPort = {
    run: async <T>(work: (uow: ProjectUnitOfWork) => Promise<T>): Promise<T> => {
      calls.uowRuns += 1;
      const before = snapshotState(state);
      try {
        const result = await work(currentUnitOfWork);
        calls.commits += 1;
        return result;
      } catch (error) {
        state = before;
        calls.rollbacks += 1;
        throw error;
      }
    },
  };

  const ports: ProjectModulePorts = {
    clock: {
      now: () => {
        calls.clockCalls += 1;
        const timestamp = options.timestamps[timestampIndex]
          ?? options.timestamps[options.timestamps.length - 1]
          ?? DEFAULT_TIMESTAMP;
        timestampIndex += 1;
        return timestamp;
      },
    },
    identity: {
      newProjectId: () => {
        const id = options.projectIds[projectIdIndex]
          ?? `project_${DEFAULT_UUID}` as ProjectId;
        projectIdIndex += 1;
        calls.projectIds.push(id);
        return id;
      },
      newDefinitionBrickId: () => {
        const id = options.brickIds[brickIdIndex]
          ?? `brick_${DEFAULT_UUID}` as DefinitionBrickId;
        brickIdIndex += 1;
        calls.brickIds.push(id);
        return id;
      },
      newDefinitionBrickRevisionId: () => {
        const id = options.revisionIds[revisionIdIndex]
          ?? `brickrev_${DEFAULT_UUID}` as DefinitionBrickRevisionId;
        revisionIdIndex += 1;
        calls.revisionIds.push(id);
        return id;
      },
    },
    digest: runtimeContractsDefinitionBrickDigest,
    unitOfWork,
  };

  return {
    ports,
    calls,
    addFailure: (point) => failures.add(point),
    listStoredProjects: () => [...state.projects.values()].map(clone),
    listStoredBricks: () => [...state.bricks.values()].map(clone),
    corruptSummary: (projectId, brickId, change) => {
      const stored = state.bricks.get(brickKey(projectId, brickId));
      if (stored !== undefined) stored.summary = clone(change(clone(stored.summary)));
    },
    corruptRevision: (projectId, brickId, revision, change) => {
      const stored = state.bricks.get(brickKey(projectId, brickId));
      const index = stored?.revisions.findIndex((candidate) => candidate.revision === revision) ?? -1;
      if (stored !== undefined && index >= 0) {
        stored.revisions[index] = clone(change(clone(stored.revisions[index]!)));
      }
    },
  };
}
