import {
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import type {
  ActorTemplateSpec,
  DefinitionBrickBody,
  DefinitionBrickId,
  DefinitionBrickRevision,
  DefinitionBrickRevisionId,
  ExactBrickRef,
  ProjectId,
} from "@ai-block/runtime-contracts";
import {
  ActorTemplateApplicationService,
  type DefinitionBrickResolverPort,
} from "../../../src/modules/actor/index.js";
import {
  createProjectDefinitionBrickResolver,
  openProjectSqlitePersistence,
  ProjectApplicationService,
  type ProjectSqlitePersistence,
} from "../../../src/modules/project/index.js";
import { createInMemoryActorAdapters } from "../actor/in-memory-adapters.js";
import { createInMemoryProjectAdapters } from "./in-memory-adapters.js";

const openedPersistence: ProjectSqlitePersistence[] = [];
const temporaryDirectories: string[] = [];

afterEach(async () => {
  for (const persistence of openedPersistence.splice(0).reverse()) {
    await persistence.close();
  }
  for (const directory of temporaryDirectories.splice(0).reverse()) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`;
}

function temporaryDatabase(): string {
  const directory = mkdtempSync(join(tmpdir(), "ai-block-actor-resolver-"));
  temporaryDirectories.push(directory);
  return join(directory, "project.sqlite");
}

function openHarness(databasePath: string, seed = 1) {
  const opened = openProjectSqlitePersistence({ databasePath });
  expect(opened.ok).toBe(true);
  if (!opened.ok) throw new Error(opened.error.code);
  openedPersistence.push(opened.persistence);

  const identifiers = Array.from({ length: 40 }, (_, offset) => uuid(seed * 100 + offset));
  const adapters = createInMemoryProjectAdapters({
    projectIds: identifiers.slice(0, 4).map((id) => `project_${id}` as ProjectId),
    brickIds: identifiers.slice(4, 20).map((id) => `brick_${id}` as DefinitionBrickId),
    revisionIds: identifiers.slice(20, 36).map((id) => `brickrev_${id}` as DefinitionBrickRevisionId),
    timestamps: Array.from(
      { length: 40 },
      (_, offset) => `2026-07-26T${(offset % 24).toString().padStart(2, "0")}:00:00.000Z`,
    ),
  });
  return {
    persistence: opened.persistence,
    service: new ProjectApplicationService({
      ...adapters.ports,
      unitOfWork: opened.persistence.unitOfWork,
    }),
  };
}

async function createProject(service: ProjectApplicationService): Promise<ProjectId> {
  const result = await service.createProject({});
  expect("project" in result).toBe(true);
  if (!("project" in result)) throw new Error(result.error.code);
  return result.project.project_id;
}

async function createBrick(
  service: ProjectApplicationService,
  projectId: ProjectId,
  brickId: string,
  kind: DefinitionBrickRevision["kind"],
  body: DefinitionBrickBody,
): Promise<DefinitionBrickRevision> {
  const result = await service.createDefinitionBrick({
    project_id: projectId,
    requested_brick_id: brickId,
    kind,
    body,
  });
  expect("revision" in result).toBe(true);
  if (!("revision" in result)) throw new Error(result.error.code);
  return result.revision;
}

async function createActorBricks(service: ProjectApplicationService, projectId: ProjectId) {
  return {
    system: await createBrick(service, projectId, "system", "sys_prompt", { text: "System revision one" }),
    backend: await createBrick(service, projectId, "backend", "backend", {
      adapter_id: "claude-code",
      model_id: "model-a",
      config: { temperature: 0 },
    }),
    toolset: await createBrick(service, projectId, "toolset", "toolset", {
      providers: [{ provider_id: "runtime-control", config: { enabled: true } }],
    }),
    runtime: await createBrick(service, projectId, "runtime", "runtime_config", {
      workspace: { root_id: "workspace", relative_working_directory: "src" },
    }),
  };
}

function templateSpec(): ActorTemplateSpec {
  return {
    schema_version: "1.0.0",
    kind: "actor_template_spec",
    metadata: { display_name: "Resolver", description: "Persisted resolver fixture", labels: {} },
    spec: {
      system_prompt: { bricks: [{ ref: { id: "system", revision: 1 } }] },
      initial_prompt: { bricks: [] },
      backend: { ref: { id: "backend", revision: 1 } },
      toolset: { ref: { id: "toolset", revision: 1 } },
      runtime_config: { ref: { id: "runtime", revision: 1 } },
    },
  };
}

function createActorHarness(
  projectId: ProjectId,
  resolver: DefinitionBrickResolverPort,
) {
  const adapters = createInMemoryActorAdapters({
    projects: [projectId],
    bricks: [],
    timestamps: [
      "2026-07-26T10:00:00.000Z",
      "2026-07-26T11:00:00.000Z",
      "2026-07-26T12:00:00.000Z",
    ],
    templateUids: [`actor_template_${uuid(70)}`],
    snapshotIds: [`actor_config_${uuid(71)}`, `actor_config_${uuid(72)}`],
  });
  adapters.ports.definitionBricks = resolver;
  return { adapters, service: new ActorTemplateApplicationService(adapters.ports) };
}

type StructuralReader = Parameters<typeof createProjectDefinitionBrickResolver>[0];

function readerReturning(value: unknown): StructuralReader {
  return {
    readExactDefinitionBrickRevision: async () => value as never,
  };
}

async function exactResult(
  service: ProjectApplicationService,
  projectId: ProjectId,
  reference: ExactBrickRef,
) {
  const result = await service.readExactDefinitionBrickRevision({ project_id: projectId, ref: reference });
  expect("revision" in result).toBe(true);
  if (!("revision" in result)) throw new Error(result.error.code);
  return result;
}

describe("Project persisted Definition Brick resolver", () => {
  it("returns only the requested Project-local revision and maps ordinary misses to absence", async () => {
    const { service } = openHarness(temporaryDatabase());
    const project1 = await createProject(service);
    const project2 = await createProject(service);
    const first = await createBrick(service, project1, "shared", "sys_prompt", { text: "Project one" });
    const secondProject = await createBrick(service, project2, "shared", "sys_prompt", { text: "Project two" });
    const revised = await service.reviseDefinitionBrick({
      project_id: project1,
      brick_id: "shared",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "Project one revision two" },
    });
    expect(revised).toMatchObject({ revision: { revision: 2 } });

    const resolver = createProjectDefinitionBrickResolver(service);
    const actorPort: DefinitionBrickResolverPort = resolver;
    expect(await actorPort.resolveExact(project1, { id: "shared", revision: 1 })).toEqual(first);
    expect(await actorPort.resolveExact(project2, { id: "shared", revision: 1 })).toEqual(secondProject);
    expect(await actorPort.resolveExact(project1, { id: "shared", revision: 3 })).toBeUndefined();
    expect(await actorPort.resolveExact(project1, { id: "missing", revision: 1 })).toBeUndefined();
    expect(await actorPort.resolveExact(`project_${uuid(99)}` as ProjectId, { id: "shared", revision: 1 })).toBeUndefined();
  });

  it("validates every structural reader result inside the fixed redacted failure boundary", async () => {
    const { service } = openHarness(temporaryDatabase(), 10);
    const projectId = await createProject(service);
    const otherProjectId = await createProject(service);
    const reference = { id: "system", revision: 1 } as ExactBrickRef;
    await createBrick(service, projectId, "system", "sys_prompt", { text: "System one" });
    await createBrick(service, projectId, "other", "sys_prompt", { text: "Other" });
    await createBrick(service, projectId, "prompt", "prompt", { kind: "text", text: "Prompt" });
    await createBrick(service, otherProjectId, "system", "sys_prompt", { text: "Other Project" });
    expect(await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "system",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "System two" },
    })).toMatchObject({ revision: { revision: 2 } });

    const valid = await exactResult(service, projectId, reference);
    const mismatchedProject = await exactResult(service, otherProjectId, reference);
    const mismatchedBrick = await exactResult(service, projectId, { id: "other", revision: 1 });
    const mismatchedKind = { ...valid, brick: { ...valid.brick, kind: "prompt" as const } };
    const mismatchedRevision = await exactResult(service, projectId, { id: "system", revision: 2 });

    const validResolver = createProjectDefinitionBrickResolver(readerReturning(valid));
    expect(await validResolver.resolveExact(projectId, reference)).toEqual(valid.revision);
    for (const code of [
      "project_not_found",
      "definition_brick_not_found",
      "definition_brick_revision_not_found",
    ] as const) {
      const resolver = createProjectDefinitionBrickResolver(readerReturning({
        error: { code, category: "not_found" },
      }));
      await expect(resolver.resolveExact(projectId, reference)).resolves.toBeUndefined();
    }

    for (const malformed of [
      null,
      { revision: undefined },
      { error: { code: "project_not_found" } },
      { ...valid, error: { code: "project_not_found", category: "not_found" } },
      mismatchedProject,
      mismatchedBrick,
      mismatchedKind,
      mismatchedRevision,
    ]) {
      const resolver = createProjectDefinitionBrickResolver(readerReturning(malformed));
      await expect(resolver.resolveExact(projectId, reference))
        .rejects.toThrow("Persisted Definition Brick resolution failed.");
    }

    const throwingReader: StructuralReader = {
      readExactDefinitionBrickRevision: async () => {
        throw new Error("unredacted reader detail");
      },
    };
    await expect(createProjectDefinitionBrickResolver(throwingReader).resolveExact(projectId, reference))
      .rejects.toThrow("Persisted Definition Brick resolution failed.");
  });

  it("preserves archived exact provenance through Project restart and Snapshot compilation", async () => {
    const databasePath = temporaryDatabase();
    const first = openHarness(databasePath);
    const projectId = await createProject(first.service);
    const bricks = await createActorBricks(first.service, projectId);
    const resolver: DefinitionBrickResolverPort = createProjectDefinitionBrickResolver(first.service);
    const actor = createActorHarness(projectId, resolver);

    expect(await actor.service.create({
      project_id: projectId,
      requested_template_id: "persisted",
      spec: templateSpec(),
    })).toMatchObject({ ok: true, value: { revision: { revision: 1 } } });
    expect(await first.service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "system",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "System revision two" },
    })).toMatchObject({ revision: { revision: 2 } });
    expect(await first.service.archiveDefinitionBrick({
      project_id: projectId,
      brick_id: "system",
    })).toMatchObject({ brick: { status: "archived" } });
    expect(await resolver.resolveExact(projectId, { id: "system", revision: 1 })).toEqual(bricks.system);

    await first.persistence.close();
    const reopened = openHarness(databasePath, 2);
    const reopenedResolver: DefinitionBrickResolverPort = createProjectDefinitionBrickResolver(reopened.service);
    actor.adapters.ports.definitionBricks = reopenedResolver;
    expect(await reopenedResolver.resolveExact(projectId, { id: "system", revision: 1 })).toEqual(bricks.system);

    const compiled = await actor.service.compileAndPersist({
      project_id: projectId,
      template_id: "persisted",
      revision: 1,
    });
    expect(compiled).toMatchObject({
      ok: true,
      value: {
        source_bricks: expect.arrayContaining([
          { slot: "sys_prompt", order: 0, revision_uid: bricks.system.revision_uid, digest: bricks.system.digest },
        ]),
        resolved: { system_prompts: [{ text: "System revision one" }] },
      },
    });
  });

  it("fails closed for persisted identity and digest corruption", async () => {
    const corruptions = [
      (database: DatabaseSync, revision: DefinitionBrickRevision) => {
        database.exec("PRAGMA foreign_keys = OFF");
        database.prepare("UPDATE definition_brick_revisions SET brick_uid = ? WHERE revision_uid = ?")
          .run(`brick_${uuid(90)}`, revision.revision_uid);
      },
      (database: DatabaseSync, revision: DefinitionBrickRevision) => {
        database.prepare("UPDATE definition_brick_revisions SET digest = ? WHERE revision_uid = ?")
          .run(`sha256:${"f".repeat(64)}`, revision.revision_uid);
      },
    ];

    for (const corrupt of corruptions) {
      const databasePath = temporaryDatabase();
      const { service } = openHarness(databasePath, corruptions.indexOf(corrupt) + 3);
      const projectId = await createProject(service);
      const bricks = await createActorBricks(service, projectId);
      const resolver: DefinitionBrickResolverPort = createProjectDefinitionBrickResolver(service);
      const actor = createActorHarness(projectId, resolver);
      expect(await actor.service.create({
        project_id: projectId,
        requested_template_id: "integrity",
        spec: templateSpec(),
      })).toMatchObject({ ok: true });

      const raw = new DatabaseSync(databasePath);
      try {
        corrupt(raw, bricks.system);
      } finally {
        raw.close();
      }

      await expect(resolver.resolveExact(projectId, { id: "system", revision: 1 } satisfies ExactBrickRef))
        .rejects.toThrow("Persisted Definition Brick resolution failed.");
      expect(await actor.service.compileAndPersist({
        project_id: projectId,
        template_id: "integrity",
        revision: 1,
      })).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
      expect(actor.adapters.listStoredSnapshots()).toEqual([]);
    }
  });
});
