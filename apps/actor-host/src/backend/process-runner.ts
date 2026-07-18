import {
  spawn,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";
import type { BackendProcessFact } from "./adapter.js";

export interface ProcessRunRequest {
  readonly executable: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly stdin: string;
}

export interface ProcessRunCompletion {
  readonly stdout: string;
  readonly stderr: string;
  readonly process: BackendProcessFact;
}

export interface ProcessExecution {
  readonly completion: Promise<ProcessRunCompletion>;
  stop(): Promise<void>;
}

export type ProcessRunStartResult =
  | { readonly kind: "started"; readonly execution: ProcessExecution }
  | { readonly kind: "launch_failed"; readonly error: unknown };

export interface ProcessRunner {
  start(request: ProcessRunRequest): ProcessRunStartResult;
}

interface SpawnOptions {
  readonly cwd: string;
  readonly shell: false;
  readonly stdio: readonly ["pipe", "pipe", "pipe"];
}

export type ProcessSpawner = (
  executable: string,
  args: readonly string[],
  options: SpawnOptions,
) => ChildProcessWithoutNullStreams;

const nativeSpawn: ProcessSpawner = (executable, args, options) =>
  spawn(executable, [...args], {
    cwd: options.cwd,
    shell: options.shell,
    stdio: [...options.stdio],
  });

class NodeProcessExecution implements ProcessExecution {
  public readonly completion: Promise<ProcessRunCompletion>;
  private settled = false;
  private stopRequested = false;
  private stopPromise: Promise<void> | undefined;
  private resolveStop: (() => void) | undefined;
  private rejectStop: ((error: unknown) => void) | undefined;

  public constructor(
    private readonly child: ChildProcessWithoutNullStreams,
    stdin: string,
  ) {
    let stdout = "";
    let stderr = "";
    let stdinError: unknown;

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.stdin.once("error", (error) => {
      stdinError = error;
    });

    this.completion = new Promise<ProcessRunCompletion>((resolve, reject) => {
      child.once("error", (error) => {
        if (this.settled) return;
        this.settled = true;
        this.rejectStop?.(error);
        reject(error);
      });
      child.once("close", (exitCode, signal) => {
        if (this.settled) return;
        this.settled = true;

        if (this.stopRequested) {
          const completion = { stdout, stderr, process: { status: "stopped" } as const };
          this.resolveStop?.();
          resolve(completion);
          return;
        }
        if (stdinError !== undefined) {
          reject(stdinError);
          return;
        }
        if (exitCode !== null && exitCode >= 0) {
          resolve({ stdout, stderr, process: { status: "exited", exit_code: exitCode } });
          return;
        }
        if (signal !== null) {
          resolve({ stdout, stderr, process: { status: "signaled", signal } });
          return;
        }
        reject(new Error("Process termination could not be observed."));
      });
    });

    child.stdin.end(stdin, "utf8");
  }

  public stop(): Promise<void> {
    if (this.stopPromise !== undefined) return this.stopPromise;
    if (this.settled) return Promise.resolve();

    this.stopRequested = true;
    this.stopPromise = new Promise<void>((resolve, reject) => {
      this.resolveStop = resolve;
      this.rejectStop = reject;
      try {
        if (!this.child.kill()) {
          this.stopRequested = false;
          reject(new Error("Process liveness could not be confirmed for stop."));
        }
      } catch (error) {
        this.stopRequested = false;
        reject(error);
      }
    });
    return this.stopPromise;
  }
}

export class NodeProcessRunner implements ProcessRunner {
  public constructor(private readonly spawnChild: ProcessSpawner = nativeSpawn) {}

  public start(request: ProcessRunRequest): ProcessRunStartResult {
    let child: ChildProcessWithoutNullStreams;
    try {
      child = this.spawnChild(request.executable, request.args, {
        cwd: request.cwd,
        shell: false,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (error) {
      return { kind: "launch_failed", error };
    }

    return {
      kind: "started",
      execution: new NodeProcessExecution(child, request.stdin),
    };
  }
}
