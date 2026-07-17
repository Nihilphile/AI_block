import { createServer, type IncomingMessage } from "node:http";
import { EventEmitter } from "node:events";
import type { AddressInfo } from "node:net";
import type { Duplex } from "node:stream";
import WebSocket from "ws";
import {
  HOST_PROTOCOL_VERSION,
  type ActorId,
  type ActorLaunchSpec,
  type CanonicalTimestamp,
  type HostHelloPayload,
  type HostInstanceId,
  type HostMessageId,
  type HostToServerMessage,
  type InvocationSpec,
  type ProjectId,
  type ServerToHostMessage,
} from "@ai-block/runtime-contracts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HostGateway } from "../../../src/modules/host-gateway/host-gateway.js";
import type {
  HostCredentialVerificationResult,
  HostCredentialVerifier,
} from "../../../src/modules/host-gateway/ports.js";
import {
  HOST_WEBSOCKET_MAX_INBOUND_BYTES,
  HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES,
  HOST_WEBSOCKET_PATH,
  HOST_WEBSOCKET_VERIFIER_TIMEOUT_MS,
  HostGatewayWebSocketAdapter,
} from "../../../src/infrastructure/actor-host-websocket/host-gateway-websocket-adapter.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const OTHER_UUID = "11111111-1111-4111-8111-111111111111";
const projectId = `project_${UUID}` as ProjectId;
const otherProjectId = `project_${OTHER_UUID}` as ProjectId;
const actorId = `actor_${UUID}` as ActorId;
const otherActorId = `actor_${OTHER_UUID}` as ActorId;
const hostInstanceId = `host_${UUID}` as HostInstanceId;
const messageId = `message_${UUID}` as HostMessageId;
const timestamp = "2026-07-16T12:34:56.789Z" as CanonicalTimestamp;
const identity = { projectId, actorId, hostInstanceId } as const;

const launchSpec: ActorLaunchSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  actor_id: actorId,
  actor_config_snapshot_id: `actor_config_${UUID}`,
  system_prompts: [],
  working_directory: "C:\\work",
  backend: { adapter_id: "fake.backend", config: {} },
  tool_providers: [],
};

const invocationSpec: InvocationSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  run_id: `run_${UUID}`,
  actor_id: actorId,
  invocation_id: `invocation_${UUID}`,
  input_package_refs: [{ package_id: `package_${UUID}`, content_hash: `sha256:${"a".repeat(64)}` }],
  prompt: { kind: "text", text: "prompt" },
  session: { mode: "create" },
};

class FakeVerifier implements HostCredentialVerifier {
  public readonly tokens: string[] = [];
  public result: HostCredentialVerificationResult = { kind: "accepted", identity };
  public promise: Promise<HostCredentialVerificationResult> | undefined;

  public verify(token: string): Promise<HostCredentialVerificationResult> {
    this.tokens.push(token);
    return this.promise ?? Promise.resolve(this.result);
  }
}

class FakeSocket extends EventEmitter {
  public destroyed = false;
  public readonly writes: string[] = [];

  public end(data?: string | Uint8Array): this {
    if (data !== undefined) this.writes.push(typeof data === "string" ? data : Buffer.from(data).toString("utf8"));
    this.destroy();
    return this;
  }

  public destroy(): this {
    if (!this.destroyed) {
      this.destroyed = true;
      this.emit("close");
    }
    return this;
  }
}

class FakeRequest extends EventEmitter {
  public method = "GET";
  public url = HOST_WEBSOCKET_PATH;
  public headers: Record<string, string | undefined> = {
    authorization: "Bearer token",
    connection: "Upgrade",
    upgrade: "websocket",
  };
  public socket = { localAddress: "127.0.0.1" };
}

