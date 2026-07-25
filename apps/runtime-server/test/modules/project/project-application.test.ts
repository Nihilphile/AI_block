import { describe, expect, it } from "vitest";
import type {
  DefinitionBrickId,
  DefinitionBrickRevisionId,
  ProjectId,
} from "@ai-block/runtime-contracts";
import { ProjectApplicationService } from "../../../src/modules/project/index.js";
import { createInMemoryProjectAdapters } from "./in-memory-adapters.js";

const UUID1 = "00000000-0000-4000-8000-000000000001";
const UUID2 = "00000000-0000-4000-8000-000000000002";
const UUID3 = "00000000-0000-4000-8000-000000000003";
const UUID4 = "00000000-0000-4000-8000-000000000004";
const UUID5 = "00000000-0000-4000-8000-000000000005";
const UUID6 = "00000000-0000-4000-8000-000000000006";

const project1 = `project_${UUID1}` as ProjectId;
const project2 = `project_${UUID2}` as ProjectId;
const project3 = `project_${UUID3}` as ProjectId;

function adaptersAndService() {
  const adapters = createInMemoryProjectAdapters({
    projectIds: [project1, project2, project3],
    brickIds: [UUID1, UUID2, UUID3, UUID4, UUID5, UUID6]
      .map((uuid) => `brick_${uuid}` as DefinitionBrickId),
    revisionIds: [UUID1, UUID2, UUID3, UUID4, UUID5, UUID6]
      .map((uuid) => `brickrev_${uuid}` as DefinitionBrickRevisionId),
    timestamps: [
      "2026-07-26T01:00:00.000Z",
      "2026-07-26T02:00:00.000Z",
      "2026-07-26T03:00:00.000Z",
      "2026-07-26T04:00:00.000Z",
      "2026-07-26T05:00:00.000Z",
      "2026-07-26T06:00:00.000Z",
      "2026-07-26T07:00:00.000Z",
      "2026-07-26T08:00:00.000Z",
    ],
  });
  return {
    adapters,
    service: new ProjectApplicationService(adapters.ports),
  };
}

async function createProject(service: ProjectApplicationService): Promise<ProjectId> {
  const created = await service.createProject({});
  expect("project" in created).toBe(true);
  if (!("project" in created)) throw new Error("Project creation failed");
  return created.project.project_id;
}

function createBrickCommand(
  projectId: ProjectId,
  brickId = "coder-core",
  text = "System",
) {
  return {
    project_id: projectId,
    requested_brick_id: brickId,
    kind: "sys_prompt" as const,
    body: { text },
  };
}

