const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const brickrevId = `brickrev_${UUID}`;
const brickrevId2 = `brickrev_${"11111111-1111-4111-8111-111111111111"}`;
const brickrevId3 = `brickrev_${"22222222-2222-4222-8222-222222222222"}`;
const brickrevId4 = `brickrev_${"33333333-3333-4333-8333-333333333333"}`;
const brickrevId5 = `brickrev_${"44444444-4444-4333-8444-444444444444"}`;
const templateId = `actor_template_${UUID}`;
const snapshotId = `actor_config_${UUID}`;
const safeDigest = `sha256:${"a".repeat(64)}`;
const safeDigest2 = `sha256:${"b".repeat(64)}`;

export const actorTemplateFixtures = {
  brickSysPromptBody: {
    text: "You are a coding worker.",
  },

  brickPromptBodyText: {
    kind: "text",
    text: "Inspect the project before beginning.",
  },

  brickPromptBodyComposite: {
    kind: "composite",
    parts: [
      { kind: "text", text: "First part." },
      { kind: "text", text: "Second part." },
    ],
  },

  backendBrickBody: {
    adapter_id: "claude.code",
    model_id: "deepseek-v4-pro",
    config: { temperature: 0.7 },
  },

  toolsetBrickBody: {
    providers: [
      {
        provider_id: "ai.block.runtime.control",
        config: { operations: ["package.publish", "runtime.complete"] },
      },
    ],
  },

  runtimeConfigBrickBody: {
    workspace: {
      root_id: "primary",
      relative_working_directory: ".",
    },
  },

  exactBrickRef: {
    id: "coder-core",
    revision: 3,
  },

  resolvedBrickRef: {
    uid: brickrevId,
    digest: safeDigest,
  },

  definitionBrickRevision: {
    revision_uid: brickrevId,
    brick_id: "coder-core",
    project_id: projectId,
    kind: "sys_prompt",
    revision: 3,
    body: { text: "You are a coding worker." },
    digest: safeDigest,
    created_at: "2026-07-16T12:34:56.789Z",
  },

  minimalSpec: {
    schema_version: "1.0.0",
    kind: "actor_template_spec",
    metadata: {
      display_name: "Coder Pro",
      description: "Coder using a Pro backend profile.",
      labels: { role: "coder", tier: "pro" },
    },
    spec: {
      system_prompt: {
        bricks: [
          { ref: { id: "coder-core", revision: 3 } },
          { ref: { id: "project-coding-policy", revision: 1 } },
        ],
      },
      initial_prompt: {
        bricks: [{ ref: { id: "init-prompt", revision: 5 } }],
      },
      backend: {
        ref: { id: "claude-code-pro", revision: 1 },
      },
      toolset: {
        ref: { id: "coder-standard-tools", revision: 2 },
      },
      runtime_config: {
        ref: { id: "claude-code-default", revision: 1 },
      },
    },
  },

  emptyPromptsSpec: {
    schema_version: "1.0.0",
    kind: "actor_template_spec",
    metadata: {
      display_name: "Minimal Actor",
      description: "",
      labels: {},
    },
    spec: {
      system_prompt: { bricks: [] },
      initial_prompt: { bricks: [] },
      backend: { ref: { id: "be", revision: 1 } },
      toolset: { ref: { id: "ts", revision: 1 } },
      runtime_config: { ref: { id: "rc", revision: 1 } },
    },
  },

  revisionView: {
    template_uid: templateId,
    template_id: "tpl-coder",
    project_id: projectId,
    revision: 3,
    revision_digest: safeDigest,
    config_digest: safeDigest2,
    metadata: {
      display_name: "Coder Pro",
      description: "Coder using a Pro backend profile.",
      labels: { role: "coder", tier: "pro" },
    },
    spec: {
      system_prompt: {
        bricks: [
          {
            ref: { id: "coder-core", revision: 3 },
            resolved: { uid: brickrevId, digest: safeDigest },
          },
        ],
      },
      initial_prompt: { bricks: [] },
      backend: {
        ref: { id: "be", revision: 1 },
        resolved: { uid: brickrevId2, digest: safeDigest },
      },
      toolset: {
        ref: { id: "ts", revision: 1 },
        resolved: { uid: brickrevId3, digest: safeDigest },
      },
      runtime_config: {
        ref: { id: "rc", revision: 1 },
        resolved: { uid: brickrevId4, digest: safeDigest },
      },
    },
    status: "active",
    created_at: "2026-07-16T12:34:56.789Z",
  },

  templateSummary: {
    template_uid: templateId,
    template_id: "tpl-coder",
    project_id: projectId,
    display_name: "Coder Pro",
    current_revision: 3,
    status: "active",
    created_at: "2026-07-16T12:34:56.789Z",
  },

  revisionSummary: {
    revision: 3,
    revision_digest: safeDigest,
    config_digest: safeDigest2,
    status: "active",
    created_at: "2026-07-16T12:34:56.789Z",
  },

  configSnapshot: {
    head: {
      snapshot_id: snapshotId,
      project_id: projectId,
      source_template: {
        template_uid: templateId,
        human_readable_id: "tpl-coder",
        revision: 3,
        revision_digest: safeDigest,
      },
      config_digest: safeDigest2,
      created_at: "2026-07-16T12:34:56.789Z",
    },
    source_bricks: [
      {
        slot: "sys_prompt",
        order: 0,
        revision_uid: brickrevId,
        digest: safeDigest,
      },
      {
        slot: "backend",
        revision_uid: brickrevId2,
        digest: safeDigest,
      },
    ],
    resolved: {
      system_prompts: [{ text: "You are a coding worker." }],
      initial_prompts: [],
      backend: {
        adapter_id: "claude.code",
        model_id: "deepseek-v4-pro",
        config: { temperature: 0.7 },
      },
      tool_providers: [],
      working_directory: "/work/primary",
    },
  },

  validationIssue: {
    code: "ref_not_found",
    path: "/spec/backend/ref",
    resource_id: "backend-missing",
    revision: 1,
  },

  validValidationReport: {
    valid: true,
    issues: [],
  },

  invalidValidationReport: {
    valid: false,
    issues: [
      { code: "unknown_field", path: "/spec/backend/extra" },
      { code: "schema_invalid", path: "/metadata/display_name" },
    ],
  },

  validationFailedDetails: {
    report: {
      valid: false,
      issues: [
        { code: "unknown_field", path: "/spec/backend/extra" },
      ],
    },
  },

  validateResult: {
    report: {
      valid: true,
      issues: [],
    },
  },

  validateCandidate: {
    project_id: projectId,
    requested_template_id: "tpl-coder",
    operation: "create",
    spec: {
      schema_version: "1.0.0",
      kind: "actor_template_spec",
      metadata: { display_name: "Test", description: "", labels: {} },
      spec: {
        system_prompt: { bricks: [] },
        initial_prompt: { bricks: [] },
        backend: { ref: { id: "be", revision: 1 } },
        toolset: { ref: { id: "ts", revision: 1 } },
        runtime_config: { ref: { id: "rc", revision: 1 } },
      },
    },
  } as const,

  createCommand: {
    project_id: projectId,
    requested_template_id: "tpl-coder",
    spec: {
      schema_version: "1.0.0",
      kind: "actor_template_spec",
      metadata: { display_name: "Test", description: "", labels: {} },
      spec: {
        system_prompt: { bricks: [] },
        initial_prompt: { bricks: [] },
        backend: { ref: { id: "be", revision: 1 } },
        toolset: { ref: { id: "ts", revision: 1 } },
        runtime_config: { ref: { id: "rc", revision: 1 } },
      },
    },
  } as const,
} as const;