function createGateway(options: {
  readonly nextMessageId?: () => HostMessageId;
  readonly outboundEnvelopeValidator?: (message: ServerToHostMessage) => boolean;
} = {}) {
  let counter = 0;
  const gateway = new HostGateway({
    factSink: { accept: vi.fn() },
    messageIds: {
      nextMessageId: () => {
        if (options.nextMessageId !== undefined) return options.nextMessageId();
        counter += 1;
        return `message_${String(counter).padStart(8, "0")}-0000-4000-8000-000000000000` as HostMessageId;
      },
    },
    timestamps: { now: () => timestamp },
    outboundEnvelopeValidator: options.outboundEnvelopeValidator,
  });
  return gateway;
}

function upgradeRequest(request: FakeRequest): IncomingMessage {
  return request as unknown as IncomingMessage;
}

function upgradeSocket(socket: FakeSocket): Duplex {
  return socket as unknown as Duplex;
}

function hello(): HostToServerMessage {
  const payload: HostHelloPayload = {
    kind: "host_hello",
    project_id: projectId,
    actor_id: actorId,
    host_instance_id: hostInstanceId,
  };
  return {
    protocol_version: HOST_PROTOCOL_VERSION,
    message_id: messageId,
    sender_sequence: 0,
    connection_generation: 1,
    sent_at: timestamp,
    payload,
  };
}

async function listen(server: ReturnType<typeof createServer>): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  return (server.address() as AddressInfo).port;
}

async function closeServer(server: ReturnType<typeof createServer>): Promise<void> {
  if (!server.listening) return;
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

function waitForEvent<T extends unknown[]>(emitter: EventEmitter, event: string): Promise<T> {
  return new Promise((resolve) => emitter.once(event, (...args: T) => resolve(args)));
}

async function closeClient(client: WebSocket): Promise<void> {
  if (client.readyState === WebSocket.CLOSED) return;
  const closed = waitForEvent<[number, Buffer]>(client, "close");
  client.terminate();
  await closed;
}

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 10; index += 1) await Promise.resolve();
}

