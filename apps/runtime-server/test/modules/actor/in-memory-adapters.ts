import type {
  ActorConfigSnapshot,
  ActorConfigSnapshotId,
  ActorTemplateId,
  ActorTemplateRevisionSummary,
  ActorTemplateRevisionView,
  ActorTemplateSummary,
  CanonicalTimestamp,
  DefinitionBrickRevision,
  ExactBrickRef,
  HumanReadableId,
  ProjectId,
  ToolsetBrickBody,
} from "@ai-block/runtime-contracts";
import type {
  BackendAdapterValidatorRegistryPort,
  ToolProviderValidatorRegistryPort,
  ActorModulePorts,
  ActorResourceKind,
  ActorTemplateArchiveResult,
  ActorTemplateCreateResult,
  ActorTemplateRepositoryPort,
  ActorTemplateRevisionWriteResult,
  ActorUnitOfWork,
  ActorUnitOfWorkPort,
  BackendToolsetCompatibilityPort,
  DefinitionBrickResolverPort,
  ProjectNamespacePort,
  ProjectWorkspaceResolverPort,
  WorkspaceResolution,
} from "../../../src/modules/actor/index.js";

export type InMemoryFailurePoint =
  | "namespace.reserve"
  | "template.create"
  | "template.append"
  | "template.archive"
  | "snapshot.save";

export type InMemoryActorAdaptersOptions = Readonly<{
  projects: readonly ProjectId[];
  bricks: readonly DefinitionBrickRevision[];
  timestamps: readonly CanonicalTimestamp[];
  templateUids: readonly ActorTemplateId[];
  snapshotIds: readonly ActorConfigSnapshotId[];
  workspace?: WorkspaceResolution;
  backendValidators?: BackendAdapterValidatorRegistryPort;
  toolProviderValidators?: ToolProviderValidatorRegistryPort;
  compatibility?: BackendToolsetCompatibilityPort;
  failures?: readonly InMemoryFailurePoint[];
}>;

export type InMemoryActorAdapters = Readonly<{
  ports: ActorModulePorts;
  calls: {
    uowRuns: number;
    commits: number;
    rollbacks: number;
    namespaceReservations: number;
    templateWrites: number;
    snapshotWrites: number;
    templateUids: ActorTemplateId[];
    snapshotIds: ActorConfigSnapshotId[];
    clockCalls: number;
  };
  addFailure(point: InMemoryFailurePoint): void;
  listStoredTemplates(): readonly ActorTemplateRevisionView[];
  listStoredSnapshots(): readonly ActorConfigSnapshot[];
}>;

type StoredTemplate = {
  revisions: ActorTemplateRevisionView[];
  archived: boolean;
};

type State = {
  namespace: Set<string>;
  templates: Map<string, StoredTemplate>;
  snapshots: Map<ActorConfigSnapshotId, ActorConfigSnapshot>;
};

const DEFAULT_TIMESTAMP = "2026-07-19T01:02:03.000Z" as CanonicalTimestamp;
const DEFAULT_UUID = "00000000-0000-4000-8000-000000000001";

function key(projectId: ProjectId, templateId: HumanReadableId): string {
  return `${projectId}\u0000${templateId}`;
}

