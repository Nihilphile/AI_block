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
import type { HostIdentity } from "./server-connection.js";

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
    private readonly identity: HostIdentity,
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
    if (launchSpec.project_id !== this.identity.projectId || launchSpec.actor_id !== this.identity.actorId) {
      this.emitFault(causalMessageId, {
        code: "identity_mismatch",
        message: "ActorHost initialization identity does not match the authenticated Host identity.",
      });
      return;
    }

    void this.supervisor.initialize(launchSpec).then(
      (result) => {
        if (result.kind === "initialized" || result.kind === "already_initialized") {
          this.emit({ kind: "host_ready", actor_id: launchSpec.actor_id }, causalMessageId);
          return;
        }
        this.emitFault(causalMessageId, result.error);
      },
      () => {
        this.emitFault(causalMessageId, {
          code: "initialization_failed",
          message: "Backend adapter initialization failed.",
        });
      },
    );
  }

  private start(causalMessageId: HostMessageId, invocation: InvocationSpec): void {
    if (invocation.project_id !== this.identity.projectId || invocation.actor_id !== this.identity.actorId) {
      this.emitFault(causalMessageId, {
        code: "identity_mismatch",
        message: "Invocation identity does not match the authenticated Host identity.",
      }, invocation.invocation_id);
      return;
    }

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
        if (invocationResult === undefined) return;
        this.emit({ kind: "invocation_result", result: invocationResult }, causalMessageId);
      },
    );
    void handle.failure.then((error) => {
      this.emitFault(causalMessageId, error, handle.invocationId);
    });
  }

  private stop(causalMessageId: HostMessageId, invocationId: InvocationId): void {
    const result = this.supervisor.stop(invocationId);
    if (result.kind === "rejected") {
      this.emitFault(causalMessageId, result.error, invocationId);
    }
  }

  private emit(payload: HostToServerPayload, causalMessageId: HostMessageId): HostOutboundSendResult {
    try {
      return this.outbound.send({ payload: this.redactOutboundPayload(payload), causalMessageId });
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

  private redactOutboundPayload(payload: HostToServerPayload): HostToServerPayload {
    if (payload.kind === "host_fault") {
      return {
        ...payload,
        error: this.redactContractError(payload.error),
      };
    }

    if (payload.kind === "invocation_result" && payload.result.process.status === "launch_failed") {
      const error = payload.result.process.error;
      const safeError: ContractErrorEnvelope = {
        schema_version: error.schema_version,
        code: error.code,
        category: error.category,
        message: "Backend process launch failed.",
        retryable: error.retryable,
        ...(error.correlation_id === undefined ? {} : { correlation_id: error.correlation_id }),
      };
      return {
        ...payload,
        result: {
          ...payload.result,
          process: { status: "launch_failed", error: safeError },
        },
      };
    }

    return payload;
  }

  private redactContractError(error: HostFaultPayload["error"]): HostFaultPayload["error"] {
    return {
      schema_version: error.schema_version,
      code: error.code,
      category: error.category,
      message: fixedHostFaultMessage(error.code),
      retryable: error.retryable,
      ...(error.correlation_id === undefined ? {} : { correlation_id: error.correlation_id }),
    };
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
      category: error.code === "initialization_failed"
        || error.code === "adapter_stop_failed"
        || error.code === "session_observation_failed"
        || error.code === "completion_observation_failed"
        || error.code === "quarantined"
        ? "backend"
        : "conflict",
      message: fixedHostFaultMessage(`actor_host.${error.code}`),
      retryable: false,
    } as ContractErrorEnvelope;
  }
}

function fixedHostFaultMessage(code: string): string {
  switch (code) {
    case "actor_host.not_initialized":
      return "BackendSupervisor is not initialized.";
    case "actor_host.busy":
      return "BackendSupervisor already has an active Invocation.";
    case "actor_host.no_active_invocation":
      return "BackendSupervisor has no active Invocation.";
    case "actor_host.invocation_mismatch":
      return "Stop targeted a different Invocation.";
    case "actor_host.already_initialized":
      return "ActorHost is already initialized.";
    case "actor_host.adapter_mismatch":
      return "Backend adapter does not match the ActorHost launch configuration.";
    case "actor_host.identity_mismatch":
      return "ActorHost identity does not match the authenticated Host identity.";
    case "actor_host.initialization_failed":
      return "Backend adapter initialization failed.";
    case "actor_host.adapter_stop_failed":
      return "Backend adapter stop failed.";
    case "actor_host.session_observation_failed":
      return "Backend session observation failed.";
    case "actor_host.completion_observation_failed":
      return "Backend completion observation failed.";
    case "actor_host.quarantined":
      return "BackendSupervisor is quarantined after an Invocation failure.";
    default:
      return "ActorHost operation failed.";
  }
}
