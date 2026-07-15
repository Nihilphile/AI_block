import * as AjvModule from "ajv";
import * as AjvFormatsModule from "ajv-formats";
import { describe, expect, it } from "vitest";
import {
  AckPayloadSchema,
  CompletionRequestPayloadSchema,
  HeartbeatPayloadSchema,
  HostFaultPayloadSchema,
  HostHelloPayloadSchema,
  HostReadyPayloadSchema,
  HostToServerMessageSchema,
  HostProtocolVersionSchema,
  InitializeActorHostPayloadSchema,
  InvocationResultPayloadSchema,
  PackagePublishRequestPayloadSchema,
  ServerToHostMessageSchema,
  SessionReportPayloadSchema,
  ShutdownHostPayloadSchema,
  StartInvocationPayloadSchema,
  StopInvocationPayloadSchema,
  decodeContract,
} from "../../src/index.js";

type TestAjv = {
  compile(schema: unknown): (value: unknown) => boolean;
};

const Ajv = AjvModule.default as unknown as new (options: Record<string, unknown>) => TestAjv;
const addFormats = AjvFormatsModule.default as unknown as (ajv: TestAjv) => TestAjv;
const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const hostInstanceId = `host_${UUID}`;
const invocationId = `invocation_${UUID}`;
const messageId = `message_${UUID}`;
const packageRef = {
  package_id: `package_${UUID}`,
  content_hash: `sha256:${"a".repeat(64)}`,
};
const launchSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  actor_id: actorId,
  actor_config_snapshot_id: `actor_config_${UUID}`,
  system_prompts: [],
  working_directory: "C:\\work",
  backend: { adapter_id: "fake.backend", config: {} },
  tool_providers: [],
};
const invocationSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  run_id: `run_${UUID}`,
  actor_id: actorId,
  invocation_id: invocationId,
  input_package_refs: [packageRef],
  prompt: { kind: "text", text: "prompt" },
  session: { mode: "create" },
};
const invocationResult = {
  schema_version: "1.0.0",
  project_id: projectId,
  run_id: `run_${UUID}`,
  actor_id: actorId,
  invocation_id: invocationId,
  process: { status: "stopped" },
  emitted_package_refs: [],
  completion_requested: false,
};
const envelope = {
  protocol_version: "1.0.0",
  message_id: messageId,
  sender_sequence: 0,
  connection_generation: 1,
  sent_at: "2026-07-16T12:34:56.789Z",
};
const serverPayloads = [
  { kind: "initialize_actor_host", launch_spec: launchSpec },
  { kind: "start_invocation", invocation_spec: invocationSpec },
  { kind: "stop_invocation", invocation_id: invocationId, reason: "cancelled" },
  { kind: "shutdown_host", reason: "maintenance" },
  { kind: "ack", acknowledged_message_id: messageId },
] as const;
const hostPayloads = [
  { kind: "host_hello", project_id: projectId, host_instance_id: hostInstanceId, actor_id: actorId },
  { kind: "host_ready", actor_id: actorId },
  { kind: "heartbeat" },
  { kind: "session_report", invocation_id: invocationId, session_id: "backend-session-1" },
  { kind: "invocation_result", result: invocationResult },
  { kind: "package_publish_request", invocation_id: invocationId, idempotency_key: "publish-1", package_type: "result", body: { kind: "text", text: "output" }, parent_refs: [] },
  { kind: "completion_request", invocation_id: invocationId, result_package_refs: [packageRef] },
  { kind: "host_fault", error: { schema_version: "1.0.0", code: "contract.backend_failed", category: "backend", message: "failed", retryable: false } },
  { kind: "ack", acknowledged_message_id: messageId },
] as const;

