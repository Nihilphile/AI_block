import { describe, expect, it, vi } from "vitest";
import type {
  ActorTemplateSpec,
  BackendBrickBody,
  DefinitionBrickRevision,
  ExactBrickRef,
  ProjectId,
  ToolProviderBrickConfig,
} from "@ai-block/runtime-contracts";
import { computeDefinitionBrickDigest } from "@ai-block/runtime-contracts";
import {
  ActorTemplateApplicationService,
  type ActorTemplateCompileCommand,
} from "../../../src/modules/actor/index.js";
import { createInMemoryActorAdapters } from "./in-memory-adapters.js";

const UUID = "00000000-0000-4000-8000-000000000001";
const UUID2 = "00000000-0000-4000-8000-000000000002";
const UUID3 = "00000000-0000-4000-8000-000000000003";
const projectId = `project_${UUID}` as ProjectId;
const otherProjectId = `project_${UUID2}` as ProjectId;
const templateUid = `actor_template_${UUID}`;
const templateUid2 = `actor_template_${UUID2}`;
const templateUid3 = `actor_template_${UUID3}`;
const snapshotId = `actor_config_${UUID}`;
const snapshotId2 = `actor_config_${UUID2}`;
const snapshotId3 = `actor_config_${UUID3}`;

const refs = {
  sys: { id: "system", revision: 1 } as ExactBrickRef,
  initial: { id: "initial", revision: 1 } as ExactBrickRef,
  backend: { id: "backend", revision: 1 } as ExactBrickRef,
  toolset: { id: "tools", revision: 1 } as ExactBrickRef,
  runtime: { id: "runtime", revision: 1 } as ExactBrickRef,
};

const backendBody: BackendBrickBody = {
  adapter_id: "claude-code",
  model_id: "model-a",
  config: { temperature: 0 },
};
const providers: ToolProviderBrickConfig[] = [
  { provider_id: "runtime-control", config: { enabled: true } },
];

const spec: ActorTemplateSpec = {
  schema_version: "1.0.0",
  kind: "actor_template_spec",
  metadata: { display_name: "Coder", description: "Worker", labels: { role: "coder" } },
  spec: {
    system_prompt: { bricks: [{ ref: refs.sys }] },
    initial_prompt: { bricks: [{ ref: refs.initial }] },
    backend: { ref: refs.backend },
    toolset: { ref: refs.toolset },
    runtime_config: { ref: refs.runtime },
  },
};

function revision(
  ref: ExactBrickRef,
  kind: DefinitionBrickRevision["kind"],
  body: DefinitionBrickRevision["body"],
  project: ProjectId = projectId,
): DefinitionBrickRevision {
  return {
    revision_uid: `brickrev_${UUID}`,
    brick_id: ref.id,
    project_id: project,
    kind,
    revision: ref.revision,
    body,
    digest: computeDefinitionBrickDigest(kind, body),
    created_at: "2026-07-19T01:02:03.000Z",
  };
}

function bricks(): DefinitionBrickRevision[] {
  return [
    revision(refs.sys, "sys_prompt", { text: "System" }),
    revision(refs.initial, "prompt", { kind: "text", text: "Init" }),
    revision(refs.backend, "backend", backendBody),
    revision(refs.toolset, "toolset", { providers }),
    revision(refs.runtime, "runtime_config", { workspace: { root_id: "workspace", relative_working_directory: "src" } }),
  ];
}

function createCommand(requestedTemplateId = "coder") {
  return { project_id: projectId, requested_template_id: requestedTemplateId, spec };
}

function reviseCommand(templateId = "coder", baseRevision = 1) {
  return { project_id: projectId, template_id: templateId, base_revision: baseRevision as 1 | 2, spec };
}

function serviceWith(ids = [templateUid, templateUid2, templateUid3]) {
  const adapters = createInMemoryActorAdapters({
    projects: [projectId],
    bricks: bricks(),
    timestamps: [
      "2026-07-19T01:02:03.000Z",
      "2026-07-19T02:02:03.000Z",
      "2026-07-19T03:02:03.000Z",
      "2026-07-19T04:02:03.000Z",
    ],
    templateUids: ids,
    snapshotIds: [snapshotId, snapshotId2, snapshotId3],
  });
  return { adapters, service: new ActorTemplateApplicationService(adapters.ports) };
}