function namespaceKey(
  projectId: ProjectId,
  kind: ActorResourceKind,
  resourceId: HumanReadableId,
): string {
  return `${projectId}\u0000${kind}\u0000${resourceId}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function snapshotState(state: State): State {
  return {
    namespace: new Set(state.namespace),
    templates: new Map(
      [...state.templates.entries()].map(([templateKey, template]) => [templateKey, clone(template)]),
    ),
    snapshots: new Map(
      [...state.snapshots.entries()].map(([snapshotId, snapshot]) => [snapshotId, clone(snapshot)]),
    ),
  };
}

function summaryFor(
  projectId: ProjectId,
  templateId: HumanReadableId,
  template: StoredTemplate,
): ActorTemplateSummary {
  const current = template.revisions[template.revisions.length - 1]!;
  return {
    template_uid: current.template_uid,
    template_id: templateId,
    project_id: projectId,
    display_name: current.metadata.display_name,
    current_revision: current.revision,
    status: template.archived ? "archived" : "active",
    created_at: template.revisions[0]!.created_at,
  };
}

function projectAndTemplate(
  templateKey: string,
): readonly [ProjectId, HumanReadableId] {
  const [projectId, templateId] = templateKey.split("\u0000");
  return [projectId as ProjectId, templateId as HumanReadableId];
}

export function createInMemoryActorAdapters(
  options: InMemoryActorAdaptersOptions,
): InMemoryActorAdapters {
  const projects = new Set(options.projects);
  const state: State = { namespace: new Set(), templates: new Map(), snapshots: new Map() };
  const failures = new Set(options.failures ?? []);
  const calls = {
    uowRuns: 0,
    commits: 0,
    rollbacks: 0,
    namespaceReservations: 0,
    templateWrites: 0,
    snapshotWrites: 0,
    templateUids: [] as ActorTemplateId[],
    snapshotIds: [] as ActorConfigSnapshotId[],
    clockCalls: 0,
  };
  let timestampIndex = 0;
  let templateUidIndex = 0;
  let snapshotIdIndex = 0;

  const shouldFail = (point: InMemoryFailurePoint): void => {
    if (failures.delete(point)) throw new Error("injected adapter failure");
  };

  const namespace: ProjectNamespacePort = {
    inspect: async (projectId, kind, resourceId) => {
      if (!projects.has(projectId)) return "project_not_found";
      return state.namespace.has(namespaceKey(projectId, kind, resourceId)) ? "occupied" : "available";
    },
    reserve: async (projectId, kind, resourceId) => {
      shouldFail("namespace.reserve");
      calls.namespaceReservations += 1;
      if (!projects.has(projectId)) return "project_not_found";
      const resourceKey = namespaceKey(projectId, kind, resourceId);
      if (state.namespace.has(resourceKey)) return "occupied";
      state.namespace.add(resourceKey);
      return "reserved";
    },
  };

  const templates: ActorTemplateRepositoryPort = {
    listSummaries: async (projectId) => {
      if (!projects.has(projectId)) return undefined;
      return [...state.templates.entries()]
        .filter(([templateKey]) => templateKey.startsWith(`${projectId}\u0000`))
        .map(([templateKey, template]) => summaryFor(...projectAndTemplate(templateKey), template));
    },
    findSummary: async (projectId, templateId) => {
      const template = state.templates.get(key(projectId, templateId));
      return template === undefined ? undefined : summaryFor(projectId, templateId, template);
    },
    findRevision: async (projectId, templateId, revision) => {
      const template = state.templates.get(key(projectId, templateId));
      const found = template?.revisions.find((candidate) => candidate.revision === revision);
      if (template === undefined || found === undefined) return undefined;
      return { ...clone(found), status: template.archived ? "archived" : "active" };
    },
    listRevisionSummaries: async (projectId, templateId) => {
      const template = state.templates.get(key(projectId, templateId));
      if (template === undefined) return undefined;
      return template.revisions.map((revision): ActorTemplateRevisionSummary => ({
        revision: revision.revision,
        revision_digest: revision.revision_digest,
        config_digest: revision.config_digest,
        status: template.archived ? "archived" : "active",
        created_at: revision.created_at,
      }));
    },
    create: async (revision): Promise<ActorTemplateCreateResult> => {
      shouldFail("template.create");
      calls.templateWrites += 1;
      const templateKey = key(revision.project_id, revision.template_id);
      if (state.templates.has(templateKey)) return "resource_id_conflict";
      state.templates.set(templateKey, { revisions: [clone(revision)], archived: false });
      return "created";
    },
    appendRevision: async (revision, expectedCurrentRevision): Promise<ActorTemplateRevisionWriteResult> => {
      shouldFail("template.append");
      calls.templateWrites += 1;
      const template = state.templates.get(key(revision.project_id, revision.template_id));
      if (template === undefined) return "not_found";
      if (template.archived) return "archived";
      const current = template.revisions[template.revisions.length - 1]!;
      if (current.revision !== expectedCurrentRevision) return "base_revision_conflict";
      template.revisions.push(clone(revision));
      return "appended";
    },
    archive: async (projectId, templateId, expectedCurrentRevision): Promise<ActorTemplateArchiveResult> => {
      shouldFail("template.archive");
      const template = state.templates.get(key(projectId, templateId));
      if (template === undefined) return "not_found";
      const current = template.revisions[template.revisions.length - 1]!;
      if (current.revision !== expectedCurrentRevision) return "base_revision_conflict";
      template.archived = true;
      return "archived";
    },
  };

  const snapshots = {
    find: async (snapshotId: ActorConfigSnapshotId) => {
      const snapshot = state.snapshots.get(snapshotId);
      return snapshot === undefined ? undefined : clone(snapshot);
    },
    save: async (snapshot: ActorConfigSnapshot) => {
      shouldFail("snapshot.save");
      calls.snapshotWrites += 1;
      if (state.snapshots.has(snapshot.head.snapshot_id)) return "snapshot_id_conflict" as const;
      state.snapshots.set(snapshot.head.snapshot_id, clone(snapshot));
      return "created" as const;
    },
  };

  const unitOfWork: ActorUnitOfWork = { namespace, templates, snapshots };
  const uowPort: ActorUnitOfWorkPort = {
    run: async <T>(work: (current: ActorUnitOfWork) => Promise<T>) => {
      calls.uowRuns += 1;
      const before = snapshotState(state);
      try {
        const result = await work(unitOfWork);
        calls.commits += 1;
        return result;
      } catch (error) {
        state.namespace = before.namespace;
        state.templates = before.templates;
        state.snapshots = before.snapshots;
        calls.rollbacks += 1;
        throw error;
      }
    },
  };

  const resolver: DefinitionBrickResolverPort = {
    resolveExact: async (projectId: ProjectId, ref: ExactBrickRef) => {
      const found = options.bricks.find(
        (brick) => brick.project_id === projectId && brick.brick_id === ref.id && brick.revision === ref.revision,
      );
      return found === undefined ? undefined : clone(found);
    },
  };

  const workspace: ProjectWorkspaceResolverPort = {
    resolveWorkingDirectory: async () => options.workspace ?? {
      kind: "resolved",
      root_id: "workspace",
      relative_working_directory: "src",
      working_directory: "C:\\project\\src",
    },
  };

  const backendValidators = options.backendValidators ?? { find: () => ({ validate: () => [] }) };
  const toolProviderValidators = options.toolProviderValidators ?? { find: () => ({ validate: () => [] }) };
  const compatibility = options.compatibility ?? { validate: (_backend: unknown, _toolset: ToolsetBrickBody) => [] };
  const ports: ActorModulePorts = {
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
      newTemplateUid: () => {
        const uid = options.templateUids[templateUidIndex]
          ?? `actor_template_${DEFAULT_UUID}` as ActorTemplateId;
        templateUidIndex += 1;
        calls.templateUids.push(uid);
        return uid;
      },
      newSnapshotId: () => {
        const id = options.snapshotIds[snapshotIdIndex]
          ?? `actor_config_${DEFAULT_UUID}` as ActorConfigSnapshotId;
        snapshotIdIndex += 1;
        calls.snapshotIds.push(id);
        return id;
      },
    },
    definitionBricks: resolver,
    backendValidators,
    toolProviderValidators,
    compatibility,
    workspace,
    unitOfWork: uowPort,
  };

  return {
    ports,
    calls,
    addFailure: (point) => failures.add(point),
    listStoredTemplates: () => [...state.templates.values()].flatMap((template) => template.revisions.map(clone)),
    listStoredSnapshots: () => [...state.snapshots.values()].map(clone),
  };
}
