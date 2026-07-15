import WebSocket from "ws";
import type {
  HostMessageId,
  HostToServerMessage,
} from "@ai-block/runtime-contracts";
import type { BackendSupervisor } from "../backend/supervisor.js";
import {
  ServerConnection,
  type HostIdentity,
  type HostMessageIdProvider,
  type HostTimestampProvider,
  type HostTransportFailure,
  type HostTransportPort,
  type ServerConnectionOptions,
} from "./server-connection.js";

export const HOST_WEBSOCKET_PATH = "/actor-hosts/connect";
export const HOST_WEBSOCKET_HANDSHAKE_TIMEOUT_MS = 5_000;
export const HOST_WEBSOCKET_MAX_INBOUND_BYTES = 4 * 1024 * 1024;
export const HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES = 8 * 1024 * 1024;
export const HOST_TOKEN_MAX_BYTES = 4 * 1024;

const OPEN_READY_STATE = 1;
const TOKEN_PATTERN = /^[A-Za-z0-9._~+\/-]+={0,2}$/;

export type HostSocketData = string | Uint8Array | ArrayBuffer | readonly Uint8Array[];

export interface HostSocketOptions {
  readonly headers: Readonly<Record<string, string>>;
  readonly followRedirects: false;
  readonly perMessageDeflate: false;
  readonly handshakeTimeout: number;
  readonly maxPayload: number;
}

export interface HostSocket {
  readonly readyState: number;
  readonly bufferedAmount: number;
  on(event: "open", listener: () => void): void;
  on(event: "message", listener: (data: HostSocketData, isBinary: boolean) => void): void;
  on(event: "error", listener: (error: Error) => void): void;
  on(event: "close", listener: (code: number, reason: Uint8Array) => void): void;
  on(event: "unexpected-response", listener: () => void): void;
  on(event: "redirect", listener: () => void): void;
  send(
    text: string,
    options: { readonly binary: false; readonly compress: false },
    callback: (error?: Error) => void,
  ): void;
  close(): void;
  terminate(): void;
}

export interface HostSocketFactory {
  create(url: string, options: HostSocketOptions): HostSocket;
}

export interface ActorHostWebSocketClientOptions {
  readonly port: number;
  readonly hostToken: string;
  readonly identity: HostIdentity;
  readonly connectionGeneration: number;
  readonly messageIds: HostMessageIdProvider;
  readonly timestamps: HostTimestampProvider;
  readonly supervisor: BackendSupervisor;
  readonly socketFactory?: HostSocketFactory;
}

export type HostWebSocketClientState = "created" | "connecting" | "open" | "failed" | "closed";

export type HostWebSocketErrorCode =
  | "invalid_port"
  | "invalid_token"
  | "already_connecting"
  | "already_connected"
  | "closed"
  | "failed"
  | "socket_creation_failed"
  | "handshake_failed"
  | "unexpected_response"
  | "redirect_rejected"
  | "socket_error"
  | "unexpected_close"
  | "unexpected_message"
  | "inbound_binary"
  | "inbound_oversize"
  | "malformed_json"
  | "protocol_rejected"
  | "outbound_buffer_limit"
  | "send_before_open"
  | "send_after_close"
  | "send_failed"
  | "hello_failed";

export interface HostWebSocketError {
  readonly code: HostWebSocketErrorCode;
  readonly message: string;
}

export type HostWebSocketConnectResult =
  | { readonly kind: "connected" }
  | { readonly kind: "rejected"; readonly reason: "already_connecting" | "already_connected" | "failed" | "closed" }
  | { readonly kind: "failed"; readonly error: HostWebSocketError };

class ProductionHostSocket implements HostSocket {
  public constructor(private readonly socket: WebSocket) {}

  public get readyState(): number {
    return this.socket.readyState;
  }

  public get bufferedAmount(): number {
    return this.socket.bufferedAmount;
  }