describe("Runtime Server authenticated Host Gateway WebSocket adapter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the frozen rejection statuses and never leaks credentials", async () => {
    const cases: Array<{ path: string; authorization?: string; localAddress?: string; result?: HostCredentialVerificationResult; expected: string }> = [
      { path: "/wrong", authorization: "Bearer secret", expected: "404 Not Found" },
      { path: `${HOST_WEBSOCKET_PATH}?query=not-owned`, authorization: "Bearer secret", expected: "404 Not Found" },
      { path: HOST_WEBSOCKET_PATH, authorization: "Bearer secret!", expected: "401 Unauthorized" },
      { path: HOST_WEBSOCKET_PATH, authorization: `Bearer ${"a".repeat(4097)}`, expected: "401 Unauthorized" },
      { path: HOST_WEBSOCKET_PATH, authorization: "Bearer secret", localAddress: "::1", expected: "404 Not Found" },
      { path: HOST_WEBSOCKET_PATH, expected: "401 Unauthorized" },
      { path: HOST_WEBSOCKET_PATH, authorization: "Basic secret", expected: "401 Unauthorized" },
      {
        path: HOST_WEBSOCKET_PATH,
        authorization: "Bearer secret",
        result: { kind: "rejected", reason: "invalid" },
        expected: "401 Unauthorized",
      },
      {
        path: HOST_WEBSOCKET_PATH,
        authorization: "Bearer secret",
        result: { kind: "rejected", reason: "unavailable" },
        expected: "503 Service Unavailable",
      },
    ];

    for (const [caseIndex, testCase] of cases.entries()) {
      const verifier = new FakeVerifier();
      if (testCase.result !== undefined) verifier.result = testCase.result;
      const socket = new FakeSocket();
      const request = new FakeRequest();
      request.url = testCase.path;
      request.socket.localAddress = testCase.localAddress ?? "127.0.0.1";
      request.headers.authorization = testCase.authorization;
      const adapter = new HostGatewayWebSocketAdapter({ gateway: createGateway(), verifier });

      adapter.handleUpgrade(upgradeRequest(request), upgradeSocket(socket), Buffer.alloc(0));
      await flushMicrotasks();

      if (socket.writes[0] === undefined) throw new Error(`missing response for case ${caseIndex}: ${testCase.expected}`);
      expect(socket.writes[0]).toContain(testCase.expected);
      expect(socket.writes[0]).toContain("Content-Length: 0");
      expect(socket.writes[0]).toContain("Connection: close");
      expect(socket.writes[0]).not.toContain("secret");
      expect(socket.writes[0]).not.toContain("invalid");
      expect(socket.destroyed).toBe(true);
      expect(verifier.tokens).toEqual(testCase.path === HOST_WEBSOCKET_PATH && (testCase.localAddress ?? "127.0.0.1") === "127.0.0.1" && testCase.authorization?.startsWith("Bearer ") && testCase.authorization === "Bearer secret" ? ["secret"] : []);
      await adapter.shutdown();
    }
  });

  it("maps verifier exceptions and deadline to 503, with one race settlement", async () => {
    vi.useFakeTimers();
    const verifier = new FakeVerifier();
    verifier.promise = Promise.reject(new Error("secret verifier failure"));
    const socket = new FakeSocket();
    const request = new FakeRequest();
    const adapter = new HostGatewayWebSocketAdapter({ gateway: createGateway(), verifier });
    adapter.handleUpgrade(upgradeRequest(request), upgradeSocket(socket), Buffer.alloc(0));
    await vi.runAllTimersAsync();
    expect(socket.writes[0]).toContain("503 Service Unavailable");
    expect(socket.writes[0]).not.toContain("secret");
    await adapter.shutdown();

    const pendingVerifier = new FakeVerifier();
    let resolveVerification!: (result: HostCredentialVerificationResult) => void;
    pendingVerifier.promise = new Promise((resolve) => { resolveVerification = resolve; });
    const pendingSocket = new FakeSocket();
    const pendingRequest = new FakeRequest();
    const pendingAdapter = new HostGatewayWebSocketAdapter({ gateway: createGateway(), verifier: pendingVerifier });
    pendingAdapter.handleUpgrade(upgradeRequest(pendingRequest), upgradeSocket(pendingSocket), Buffer.alloc(0));
    pendingSocket.emit("close");
    resolveVerification({ kind: "accepted", identity });
    await Promise.resolve();
    await Promise.resolve();
    expect(pendingSocket.writes).toHaveLength(0);
    await pendingAdapter.shutdown();
  });

  it("returns the verifier deadline exactly at 4000ms and ignores a late fulfillment", async () => {
    vi.useFakeTimers();
    const verifier = new FakeVerifier();
    let resolveVerification!: (result: HostCredentialVerificationResult) => void;
    verifier.promise = new Promise((resolve) => { resolveVerification = resolve; });
    const socket = new FakeSocket();
    const adapter = new HostGatewayWebSocketAdapter({ gateway: createGateway(), verifier });
    adapter.handleUpgrade(upgradeRequest(new FakeRequest()), upgradeSocket(socket), Buffer.alloc(0));
    await vi.advanceTimersByTimeAsync(HOST_WEBSOCKET_VERIFIER_TIMEOUT_MS - 1);
    expect(socket.writes).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(socket.writes[0]).toContain("503 Service Unavailable");
    resolveVerification({ kind: "accepted", identity });
    await flushMicrotasks();
    expect(socket.writes).toHaveLength(1);
    await adapter.shutdown();
  });

  it("attaches only one upgrade listener and detaches/shuts down idempotently", async () => {
    const server = new EventEmitter() as ReturnType<typeof createServer>;
    const adapter = new HostGatewayWebSocketAdapter({ gateway: createGateway(), verifier: new FakeVerifier() });
    const attached = adapter.attach(server);
    expect(attached.kind).toBe("attached");
    expect(adapter.attach(server)).toEqual({ kind: "rejected", reason: "already_attached" });
    if (attached.kind === "attached") {
      attached.detach();
      attached.detach();
    }
    expect(server.listenerCount("upgrade")).toBe(0);
    expect(adapter.attach(server)).toEqual({ kind: "rejected", reason: "already_attached" });
    await adapter.shutdown();
    await adapter.shutdown();
  });

  it("upgrades on loopback, registers after Hello ACK, sends text, and cleans up", async () => {
    const server = createServer();
    const verifier = new FakeVerifier();
    const gateway = createGateway();
    const adapter = new HostGatewayWebSocketAdapter({ gateway, verifier });
    const attached = adapter.attach(server);
    expect(attached.kind).toBe("attached");
    const port = await listen(server);
    const client = new WebSocket(`ws://127.0.0.1:${port}${HOST_WEBSOCKET_PATH}`, {
      headers: { authorization: "Bearer loopback-token" },
      followRedirects: false,
      perMessageDeflate: false,
      handshakeTimeout: 5000,
      maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
    });
    try {
      await waitForEvent<[void]>(client, "open");
      expect(client.extensions).toBe("");
      expect(verifier.tokens).toEqual(["loopback-token"]);
      client.send(JSON.stringify(hello()), { binary: false, compress: false });
      const [data, isBinary] = await waitForEvent<[WebSocket.RawData, boolean]>(client, "message");
      expect(isBinary).toBe(false);
      const acknowledgement = JSON.parse(data.toString()) as ServerToHostMessage;
      expect(acknowledgement.payload).toMatchObject({ kind: "ack", acknowledged_message_id: messageId });
      expect(gateway.connectionForActor(actorId)).toBeDefined();

      expect(gateway.sendCommand(actorId, {
        kind: "initialize_actor_host",
        launch_spec: { ...launchSpec, project_id: otherProjectId },
      })).toEqual({ kind: "rejected", reason: "identity_mismatch" });
      expect(gateway.sendCommand(actorId, {
        kind: "start_invocation",
        invocation_spec: { ...invocationSpec, actor_id: otherActorId },
      })).toEqual({ kind: "rejected", reason: "identity_mismatch" });
      expect(client.readyState).toBe(WebSocket.OPEN);

      expect(gateway.sendCommand(actorId, { kind: "shutdown_host", reason: "test" }).kind).toBe("sent");
      const [commandData, commandBinary] = await waitForEvent<[WebSocket.RawData, boolean]>(client, "message");
      expect(commandBinary).toBe(false);
      expect(JSON.parse(commandData.toString())).toMatchObject({ payload: { kind: "shutdown_host" } });
      expect(HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES).toBe(8 * 1024 * 1024);
    } finally {
      await closeClient(client);
      await adapter.shutdown();
      await closeServer(server);
    }
  });

  it("terminates the real loopback socket once for Gateway provider or envelope failure and permits fresh registration", async () => {
    for (const failureKind of ["provider", "envelope"] as const) {
      const server = createServer();
      let failNextMessageId = false;
      let counter = 0;
      const gateway = createGateway(failureKind === "provider" ? {
        nextMessageId: () => {
          if (failNextMessageId) {
            failNextMessageId = false;
            throw new Error("secret provider failure");
          }
          counter += 1;
          return `message_${String(counter).padStart(8, "0")}-0000-4000-8000-000000000000` as HostMessageId;
        },
      } : {
        outboundEnvelopeValidator: (message) => message.payload.kind === "ack",
      });
      const adapter = new HostGatewayWebSocketAdapter({ gateway, verifier: new FakeVerifier() });
      adapter.attach(server);
      const port = await listen(server);
      const url = `ws://127.0.0.1:${port}${HOST_WEBSOCKET_PATH}`;
      const client = new WebSocket(url, {
        headers: { authorization: "Bearer loopback-token" },
        perMessageDeflate: false,
        handshakeTimeout: 5000,
        maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
      });
      const messages: string[] = [];
      let closeEvents = 0;
      client.on("message", (data: WebSocket.RawData) => messages.push(data.toString()));
      client.on("close", () => { closeEvents += 1; });

      try {
        await waitForEvent<[void]>(client, "open");
        client.send(JSON.stringify(hello()), { binary: false, compress: false });
        await waitForEvent<[WebSocket.RawData, boolean]>(client, "message");

        if (failureKind === "provider") failNextMessageId = true;
        const failed = gateway.sendCommand(actorId, { kind: "shutdown_host", reason: `secret-${failureKind}-failure` });
        expect(failed).toMatchObject({ kind: "transport_failed" });
        await waitForEvent<[number, Buffer]>(client, "close");
        await flushMicrotasks();

        expect(closeEvents).toBe(1);
        expect(gateway.connectionForActor(actorId)).toBeUndefined();
        expect(messages.join("\n")).not.toContain("secret");
        expect(messages.join("\n")).not.toContain("loopback-token");

        if (failureKind === "provider") failNextMessageId = false;
        const retryClient = new WebSocket(url, {
          headers: { authorization: "Bearer loopback-token" },
          perMessageDeflate: false,
          handshakeTimeout: 5000,
          maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
        });
        try {
          await waitForEvent<[void]>(retryClient, "open");
          retryClient.send(JSON.stringify(hello()), { binary: false, compress: false });
          const [retryData] = await waitForEvent<[WebSocket.RawData, boolean]>(retryClient, "message");
          expect(JSON.parse(retryData.toString())).toMatchObject({ payload: { kind: "ack" } });
          expect(gateway.connectionForActor(actorId)).toBeDefined();
        } finally {
          if (retryClient.readyState !== WebSocket.CLOSED) await closeClient(retryClient);
        }
      } finally {
        if (client.readyState !== WebSocket.CLOSED) await closeClient(client);
        await adapter.shutdown();
        await closeServer(server);
      }
    }
  });

  it("terminates a loopback connection on binary input without a second HTTP response", async () => {
    const server = createServer();
    const gateway = createGateway();
    const adapter = new HostGatewayWebSocketAdapter({ gateway, verifier: new FakeVerifier() });
    adapter.attach(server);
    const port = await listen(server);
    const client = new WebSocket(`ws://127.0.0.1:${port}${HOST_WEBSOCKET_PATH}`, {
      headers: { authorization: "Bearer loopback-token" },
      perMessageDeflate: false,
      handshakeTimeout: 5000,
      maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
    });
    try {
      await waitForEvent<[void]>(client, "open");
      client.send(Buffer.from("binary"));
      await waitForEvent<[number, Buffer]>(client, "close");
      expect(gateway.connectionForActor(actorId)).toBeUndefined();
    } finally {
      if (client.readyState !== WebSocket.CLOSED) await closeClient(client);
      await adapter.shutdown();
      await closeServer(server);
    }
  });

  it("terminates on a Host Gateway core rejection without sending a protocol error", async () => {
    const server = createServer();
    const gateway = createGateway();
    const adapter = new HostGatewayWebSocketAdapter({ gateway, verifier: new FakeVerifier() });
    adapter.attach(server);
    const port = await listen(server);
    const client = new WebSocket(`ws://127.0.0.1:${port}${HOST_WEBSOCKET_PATH}`, {
      headers: { authorization: "Bearer loopback-token" },
      perMessageDeflate: false,
      handshakeTimeout: 5000,
      maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
    });
    try {
      await waitForEvent<[void]>(client, "open");
      client.send(JSON.stringify({
        protocol_version: HOST_PROTOCOL_VERSION,
        message_id: messageId,
        sender_sequence: 0,
        connection_generation: 1,
        sent_at: timestamp,
        payload: { kind: "not-a-host-payload" },
      }), { binary: false, compress: false });
      await waitForEvent<[number, Buffer]>(client, "close");
      expect(gateway.connectionForActor(actorId)).toBeUndefined();
    } finally {
      if (client.readyState !== WebSocket.CLOSED) await closeClient(client);
      await adapter.shutdown();
      await closeServer(server);
    }
  });
});
