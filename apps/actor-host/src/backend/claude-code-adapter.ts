import { isAbsolute } from "node:path";
import type {
  ActorLaunchSpec,
  BackendSessionId,
  ContractErrorEnvelope,
  InvocationSpec,
} from "@ai-block/runtime-contracts";
import type {
  BackendAdapter,
  BackendAdapterStartResult,
  BackendInvocationCompletion,
  BackendInvocationExecution,
} from "./adapter.js";
import {
  NodeProcessRunner,
  type ProcessExecution,
  type ProcessRunCompletion,
  type ProcessRunner,
} from "./process-runner.js";

const ADAPTER_ID = "claude-code" as const;
const SUPPORTED_VERSION = "2.1.172";
const CREATE_ARGS = ["--print", "--bare", "--output-format", "json", "--tools", ""] as const;

interface InitializedLaunch {
  readonly executable: string;
  readonly cwd: string;
}

type TerminalObservation =
  | { readonly kind: "success"; readonly process: ProcessRunCompletion; readonly sessionId: BackendSessionId }
  | { readonly kind: "stopped"; readonly process: ProcessRunCompletion }
  | { readonly kind: "completion_failure"; readonly error: unknown }
  | { readonly kind: "session_failure"; readonly error: unknown };

class CompletionObservationError extends Error {}
class SessionObservationError extends Error {}

function fixedLaunchError(
  schemaVersion: InvocationSpec["schema_version"],
  code: string,
  category: "validation" | "backend",
  message: string,
): ContractErrorEnvelope {
  return {
    schema_version: schemaVersion,
    code,
    category,
    message,
    retryable: false,
  } as ContractErrorEnvelope;
}

function launchFailed(
  invocation: InvocationSpec,
  code: string,
  category: "validation" | "backend",
  message: string,
): BackendAdapterStartResult {
  return {
    kind: "launch_failed",
    fact: {
      status: "launch_failed",
      error: fixedLaunchError(invocation.schema_version, code, category, message),
    },
  };
}

function validateLaunchSpec(launchSpec: ActorLaunchSpec): InitializedLaunch {
  if (launchSpec.backend.adapter_id !== ADAPTER_ID) {
    throw new Error("ClaudeCodeAdapter requires backend adapter_id claude-code.");
  }
  if (launchSpec.system_prompts.length !== 0) {
    throw new Error("ClaudeCodeAdapter v0.1 does not support system prompts.");
  }
  if (launchSpec.tool_providers.length !== 0) {
    throw new Error("ClaudeCodeAdapter v0.1 does not support tool providers.");
  }
  if (!isAbsolute(launchSpec.working_directory)) {
    throw new Error("ClaudeCodeAdapter working_directory must be absolute.");
  }

  const configValue = launchSpec.backend.config;
  if (typeof configValue !== "object" || configValue === null || Array.isArray(configValue)) {
    throw new Error("ClaudeCodeAdapter config must be an object.");
  }
  const config = configValue as Record<string, unknown>;
  const keys = Object.keys(config);
  if (keys.length !== 1 || keys[0] !== "executable") {
    throw new Error("ClaudeCodeAdapter config must contain exactly executable.");
  }
  const executable = config.executable;
  if (typeof executable !== "string" || !isAbsolute(executable)) {
    throw new Error("ClaudeCodeAdapter executable must be an absolute native path.");
  }
  return Object.freeze({ executable, cwd: launchSpec.working_directory });
}

function parseVersion(stdout: string): string {
  const match = /^(\d+\.\d+\.\d+)(?: \(Claude Code\))?$/.exec(stdout.trim());
  if (match === null) throw new Error("Claude Code version output is not recognized.");
  return match[1];
}

function parseTerminalSession(stdout: string, invocation: InvocationSpec): BackendSessionId {
  let value: unknown;
  try {
    value = JSON.parse(stdout);
  } catch {
    throw new CompletionObservationError("Claude Code stdout is not terminal JSON.");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CompletionObservationError("Claude Code terminal JSON must be a root object.");
  }

  const record = value as Record<string, unknown>;
  if (record.type !== "result" || record.is_error !== false || typeof record.result !== "string") {
    throw new CompletionObservationError("Claude Code terminal result is not a successful result object.");
  }
  if (typeof record.session_id !== "string" || record.session_id.length === 0) {
    throw new SessionObservationError("Claude Code terminal result has no session identity.");
  }
  if (invocation.session.mode === "resume" && record.session_id !== invocation.session.session_id) {
    throw new SessionObservationError("Claude Code resumed a different session identity.");
  }
  return record.session_id as BackendSessionId;
}

