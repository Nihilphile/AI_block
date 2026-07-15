import type {
  ActorLaunchSpec,
  BackendAdapterId,
  BackendSessionId,
  ExitedProcessFact,
  InvocationSpec,
  LaunchFailedProcessFact,
  SignaledProcessFact,
  StoppedProcessFact,
} from "@ai-block/runtime-contracts";

export type BackendProcessFact =
  | ExitedProcessFact
  | SignaledProcessFact
  | StoppedProcessFact;

export interface BackendInvocationCompletion {
  readonly sessionId?: BackendSessionId;
  readonly process: BackendProcessFact;
}

export interface BackendInvocationExecution {
  readonly session: Promise<BackendSessionId | undefined>;
  readonly completion: Promise<BackendInvocationCompletion>;
  stop(): Promise<void>;
}

export type BackendAdapterStartResult =
  | {
      readonly kind: "started";
      readonly execution: BackendInvocationExecution;
    }
  | {
      readonly kind: "launch_failed";
      readonly fact: LaunchFailedProcessFact;
    };

export interface BackendAdapter {
  readonly adapterId: BackendAdapterId;
  initialize(launchSpec: ActorLaunchSpec): Promise<void>;
  start(invocation: InvocationSpec): BackendAdapterStartResult;
}