describe("B.3 Host protocol contracts", () => {
  it("compiles every public Host payload and directional message with Ajv main export", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv);
    const schemasAndValues: Array<[string, unknown, unknown]> = [
      ["HostProtocolVersion", HostProtocolVersionSchema, "1.0.0"],
      ["InitializeActorHostPayload", InitializeActorHostPayloadSchema, serverPayloads[0]],
      ["StartInvocationPayload", StartInvocationPayloadSchema, serverPayloads[1]],
      ["StopInvocationPayload", StopInvocationPayloadSchema, serverPayloads[2]],
      ["ShutdownHostPayload", ShutdownHostPayloadSchema, serverPayloads[3]],
      ["AckPayload", AckPayloadSchema, serverPayloads[4]],
      ["HostHelloPayload", HostHelloPayloadSchema, hostPayloads[0]],
      ["HostReadyPayload", HostReadyPayloadSchema, hostPayloads[1]],
      ["HeartbeatPayload", HeartbeatPayloadSchema, hostPayloads[2]],
      ["SessionReportPayload", SessionReportPayloadSchema, hostPayloads[3]],
      ["InvocationResultPayload", InvocationResultPayloadSchema, hostPayloads[4]],
      ["PackagePublishRequestPayload", PackagePublishRequestPayloadSchema, hostPayloads[5]],
      ["CompletionRequestPayload", CompletionRequestPayloadSchema, hostPayloads[6]],
      ["HostFaultPayload", HostFaultPayloadSchema, hostPayloads[7]],
      ["ServerToHostMessage", ServerToHostMessageSchema, { ...envelope, payload: serverPayloads[0] }],
      ["HostToServerMessage", HostToServerMessageSchema, { ...envelope, payload: hostPayloads[0] }],
    ];
    for (const [name, schema, value] of schemasAndValues) {
      expect(() => ajv.compile(schema), name).not.toThrow();
      expect(ajv.compile(schema)(value), name).toBe(true);
    }
  });

  it("accepts directional payloads, ACK, correlation, round-trip JSON, and exact integer bounds", () => {
    const correlated = { ...envelope, correlation_id: `message_${"11111111-1111-4111-8111-111111111111"}`, payload: serverPayloads[4] };
    expect(decodeContract(ServerToHostMessageSchema, correlated)).toMatchObject({ ok: true });
    expect(decodeContract(HostToServerMessageSchema, { ...envelope, payload: hostPayloads[8] })).toMatchObject({ ok: true });
    const max = Number.MAX_SAFE_INTEGER;
    const bounded = { ...envelope, sender_sequence: max, connection_generation: max, payload: serverPayloads[3] };
    expect(decodeContract(ServerToHostMessageSchema, bounded)).toMatchObject({ ok: true });
    const decoded = decodeContract(ServerToHostMessageSchema, { ...envelope, payload: serverPayloads[0] });
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decodeContract(ServerToHostMessageSchema, JSON.parse(JSON.stringify(decoded.value)))).toEqual(decoded);
    }
  });

  it("rejects opposite-direction payloads, unknown fields, bad versions, and invalid sequence values", () => {
    expect(decodeContract(ServerToHostMessageSchema, { ...envelope, payload: hostPayloads[0] }).ok).toBe(false);
    expect(decodeContract(HostToServerMessageSchema, { ...envelope, payload: serverPayloads[0] }).ok).toBe(false);
    expect(decodeContract(ServerToHostMessageSchema, { ...envelope, extra: true, payload: serverPayloads[0] }).ok).toBe(false);
    expect(decodeContract(ServerToHostMessageSchema, { ...envelope, protocol_version: "2.0.0", payload: serverPayloads[0] }).ok).toBe(false);
    expect(decodeContract(ServerToHostMessageSchema, { ...envelope, payload: { ...serverPayloads[0], extra: true } }).ok).toBe(false);
    for (const value of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, Infinity]) {
      expect(decodeContract(ServerToHostMessageSchema, { ...envelope, sender_sequence: value, payload: serverPayloads[0] }).ok).toBe(false);
    }
    for (const value of [0, -1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(decodeContract(ServerToHostMessageSchema, { ...envelope, connection_generation: value, payload: serverPayloads[0] }).ok).toBe(false);
    }
    expect(decodeContract(CompletionRequestPayloadSchema, { ...hostPayloads[6], result_package_refs: [] }).ok).toBe(false);
    expect(decodeContract(PackagePublishRequestPayloadSchema, { ...hostPayloads[5], project_id: projectId }).ok).toBe(false);
    expect(decodeContract(AckPayloadSchema, { kind: "ack", acknowledged_message_id: messageId, message_id: messageId }).ok).toBe(false);
  });
});
