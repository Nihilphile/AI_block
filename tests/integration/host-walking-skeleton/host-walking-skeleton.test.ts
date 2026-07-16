import { EventEmitter } from "node:events";
import { createServer, type Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import type {
  ActorId,
  ActorLaunchSpec,
  BackendSessionId,
  CanonicalTimestamp,
  ContractErrorEnvelope,
  HostInstanceId,
  HostMessageId,
  HostToServerMessage,
  InvocationId,
  InvocationResult,
  InvocationSpec,
  ProjectId,
  ServerToHostMessage,
} from "@ai-block/runtime-contracts";
import { FakeBackend, type FakeBackendStep } from "../../../apps/actor-host/dist/backend/fake-backend.js";
import { BackendSupervisor } from "../../../apps/actor-host/dist/backend/supervisor.js";
import { ActorHostWebSocketClient } from "../../../apps/actor-host/dist/server-connection/ws-client.js";
import { HostGatewayWebSocketAdapter } from "../../../apps/runtime-server/dist/infrastructure/actor-host-websocket/host-gateway-websocket-adapter.js";
import { HostGateway } from "../../../apps/runtime-server/dist/modules/host-gateway/host-gateway.js";
import type {
  AuthenticatedHostContext,
  HostFact,
  HostGatewayInboundResult,
  HostGatewayTransport,
  HostTransportFailure,
} from "../../../apps/runtime-server/dist/modules/host-gateway/ports.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const OTHER_UUID = "11111111-1111-4111-8111-111111111111";
const projectId = `project_${UUID}` as ProjectId;
const otherProjectId = `project_${OTHER_UUID}` as ProjectId;
const actorId = `actor_${UUID}` as ActorId;
const otherActorId = `actor_${OTHER_UUID}` as ActorId;
const hostInstanceId = `host_${UUID}` as HostInstanceId;
const otherHostInstanceId = `host_${OTHER_UUID}` as HostInstanceId;
const configSnapshotId = `actor_config_${UUID}`;
const runId = `run_${UUID}`;
const packageId = `package_${UUID}`;
const createInvocationId = `invocation_${UUID}` as InvocationId;
const resumeInvocationId = `invocation_${OTHER_UUID}` as InvocationId;
const sessionId = "fake-session-0001" as BackendSessionId;
const timestamp = "2026-07-16T12:34:56.789Z" as CanonicalTimestamp;
const token = "synthetic-host-token_123";

const identity = { projectId, actorId, hostInstanceId } as const;
const otherIdentity = {
  projectId: otherProjectId,
  actorId: otherActorId,
  hostInstanceId: otherHostInstanceId,
} as const;

const launchSpec: ActorLaunchSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  actor_id: actorId,
  actor_config_snapshot_id: configSnapshotId,
  system_prompts: [],
  working_directory: "C:\\work",
  backend: { adapter_id: "fake.backend", config: {} },
  tool_providers: [],
};

function invocation(invocationId: InvocationId, session: InvocationSpec["session"]): InvocationSpec {
  return {
    schema_version: "1.0.0",
    project_id: projectId,
    run_id: runId,
    actor_id: actorId,
    invocation_id: invocationId,
    input_package_refs: [{ package_id: packageId, content_hash: `sha256:${"a".repeat(64)}` }],
    prompt: { kind: "text", text: "walking skeleton prompt" },
    session,
  };
}

function launchFailure(): ContractErrorEnvelope {
  return {
    schema_version: "1.0.0",
    code: "backend.launch_failed",
    category: "backend",
    message: "synthetic launch failure",
    retryable: false,
  } as ContractErrorEnvelope;
}

class DeterministicMessageIds {
  public constructor(public readonly offset: number) {}

  public index = 0;

  public nextMessageId(): HostMessageId {
    const suffix = String(this.offset + this.index++).padStart(12, "0");
    return `message_00000000-0000-4000-8000-${suffix}` as HostMessageId;
  }
}

class DeterministicTimestamps {
  public now(): CanonicalTimestamp {
    return timestamp;
  }
}

