import type {
  ActorLaunchSpec,
  BackendSessionId,
  InvocationId,
  InvocationResult,
  InvocationSpec,
} from "@ai-block/runtime-contracts";
import type {
  BackendAdapter,
  BackendInvocationExecution,
} from "./adapter.js";

export type SupervisorState = "uninitialized" | "ready" | "running" | "stopping";

export type SupervisorErrorCode =
  | "not_initialized"
  | "busy"
  | "no_active_invocation"
  | "invocation_mismatch"
  | "already_initialized"
  | "adapter_mismatch"
  | "identity_mismatch"
  | "initialization_failed"
  | "adapter_stop_failed";

export interface SupervisorLifecycleError {
  readonly code: SupervisorErrorCode;
  readonly message: string;
}

export type SupervisorInitializeResult =
  | { readonly kind: "initialized" }
  | { readonly kind: "already_initialized" }
  | { readonly kind: "rejected"; readonly error: SupervisorLifecycleError };

export interface SupervisedInvocation {
  readonly invocationId: InvocationId;
  readonly session: Promise<BackendSessionId | undefined>;
  readonly result: Promise<InvocationResult>;
}

export type SupervisorStartResult =
  | { readonly kind: "started"; readonly invocation: SupervisedInvocation }
  | { readonly kind: "launch_failed"; readonly result: InvocationResult }
  | { readonly kind: "rejected"; readonly error: SupervisorLifecycleError };

export type SupervisorStopResult =
  | { readonly kind: "accepted"; readonly invocationId: InvocationId }
  | { readonly kind: "rejected"; readonly error: SupervisorLifecycleError };

export interface SupervisorSnapshot {
  readonly state: SupervisorState;
  readonly activeInvocationId?: InvocationId;
  readonly sessionId?: BackendSessionId;
}

interface ActiveInvocation {
  readonly invocationId: InvocationId;
  readonly spec: InvocationSpec;
  readonly execution: BackendInvocationExecution;
  session: Promise<BackendSessionId | undefined>;
  result: Promise<InvocationResult>;
  handle: SupervisedInvocation;
  completionSettled: boolean;
  settled: boolean;
}

function rejected(code: SupervisorErrorCode, message: string): SupervisorStartResult & SupervisorStopResult & SupervisorInitializeResult {
  return { kind: "rejected", error: { code, message } };
}

export class BackendSupervisor {
  private state: SupervisorState = "uninitialized";
  private launchSpec?: ActorLaunchSpec;
  private active?: ActiveInvocation;
  private sessionId?: BackendSessionId;

  public constructor(private readonly adapter: BackendAdapter) {}

  public async initialize(launchSpec: ActorLaunchSpec): Promise<SupervisorInitializeResult> {
    if (this.adapter.adapterId !== launchSpec.backend.adapter_id) {
      return rejected(
        "adapter_mismatch",
        `Injected adapter ${this.adapter.adapterId} does not match ${launchSpec.backend.adapter_id}.`,
      );
    }

    if (this.launchSpec !== undefined) {
      if (!this.sameIdentity(this.launchSpec, launchSpec)) {
        return rejected("identity_mismatch", "ActorHost initialization identity does not match the existing supervisor.");
      }
      return { kind: "already_initialized" };
    }

    try {
      await this.adapter.initialize(launchSpec);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Backend adapter initialization failed.";
      return rejected("initialization_failed", message);
    }

    this.launchSpec = launchSpec;
    this.sessionId = undefined;
    this.state = "ready";
    return { kind: "initialized" };
  }

