import type {
  ActorLaunchSpec,
  ContractErrorEnvelope,
  HostFaultPayload,
  HostMessageId,
  HostToServerPayload,
  InvocationId,
  InvocationSpec,
  ServerToHostMessage,
} from "@ai-block/runtime-contracts";
import {
  BackendSupervisor,
  type SupervisorLifecycleError,
} from "../backend/supervisor.js";

export interface HostOutboundIntent {
  readonly payload: HostToServerPayload;
  readonly causalMessageId?: HostMessageId;
}

export interface HostOutboundPayloadSink {
  send(intent: HostOutboundIntent): HostOutboundSendResult;
}

export interface HostOutboundSendError {
  readonly code: "transport_failed" | "not_started" | "already_started" | "failed";
  readonly message: string;
}

export type HostOutboundSendResult =
  | { readonly kind: "sent" }
  | { readonly kind: "rejected"; readonly reason: "not_started" | "already_started" | "failed" }
  | { readonly kind: "transport_failed"; readonly error: HostOutboundSendError };

export type CommandDisposition =
  | { readonly kind: "handled" }
  | { readonly kind: "not_command" }
  | { readonly kind: "transport_failed"; readonly error: HostOutboundSendError };

export class ActorHostCommandProcessor {
  public constructor(
    private readonly supervisor: BackendSupervisor,
    private readonly outbound: HostOutboundPayloadSink,
  ) {}

  public process(message: ServerToHostMessage): CommandDisposition {
    if (message.payload.kind === "ack") return { kind: "not_command" };

    const acknowledgement = this.emit({ kind: "ack", acknowledged_message_id: message.message_id }, message.message_id);
    if (acknowledgement.kind !== "sent") {
      return {
        kind: "transport_failed",
        error: acknowledgement.kind === "transport_failed"
          ? acknowledgement.error
          : { code: acknowledgement.reason, message: `Host connection rejected outbound payload: ${acknowledgement.reason}.` },
      };
    }

    switch (message.payload.kind) {
      case "initialize_actor_host":
        this.initialize(message.message_id, message.payload.launch_spec);
        return { kind: "handled" };
      case "start_invocation":
        this.start(message.message_id, message.payload.invocation_spec);
        return { kind: "handled" };
      case "stop_invocation":
        this.stop(message.message_id, message.payload.invocation_id);
        return { kind: "handled" };
      case "shutdown_host":
        return { kind: "handled" };
    }
    return { kind: "handled" };
  }

  private initialize(causalMessageId: HostMessageId, launchSpec: ActorLaunchSpec): void {
    void this.supervisor.initialize(launchSpec).then(
      (result) => {
        if (result.kind === "initialized" || result.kind === "already_initialized") {
          this.emit({ kind: "host_ready", actor_id: launchSpec.actor_id }, causalMessageId);
          return;
        }
        this.emitFault(causalMessageId, result.error);
      },
      (error: unknown) => {
        this.emitFault(causalMessageId, {
          code: "initialization_failed",
          message: error instanceof Error ? error.message : "Backend adapter initialization failed.",
        });
      },
    );
  }

  private start(causalMessageId: HostMessageId, invocation: InvocationSpec): void {
    const result = this.supervisor.start(invocation);
    if (result.kind === "launch_failed") {
      this.emit({ kind: "invocation_result", result: result.result }, causalMessageId);
      return;
    }
    if (result.kind === "rejected") {
      this.emitFault(causalMessageId, result.error, invocation.invocation_id);
      return;
    }

    const handle = result.invocation;
    void handle.session.then(
      (sessionId) => {
        if (sessionId === undefined) return;
        this.emit({
          kind: "session_report",
          invocation_id: handle.invocationId,
          session_id: sessionId,
        }, causalMessageId);
      },
      () => undefined,
    );
    void handle.result.then(
      (invocationResult) => {
        this.emit({ kind: "invocation_result", result: invocationResult }, causalMessageId);
      },
      () => undefined,
    );
  }

  private stop(causalMessageId: HostMessageId, invocationId: InvocationId): void {
    const result = this.supervisor.stop(invocationId);
    if (result.kind === "rejected") {
      this.emitFault(causalMessageId, result.error, invocationId);
    }
  }

  private emit(payload: HostToServerPayload, causalMessageId: HostMessageId): HostOutboundSendResult {
    try {
      return this.outbound.send({ payload, causalMessageId });
    } catch (error) {
      return {
        kind: "transport_failed",
        error: {
          code: "transport_failed",
          message: error instanceof Error ? error.message : "Host outbound transport failed.",
        },
      };
    }
  }

  private emitFault(
    causalMessageId: HostMessageId,
    error: SupervisorLifecycleError,
    invocationId?: InvocationId,
  ): void {
    const payload: HostFaultPayload = {
      kind: "host_fault",
      ...(invocationId === undefined ? {} : { invocation_id: invocationId }),
      error: this.toContractError(error),
    };
    this.emit(payload, causalMessageId);
  }

  private toContractError(error: SupervisorLifecycleError): ContractErrorEnvelope {
    return {
      schema_version: "1.0.0",
      code: `actor_host.${error.code}`,
      category: error.code === "initialization_failed" || error.code === "adapter_stop_failed" ? "backend" : "conflict",
      message: error.message,
      retryable: false,
    } as ContractErrorEnvelope;
  }
}