class IntegrationObservations {
  public readonly events = new EventEmitter();
  public readonly serverMessages: ServerToHostMessage[] = [];
  public readonly gatewayResults: HostGatewayInboundResult[] = [];
  public readonly facts: HostFact[] = [];
  public readonly transportFailures: HostTransportFailure[] = [];

  public serverMessage(message: ServerToHostMessage): void {
    this.serverMessages.push(message);
    this.events.emit("server_message", message);
  }

  public gatewayResult(result: HostGatewayInboundResult): void {
    this.gatewayResults.push(result);
    this.events.emit("gateway_result", result);
  }

  public fact(fact: HostFact): void {
    this.facts.push(fact);
    this.events.emit("fact", fact);
  }

  public transportFailure(failure: HostTransportFailure): void {
    this.transportFailures.push(failure);
    this.events.emit("transport_failure", failure);
  }

  public clearWaiters(): void {
    this.events.removeAllListeners();
  }
}

function waitFor<T>(
  emitter: EventEmitter,
  event: string,
  predicate: (value: T) => boolean = () => true,
): Promise<T> {
  return new Promise((resolve) => {
    const listener = (value: T): void => {
      if (!predicate(value)) return;
      emitter.off(event, listener);
      resolve(value);
    };
    emitter.on(event, listener);
  });
}

function decorateGateway(gateway: HostGateway, observations: IntegrationObservations): void {
  const originalOpenConnection = gateway.openConnection.bind(gateway);
  gateway.openConnection = (hostIdentity, transport) => {
    const observedTransport: HostGatewayTransport = {
      send(message): void {
        observations.serverMessage(message);
        transport.send(message);
      },
      onFailure(listener): () => void {
        return transport.onFailure((failure) => {
          listener(failure);
          observations.transportFailure(failure);
        });
      },
    };
    const result = originalOpenConnection(hostIdentity, observedTransport);
    if (result.kind === "accepted") {
      const originalReceive = result.connection.receive.bind(result.connection);
      result.connection.receive = (input): HostGatewayInboundResult => {
        const receiveResult = originalReceive(input);
        observations.gatewayResult(receiveResult);
        return receiveResult;
      };
    }
    return result;
  };
}

interface IntegrationHarness {
  readonly gateway: HostGateway;
  readonly adapter: HostGatewayWebSocketAdapter;
  readonly client: ActorHostWebSocketClient;
  readonly fake: FakeBackend;
  readonly supervisor: BackendSupervisor;
  readonly observations: IntegrationObservations;
  readonly verifierTokens: string[];
  readonly identity: AuthenticatedHostContext;
  cleanup(): Promise<void>;
}

async function closeHttpServer(server: HttpServer): Promise<void> {
  if (!server.listening) return;
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
}