function observeTerminal(
  execution: ProcessExecution,
  invocation: InvocationSpec,
): Promise<TerminalObservation> {
  return execution.completion.then(
    (process) => {
      if (process.process.status === "stopped") return { kind: "stopped", process };
      try {
        return { kind: "success", process, sessionId: parseTerminalSession(process.stdout, invocation) };
      } catch (error) {
        return error instanceof SessionObservationError
          ? { kind: "session_failure", error }
          : { kind: "completion_failure", error };
      }
    },
    (error: unknown) => ({ kind: "completion_failure", error }),
  );
}

class ClaudeCodeExecution implements BackendInvocationExecution {
  public readonly session: Promise<BackendSessionId | undefined>;
  public readonly completion: Promise<BackendInvocationCompletion>;

  public constructor(
    private readonly process: ProcessExecution,
    invocation: InvocationSpec,
  ) {
    const observation = observeTerminal(process, invocation);
    this.session = observation.then((value) => {
      if (value.kind === "session_failure") throw value.error;
      return value.kind === "success" ? value.sessionId : undefined;
    });
    this.completion = observation.then((value) => {
      if (value.kind === "completion_failure" || value.kind === "session_failure") throw value.error;
      return value.kind === "success"
        ? { sessionId: value.sessionId, process: value.process.process }
        : { process: value.process.process };
    });
  }

  public stop(): Promise<void> {
    return this.process.stop();
  }
}

export class ClaudeCodeAdapter implements BackendAdapter {
  public readonly adapterId = ADAPTER_ID;
  private launch: InitializedLaunch | undefined;

  public constructor(private readonly runner: ProcessRunner = new NodeProcessRunner()) {}

  public async initialize(launchSpec: ActorLaunchSpec): Promise<void> {
    const launch = validateLaunchSpec(launchSpec);
    const started = this.runner.start({
      executable: launch.executable,
      args: ["--version"],
      cwd: launch.cwd,
      stdin: "",
    });
    if (started.kind === "launch_failed") {
      throw new Error("Claude Code metadata process could not be launched.");
    }
    const completion = await started.execution.completion;
    if (completion.process.status !== "exited" || completion.process.exit_code !== 0) {
      throw new Error("Claude Code metadata process did not exit successfully.");
    }
    if (parseVersion(completion.stdout) !== SUPPORTED_VERSION) {
      throw new Error(`Unsupported Claude Code version; expected ${SUPPORTED_VERSION}.`);
    }
    this.launch = launch;
  }

  public start(invocation: InvocationSpec): BackendAdapterStartResult {
    if (this.launch === undefined) {
      return launchFailed(
        invocation,
        "backend.claude_code_not_initialized",
        "backend",
        "Claude Code adapter is not initialized.",
      );
    }
    if (invocation.prompt.kind !== "text" || invocation.prompt.text.length === 0) {
      return launchFailed(
        invocation,
        "backend.claude_code_prompt_unsupported",
        "validation",
        "Claude Code invocation prompt is unsupported.",
      );
    }

    const args = invocation.session.mode === "create"
      ? [...CREATE_ARGS]
      : [
          "--print",
          "--resume",
          invocation.session.session_id,
          "--bare",
          "--output-format",
          "json",
          "--tools",
          "",
        ];
    const started = this.runner.start({
      executable: this.launch.executable,
      args,
      cwd: this.launch.cwd,
      stdin: invocation.prompt.text,
    });
    if (started.kind === "launch_failed") {
      return launchFailed(
        invocation,
        "backend.claude_code_launch_failed",
        "backend",
        "Claude Code process launch failed.",
      );
    }
    return {
      kind: "started",
      execution: new ClaudeCodeExecution(started.execution, invocation),
    };
  }
}