  public on(event: "open", listener: () => void): void;
  public on(event: "message", listener: (data: HostSocketData, isBinary: boolean) => void): void;
  public on(event: "error", listener: (error: Error) => void): void;
  public on(event: "close", listener: (code: number, reason: Uint8Array) => void): void;
  public on(event: "unexpected-response", listener: () => void): void;
  public on(event: "redirect", listener: () => void): void;
  public on(event: HostSocketEvent, listener: (...args: any[]) => void): void {
    switch (event) {
      case "open":
        this.socket.on("open", listener);
        return;
      case "message":
        this.socket.on("message", (data, isBinary) => listener(normalizeSocketData(data), isBinary));
        return;
      case "error":
        this.socket.on("error", listener);
        return;
      case "close":
        this.socket.on("close", listener);
        return;
      case "unexpected-response":
        this.socket.on("unexpected-response", listener);
        return;
      case "redirect":
        this.socket.on("redirect", listener);
        return;
    }
  }

  public send(
    text: string,
    options: { readonly binary: false; readonly compress: false },
    callback: (error?: Error) => void,
  ): void {
    this.socket.send(text, options, callback);
  }

  public close(): void {
    this.socket.close();
  }

  public terminate(): void {
    this.socket.terminate();
  }
}

class ProductionHostSocketFactory implements HostSocketFactory {
  public create(url: string, options: HostSocketOptions): HostSocket {
    const socketOptions: WebSocket.ClientOptions = {
      headers: { ...options.headers },
      followRedirects: options.followRedirects,
      perMessageDeflate: options.perMessageDeflate,
      handshakeTimeout: options.handshakeTimeout,
      maxPayload: options.maxPayload,
    };
    return new ProductionHostSocket(new WebSocket(url, socketOptions));
  }
}

class WebSocketTransport implements HostTransportPort {
  private socket: HostSocket | undefined;
  private closed = false;
  private failure: HostTransportFailure | undefined;
  private readonly listeners = new Set<(failure: HostTransportFailure) => void>();

  public constructor(private readonly onLocalFailure: (failure: HostWebSocketError) => void) {}

  public attach(socket: HostSocket): void {
    this.socket = socket;
    this.closed = false;
  }

  public markClosed(): void {
    this.closed = true;
  }