async function createHarness(
  script: readonly FakeBackendStep[],
  clientIdentity: AuthenticatedHostContext = identity,
  verifiedIdentity: AuthenticatedHostContext = identity,
): Promise<IntegrationHarness> {
  const observations = new IntegrationObservations();
  const verifierTokens: string[] = [];
  const fake = new FakeBackend(script);
  const supervisor = new BackendSupervisor(fake);
  const gateway = new HostGateway({
    factSink: { accept: (fact) => observations.fact(fact) },
    messageIds: new DeterministicMessageIds(1),
    timestamps: new DeterministicTimestamps(),
  });
  decorateGateway(gateway, observations);
  const adapter = new HostGatewayWebSocketAdapter({
    gateway,
    verifier: {
      verify: async (receivedToken) => {
        verifierTokens.push(receivedToken);
        return { kind: "accepted", identity: verifiedIdentity };
      },
    },
  });
  const server = createServer();
  let client: ActorHostWebSocketClient | undefined;
  let cleanupPromise: Promise<void> | undefined;

  const cleanup = async (): Promise<void> => {
    if (cleanupPromise !== undefined) return cleanupPromise;
    cleanupPromise = (async () => {
      const activeInvocationId = supervisor.snapshot().activeInvocationId;
      if (
        activeInvocationId !== undefined
        && client?.state() === "open"
        && gateway.connectionForActor(identity.actorId) !== undefined
      ) {
        supervisor.stop(activeInvocationId);
        await Promise.resolve();
      } else if (activeInvocationId !== undefined) {
        supervisor.stop(activeInvocationId);
      }
      client?.close();
      await adapter.shutdown();
      await closeHttpServer(server);
      observations.clearWaiters();
    })();
    return cleanupPromise;
  };

  try {
    const attachment = adapter.attach(server);
    if (attachment.kind !== "attached") throw new Error(`Host Gateway adapter attach failed: ${attachment.reason}.`);
    await new Promise<void>((resolve, reject) => {
      const onListening = (): void => {
        server.off("error", onError);
        resolve();
      };
      const onError = (error: Error): void => {
        server.off("listening", onListening);
        reject(error);
      };
      server.once("listening", onListening);
      server.once("error", onError);
      server.listen(0, "127.0.0.1");
    });
    const address = server.address();
    if (address === null || typeof address === "string") throw new Error("Loopback server did not expose an address.");
    const port = (address as AddressInfo).port;
    client = new ActorHostWebSocketClient({
      port,
      hostToken: token,
      identity: clientIdentity,
      connectionGeneration: 1,
      messageIds: new DeterministicMessageIds(100),
      timestamps: new DeterministicTimestamps(),
      supervisor,
    });
    return {
      gateway,
      adapter,
      client,
      fake,
      supervisor,
      observations,
      verifierTokens,
      identity: verifiedIdentity,
      cleanup,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

async function connectAndAwaitRegistration(harness: IntegrationHarness): Promise<void> {
  const hello = waitFor<HostGatewayInboundResult>(
    harness.observations.events,
    "gateway_result",
    (result) => result.kind === "hello_registered",
  );
  const connectionResult = await harness.client.connect();
  expect(connectionResult).toEqual({ kind: "connected" });
  const helloResult = await hello;
  if (helloResult.kind !== "hello_registered") throw new Error("HostHello was not registered.");
  expect(helloResult.acknowledgement.sender_sequence).toBe(0);
  expect(helloResult.acknowledgement.payload).toEqual({
    kind: "ack",
    acknowledged_message_id: expect.any(String),
  });
  expect(harness.gateway.connectionForActor(harness.identity.actorId)).toBeDefined();
  expect(harness.verifierTokens).toEqual([token]);
}

function waitForAnyAcknowledgement(harness: IntegrationHarness): Promise<HostGatewayInboundResult> {
  return waitFor<HostGatewayInboundResult>(
    harness.observations.events,
    "gateway_result",
    (result) => result.kind === "acknowledged",
  );
}

function waitForFact(
  harness: IntegrationHarness,
  predicate: (fact: HostFact) => boolean,
): Promise<HostFact> {
  return waitFor<HostFact>(harness.observations.events, "fact", predicate);
}

function sendCommand(
  harness: IntegrationHarness,
  payload: Parameters<HostGateway["sendCommand"]>[1],
): ServerToHostMessage {
  const result = harness.gateway.sendCommand(harness.identity.actorId, payload);
  expect(result.kind).toBe("sent");
  if (result.kind !== "sent") throw new Error(`Host command was not sent: ${result.kind}.`);
  return result.message;
}

function sendCommandWithAcknowledgement(
  harness: IntegrationHarness,
  payload: Parameters<HostGateway["sendCommand"]>[1],
): { message: ServerToHostMessage; acknowledgement: Promise<HostGatewayInboundResult> } {
  const acknowledgement = waitForAnyAcknowledgement(harness);
  const message = sendCommand(harness, payload);
  return { message, acknowledgement };
}

function invocationResult(fact: HostFact): InvocationResult {
  if (fact.message.payload.kind !== "invocation_result") throw new Error("Expected an InvocationResult fact.");
  return fact.message.payload.result;
}

function gatewayResultIndex(
  harness: IntegrationHarness,
  predicate: (result: HostGatewayInboundResult) => boolean,
): number {
  return harness.observations.gatewayResults.findIndex(predicate);
}

function assertNoTokenExposure(harness: IntegrationHarness): void {
  const observed = JSON.stringify({
    serverMessages: harness.observations.serverMessages,
    gatewayResults: harness.observations.gatewayResults,
    facts: harness.observations.facts,
    transportFailures: harness.observations.transportFailures,
  });
  expect(observed).not.toContain(token);
}

describe("Host Gateway fake backend walking skeleton", () => {
  it("connects, initializes, creates, resumes, ACKs, and preserves event ordering", { timeout: 15_000 }, async () => {
    const harness = await createHarness([
      { kind: "pending", sessionId },
      { kind: "pending", sessionId },
    ]);
    try {
      await connectAndAwaitRegistration(harness);

      const ready = waitForFact(harness, (fact) => fact.message.payload.kind === "host_ready");
      const initializeCommandWithAck = sendCommandWithAcknowledgement(harness, { kind: "initialize_actor_host", launch_spec: launchSpec });
      const readyFact = await ready;
      const initializeAck = await initializeCommandWithAck.acknowledgement;
      expect(initializeAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: initializeCommandWithAck.message.message_id });
      expect(readyFact.message.payload.kind).toBe("host_ready");
      expect(harness.fake.initializeCalls).toBe(1);
      expect(harness.fake.startCalls).toHaveLength(0);
      expect(harness.fake.sessionBindings).toEqual([]);

      const firstSession = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "session_report"
        && fact.message.payload.invocation_id === createInvocationId);
      const firstResult = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "invocation_result"
        && fact.message.payload.result.invocation_id === createInvocationId);
      const firstCommandWithAck = sendCommandWithAcknowledgement(harness, {
        kind: "start_invocation",
        invocation_spec: invocation(createInvocationId, { mode: "create" }),
      });
      const firstSessionFact = await firstSession;
      const firstCommandAck = await firstCommandWithAck.acknowledgement;
      expect(firstCommandAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: firstCommandWithAck.message.message_id });
      expect(harness.supervisor.snapshot().state).toBe("running");
      if (firstSessionFact.message.payload.kind !== "session_report") throw new Error("Expected first SessionReport.");
      expect(firstSessionFact.message.payload.session_id).toBe(sessionId);
      harness.fake.complete(createInvocationId, { status: "exited", exit_code: 0 });
      const firstResultFact = await firstResult;
      expect(invocationResult(firstResultFact).session_id).toBe(sessionId);

      const secondSession = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "session_report"
        && fact.message.payload.invocation_id === resumeInvocationId);
      const secondResult = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "invocation_result"
        && fact.message.payload.result.invocation_id === resumeInvocationId);
      const secondCommandWithAck = sendCommandWithAcknowledgement(harness, {
        kind: "start_invocation",
        invocation_spec: invocation(resumeInvocationId, { mode: "resume", session_id: sessionId }),
      });
      const secondSessionFact = await secondSession;
      const secondCommandAck = await secondCommandWithAck.acknowledgement;
      expect(secondCommandAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: secondCommandWithAck.message.message_id });
      if (secondSessionFact.message.payload.kind !== "session_report") throw new Error("Expected second SessionReport.");
      expect(secondSessionFact.message.payload.session_id).toBe(sessionId);
      harness.fake.complete(resumeInvocationId, { status: "exited", exit_code: 0 });
      const secondResultFact = await secondResult;
      expect(invocationResult(secondResultFact).session_id).toBe(sessionId);

      expect(harness.fake.startCalls.map((call) => call.session)).toEqual([
        { mode: "create" },
        { mode: "resume", session_id: sessionId },
      ]);
      expect(harness.fake.sessionBindings).toEqual([sessionId, sessionId]);
      expect(harness.observations.facts.indexOf(firstSessionFact)).toBeLessThan(harness.observations.facts.indexOf(firstResultFact));
      expect(harness.observations.facts.indexOf(secondSessionFact)).toBeLessThan(harness.observations.facts.indexOf(secondResultFact));
      const initializeAckIndex = gatewayResultIndex(
        harness,
        (result) => result.kind === "acknowledged" && result.acknowledgedMessageId === initializeCommandWithAck.message.message_id,
      );
      const readyResultIndex = gatewayResultIndex(
        harness,
        (result) => result.kind === "fact_delivered" && result.fact.message.message_id === readyFact.message.message_id,
      );
      const firstAckIndex = gatewayResultIndex(
        harness,
        (result) => result.kind === "acknowledged" && result.acknowledgedMessageId === firstCommandWithAck.message.message_id,
      );
      const firstSessionResultIndex = gatewayResultIndex(
        harness,
        (result) => result.kind === "fact_delivered" && result.fact.message.message_id === firstSessionFact.message.message_id,
      );
      const secondAckIndex = gatewayResultIndex(
        harness,
        (result) => result.kind === "acknowledged" && result.acknowledgedMessageId === secondCommandWithAck.message.message_id,
      );
      const secondSessionResultIndex = gatewayResultIndex(
        harness,
        (result) => result.kind === "fact_delivered" && result.fact.message.message_id === secondSessionFact.message.message_id,
      );
      expect(initializeAckIndex).toBeGreaterThanOrEqual(0);
      expect(readyResultIndex).toBeGreaterThan(initializeAckIndex);
      expect(firstAckIndex).toBeGreaterThanOrEqual(0);
      expect(firstSessionResultIndex).toBeGreaterThan(firstAckIndex);
      expect(secondAckIndex).toBeGreaterThanOrEqual(0);
      expect(secondSessionResultIndex).toBeGreaterThan(secondAckIndex);
      const receiptAckIds = new Set(
        harness.observations.serverMessages
          .flatMap((message) => message.payload.kind === "ack" ? [message.payload.acknowledged_message_id] : []),
      );
      for (const fact of harness.observations.facts) expect(receiptAckIds.has(fact.message.message_id)).toBe(true);
      expect(harness.observations.gatewayResults).toContainEqual({ kind: "acknowledged", acknowledgedMessageId: initializeCommandWithAck.message.message_id });
      expect(harness.observations.gatewayResults).toContainEqual({ kind: "acknowledged", acknowledgedMessageId: firstCommandWithAck.message.message_id });
      expect(harness.observations.gatewayResults).toContainEqual({ kind: "acknowledged", acknowledgedMessageId: secondCommandWithAck.message.message_id });
      assertNoTokenExposure(harness);
    } finally {
      await harness.cleanup();
    }
  });

  it("rejects an authenticated identity mismatch before initialization or backend execution", { timeout: 15_000 }, async () => {
    const harness = await createHarness([], otherIdentity, identity);
    try {
      const rejection = waitFor<HostGatewayInboundResult>(
        harness.observations.events,
        "gateway_result",
        (result) => result.kind === "rejected" && result.reason === "identity_mismatch",
      );
      expect(await harness.client.connect()).toEqual({ kind: "connected" });
      await rejection;
      expect(harness.gateway.connectionForActor(actorId)).toBeUndefined();
      expect(harness.gateway.connectionForActor(otherActorId)).toBeUndefined();
      expect(harness.fake.initializeCalls).toBe(0);
      expect(harness.fake.startCalls).toHaveLength(0);
      assertNoTokenExposure(harness);
    } finally {
      await harness.cleanup();
    }
  });

  it("reports busy without launching a second backend execution", { timeout: 15_000 }, async () => {
    const harness = await createHarness([{ kind: "pending", sessionId }]);
    try {
      await connectAndAwaitRegistration(harness);
      const ready = waitForFact(harness, (fact) => fact.message.payload.kind === "host_ready");
      const initializeCommandWithAck = sendCommandWithAcknowledgement(harness, { kind: "initialize_actor_host", launch_spec: launchSpec });
      const initializeAck = await initializeCommandWithAck.acknowledgement;
      expect(initializeAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: initializeCommandWithAck.message.message_id });
      await ready;

      const firstSession = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "session_report"
        && fact.message.payload.invocation_id === createInvocationId);
      const firstCommandWithAck = sendCommandWithAcknowledgement(harness, {
        kind: "start_invocation",
        invocation_spec: invocation(createInvocationId, { mode: "create" }),
      });
      const firstAck = await firstCommandWithAck.acknowledgement;
      expect(firstAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: firstCommandWithAck.message.message_id });
      await firstSession;

      const busyFault = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "host_fault"
        && fact.message.payload.invocation_id === resumeInvocationId);
      const secondCommandWithAck = sendCommandWithAcknowledgement(harness, {
        kind: "start_invocation",
        invocation_spec: invocation(resumeInvocationId, { mode: "create" }),
      });
      const secondAck = await secondCommandWithAck.acknowledgement;
      expect(secondAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: secondCommandWithAck.message.message_id });
      const faultFact = await busyFault;
      if (faultFact.message.payload.kind !== "host_fault") throw new Error("Expected HostFault.");
      expect(faultFact.message.payload.error.code).toBe("actor_host.busy");
      expect(harness.fake.startCalls).toHaveLength(1);
      expect(harness.supervisor.snapshot().state).toBe("running");
      assertNoTokenExposure(harness);
    } finally {
      await harness.cleanup();
    }
  });

  it("reports scripted launch failure as InvocationResult rather than HostFault", { timeout: 15_000 }, async () => {
    const harness = await createHarness([{ kind: "launch_failed", error: launchFailure() }]);
    try {
      await connectAndAwaitRegistration(harness);
      const ready = waitForFact(harness, (fact) => fact.message.payload.kind === "host_ready");
      const initializeCommandWithAck = sendCommandWithAcknowledgement(harness, { kind: "initialize_actor_host", launch_spec: launchSpec });
      const initializeAck = await initializeCommandWithAck.acknowledgement;
      expect(initializeAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: initializeCommandWithAck.message.message_id });
      await ready;

      const resultFact = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "invocation_result"
        && fact.message.payload.result.invocation_id === createInvocationId);
      const startCommandWithAck = sendCommandWithAcknowledgement(harness, {
        kind: "start_invocation",
        invocation_spec: invocation(createInvocationId, { mode: "create" }),
      });
      const startAck = await startCommandWithAck.acknowledgement;
      expect(startAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: startCommandWithAck.message.message_id });
      const result = invocationResult(await resultFact);
      expect(result.process).toEqual({ status: "launch_failed", error: launchFailure() });
      expect(harness.observations.facts.some((fact) => fact.message.payload.kind === "host_fault")).toBe(false);
      expect(harness.fake.startCalls).toHaveLength(1);
      expect(harness.fake.sessionBindings).toEqual([]);
      assertNoTokenExposure(harness);
    } finally {
      await harness.cleanup();
    }
  });

  it("unregisters after explicit disconnect and rejects later commands", { timeout: 15_000 }, async () => {
    const harness = await createHarness([{ kind: "pending", sessionId }]);
    try {
      await connectAndAwaitRegistration(harness);
      const ready = waitForFact(harness, (fact) => fact.message.payload.kind === "host_ready");
      const initializeCommandWithAck = sendCommandWithAcknowledgement(harness, { kind: "initialize_actor_host", launch_spec: launchSpec });
      const initializeAck = await initializeCommandWithAck.acknowledgement;
      expect(initializeAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: initializeCommandWithAck.message.message_id });
      await ready;

      const firstSession = waitForFact(harness, (fact) =>
        fact.message.payload.kind === "session_report"
        && fact.message.payload.invocation_id === createInvocationId);
      const startCommandWithAck = sendCommandWithAcknowledgement(harness, {
        kind: "start_invocation",
        invocation_spec: invocation(createInvocationId, { mode: "create" }),
      });
      const startAck = await startCommandWithAck.acknowledgement;
      expect(startAck).toEqual({ kind: "acknowledged", acknowledgedMessageId: startCommandWithAck.message.message_id });
      await firstSession;

      const transportFailure = waitFor<HostTransportFailure>(harness.observations.events, "transport_failure");
      harness.client.close();
      await transportFailure;
      expect(harness.gateway.connectionForActor(actorId)).toBeUndefined();
      expect(harness.observations.transportFailures).toHaveLength(1);
      const messagesBeforeRejectedCommand = harness.observations.serverMessages.length;
      expect(harness.gateway.sendCommand(harness.identity.actorId, {
        kind: "start_invocation",
        invocation_spec: invocation(resumeInvocationId, { mode: "resume", session_id: sessionId }),
      })).toEqual({ kind: "rejected", reason: "not_live" });
      expect(harness.observations.serverMessages).toHaveLength(messagesBeforeRejectedCommand);
      assertNoTokenExposure(harness);
    } finally {
      await harness.cleanup();
    }
  });
});
