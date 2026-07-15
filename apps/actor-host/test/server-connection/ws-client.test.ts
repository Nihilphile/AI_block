import { describe, expect, it } from "vitest";
import WebSocket, { WebSocketServer } from "ws";
import type { AddressInfo } from "node:net";
import type {
  ActorLaunchSpec,
  CanonicalTimestamp,
  HostMessageId,
  HostToServerMessage,
  InvocationSpec,
  ServerToHostMessage,
} from "@ai-block/runtime-contracts";
import { FakeBackend } from "../../src/backend/fake-backend.js";
import { BackendSupervisor } from "../../src/backend/supervisor.js";
import {
  ActorHostWebSocketClient,
  HOST_WEBSOCKET_HANDSHAKE_TIMEOUT_MS,
  HOST_WEBSOCKET_MAX_INBOUND_BYTES,
  HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES,
  HOST_WEBSOCKET_PATH,
  type HostSocket,
  type HostSocketData,
  type HostSocketFactory,
  type HostSocketOptions,
} from "../../src/server-connection/ws-client.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const hostInstanceId = `host_${UUID}`;
const snapshotId = `actor_config_${UUID}`;
const runId = `run_${UUID}`;
const packageRef = {
  package_id: `package_${UUID}`,
  content_hash: `sha256:${"a".repeat(64)}`,
};
const launchSpec = {
  schema_version: "1.0.0",
  project_id: projectId,
  actor_id: actorId,
  actor_config_snapshot_id: snapshotId,
  system_prompts: [],
  working_directory: "C:\\work",
  backend: { adapter_id: "fake.backend", config: {} },
  tool_providers: [],
} satisfies ActorLaunchSpec;
const identity = { projectId, hostInstanceId, actorId };
const token = "test-host-token_123";

const messageIds = [
  `message_${"11111111-1111-4111-8111-111111111111"}`,
  `message_${"22222222-2222-4222-8222-222222222222"}`,
  `message_${"33333333-3333-4333-8333-333333333333"}`,
  `message_${"44444444-4444-4444-8444-444444444444"}`,
  `message_${"55555555-5555-4555-8555-555555555555"}`,
] as const;
const timestamps = [
  "2026-07-16T01:00:00.000Z",
  "2026-07-16T01:00:00.001Z",
  "2026-07-16T01:00:00.002Z",
  "2026-07-16T01:00:00.003Z",
  "2026-07-16T01:00:00.004Z",
] as const;

class DeterministicIds {
  private index = 0;

  public nextMessageId(): HostMessageId {
    const value = messageIds[this.index++];
    if (value === undefined) throw new Error("test message ID provider exhausted");
    return value;
  }
}

class DeterministicTimestamps {
  private index = 0;

  public now(): CanonicalTimestamp {
    const value = timestamps[this.index++];
    if (value === undefined) throw new Error("test timestamp provider exhausted");
    return value;
  }
}

class FakeSocket implements HostSocket {
  public readyState = 0;
  public bufferedAmount = 0;
  public readonly sent: Array<{ text: string; binary: false; compress: false }> = [];
  public throwOnSend = false;
  private sendCallback: ((error?: Error) => void) | undefined;
  private readonly handlers = new Map<string, Array<(...args: any[]) => void>>();

  public on(event: "open", listener: () => void): void;
  public on(event: "message", listener: (data: HostSocketData, isBinary: boolean) => void): void;
  public on(event: "error", listener: (error: Error) => void): void;
  public on(event: "close", listener: (code: number, reason: Uint8Array) => void): void;
  public on(event: "unexpected-response", listener: () => void): void;
  public on(event: "redirect", listener: () => void): void;
  public on(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.handlers.get(event) ?? [];
    listeners.push(listener);
    this.handlers.set(event, listeners);
  }

  public send(
    text: string,
    options: { readonly binary: false; readonly compress: false },
    callback: (error?: Error) => void,
  ): void {
    if (this.throwOnSend) throw new Error("fake send failed");
    this.sent.push({ text, binary: options.binary, compress: options.compress });
    this.sendCallback = callback;
  }

  public close(): void {
    this.readyState = 3;
    this.emit("close", 1000, new Uint8Array());
  }