  public onFailure(listener: (failure: HostTransportFailure) => void): () => void {
    if (this.failure !== undefined) {
      listener(this.failure);
      return () => undefined;
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notifyFailure(message: string): void {
    if (this.failure !== undefined) return;
    this.failure = { code: "transport_failed", message };
    for (const listener of this.listeners) listener(this.failure);
    this.listeners.clear();
  }

  public send(message: HostToServerMessage): void {
    if (this.closed) {
      this.fail({ code: "send_after_close", message: "Host WebSocket is closed." });
      throw new Error("Host WebSocket send failed.");
    }

    const socket = this.socket;
    if (socket === undefined || socket.readyState !== OPEN_READY_STATE) {
      this.fail({ code: "send_before_open", message: "Host WebSocket is not open." });
      throw new Error("Host WebSocket send failed.");
    }

    let text: string;
    try {
      text = JSON.stringify(message);
    } catch {
      this.fail({ code: "send_failed", message: "Host WebSocket JSON serialization failed." });
      throw new Error("Host WebSocket send failed.");
    }

    const textBytes = Buffer.byteLength(text, "utf8");
    if (textBytes + socket.bufferedAmount > HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES) {
      this.fail({ code: "outbound_buffer_limit", message: "Host WebSocket outbound buffer limit exceeded." });
      throw new Error("Host WebSocket send failed.");
    }

    try {
      socket.send(text, { binary: false, compress: false }, (error) => {
        if (error !== undefined && error !== null) {
          this.fail({ code: "send_failed", message: "Host WebSocket asynchronous send failed." });
        }
      });
    } catch {
      this.fail({ code: "send_failed", message: "Host WebSocket send failed." });
      throw new Error("Host WebSocket send failed.");
    }
  }

  private fail(failure: HostWebSocketError): void {
    this.onLocalFailure(failure);
  }
}

export class ActorHostWebSocketClient {
  public readonly connection: ServerConnection;

  private readonly transport: WebSocketTransport;
  private readonly socketFactory: HostSocketFactory;
  private readonly options: ActorHostWebSocketClientOptions;
  private stateValue: HostWebSocketClientState = "created";
  private socket: HostSocket | undefined;
  private connectResolve: ((result: HostWebSocketConnectResult) => void) | undefined;

  public constructor(options: ActorHostWebSocketClientOptions) {
    this.options = options;
    this.socketFactory = options.socketFactory ?? new ProductionHostSocketFactory();
    this.transport = new WebSocketTransport((failure) => this.fail(failure));
    this.connection = new ServerConnection({
      identity: options.identity,
      connectionGeneration: options.connectionGeneration,
      messageIds: options.messageIds,
      timestamps: options.timestamps,
      transport: this.transport,
      supervisor: options.supervisor,
    } satisfies ServerConnectionOptions);
  }

  public state(): HostWebSocketClientState {
    return this.stateValue;
  }

  public connect(): Promise<HostWebSocketConnectResult> {
    if (this.stateValue === "connecting") {
      return Promise.resolve({ kind: "rejected", reason: "already_connecting" });
    }
    if (this.stateValue === "open") {
      return Promise.resolve({ kind: "rejected", reason: "already_connected" });
    }
    if (this.stateValue === "failed") {
      return Promise.resolve({ kind: "rejected", reason: "failed" });
    }
    if (this.stateValue === "closed") {
      return Promise.resolve({ kind: "rejected", reason: "closed" });
    }

    const validation = this.validateConfiguration();
    if (validation !== undefined) {
      this.fail(validation);
      return Promise.resolve({ kind: "failed", error: validation });
    }

    this.stateValue = "connecting";
    const result = new Promise<HostWebSocketConnectResult>((resolve) => {
      this.connectResolve = resolve;
    });

    try {
      const socket = this.socketFactory.create(this.url(), this.socketOptions());
      this.socket = socket;
      this.transport.attach(socket);
      this.bind(socket);
    } catch {
      this.fail({ code: "socket_creation_failed", message: "Host WebSocket creation failed." });
    }
    return result;
  }

  public close(): void {
    if (this.stateValue === "closed") return;
    this.stateValue = "closed";
    this.transport.markClosed();
    try {
      this.socket?.terminate();
    } catch {
      // Explicit cleanup is terminal even if the underlying socket is already closed.
    }
    this.resolveConnect({ kind: "rejected", reason: "closed" });
  }

  private bind(socket: HostSocket): void {
    socket.on("open", () => this.open());
    socket.on("message", (data, isBinary) => this.message(data, isBinary));
    socket.on("error", () => this.socketError());
    socket.on("close", () => this.socketClose());
    socket.on("unexpected-response", () => {
      this.fail({ code: "unexpected_response", message: "Host WebSocket handshake response was rejected." });
    });
    socket.on("redirect", () => {
      this.fail({ code: "redirect_rejected", message: "Host WebSocket redirects are disabled." });
    });
  }

  private open(): void {
    if (this.stateValue !== "connecting") return;
    this.stateValue = "open";
    const result = this.connection.start();
    if (result.kind !== "sent") {
      this.fail({ code: "hello_failed", message: "Host WebSocket HostHello send failed." });
      return;
    }
    this.resolveConnect({ kind: "connected" });
  }

  private message(data: HostSocketData, isBinary: boolean): void {
    if (this.stateValue !== "open") {
      this.fail({ code: "unexpected_message", message: "Host WebSocket message arrived outside the open state." });
      return;
    }
    if (isBinary) {
      this.fail({ code: "inbound_binary", message: "Host WebSocket binary messages are rejected." });
      return;
    }

    let text: string;
    try {
      text = socketDataToText(data);
    } catch {
      this.fail({ code: "malformed_json", message: "Host WebSocket text decoding failed." });
      return;
    }
    if (Buffer.byteLength(text, "utf8") > HOST_WEBSOCKET_MAX_INBOUND_BYTES) {
      this.fail({ code: "inbound_oversize", message: "Host WebSocket inbound payload limit exceeded." });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      this.fail({ code: "malformed_json", message: "Host WebSocket JSON payload is malformed." });
      return;
    }

    try {
      const result = this.connection.receive(parsed);
      if (result.kind === "rejected") {
        this.fail({ code: "protocol_rejected", message: "Host WebSocket inbound protocol message was rejected." });
      } else if (result.disposition.kind === "transport_failed") {
        this.fail({ code: "socket_error", message: "Host WebSocket transport failed." });
      }
    } catch {
      this.fail({ code: "protocol_rejected", message: "Host WebSocket inbound protocol processing failed." });
    }
  }

  private socketError(): void {
    if (this.stateValue === "connecting") {
      this.fail({ code: "handshake_failed", message: "Host WebSocket handshake failed." });
    } else {
      this.fail({ code: "socket_error", message: "Host WebSocket socket failed." });
    }
  }

  private socketClose(): void {
    if (this.stateValue === "closed" || this.stateValue === "failed") return;
    if (this.stateValue === "connecting") {
      this.fail({ code: "handshake_failed", message: "Host WebSocket closed before opening." });
    } else {
      this.fail({ code: "unexpected_close", message: "Host WebSocket closed unexpectedly." });
    }
  }

  private fail(failure: HostWebSocketError): void {
    if (this.stateValue === "failed" || this.stateValue === "closed") return;
    this.stateValue = "failed";
    this.transport.notifyFailure(failure.message);
    try {
      this.socket?.terminate();
    } catch {
      // Failure is already terminal and must not escape an event callback.
    }
    this.resolveConnect({ kind: "failed", error: failure });
  }

  private resolveConnect(result: HostWebSocketConnectResult): void {
    const resolve = this.connectResolve;
    this.connectResolve = undefined;
    resolve?.(result);
  }

  private validateConfiguration(): HostWebSocketError | undefined {
    if (!Number.isInteger(this.options.port) || this.options.port < 1 || this.options.port > 65_535) {
      return { code: "invalid_port", message: "Host WebSocket port must be an explicit valid loopback port." };
    }
    const tokenBytes = Buffer.byteLength(this.options.hostToken, "utf8");
    if (
      tokenBytes < 1 ||
      tokenBytes > HOST_TOKEN_MAX_BYTES ||
      !TOKEN_PATTERN.test(this.options.hostToken)
    ) {
      return { code: "invalid_token", message: "Host WebSocket bearer token is invalid." };
    }
    return undefined;
  }

  private url(): string {
    return `ws://127.0.0.1:${this.options.port}${HOST_WEBSOCKET_PATH}`;
  }

  private socketOptions(): HostSocketOptions {
    return {
      headers: { Authorization: `Bearer ${this.options.hostToken}` },
      followRedirects: false,
      perMessageDeflate: false,
      handshakeTimeout: HOST_WEBSOCKET_HANDSHAKE_TIMEOUT_MS,
      maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
    };
  }
}

type HostSocketEvent = "open" | "message" | "error" | "close" | "unexpected-response" | "redirect";

function normalizeSocketData(data: WebSocket.RawData): HostSocketData {
  if (typeof data === "string" || data instanceof ArrayBuffer || Array.isArray(data)) return data;
  return data;
}

function socketDataToText(data: HostSocketData): string {
  if (typeof data === "string") return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  if (isSocketDataParts(data)) return Buffer.concat(data.map((part) => Buffer.from(part))).toString("utf8");
  return Buffer.from(data).toString("utf8");
}

function isSocketDataParts(data: HostSocketData): data is readonly Uint8Array[] {
  return Array.isArray(data);
}
