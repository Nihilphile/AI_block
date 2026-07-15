const UUID = "00000000-0000-4000-8000-000000000000";
const packageId = `package_${UUID}`;
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const runId = `run_${UUID}`;
const invocationId = `invocation_${UUID}`;
const messageId = `message_${UUID}`;
const contentHash = `sha256:${"a".repeat(64)}`;
const packageRef = { package_id: packageId, content_hash: contentHash };

export const compatibilityFixtures = {
  error: {
    schema_version: "1.0.0",
    code: "contract.compatibility_failed",
    category: "compatibility",
    message: "Compatibility fixture failed.",
    retryable: false,
  },
  package: {
    head: {
      package_id: packageId,
      package_type: "task",
      schema_version: "1.0.0",
      project_id: projectId,
      created_by: { kind: "runtime" },
      created_at: "2026-07-16T12:34:56.789Z",
      content_hash: contentHash,
      provenance: { parent_refs: [] },
    },
    body: { kind: "text", text: "compatibility fixture" },
  },
  delivery: {
    delivery_id: `delivery_${UUID}`,
    package_ref: packageRef,
    project_id: projectId,
    run_id: runId,
    target_actor_id: actorId,
    state: "pending",
    created_at: "2026-07-16T12:34:56.789Z",
  },
  launchSpec: {
    schema_version: "1.0.0",
    project_id: projectId,
    actor_id: actorId,
    actor_config_snapshot_id: `actor_config_${UUID}`,
    system_prompts: [{ kind: "system_text", text: "compatibility system prompt" }],
    working_directory: "C:\\work",
    backend: { adapter_id: "fake.backend", config: { model: "fixture" } },
    tool_providers: [{ provider_id: "tools.mock", config: { enabled: true } }],
  },
  serverMessage: {
    protocol_version: "1.0.0",
    message_id: messageId,
    sender_sequence: 0,
    connection_generation: 1,
    sent_at: "2026-07-16T12:34:56.789Z",
    payload: {
      kind: "initialize_actor_host",
      launch_spec: {
        schema_version: "1.0.0",
        project_id: projectId,
        actor_id: actorId,
        actor_config_snapshot_id: `actor_config_${UUID}`,
        system_prompts: [{ kind: "system_text", text: "compatibility system prompt" }],
        working_directory: "C:\\work",
        backend: { adapter_id: "fake.backend", config: { model: "fixture" } },
        tool_providers: [{ provider_id: "tools.mock", config: { enabled: true } }],
      },
    },
  },
  hostMessage: {
    protocol_version: "1.0.0",
    message_id: `message_${"11111111-1111-4111-8111-111111111111"}`,
    correlation_id: messageId,
    sender_sequence: 1,
    connection_generation: 1,
    sent_at: "2026-07-16T12:34:57.789Z",
    payload: {
      kind: "host_hello",
      project_id: projectId,
      host_instance_id: `host_${UUID}`,
      actor_id: actorId,
    },
  },
} as const;