  public terminate(): void {
    this.readyState = 3;
  }

  public open(): void {
    this.readyState = 1;
    this.emit("open");
  }

  public message(data: HostSocketData, isBinary = false): void {
    this.emit("message", data, isBinary);
  }

  public error(): void {
    this.emit("error", new Error("fake socket error"));
  }

  public closeUnexpectedly(): void {
    this.readyState = 3;
    this.emit("close", 1006, new Uint8Array());
  }

  public unexpectedResponse(): void {
    this.emit("unexpected-response");
  }

  public redirect(): void {
    this.emit("redirect");
  }

  public sendError(): void {
    const callback = this.sendCallback;
    this.sendCallback = undefined;
    callback?.(new Error("fake asynchronous send failure"));
  }

  private emit(event: string, ...args: any[]): void {
    for (const listener of this.handlers.get(event) ?? []) listener(...args);
  }
}

class RecordingFactory implements HostSocketFactory {
  public url: string | undefined;
  public options: HostSocketOptions | undefined;

  public constructor(public readonly socket: FakeSocket) {}

  public create(url: string, options: HostSocketOptions): HostSocket {
    this.url = url;
    this.options = options;
    return this.socket;
  }
}

function createClient(socket = new FakeSocket(), hostToken = token, port = 43123): {
  client: ActorHostWebSocketClient;
  socket: FakeSocket;
  factory: RecordingFactory;
} {
  const factory = new RecordingFactory(socket);
  const client = new ActorHostWebSocketClient({
    port,
    hostToken,
    identity,
    connectionGeneration: 1,
    messageIds: new DeterministicIds(),
    timestamps: new DeterministicTimestamps(),
    supervisor: new BackendSupervisor(new FakeBackend([])),
    socketFactory: factory,
  });
  return { client, socket, factory };
}

function inboundAck(sequence = 0): ServerToHostMessage {
  return {
    protocol_version: "1.0.0",
    message_id: `message_${"99999999-9999-4999-8999-999999999999"}`,
    sender_sequence: sequence,
    connection_generation: 1,
    sent_at: "2026-07-16T02:00:00.000Z",
    payload: {
      kind: "ack",
      acknowledged_message_id: messageIds[0],
    },
  };
}