  public start(invocation: InvocationSpec): SupervisorStartResult {
    if (this.state === "uninitialized" || this.launchSpec === undefined) {
      return rejected("not_initialized", "BackendSupervisor is not initialized.");
    }
    if (this.state === "running" || this.state === "stopping") {
      return rejected("busy", "BackendSupervisor already has an active Invocation.");
    }
    if (invocation.project_id !== this.launchSpec.project_id || invocation.actor_id !== this.launchSpec.actor_id) {
      return rejected("identity_mismatch", "Invocation identity does not match the initialized ActorHost.");
    }

    const adapterStart = this.adapter.start(invocation);
    if (adapterStart.kind === "launch_failed") {
      return {
        kind: "launch_failed",
        result: {
          schema_version: invocation.schema_version,
          project_id: invocation.project_id,
          run_id: invocation.run_id,
          actor_id: invocation.actor_id,
          invocation_id: invocation.invocation_id,
          process: adapterStart.fact,
          emitted_package_refs: [],
          completion_requested: false,
        },
      };
    }

    const active: ActiveInvocation = {
      invocationId: invocation.invocation_id,
      spec: invocation,
      execution: adapterStart.execution,
      session: Promise.resolve(undefined),
      result: Promise.resolve(undefined as never),
      handle: undefined as never,
      completionSettled: false,
      settled: false,
    };
    const session = adapterStart.execution.session.then((sessionId) => {
      if (sessionId !== undefined && this.active === active) this.sessionId = sessionId;
      return sessionId;
    });
    const result = adapterStart.execution.completion.then(async (completion) => {
      active.completionSettled = true;
      const discoveredSessionId = await session;
      const resolvedSessionId = discoveredSessionId ?? completion.sessionId;
      if (resolvedSessionId !== undefined) this.sessionId = resolvedSessionId;

      const invocationResult: InvocationResult = {
        schema_version: active.spec.schema_version,
        project_id: active.spec.project_id,
        run_id: active.spec.run_id,
        actor_id: active.spec.actor_id,
        invocation_id: active.spec.invocation_id,
        ...(resolvedSessionId === undefined ? {} : { session_id: resolvedSessionId }),
        process: completion.process,
        emitted_package_refs: [],
        completion_requested: false,
      };
      this.finish(active);
      return invocationResult;
    });

    active.session = session;
    active.result = result;
    active.handle = Object.freeze({
      invocationId: invocation.invocation_id,
      session,
      result,
    });
    this.active = active;
    this.state = "running";
    return { kind: "started", invocation: active.handle };
  }

  public stop(invocationId: InvocationId): SupervisorStopResult {
    if (this.state === "uninitialized" || this.launchSpec === undefined) {
      return rejected("not_initialized", "BackendSupervisor is not initialized.");
    }
    if (this.active === undefined) {
      return rejected("no_active_invocation", "BackendSupervisor has no active Invocation.");
    }
    if (this.active.invocationId !== invocationId) {
      return rejected("invocation_mismatch", "Stop targeted a different Invocation.");
    }
    if (this.active.completionSettled) {
      return { kind: "accepted", invocationId };
    }
    if (this.state === "stopping") {
      return { kind: "accepted", invocationId };
    }

    try {
      this.state = "stopping";
      void this.active.execution.stop().catch(() => undefined);
      return { kind: "accepted", invocationId };
    } catch (error) {
      this.state = "running";
      const message = error instanceof Error ? error.message : "Backend adapter stop failed.";
      return rejected("adapter_stop_failed", message);
    }
  }

  public snapshot(): SupervisorSnapshot {
    const snapshot: { state: SupervisorState; activeInvocationId?: InvocationId; sessionId?: BackendSessionId } = {
      state: this.state,
    };
    if (this.active !== undefined) snapshot.activeInvocationId = this.active.invocationId;
    if (this.sessionId !== undefined) snapshot.sessionId = this.sessionId;
    return snapshot;
  }

  private sameIdentity(left: ActorLaunchSpec, right: ActorLaunchSpec): boolean {
    return left.project_id === right.project_id
      && left.actor_id === right.actor_id
      && left.actor_config_snapshot_id === right.actor_config_snapshot_id;
  }

  private finish(active: ActiveInvocation): void {
    if (this.active !== active || active.settled) return;
    active.settled = true;
    this.active = undefined;
    this.state = "ready";
  }
}