describe("Project application service", () => {
  it("strictly validates commands before persistence and creates/reads explicit Projects", async () => {
    const { adapters, service } = adaptersAndService();

    expect(await service.createProject({ activate: true })).toEqual({
      error: { code: "definition_brick_invalid_candidate", category: "validation" },
    });
    expect(adapters.calls.uowRuns).toBe(0);
    expect(adapters.calls.projectIds).toEqual([]);
    expect(adapters.calls.clockCalls).toBe(0);

    const created = await service.createProject({});
    expect(created).toEqual({
      project: {
        project_id: project1,
        created_at: "2026-07-26T01:00:00.000Z",
      },
    });
    expect(await service.readProject({ project_id: project1 })).toEqual(created);
    expect(adapters.listStoredProjects()).toHaveLength(1);
    expect(adapters.listStoredBricks()).toEqual([]);
  });

  it("reports missing Projects and never writes Brick state for them", async () => {
    const { adapters, service } = adaptersAndService();

    expect(await service.readProject({ project_id: project1 })).toEqual({
      error: { code: "project_not_found", category: "not_found" },
    });
    expect(await service.createDefinitionBrick(createBrickCommand(project1))).toEqual({
      error: { code: "project_not_found", category: "not_found" },
    });
    expect(adapters.listStoredBricks()).toEqual([]);
    expect(adapters.calls.brickCreates).toBe(0);
  });

  it("strictly creates revision one, isolates Projects, and never upserts", async () => {
    const { adapters, service } = adaptersAndService();
    const firstProject = await createProject(service);
    const secondProject = await createProject(service);

    const first = await service.createDefinitionBrick(
      createBrickCommand(firstProject, "shared-id"),
    );
    const second = await service.createDefinitionBrick(
      createBrickCommand(secondProject, "shared-id", "Other"),
    );
    expect(first).toMatchObject({
      brick: {
        project_id: firstProject,
        brick_id: "shared-id",
        current_revision: 1,
        status: "active",
      },
      revision: { project_id: firstProject, revision: 1 },
    });
    expect(second).toMatchObject({
      brick: { project_id: secondProject, brick_id: "shared-id" },
      revision: { project_id: secondProject, revision: 1 },
    });

    const duplicate = await service.createDefinitionBrick(
      createBrickCommand(firstProject, "shared-id", "Replacement"),
    );
    expect(duplicate).toEqual({
      error: { code: "definition_brick_already_exists", category: "conflict" },
    });
    expect(adapters.listStoredBricks()).toHaveLength(2);
    expect(adapters.listStoredBricks()[0]?.revisions).toHaveLength(1);
  });

  it("keeps kind immutable, enforces base revision, and preserves equal-content provenance", async () => {
    const { adapters, service } = adaptersAndService();
    const projectId = await createProject(service);
    const created = await service.createDefinitionBrick(
      createBrickCommand(projectId, "canonical", "\uFEFFone\r\ntwo\rthree"),
    );
    expect("revision" in created).toBe(true);
    if (!("revision" in created)) return;
    expect(created.revision.body).toEqual({ text: "one\ntwo\nthree" });
    expect(adapters.listStoredBricks()[0]?.revisions[0]?.body).toEqual({
      text: "one\ntwo\nthree",
    });

    const mismatchedKind = await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "canonical",
      base_revision: 1,
      kind: "prompt",
      body: { kind: "text", text: "one\ntwo" },
    });
    expect(mismatchedKind).toEqual({
      error: { code: "definition_brick_invalid_candidate", category: "validation" },
    });

    const revised = await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "canonical",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "\uFEFFone\r\ntwo\rthree" },
    });
    expect("revision" in revised).toBe(true);
    if (!("revision" in revised)) return;
    expect(revised.revision.revision).toBe(2);
    expect(revised.revision.revision_uid).not.toBe(created.revision.revision_uid);
    expect(revised.revision.digest).toBe(created.revision.digest);
    expect(revised.revision.body).toEqual({ text: "one\ntwo\nthree" });
    expect(adapters.listStoredBricks()[0]?.revisions[1]?.body).toEqual({
      text: "one\ntwo\nthree",
    });

    expect(await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "canonical",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "stale" },
    })).toEqual({
      error: { code: "definition_brick_revision_conflict", category: "conflict" },
    });
  });

  it("recursively canonicalizes prompt Bodies without reordering composite parts", async () => {
    const { adapters, service } = adaptersAndService();
    const projectId = await createProject(service);
    const created = await service.createDefinitionBrick({
      project_id: projectId,
      requested_brick_id: "nested",
      kind: "prompt",
      body: {
        kind: "composite",
        parts: [
          { kind: "text", text: "\uFEFFFirst\r\n" },
          {
            kind: "composite",
            parts: [{ kind: "text", text: "Second\rThird" }],
          },
        ],
      },
    });
    expect("revision" in created).toBe(true);
    if (!("revision" in created)) return;

    const canonicalBody = {
      kind: "composite",
      parts: [
        { kind: "text", text: "First\n" },
        {
          kind: "composite",
          parts: [{ kind: "text", text: "Second\nThird" }],
        },
      ],
    };
    expect(created.revision.body).toEqual(canonicalBody);
    expect(adapters.listStoredBricks()[0]?.revisions[0]?.body).toEqual(canonicalBody);
  });

  it("archives idempotently without releasing the ID and resolves exact archived history", async () => {
    const { adapters, service } = adaptersAndService();
    const projectId = await createProject(service);
    await service.createDefinitionBrick(createBrickCommand(projectId));
    await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "coder-core",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "Revised" },
    });

    const archived = await service.archiveDefinitionBrick({
      project_id: projectId,
      brick_id: "coder-core",
    });
    expect(archived).toMatchObject({
      brick: { status: "archived", current_revision: 2 },
    });
    const archiveWrites = adapters.calls.brickArchives;
    expect(await service.archiveDefinitionBrick({
      project_id: projectId,
      brick_id: "coder-core",
    })).toEqual(archived);
    expect(adapters.calls.brickArchives).toBe(archiveWrites);

    expect(await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "coder-core",
      base_revision: 2,
      kind: "sys_prompt",
      body: { text: "Rejected" },
    })).toEqual({
      error: { code: "definition_brick_archived", category: "conflict" },
    });
    expect(await service.createDefinitionBrick(createBrickCommand(projectId))).toEqual({
      error: { code: "definition_brick_already_exists", category: "conflict" },
    });
    expect(await service.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "coder-core", revision: 1 },
    })).toMatchObject({
      brick: { status: "archived", current_revision: 2 },
      revision: { revision: 1, body: { text: "System" } },
    });
  });

  it("sorts aggregate reads by brick_id and complete history by ascending revision", async () => {
    const { service } = adaptersAndService();
    const projectId = await createProject(service);
    await service.createDefinitionBrick(createBrickCommand(projectId, "zeta"));
    await service.createDefinitionBrick(createBrickCommand(projectId, "alpha"));
    await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "zeta",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "Zeta 2" },
    });

    const listed = await service.listDefinitionBricks({ project_id: projectId });
    expect("bricks" in listed).toBe(true);
    if (!("bricks" in listed)) return;
    expect(listed.bricks.map((brick) => brick.brick_id)).toEqual(["alpha", "zeta"]);

    const history = await service.listDefinitionBrickHistory({
      project_id: projectId,
      brick_id: "zeta",
    });
    expect("revisions" in history).toBe(true);
    if (!("revisions" in history)) return;
    expect(history.revisions.map((revision) => revision.revision)).toEqual([1, 2]);
    expect(await service.readDefinitionBrick({
      project_id: projectId,
      brick_id: "missing",
    })).toEqual({
      error: { code: "definition_brick_not_found", category: "not_found" },
    });
    expect(await service.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "zeta", revision: 3 },
    })).toEqual({
      error: { code: "definition_brick_revision_not_found", category: "not_found" },
    });
  });

  it("fails closed for invalid kind/body pairs and stored identity or digest corruption", async () => {
    const { adapters, service } = adaptersAndService();
    const projectId = await createProject(service);

    const invalid = await service.createDefinitionBrick({
      project_id: projectId,
      requested_brick_id: "invalid",
      kind: "sys_prompt",
      body: { kind: "text", text: "wrong body kind" },
    });
    expect(invalid).toEqual({
      error: { code: "definition_brick_invalid_candidate", category: "validation" },
    });
    expect(adapters.calls.brickCreates).toBe(0);

    await service.createDefinitionBrick(createBrickCommand(projectId, "corrupt"));
    adapters.corruptRevision(projectId, "corrupt", 1, (revision) => ({
      ...revision,
      digest: `sha256:${"f".repeat(64)}`,
    }));
    expect(await service.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "corrupt", revision: 1 },
    })).toEqual({
      error: { code: "definition_brick_integrity_error", category: "integrity" },
    });

    adapters.corruptSummary(projectId, "corrupt", (summary) => ({
      ...summary,
      brick_id: "other",
    }));
    expect(await service.readDefinitionBrick({
      project_id: projectId,
      brick_id: "corrupt",
    })).toEqual({
      error: { code: "definition_brick_integrity_error", category: "integrity" },
    });
  });

  it("rejects noncanonical stored Bodies even when their normalized digest matches", async () => {
    const { adapters, service } = adaptersAndService();
    const projectId = await createProject(service);
    await service.createDefinitionBrick(
      createBrickCommand(projectId, "noncanonical", "one\ntwo"),
    );
    adapters.corruptRevision(projectId, "noncanonical", 1, (revision) => ({
      ...revision,
      body: { text: "\uFEFFone\r\ntwo" },
    }));

    expect(await service.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "noncanonical", revision: 1 },
    })).toEqual({
      error: { code: "definition_brick_integrity_error", category: "integrity" },
    });
  });

  it("classifies missing and beyond-current exact revisions by aggregate coherence", async () => {
    const { adapters, service } = adaptersAndService();
    const projectId = await createProject(service);
    await service.createDefinitionBrick(createBrickCommand(projectId, "coherence"));
    await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "coherence",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "revision two" },
    });

    const serviceWithMissingRevision = new ProjectApplicationService({
      ...adapters.ports,
      unitOfWork: {
        run: (work) => adapters.ports.unitOfWork.run((uow) => work({
          ...uow,
          definitionBricks: {
            ...uow.definitionBricks,
            findRevision: async (requestedProjectId, brickId, revision) => (
              revision === 1
                ? undefined
                : uow.definitionBricks.findRevision(requestedProjectId, brickId, revision)
            ),
          },
        })),
      },
    });
    expect(await serviceWithMissingRevision.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "coherence", revision: 1 },
    })).toEqual({
      error: { code: "definition_brick_integrity_error", category: "integrity" },
    });

    expect(await service.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "coherence", revision: 3 },
    })).toEqual({
      error: { code: "definition_brick_revision_not_found", category: "not_found" },
    });

    adapters.corruptSummary(projectId, "coherence", (summary) => ({
      ...summary,
      current_revision: 1,
    }));
    expect(await service.readExactDefinitionBrickRevision({
      project_id: projectId,
      ref: { id: "coherence", revision: 2 },
    })).toEqual({
      error: { code: "definition_brick_integrity_error", category: "integrity" },
    });
  });

  it("rolls back every Project/Brick write stage before stable error mapping", async () => {
    const { adapters, service } = adaptersAndService();

    adapters.addFailure("project.create.after_write");
    expect(await service.createProject({})).toEqual({
      error: { code: "persistence_failure", category: "persistence" },
    });
    expect(adapters.listStoredProjects()).toEqual([]);
    expect(adapters.calls.rollbacks).toBe(1);

    const projectId = await createProject(service);
    adapters.addFailure("brick.create.after_reserve");
    expect(await service.createDefinitionBrick(createBrickCommand(projectId))).toEqual({
      error: { code: "persistence_failure", category: "persistence" },
    });
    expect(adapters.listStoredBricks()).toEqual([]);

    expect("brick" in await service.createDefinitionBrick(createBrickCommand(projectId))).toBe(true);
    adapters.addFailure("brick.append.after_write");
    expect(await service.reviseDefinitionBrick({
      project_id: projectId,
      brick_id: "coder-core",
      base_revision: 1,
      kind: "sys_prompt",
      body: { text: "Not committed" },
    })).toEqual({
      error: { code: "persistence_failure", category: "persistence" },
    });
    expect(adapters.listStoredBricks()[0]?.summary.current_revision).toBe(1);
    expect(adapters.listStoredBricks()[0]?.revisions).toHaveLength(1);

    adapters.addFailure("brick.archive.after_write");
    expect(await service.archiveDefinitionBrick({
      project_id: projectId,
      brick_id: "coder-core",
    })).toEqual({
      error: { code: "persistence_failure", category: "persistence" },
    });
    expect(adapters.listStoredBricks()[0]?.summary.status).toBe("active");
    expect(adapters.calls.rollbacks).toBe(4);
  });
});