describe("ActorHost WebSocket client", () => {
  it("waits for open, sends exactly one text HostHello, and exposes exact options", async () => {
    const { client, socket, factory } = createClient();
    const pending = client.connect();
    expect(client.state()).toBe("connecting");
    expect(factory.url).toBe("ws://127.0.0.1:43123/actor-hosts/connect");
    expect(factory.options?.headers.Authorization === `Bearer ${token}`).toBe(true);
    expect(factory.options?.followRedirects).toBe(false);
    expect(factory.options?.perMessageDeflate).toBe(false);
    expect(factory.options?.handshakeTimeout).toBe(HOST_WEBSOCKET_HANDSHAKE_TIMEOUT_MS);
    expect(factory.options?.maxPayload).toBe(HOST_WEBSOCKET_MAX_INBOUND_BYTES);

    socket.open();
    expect(await pending).toEqual({ kind: "connected" });
    expect(client.state()).toBe("open");
    expect(socket.sent).toHaveLength(1);
    expect(socket.sent[0]!.binary).toBe(false);
    expect(socket.sent[0]!.compress).toBe(false);
    expect(JSON.parse(socket.sent[0]!.text).payload.kind).toBe("host_hello");

    expect(await client.connect()).toEqual({ kind: "rejected", reason: "already_connected" });
    expect(socket.sent).toHaveLength(1);
  });

  it("accepts a boundary-equal outbound buffer and rejects the next over-limit send", async () => {
    const { client, socket } = createClient();
    const pending = client.connect();
    socket.open();
    await pending;

    const nextMessage: HostToServerMessage = {
      protocol_version: "1.0.0",
      message_id: messageIds[1],
      sender_sequence: 1,
      connection_generation: 1,
      sent_at: timestamps[1],
      payload: { kind: "heartbeat" },
    };
    socket.bufferedAmount = HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES - Buffer.byteLength(JSON.stringify(nextMessage), "utf8");
    expect(client.connection.send({ payload: { kind: "heartbeat" } })).toEqual({ kind: "sent" });
    expect(socket.sent).toHaveLength(2);

    socket.bufferedAmount = HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES;
    expect(client.connection.send({ payload: { kind: "heartbeat" } })).toMatchObject({
      kind: "transport_failed",
      error: { code: "transport_failed" },
    });
    expect(client.state()).toBe("failed");
    expect(client.connection.state()).toBe("failed");
  });

  it("maps malformed, binary, oversize, and core protocol rejection to terminal failure", async () => {
    for (const input of [
      { data: "{", binary: false },
      { data: new Uint8Array([123]), binary: true },
      { data: "x".repeat(HOST_WEBSOCKET_MAX_INBOUND_BYTES + 1), binary: false },
    ]) {
      const { client, socket } = createClient();
      const pending = client.connect();
      socket.open();
      await pending;
      socket.message(input.data, input.binary);
      expect(client.state()).toBe("failed");
      expect(client.connection.state()).toBe("failed");
    }

    const { client, socket } = createClient();
    const pending = client.connect();
    socket.open();
    await pending;
    socket.message(JSON.stringify({ ...inboundAck(), connection_generation: 2 }));
    expect(client.state()).toBe("failed");
    expect(client.connection.state()).toBe("failed");
    expect(socket.readyState).toBe(3);
  });

  it("propagates asynchronous send failure and suppresses duplicate socket failures", async () => {
    const { client, socket } = createClient();
    const pending = client.connect();
    socket.open();
    await pending;
    expect(client.connection.send({ payload: { kind: "heartbeat" } })).toEqual({ kind: "sent" });

    socket.sendError();
    socket.error();
    socket.closeUnexpectedly();
    expect(client.state()).toBe("failed");
    expect(client.connection.state()).toBe("failed");
  });

  it("keeps explicit close distinct from unexpected failure", async () => {
    const { client, socket } = createClient();
    const pending = client.connect();
    socket.open();
    await pending;
    client.close();
    expect(client.state()).toBe("closed");
    expect(client.connection.state()).toBe("live");
    socket.error();
    expect(client.state()).toBe("closed");
  });

  it("returns typed lifecycle failures and terminates send-before-open work", async () => {
    const invalidPort = createClient(new FakeSocket(), token, 0).client;
    const invalidPortResult = await invalidPort.connect();
    expect(invalidPortResult).toMatchObject({ kind: "failed", error: { code: "invalid_port" } });

    const handshake = createClient();
    const pending = handshake.client.connect();
    expect(await handshake.client.connect()).toEqual({ kind: "rejected", reason: "already_connecting" });
    handshake.socket.unexpectedResponse();
    expect(await pending).toMatchObject({ kind: "failed", error: { code: "unexpected_response" } });
    expect(await handshake.client.connect()).toEqual({ kind: "rejected", reason: "failed" });

    const redirect = createClient();
    const redirectPending = redirect.client.connect();
    redirect.socket.redirect();
    expect(await redirectPending).toMatchObject({ kind: "failed", error: { code: "redirect_rejected" } });

    const beforeOpen = createClient();
    expect(beforeOpen.client.connection.start()).toMatchObject({
      kind: "transport_failed",
      error: { code: "transport_failed" },
    });
    expect(beforeOpen.client.state()).toBe("failed");

    const afterClose = createClient();
    const connected = afterClose.client.connect();
    afterClose.socket.open();
    await connected;
    afterClose.client.close();
    expect(afterClose.client.connection.send({ payload: { kind: "heartbeat" } })).toMatchObject({
      kind: "transport_failed",
      error: { code: "transport_failed" },
    });
    expect(afterClose.client.state()).toBe("closed");
  });

  it("returns typed validation and lifecycle results without echoing secrets", async () => {
    const invalidTokens = ["", "with space", "with\rnewline", "unicode-秘密", "a".repeat(4097), "bad=padding"];
    for (const invalidToken of invalidTokens) {
      const { client } = createClient(new FakeSocket(), invalidToken);
      const result = await client.connect();
      expect(result).toMatchObject({ kind: "failed", error: { code: "invalid_token" } });
      if (invalidToken.length > 0) expect(JSON.stringify(result)).not.toContain(invalidToken);
    }

    const { client } = createClient();
    client.close();
    expect(await client.connect()).toEqual({ kind: "rejected", reason: "closed" });
  });

  it("round-trips through a loopback server with the restricted Upgrade", async () => {
    const server = await listenLoopback();
    const serverConnection = onceServerConnection(server);
    const address = server.address();
    if (address === null || typeof address === "string") throw new Error("loopback server has no address");

    const loopbackClient = new ActorHostWebSocketClient({
      port: (address as AddressInfo).port,
      hostToken: "loopback-token",
      identity,
      connectionGeneration: 1,
      messageIds: new DeterministicIds(),
      timestamps: new DeterministicTimestamps(),
      supervisor: new BackendSupervisor(new FakeBackend([])),
    });
    try {
      const result = await loopbackClient.connect();
      expect(result).toEqual({ kind: "connected" });
      const { socket, request } = await serverConnection;
      expect(request.url).toBe(HOST_WEBSOCKET_PATH);
      expect(request.headers["authorization"] === "Bearer loopback-token").toBe(true);
      expect(request.headers["sec-websocket-extensions"]).toBeUndefined();

      const frame = await onceMessage(socket);
      expect(frame.isBinary).toBe(false);
      expect(JSON.parse(frame.text).payload.kind).toBe("host_hello");
      socket.send(JSON.stringify(inboundAck()), { binary: false });
      await Promise.resolve();
      expect(loopbackClient.state()).toBe("open");
    } finally {
      loopbackClient.close();
      await closeServer(server);
    }
  });

  it.each([
    ["malformed JSON", "{", false],
    ["binary input", Buffer.from("{}"), true],
  ])("fails closed for loopback %s", async (_label, data, isBinary) => {
    const server = await listenLoopback();
    const serverConnection = onceServerConnection(server);
    const address = server.address();
    if (address === null || typeof address === "string") throw new Error("loopback server has no address");
    const client = new ActorHostWebSocketClient({
      port: (address as AddressInfo).port,
      hostToken: "loopback-token",
      identity,
      connectionGeneration: 1,
      messageIds: new DeterministicIds(),
      timestamps: new DeterministicTimestamps(),
      supervisor: new BackendSupervisor(new FakeBackend([])),
    });
    try {
      expect(await client.connect()).toEqual({ kind: "connected" });
      const { socket } = await serverConnection;
      socket.send(data, { binary: isBinary });
      await onceSocketClose(socket);
      expect(client.state()).toBe("failed");
      expect(client.connection.state()).toBe("failed");
    } finally {
      client.close();
      await closeServer(server);
    }
  });
});

