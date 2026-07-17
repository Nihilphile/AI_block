import type { IncomingMessage, Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import WebSocket, { WebSocketServer } from "ws";
import type { RawData } from "ws";
import { HostGateway } from "../../modules/host-gateway/host-gateway.js";
import type {
  AuthenticatedHostContext,
  HostCredentialVerificationResult,
  HostCredentialVerifier,
  HostGatewayConnection,
  HostGatewayTransport,
  HostTransportFailure,
} from "../../modules/host-gateway/ports.js";

export const HOST_WEBSOCKET_PATH = "/actor-hosts/connect";
export const HOST_WEBSOCKET_MAX_INBOUND_BYTES = 4 * 1024 * 1024;
export const HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES = 8 * 1024 * 1024;
export const HOST_WEBSOCKET_VERIFIER_TIMEOUT_MS = 4_000;

const HOST_WEBSOCKET_LOCAL_ADDRESS = "127.0.0.1";
const HOST_TOKEN_PATTERN = /^[A-Za-z0-9._~+\/-]+={0,2}$/;
const OPEN_READY_STATE = WebSocket.OPEN;
const CONNECTING_READY_STATE = WebSocket.CONNECTING;
const MAX_TOKEN_BYTES = 4 * 1024;

type VerificationOutcome =
  | { readonly kind: "verified"; readonly result: HostCredentialVerificationResult }
  | { readonly kind: "aborted" }
  | { readonly kind: "timeout" }
  | { readonly kind: "failed" };

export type HostGatewayWebSocketAttachResult =
  | { readonly kind: "attached"; readonly detach: () => void }
  | { readonly kind: "rejected"; readonly reason: "already_attached" | "shutdown" };

export interface HostGatewayWebSocketAdapterOptions {
  readonly gateway: HostGateway;
  readonly verifier: HostCredentialVerifier;
}

interface PendingVerification {
  readonly settle: (outcome: VerificationOutcome) => void;
}

class HostGatewayWebSocketTransport implements HostGatewayTransport {
  private readonly failureListeners = new Set<(failure: HostTransportFailure) => void>();
  private failureNotified = false;

  public constructor(private readonly socket: WebSocket) {}

  public send(message: Parameters<HostGatewayTransport["send"]>[0]): void {
    let text: string;
    try {
      text = JSON.stringify(message);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Host message serialization failed.";
      this.failSynchronously({ code: "transport_failed", message: messageText });
    }

    const frameBytes = Buffer.byteLength(text!, "utf8");
    if (frameBytes + this.socket.bufferedAmount > HOST_WEBSOCKET_MAX_OUTBOUND_BUFFERED_BYTES) {
      this.failSynchronously({ code: "transport_failed", message: "Host transport outbound buffer limit exceeded." });
    }
    if (this.socket.readyState !== OPEN_READY_STATE) {
      this.failSynchronously({ code: "transport_failed", message: "Host WebSocket is not open." });
    }

    try {
      this.socket.send(text!, { binary: false, compress: false }, (error?: Error | null) => {
        if (error != null) this.notifyFailure({ code: "transport_failed", message: error.message || "Host WebSocket send failed." });
      });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Host WebSocket send failed.";
      this.notifyFailure({ code: "transport_failed", message: messageText });
      throw error instanceof Error ? error : new Error(messageText);
    }
  }

  public onFailure(listener: (failure: HostTransportFailure) => void): () => void {
    this.failureListeners.add(listener);
    return () => this.failureListeners.delete(listener);
  }

  public fail(failure: HostTransportFailure): void {
    this.notifyFailure(failure);
  }

  public dispose(): void {
    this.failureListeners.clear();
  }

  private failSynchronously(failure: HostTransportFailure): never {
    this.notifyFailure(failure);
    throw new Error(failure.message);
  }

  private notifyFailure(failure: HostTransportFailure): void {
    if (this.failureNotified) return;
    this.failureNotified = true;
    for (const listener of [...this.failureListeners]) {
      try {
        listener(failure);
      } catch {
        // One failure observer must not prevent other observers from terminating the boundary.
      }
    }
  }
}

class HostGatewayWebSocketSession {
  private readonly transport: HostGatewayWebSocketTransport;
  private readonly closedPromise: Promise<void>;
  private resolveClosed!: () => void;
  private connection: HostGatewayConnection | undefined;
  private adapterTerminal = false;
  private coreTerminal = false;
  private closed = false;
  private socketTerminationRequested = false;
  private lifecycleListenersAttached = false;

  public constructor(
    private readonly socket: WebSocket,
    private readonly gateway: HostGateway,
    private readonly identity: AuthenticatedHostContext,
    private readonly onClosed: (session: HostGatewayWebSocketSession) => void,
  ) {
    this.transport = new HostGatewayWebSocketTransport(socket);
    this.transport.onFailure(() => this.onTransportFailure());
    this.closedPromise = new Promise((resolve) => { this.resolveClosed = resolve; });
  }

  public open(): boolean {
    this.attachLifecycleListeners();
    const result = this.gateway.openConnection(this.identity, this.transport);
    if (result.kind !== "accepted") {
      this.coreTerminal = true;
      this.adapterTerminal = true;
      this.terminateSocket();
      if (this.socket.readyState === WebSocket.CLOSED) this.finishClosed();
      return false;
    }

    this.connection = result.connection;
    this.socket.on("message", (data: RawData, isBinary: boolean) => this.onMessage(data, isBinary));
    return true;
  }

  public waitForClose(): Promise<void> {
    return this.closedPromise;
  }

  public shutdown(): void {
    if (this.closed) return;
    this.adapterTerminal = true;
    if (!this.coreTerminal) {
      this.transport.fail({ code: "transport_failed", message: "Host Gateway WebSocket adapter shut down." });
    }
    this.terminateSocket();
    if (this.socket.readyState === WebSocket.CLOSED) this.finishClosed();
  }

  private onMessage(data: RawData, isBinary: boolean): void {
    if (this.adapterTerminal || this.connection === undefined) return;
    if (isBinary) {
      this.failTransport("Binary Host WebSocket frames are not supported.");
      return;
    }

    let text: string;
    try {
      text = rawDataToText(data);
    } catch {
      this.failTransport("Host WebSocket text frame could not be decoded.");
      return;
    }
    if (Buffer.byteLength(text, "utf8") > HOST_WEBSOCKET_MAX_INBOUND_BYTES) {
      this.failTransport("Host WebSocket inbound payload limit exceeded.");
      return;
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(text);
    } catch {
      this.failTransport("Host WebSocket JSON payload is malformed.");
      return;
    }

    let result;
    try {
      result = this.connection.receive(decoded);
    } catch {
      this.failTransport("Host Gateway receive failed.");
      return;
    }
    if (result.kind === "rejected" || this.connection.state() === "failed") {
      this.coreTerminal = true;
      this.adapterTerminal = true;
      this.terminateSocket();
    }
  }

  private onSocketFailure(message: string): void {
    if (this.coreTerminal || this.adapterTerminal) {
      this.terminateSocket();
      return;
    }
    this.failTransport(message);
  }

  private onSocketClose(): void {
    if (!this.coreTerminal && !this.adapterTerminal) this.failTransport("Host WebSocket closed unexpectedly.");
    this.finishClosed();
  }

  private onTransportFailure(): void {
    if (this.coreTerminal || this.adapterTerminal) return;
    this.adapterTerminal = true;
    this.terminateSocket();
  }

  private failTransport(message: string): void {
    if (this.coreTerminal || this.adapterTerminal) return;
    this.adapterTerminal = true;
    this.transport.fail({ code: "transport_failed", message });
    this.terminateSocket();
  }

  private terminateSocket(): void {
    if (this.socketTerminationRequested) return;
    if (this.socket.readyState !== OPEN_READY_STATE && this.socket.readyState !== CONNECTING_READY_STATE) return;
    this.socketTerminationRequested = true;
    try {
      this.socket.terminate();
    } catch {
      // The transport failure latch has already made this terminal.
    }
  }

  private finishClosed(): void {
    if (this.closed) return;
    this.closed = true;
    this.transport.dispose();
    this.onClosed(this);
    this.resolveClosed();
  }

  private attachLifecycleListeners(): void {
    if (this.lifecycleListenersAttached) return;
    this.lifecycleListenersAttached = true;
    this.socket.on("error", (error: Error) => this.onSocketFailure(error.message || "Host WebSocket error."));
    this.socket.on("close", () => this.onSocketClose());
  }
}

export class HostGatewayWebSocketAdapter {
  private readonly webSocketServer = new WebSocketServer({
    noServer: true,
    path: HOST_WEBSOCKET_PATH,
    clientTracking: true,
    perMessageDeflate: false,
    maxPayload: HOST_WEBSOCKET_MAX_INBOUND_BYTES,
    skipUTF8Validation: false,
  });
  private readonly pendingVerifications = new Set<PendingVerification>();
  private readonly activeSessions = new Set<HostGatewayWebSocketSession>();
  private attachedServer: HttpServer | undefined;
  private attachedUpgradeListener: ((request: IncomingMessage, socket: Duplex, head: Buffer) => void) | undefined;
  private hasAttached = false;
  private acceptingUpgrades = true;
  private shutdownPromise: Promise<void> | undefined;

  public constructor(private readonly options: HostGatewayWebSocketAdapterOptions) {}

  public attach(server: HttpServer): HostGatewayWebSocketAttachResult {
    if (!this.acceptingUpgrades) return { kind: "rejected", reason: "shutdown" };
    if (this.hasAttached) return { kind: "rejected", reason: "already_attached" };

    const listener = (request: IncomingMessage, socket: Duplex, head: Buffer): void => {
      this.handleUpgrade(request, socket, head);
    };
    server.on("upgrade", listener);
    this.attachedServer = server;
    this.attachedUpgradeListener = listener;
    this.hasAttached = true;
    let detached = false;
    return {
      kind: "attached",
      detach: () => {
        if (detached) return;
        detached = true;
        if (this.attachedServer === server && this.attachedUpgradeListener === listener) {
          server.off("upgrade", listener);
          this.attachedServer = undefined;
          this.attachedUpgradeListener = undefined;
        }
      },
    };
  }

  public handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
    if (!this.acceptingUpgrades) {
      destroySocket(socket);
      return;
    }
    if (request.socket.localAddress !== HOST_WEBSOCKET_LOCAL_ADDRESS) {
      rejectHttp(socket, 404, "Not Found");
      return;
    }
    if (request.url !== HOST_WEBSOCKET_PATH) {
      rejectHttp(socket, 404, "Not Found");
      return;
    }

    const token = parseBearerToken(request.headers.authorization);
    if (token === undefined) {
      rejectHttp(socket, 401, "Unauthorized");
      return;
    }
    if (request.aborted || request.destroyed || socket.destroyed) {
      destroySocket(socket);
      return;
    }

    this.verifyCredential(request, socket, head, token);
  }

  public shutdown(): Promise<void> {
    if (this.shutdownPromise !== undefined) return this.shutdownPromise;
    this.acceptingUpgrades = false;
    this.detachAttachedServer();
    this.shutdownPromise = this.performShutdown();
    return this.shutdownPromise;
  }

  private verifyCredential(request: IncomingMessage, socket: Duplex, head: Buffer, token: string): void {
    let settled = false;
    let timer: NodeJS.Timeout | undefined;
    const requestAbort = (): void => settle({ kind: "aborted" });
    const socketAbort = (): void => settle({ kind: "aborted" });
    const pending: PendingVerification = {
      settle: (outcome) => {
        if (settled) return;
        settled = true;
        if (timer !== undefined) clearTimeout(timer);
        request.removeListener("aborted", requestAbort);
        request.removeListener("error", requestAbort);
        socket.removeListener("error", socketAbort);
        socket.removeListener("close", socketAbort);
        this.pendingVerifications.delete(pending);

        if (outcome.kind === "aborted") {
          destroySocket(socket);
          return;
        }
        if (outcome.kind === "timeout" || outcome.kind === "failed") {
          rejectHttp(socket, 503, "Service Unavailable");
          return;
        }
        if (outcome.result.kind === "rejected") {
          rejectHttp(socket, outcome.result.reason === "invalid" ? 401 : 503, outcome.result.reason === "invalid" ? "Unauthorized" : "Service Unavailable");
          return;
        }
        if (!this.acceptingUpgrades || request.aborted || request.destroyed || socket.destroyed) {
          destroySocket(socket);
          return;
        }
        this.acceptVerifiedUpgrade(request, socket, head, outcome.result.identity);
      },
    };
    const settle = pending.settle;
    this.pendingVerifications.add(pending);
    request.once("aborted", requestAbort);
    request.once("error", requestAbort);
    socket.once("error", socketAbort);
    socket.once("close", socketAbort);
    timer = setTimeout(() => settle({ kind: "timeout" }), HOST_WEBSOCKET_VERIFIER_TIMEOUT_MS);
    timer.unref?.();
    void Promise.resolve()
      .then(() => this.options.verifier.verify(token))
      .then(
        (result) => settle({ kind: "verified", result }),
        () => settle({ kind: "failed" }),
      );
  }

  private acceptVerifiedUpgrade(
    request: IncomingMessage,
    socket: Duplex,
    head: Buffer,
    identity: AuthenticatedHostContext,
  ): void {
    let callbackCalled = false;
    try {
      this.webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
        callbackCalled = true;
        const session = new HostGatewayWebSocketSession(webSocket, this.options.gateway, identity, (closed) => {
          this.activeSessions.delete(closed);
        });
        this.activeSessions.add(session);
        if (!session.open()) this.activeSessions.delete(session);
      });
    } catch {
      if (callbackCalled || socket.destroyed || socket.writableEnded) {
        destroySocket(socket);
      } else {
        rejectHttp(socket, 500, "Internal Server Error");
      }
    }
  }

  private detachAttachedServer(): void {
    if (this.attachedServer === undefined || this.attachedUpgradeListener === undefined) return;
    this.attachedServer.off("upgrade", this.attachedUpgradeListener);
    this.attachedServer = undefined;
    this.attachedUpgradeListener = undefined;
  }

  private async performShutdown(): Promise<void> {
    for (const pending of [...this.pendingVerifications]) pending.settle({ kind: "aborted" });
    const sessions = [...this.activeSessions];
    for (const session of sessions) session.shutdown();
    await Promise.all(sessions.map((session) => session.waitForClose()));
    await new Promise<void>((resolve) => {
      try {
        this.webSocketServer.close(() => resolve());
      } catch {
        resolve();
      }
    });
  }
}

function parseBearerToken(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^Bearer ([A-Za-z0-9._~+\/-]+={0,2})$/.exec(value);
  if (match === null) return undefined;
  const token = match[1];
  if (Buffer.byteLength(token, "utf8") < 1 || Buffer.byteLength(token, "utf8") > MAX_TOKEN_BYTES) return undefined;
  if (!HOST_TOKEN_PATTERN.test(token)) return undefined;
  return token;
}

function rawDataToText(data: RawData): string {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  return Buffer.concat(data).toString("utf8");
}

function rejectHttp(socket: Duplex, statusCode: number, statusText: string): void {
  if (socket.destroyed) return;
  const response = `HTTP/1.1 ${statusCode} ${statusText}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n`;
  try {
    socket.end(response);
  } catch {
    destroySocket(socket);
  }
}

function destroySocket(socket: Duplex): void {
  try {
    if (!socket.destroyed) socket.destroy();
  } catch {
    // A disconnected raw socket is already terminal.
  }
}
