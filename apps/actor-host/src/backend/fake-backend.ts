import type {
  ActorLaunchSpec,
  BackendSessionId,
  ContractErrorEnvelope,
  InvocationSpec,
  SessionDirective,
} from "@ai-block/runtime-contracts";
import type {
  BackendAdapter,
  BackendAdapterStartResult,
  BackendInvocationCompletion,
  BackendInvocationExecution,
  BackendProcessFact,
} from "./adapter.js";

export type FakeBackendStep =
  | { readonly kind: "launch_failed"; readonly error: ContractErrorEnvelope }
  | { readonly kind: "pending"; readonly sessionId: BackendSessionId }
  | { readonly kind: "completed"; readonly sessionId: BackendSessionId; readonly process: BackendProcessFact }
  | { readonly kind: "session_rejected"; readonly message: string }
  | { readonly kind: "session_and_completion_rejected"; readonly message: string }
  | { readonly kind: "completion_rejected"; readonly sessionId: BackendSessionId; readonly message: string }
  | { readonly kind: "stop_rejected"; readonly sessionId: BackendSessionId; readonly message: string };

export interface FakeBackendStartCall {
  readonly invocationId: string;
  readonly session: SessionDirective;
}

class Deferred<T> {
  public readonly promise: Promise<T>;
  private resolveValue!: (value: T) => void;
  private settled = false;

  public constructor() {
    this.promise = new Promise<T>((resolve) => {
      this.resolveValue = resolve;
    });
  }

  public resolve(value: T): void {
    if (this.settled) return;
    this.settled = true;
    this.resolveValue(value);
  }
}

class FakeExecution implements BackendInvocationExecution {
  public readonly session: Promise<BackendSessionId>;
  public readonly completion: Promise<BackendInvocationCompletion>;
  private readonly pendingCompletion?: Deferred<BackendInvocationCompletion>;
  private settled = false;

  public constructor(
    step: Exclude<FakeBackendStep, { kind: "launch_failed" }>,
    private readonly onStop: () => void,
  ) {
    this.session = step.kind === "session_rejected" || step.kind === "session_and_completion_rejected"
      ? Promise.reject(new Error(step.message))
      : Promise.resolve(step.sessionId);
    if (step.kind === "pending" || step.kind === "stop_rejected" || step.kind === "session_rejected") {
      this.pendingCompletion = new Deferred<BackendInvocationCompletion>();
      this.completion = this.pendingCompletion.promise;
    } else if (step.kind === "completion_rejected" || step.kind === "session_and_completion_rejected") {
      this.settled = true;
      this.completion = Promise.reject(new Error(step.message));
    } else {
      this.settled = true;
      this.completion = Promise.resolve({ sessionId: step.sessionId, process: step.process });
    }
    this.stopError = step.kind === "stop_rejected" ? new Error(step.message) : undefined;
  }

  public complete(process: BackendProcessFact): void {
    if (this.pendingCompletion === undefined || this.settled) return;
    this.settled = true;
    this.pendingCompletion.resolve({ sessionId: undefined, process });
  }

  public stop(): Promise<void> {
    if (this.stopError !== undefined) {
      this.onStop();
      return Promise.reject(this.stopError);
    }
    if (this.pendingCompletion !== undefined && !this.settled) {
      this.onStop();
      this.settled = true;
      this.pendingCompletion.resolve({ sessionId: undefined, process: { status: "stopped" } });
    }
    return Promise.resolve();
  }

  private readonly stopError?: Error;
}

export class FakeBackend implements BackendAdapter {
  public readonly adapterId = "fake.backend" as const;
  public initializeCalls = 0;
  public stopCalls = 0;
  public readonly startCalls: FakeBackendStartCall[] = [];
  public readonly sessionBindings: BackendSessionId[] = [];
  private readonly executions = new Map<string, FakeExecution>();
  private stepIndex = 0;

  public constructor(private readonly script: readonly FakeBackendStep[]) {}

  public async initialize(_launchSpec: ActorLaunchSpec): Promise<void> {
    this.initializeCalls += 1;
  }

  public start(invocation: InvocationSpec): BackendAdapterStartResult {
    const step = this.script[this.stepIndex++];
    if (step === undefined) throw new Error("FakeBackend script has no step for this Invocation.");
    this.startCalls.push({ invocationId: invocation.invocation_id, session: invocation.session });

    if (step.kind === "launch_failed") {
      return { kind: "launch_failed", fact: { status: "launch_failed", error: step.error } };
    }

    if (step.kind === "session_rejected" || step.kind === "session_and_completion_rejected") {
      const execution = new FakeExecution(step, () => {
        this.stopCalls += 1;
      });
      this.executions.set(invocation.invocation_id, execution);
      return { kind: "started", execution };
    }

    if (invocation.session.mode === "resume" && invocation.session.session_id !== step.sessionId) {
      throw new Error(`FakeBackend expected resume session ${step.sessionId}.`);
    }
    this.sessionBindings.push(step.sessionId);
    const execution = new FakeExecution(step, () => {
      this.stopCalls += 1;
    });
    this.executions.set(invocation.invocation_id, execution);
    return { kind: "started", execution };
  }

  public complete(invocationId: string, process: BackendProcessFact): void {
    const execution = this.executions.get(invocationId);
    if (execution === undefined) throw new Error(`FakeBackend has no Invocation ${invocationId}.`);
    execution.complete(process);
  }
}