async function listenLoopback(): Promise<WebSocketServer> {
  const server = new WebSocketServer({
    host: "127.0.0.1",
    port: 0,
    path: HOST_WEBSOCKET_PATH,
    perMessageDeflate: false,
    maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
  });
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  return server;
}

function onceServerConnection(server: WebSocketServer): Promise<{ socket: WebSocket; request: { url?: string; headers: Record<string, string | string[] | undefined> } }> {
  return new Promise((resolve) => {
    server.once("connection", (socket, request) => {
      resolve({ socket, request: { url: request.url, headers: request.headers } });
    });
  });
}

function onceMessage(socket: WebSocket): Promise<{ text: string; isBinary: boolean }> {
  return new Promise((resolve) => {
    socket.once("message", (data, isBinary) => {
      resolve({ text: data.toString(), isBinary });
    });
  });
}

function onceSocketClose(socket: WebSocket): Promise<void> {
  return new Promise((resolve) => {
    if (socket.readyState === WebSocket.CLOSED) {
      resolve();
      return;
    }
    socket.once("close", () => resolve());
  });
}

async function closeServer(server: WebSocketServer): Promise<void> {
  const clients = [...server.clients];
  const closed = clients.map((socket) => new Promise<void>((resolve) => {
    if (socket.readyState === WebSocket.CLOSED) {
      resolve();
      return;
    }
    socket.once("close", () => resolve());
    socket.terminate();
  }));
  await Promise.all(closed);
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error === undefined ? resolve() : reject(error));
  });
}
