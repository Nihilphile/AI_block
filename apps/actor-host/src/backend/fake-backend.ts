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
  | { readonly kind: "completed"; readonly sessionId: BackendSessionId; readonly process: BackendProcessFact };

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
    sessionId: BackendSessionId,
    step: Extract<FakeBackendStep, { kind: "pending" | "completed" }>,
    private readonly onStop: () => void,
  ) {
    this.session = Promise.resolve(sessionId);
    if (step.kind === "pending") {
      this.pendingCompletion = new Deferred<BackendInvocationCompletion>();
      this.completion = this.pendingCompletion.promise;
    } else {
      this.settled = true;
      this.completion = Promise.resolve({ sessionId, process: step.process });
    }
  }

  public complete(process: BackendProcessFact): void {
    if (this.pendingCompletion === undefined || this.settled) return;
    this.settled = true;
    this.pendingCompletion.resolve({ sessionId: undefined, process });
  }

  public stop(): Promise<void> {
    if (this.pendingCompletion !== undefined && !this.settled) {
      this.onStop();
      this.settled = true;
      this.pendingCompletion.resolve({ sessionId: undefined, process: { status: "stopped" } });
    }
    return Promise.resolve();
  }
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

    if (invocation.session.mode === "resume" && invocation.session.session_id !== step.sessionId) {
      throw new Error(`FakeBackend expected resume session ${step.sessionId}.`);
    }
    this.sessionBindings.push(step.sessionId);
    const execution = new FakeExecution(step.sessionId, step, () => {
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