describe("ActorTemplate application service", () => {
  it("validates without entering a transaction or consuming identity/time", async () => {
    const { adapters, service } = serviceWith();
    const invalid = { ...createCommand(), spec: { ...spec, extra: true } };

    const validated = await service.validate(invalid);

    expect("report" in validated).toBe(true);
    if (!("report" in validated)) return;
    expect(validated.report.valid).toBe(false);
    expect(adapters.calls.uowRuns).toBe(0);
    expect(adapters.calls.namespaceReservations).toBe(0);
    expect(adapters.calls.templateUids).toEqual([]);
    expect(adapters.calls.clockCalls).toBe(0);
  });

  it("creates revision one atomically and never treats create as upsert", async () => {
    const { adapters, service } = serviceWith();
    const first = await service.create(createCommand());
    const second = await service.create(createCommand());

    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.value.revision.revision).toBe(1);
    expect(first.value.revision.template_uid).toBe(templateUid);
    expect(first.value.revision.created_at).toBe("2026-07-19T01:02:03.000Z");
    expect(second).toEqual({
      ok: false,
      error: {
        schema_version: "1.0.0",
        code: "project.resource_id_conflict",
        category: "conflict",
        message: "Project resource ID conflict.",
        retryable: false,
      },
    });
    expect(adapters.listStoredTemplates()).toHaveLength(1);
    expect(adapters.listStoredTemplates()[0]?.revision).toBe(1);
  });

  it("sorts reads and histories deterministically and projects archive status", async () => {
    const { service } = serviceWith();
    await service.create(createCommand("zeta"));
    await service.create(createCommand("alpha"));
    await service.revise(reviseCommand("zeta"));

    const listed = await service.list(projectId);
    expect(listed.ok).toBe(true);
    if (!listed.ok) return;
    expect(listed.value.map((summary) => summary.template_id)).toEqual(["alpha", "zeta"]);

    const history = await service.history(projectId, "zeta");
    expect(history.ok).toBe(true);
    if (!history.ok) return;
    expect(history.value.map((item) => item.revision)).toEqual([1, 2]);
    expect(history.value.every((item) => item.status === "active")).toBe(true);

    const archived = await service.archive(projectId, "zeta");
    expect(archived.ok).toBe(true);
    const afterArchive = await service.history(projectId, "zeta");
    expect(afterArchive.ok).toBe(true);
    if (!afterArchive.ok) return;
    expect(afterArchive.value.every((item) => item.status === "archived")).toBe(true);
    const historicalRead = await service.read(projectId, "zeta", 1);
    expect(historicalRead.ok).toBe(true);
    if (!historicalRead.ok) return;
    expect(historicalRead.value.status).toBe("archived");
  });

  it("enforces revise CAS, retains immutable history, and makes archive idempotent", async () => {
    const { service } = serviceWith();
    await service.create(createCommand());
    const revised = await service.revise(reviseCommand());
    expect(revised.ok).toBe(true);

    const stale = await service.revise(reviseCommand("coder", 1));
    expect(stale).toMatchObject({ ok: false, error: { code: "actor_template.base_revision_conflict" } });

    const archived = await service.archive(projectId, "coder", 2);
    expect(archived).toMatchObject({ ok: true, value: { status: "archived", current_revision: 2 } });
    const idempotent = await service.archive(projectId, "coder", 1);
    expect(idempotent).toMatchObject({ ok: true, value: { status: "archived", current_revision: 2 } });
    const rejected = await service.revise(reviseCommand("coder", 2));
    expect(rejected).toMatchObject({ ok: false, error: { code: "actor_template.archived" } });
  });

  it("maps validation parity and project/template not-found outcomes safely", async () => {
    const { adapters, service } = serviceWith();
    const invalidCommand = { ...createCommand(), spec: { ...spec, extra: true } };
    const invalidCandidate = { ...invalidCommand, operation: "create" as const };
    const report = await service.validate(invalidCandidate);
    expect("report" in report).toBe(true);
    if (!("report" in report)) return;
    const create = await service.create(invalidCommand);
    expect(create).toMatchObject({
      ok: false,
      error: { code: "actor_template.validation_failed", details: { report: report.report } },
    });
    expect(adapters.calls.uowRuns).toBe(0);
    expect((await service.list(otherProjectId))).toMatchObject({ ok: false, error: { code: "project.not_found" } });
    expect((await service.read(projectId, "missing"))).toMatchObject({ ok: false, error: { code: "actor_template.not_found" } });
  });

  it("returns an operation failure for resolver exceptions without entering persistence", async () => {
    const { adapters, service } = serviceWith();
    adapters.ports.definitionBricks = {
      resolveExact: vi.fn(async () => {
        throw new Error("resolver unavailable");
      }),
    };

    const validated = await service.validate({ ...createCommand(), operation: "create" });
    expect(validated).toEqual({
      error: {
        schema_version: "1.0.0",
        code: "actor_template.operation_failed",
        category: "internal",
        message: "ActorTemplate operation failed.",
        retryable: false,
      },
    });
    const created = await service.create(createCommand());
    expect(created).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(adapters.calls.uowRuns).toBe(0);
    expect(adapters.calls.namespaceReservations).toBe(0);
    expect(adapters.calls.templateWrites).toBe(0);

    const compiledAdapters = serviceWith();
    await compiledAdapters.service.create(createCommand());
    compiledAdapters.adapters.ports.definitionBricks = adapters.ports.definitionBricks;
    const compiled = await compiledAdapters.service.compileAndPersist({
      project_id: projectId,
      template_id: "coder",
      revision: 1,
    });
    expect(compiled).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(compiledAdapters.adapters.listStoredSnapshots()).toEqual([]);
  });

  it("does not classify validator or workspace port exceptions as validation findings", async () => {
    const validatorFailure = serviceWith();
    validatorFailure.adapters.ports.backendValidators = {
      find: vi.fn(() => {
        throw new Error("validator unavailable");
      }),
    };
    expect(await validatorFailure.service.create(createCommand())).toMatchObject({
      ok: false,
      error: { code: "actor_template.operation_failed" },
    });
    expect(validatorFailure.adapters.calls.uowRuns).toBe(0);

    const workspaceFailure = serviceWith();
    workspaceFailure.adapters.ports.workspace = {
      resolveWorkingDirectory: vi.fn(async () => {
        throw new Error("workspace unavailable");
      }),
    };
    expect(await workspaceFailure.service.create(createCommand())).toMatchObject({
      ok: false,
      error: { code: "actor_template.operation_failed" },
    });
    expect(workspaceFailure.adapters.calls.uowRuns).toBe(0);
  });

  it("rejects resolver digest corruption before create and revise writes", async () => {
    const { adapters, service } = serviceWith();
    const baseResolver = adapters.ports.definitionBricks;
    adapters.ports.definitionBricks = {
      resolveExact: vi.fn(async (project, ref) => {
        const resolved = await baseResolver.resolveExact(project, ref);
        return resolved?.brick_id === refs.sys.id
          ? { ...resolved, digest: `sha256:${"b".repeat(64)}` }
          : resolved;
      }),
    };

    const failedCreate = await service.create(createCommand());
    expect(failedCreate).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(adapters.listStoredTemplates()).toEqual([]);
    expect(adapters.calls.uowRuns).toBe(0);

    adapters.ports.definitionBricks = baseResolver;
    expect((await service.create(createCommand())).ok).toBe(true);
    const writesBeforeRevise = adapters.calls.templateWrites;
    adapters.ports.definitionBricks = {
      resolveExact: vi.fn(async (project, ref) => {
        const resolved = await baseResolver.resolveExact(project, ref);
        return resolved?.brick_id === refs.sys.id
          ? { ...resolved, digest: `sha256:${"c".repeat(64)}` }
          : resolved;
      }),
    };

    const failedRevise = await service.revise(reviseCommand());
    expect(failedRevise).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(adapters.calls.templateWrites).toBe(writesBeforeRevise);
    expect(adapters.listStoredTemplates()).toHaveLength(1);
  });

  it("rejects historical UID, content, and Template digest drift without Snapshot writes", async () => {
    const { adapters, service } = serviceWith();
    await service.create(createCommand());
    const baseResolver = adapters.ports.definitionBricks;

    adapters.ports.definitionBricks = {
      resolveExact: vi.fn(async (project, ref) => {
        const resolved = await baseResolver.resolveExact(project, ref);
        return resolved?.brick_id === refs.sys.id
          ? { ...resolved, revision_uid: `brickrev_${UUID2}` }
          : resolved;
      }),
    };
    const uidDrift = await service.compileAndPersist({ project_id: projectId, template_id: "coder", revision: 1 });
    expect(uidDrift).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });

    adapters.ports.definitionBricks = {
      resolveExact: vi.fn(async (project, ref) => {
        const resolved = await baseResolver.resolveExact(project, ref);
        if (resolved?.brick_id !== refs.sys.id) return resolved;
        const body = { text: "Changed persisted content" };
        return { ...resolved, body, digest: computeDefinitionBrickDigest("sys_prompt", body) };
      }),
    };
    const contentDrift = await service.compileAndPersist({ project_id: projectId, template_id: "coder", revision: 1 });
    expect(contentDrift).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });

    const baseUnitOfWork = adapters.ports.unitOfWork;
    adapters.ports.definitionBricks = baseResolver;
    adapters.ports.unitOfWork = {
      run: async (work) => baseUnitOfWork.run(async (uow) => work({
        ...uow,
        templates: {
          ...uow.templates,
          findRevision: async (project, template, revision) => {
            const view = await uow.templates.findRevision(project, template, revision);
            return view === undefined ? undefined : { ...view, revision_digest: `sha256:${"d".repeat(64)}` };
          },
        },
      })),
    };
    const templateDigestDrift = await service.compileAndPersist({ project_id: projectId, template_id: "coder", revision: 1 });
    expect(templateDigestDrift).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(adapters.listStoredSnapshots()).toEqual([]);
  });

  it("rolls back namespace/template changes on every write-stage failure", async () => {
    const reservation = serviceWith();
    reservation.adapters.addFailure("namespace.reserve");
    const failedReservation = await reservation.service.create(createCommand());
    expect(failedReservation).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(reservation.adapters.listStoredTemplates()).toEqual([]);
    expect(reservation.adapters.calls.rollbacks).toBe(1);

    const { adapters, service } = serviceWith();
    adapters.addFailure("template.create");
    const failedCreate = await service.create(createCommand());
    expect(failedCreate).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(adapters.listStoredTemplates()).toEqual([]);
    expect(adapters.calls.rollbacks).toBe(1);

    const created = await service.create(createCommand());
    expect(created.ok).toBe(true);
    adapters.addFailure("template.append");
    const failedRevise = await service.revise(reviseCommand());
    expect(failedRevise).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(adapters.listStoredTemplates()).toHaveLength(1);

    const failedArchive = (() => {
      adapters.addFailure("template.archive");
      return service.archive(projectId, "coder");
    })();
    expect(await failedArchive).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect((await service.read(projectId, "coder"))).toMatchObject({ ok: true, value: { status: "active" } });
  });

  it("compiles and persists fresh snapshots without mutating templates or reusing entities", async () => {
    const { adapters, service } = serviceWith();
    await service.create(createCommand());
    const compile: ActorTemplateCompileCommand = { project_id: projectId, template_id: "coder", revision: 1 };
    const first = await service.compileAndPersist(compile);
    const second = await service.compileAndPersist(compile);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.value.head.snapshot_id).not.toBe(second.value.head.snapshot_id);
    expect(first.value.head.created_at).toBe("2026-07-19T02:02:03.000Z");
    expect(second.value.head.created_at).toBe("2026-07-19T03:02:03.000Z");
    expect(first.value.head.config_digest).toBe(second.value.head.config_digest);
    const revision = await service.read(projectId, "coder", 1);
    expect(revision.ok).toBe(true);
    if (!revision.ok) return;
    expect(revision.value.config_digest).toBe(first.value.head.config_digest);
    expect(first.value.head.source_template).toEqual(second.value.head.source_template);
    expect(adapters.listStoredSnapshots()).toHaveLength(2);
    expect(adapters.calls.templateWrites).toBe(1);

    const revisedSpec = { ...spec, metadata: { ...spec.metadata, description: "Different display metadata" } };
    const revised = await service.revise({ ...reviseCommand(), spec: revisedSpec });
    expect(revised.ok).toBe(true);
    const third = await service.compileAndPersist({ ...compile, revision: 2 });
    expect(third.ok).toBe(true);
    if (!third.ok) return;
    expect(third.value.head.snapshot_id).not.toBe(first.value.head.snapshot_id);
    expect(third.value.head.config_digest).toBe(first.value.head.config_digest);
    expect(third.value.head.source_template.revision_digest).not.toBe(first.value.head.source_template.revision_digest);
  });

  it("rolls back a failed snapshot persistence and keeps the Template unchanged", async () => {
    const { adapters, service } = serviceWith();
    await service.create(createCommand());
    adapters.addFailure("snapshot.save");

    const failed = await service.compileAndPersist({ project_id: projectId, template_id: "coder", revision: 1 });

    expect(failed).toMatchObject({ ok: false, error: { code: "actor_template.operation_failed" } });
    expect(adapters.listStoredSnapshots()).toEqual([]);
    expect((await service.read(projectId, "coder", 1))).toMatchObject({ ok: true, value: { revision: 1 } });
    expect(adapters.calls.rollbacks).toBe(1);
  });

});
