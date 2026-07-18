import { spawn } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  ActorLaunchSpec,
  InvocationSpec,
} from "@ai-block/runtime-contracts";
import type { BackendAdapterStartResult } from "../../src/backend/adapter.js";
import { ClaudeCodeAdapter } from "../../src/backend/claude-code-adapter.js";
import {
  NodeProcessRunner,
  type ProcessExecution,
  type ProcessRunCompletion,
  type ProcessRunner,
  type ProcessRunRequest,
  type ProcessRunStartResult,
} from "../../src/backend/process-runner.js";
import { BackendSupervisor } from "../../src/backend/supervisor.js";

const UUID = "00000000-0000-4000-8000-000000000000";
const projectId = `project_${UUID}`;
const actorId = `actor_${UUID}`;
const runId = `run_${UUID}`;

function launchSpec(overrides: Partial<ActorLaunchSpec> = {}): ActorLaunchSpec {
  return {
    schema_version: "1.0.0",
    project_id: projectId,
    actor_id: actorId,
    actor_config_snapshot_id: `actor_config_${UUID}`,
    system_prompts: [],
    working_directory: process.cwd(),
    backend: { adapter_id: "claude-code", config: { executable: process.execPath } },
    tool_providers: [],
    ...overrides,
  };
}

function invocation(
  overrides: Partial<InvocationSpec> = {},
): InvocationSpec {
  return {
    schema_version: "1.0.0",
    project_id: projectId,
    run_id: runId,
    actor_id: actorId,
    invocation_id: `invocation_${UUID}`,
    input_package_refs: [{
      package_id: `package_${UUID}`,
      content_hash: `sha256:${"a".repeat(64)}`,
    }],
    prompt: { kind: "text", text: "你好, Claude" },
    session: { mode: "create" },
    ...overrides,
  };
}

function exited(stdout: string, exitCode = 0, stderr = ""): ProcessRunCompletion {
  return {
    stdout,
    stderr,
    process: { status: "exited", exit_code: exitCode },
  };
}

function terminalJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: "result",
    is_error: false,
    result: "fixture result",
    session_id: "session-1",
    ...overrides,
  });
}

type FixtureStep =
  | { readonly kind: "completion"; readonly completion: ProcessRunCompletion }
  | { readonly kind: "rejected"; readonly error: Error }
  | { readonly kind: "launch_failed"; readonly error: Error };

class FixtureExecution implements ProcessExecution {
  public stopCalls = 0;

  public constructor(public readonly completion: Promise<ProcessRunCompletion>) {}

  public stop(): Promise<void> {
    this.stopCalls += 1;
    return Promise.resolve();
  }
}

class FixtureRunner implements ProcessRunner {
  public readonly requests: ProcessRunRequest[] = [];
  public readonly executions: FixtureExecution[] = [];

  public constructor(private readonly steps: FixtureStep[]) {}

  public start(request: ProcessRunRequest): ProcessRunStartResult {
    this.requests.push({ ...request, args: [...request.args] });
    const step = this.steps.shift();
    if (step === undefined) throw new Error("FixtureRunner has no remaining step.");
    if (step.kind === "launch_failed") return step;

    const execution = new FixtureExecution(
      step.kind === "completion"
        ? Promise.resolve(step.completion)
        : Promise.reject(step.error),
    );
    this.executions.push(execution);
    return { kind: "started", execution };
  }
}

function adapterRunner(...steps: FixtureStep[]): FixtureRunner {
  return new FixtureRunner([
    { kind: "completion", completion: exited("2.1.172 (Claude Code)\n") },
    ...steps,
  ]);
}

function started(result: BackendAdapterStartResult) {
  expect(result.kind).toBe("started");
  if (result.kind !== "started") throw new Error("Expected a started adapter execution.");
  return result.execution;
}

describe("NodeProcessRunner", () => {
  it("launches tokenized argv without a shell and closes UTF-8 stdin", async () => {
    const runner = new NodeProcessRunner();
    const script = [
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (chunk) => { input += chunk; });",
      "process.stdin.on('end', () => {",
      "process.stdout.write(JSON.stringify({ argv: process.argv.slice(1), input, cwd: process.cwd() }));",
      "process.stderr.write('fake-stderr');",
      "});",
    ].join("\n");

    const result = runner.start({
      executable: process.execPath,
      args: ["-e", script, "one value", "", "x&y"],
      cwd: process.cwd(),
      stdin: "提示：你好",
    });

    expect(result.kind).toBe("started");
    if (result.kind !== "started") throw new Error("Local fake child did not start.");
    const completion = await result.execution.completion;
    expect(completion.process).toEqual({ status: "exited", exit_code: 0 });
    expect(completion.stderr).toBe("fake-stderr");
    expect(JSON.parse(completion.stdout)).toEqual({
      argv: ["one value", "", "x&y"],
      input: "提示：你好",
      cwd: process.cwd(),
    });
  });

  it("keeps non-zero exit and signal-or-platform-equivalent termination as process facts", async () => {
    const runner = new NodeProcessRunner();
    const nonZero = runner.start({
      executable: process.execPath,
      args: ["-e", "process.stdout.write('done'); process.exitCode = 7;"],
      cwd: process.cwd(),
      stdin: "",
    });
    if (nonZero.kind !== "started") throw new Error("Non-zero fixture did not start.");
    await expect(nonZero.execution.completion).resolves.toMatchObject({
      stdout: "done",
      process: { status: "exited", exit_code: 7 },
    });

    const terminated = runner.start({
      executable: process.execPath,
      args: ["-e", "process.kill(process.pid, 'SIGTERM');"],
      cwd: process.cwd(),
      stdin: "",
    });
    if (terminated.kind !== "started") throw new Error("Termination fixture did not start.");
    const fact = (await terminated.execution.completion).process;
    expect(["signaled", "exited"]).toContain(fact.status);
  });

  it("separates synchronous and asynchronous launch failures from process facts", async () => {
    const runner = new NodeProcessRunner();
    const synchronous = runner.start({
      executable: "\0",
      args: [],
      cwd: process.cwd(),
      stdin: "",
    });
    expect(synchronous.kind).toBe("launch_failed");

    const missing = runner.start({
      executable: join(process.cwd(), `missing-child-${Date.now()}`),
      args: [],
      cwd: process.cwd(),
      stdin: "",
    });
    if (missing.kind === "started") {
      await expect(missing.execution.completion).rejects.toBeDefined();
    } else {
      expect(missing.kind).toBe("launch_failed");
    }
  });

  it("stops idempotently and reports stopped only after termination is observed", async () => {
    const runner = new NodeProcessRunner();
    const result = runner.start({
      executable: process.execPath,
      args: ["-e", "setInterval(() => {}, 1000);"],
      cwd: process.cwd(),
      stdin: "",
    });
    if (result.kind !== "started") throw new Error("Stop fixture did not start.");
    await new Promise<void>((resolve) => setImmediate(resolve));

    const firstStop = result.execution.stop();
    const secondStop = result.execution.stop();
    expect(secondStop).toBe(firstStop);
    await expect(firstStop).resolves.toBeUndefined();
    await expect(result.execution.completion).resolves.toMatchObject({
      process: { status: "stopped" },
    });
  });

  it("rejects stop when child liveness cannot be confirmed", async () => {
    let forceKill: (() => boolean) | undefined;
    const runner = new NodeProcessRunner((executable, args, options) => {
      const child = spawn(executable, [...args], {
        cwd: options.cwd,
        shell: options.shell,
        stdio: [...options.stdio],
      });
      forceKill = child.kill.bind(child);
      child.kill = (() => false) as typeof child.kill;
      return child;
    });
    const result = runner.start({
      executable: process.execPath,
      args: ["-e", "setInterval(() => {}, 1000);"],
      cwd: process.cwd(),
      stdin: "",
    });
    if (result.kind !== "started") throw new Error("Unknown-liveness fixture did not start.");
    await new Promise<void>((resolve) => setImmediate(resolve));

    await expect(result.execution.stop()).rejects.toThrow("liveness");
    if (forceKill === undefined) throw new Error("Missing fake-child cleanup operation.");
    forceKill();
    const completion = await result.execution.completion;
    expect(completion.process.status).not.toBe("stopped");
  });
});

describe("ClaudeCodeAdapter initialization and launch profile", () => {
  it("accepts only the exact config and performs metadata-only version inspection", async () => {
    const runner = adapterRunner();
    const adapter = new ClaudeCodeAdapter(runner);

    await adapter.initialize(launchSpec());

    expect(runner.requests).toEqual([{
      executable: process.execPath,
      args: ["--version"],
      cwd: process.cwd(),
      stdin: "",
    }]);
  });

  it("rejects unsupported config, paths, prompts, providers, and adapter identity before launch", async () => {
    const invalidSpecs: ActorLaunchSpec[] = [
      launchSpec({ backend: { adapter_id: "claude-code", config: {} } }),
      launchSpec({ backend: { adapter_id: "claude-code", config: { executable: process.execPath, extra: true } } }),
      launchSpec({ backend: { adapter_id: "claude-code", config: { executable: "relative-cli" } } }),
      launchSpec({ backend: { adapter_id: "other-adapter", config: { executable: process.execPath } } }),
      launchSpec({ working_directory: "relative-cwd" }),
      launchSpec({ system_prompts: [{ kind: "system_text", text: "private system prompt" }] }),
      launchSpec({ tool_providers: [{ provider_id: "provider", config: {} }] }),
    ];

    for (const spec of invalidSpecs) {
      const runner = new FixtureRunner([]);
      await expect(new ClaudeCodeAdapter(runner).initialize(spec)).rejects.toBeDefined();
      expect(runner.requests).toHaveLength(0);
    }
  });

  it("rejects launch errors, non-success metadata processes, malformed versions, and other versions", async () => {
    const cases: FixtureStep[] = [
      { kind: "launch_failed", error: new Error("spawn failed") },
      { kind: "rejected", error: new Error("async spawn failed") },
      { kind: "completion", completion: exited("2.1.172 (Claude Code)", 1) },
      { kind: "completion", completion: exited("not-a-version") },
      { kind: "completion", completion: exited("2.1.173 (Claude Code)") },
    ];

    for (const step of cases) {
      const runner = new FixtureRunner([step]);
      await expect(new ClaudeCodeAdapter(runner).initialize(launchSpec())).rejects.toBeDefined();
      expect(runner.requests).toHaveLength(1);
    }
  });

  it("builds the exact P5 create argv and writes only the text prompt to stdin", async () => {
    const runner = adapterRunner({ kind: "completion", completion: exited(terminalJson()) });
    const adapter = new ClaudeCodeAdapter(runner);
    await adapter.initialize(launchSpec());

    const execution = started(adapter.start(invocation()));
    await expect(execution.session).resolves.toBe("session-1");
    await expect(execution.completion).resolves.toMatchObject({
      sessionId: "session-1",
      process: { status: "exited", exit_code: 0 },
    });
    expect(runner.requests[1]).toEqual({
      executable: process.execPath,
      args: ["--print", "--bare", "--output-format", "json", "--tools", ""],
      cwd: process.cwd(),
      stdin: "你好, Claude",
    });
  });

  it("builds exact explicit resume argv with the actual session ID", async () => {
    const runner = adapterRunner({
      kind: "completion",
      completion: exited(terminalJson({ session_id: "resume-session" })),
    });
    const adapter = new ClaudeCodeAdapter(runner);
    await adapter.initialize(launchSpec());

    const execution = started(adapter.start(invocation({
      session: { mode: "resume", session_id: "resume-session" },
    })));
    await expect(execution.completion).resolves.toBeDefined();
    expect(runner.requests[1]?.args).toEqual([
      "--print",
      "--resume",
      "resume-session",
      "--bare",
      "--output-format",
      "json",
      "--tools",
      "",
    ]);
  });

  it("rejects composite prompts and uninitialized or synchronously failed launches without spawning a model call", async () => {
    const uninitialized = new ClaudeCodeAdapter(new FixtureRunner([]));
    expect(uninitialized.start(invocation())).toMatchObject({
      kind: "launch_failed",
      fact: { error: { code: "backend.claude_code_not_initialized" } },
    });

    const compositeRunner = adapterRunner();
    const compositeAdapter = new ClaudeCodeAdapter(compositeRunner);
    await compositeAdapter.initialize(launchSpec());
    expect(compositeAdapter.start(invocation({
      prompt: { kind: "composite", parts: [{ kind: "text", text: "part" }] },
    }))).toMatchObject({
      kind: "launch_failed",
      fact: { error: { code: "backend.claude_code_prompt_unsupported" } },
    });
    expect(compositeRunner.requests).toHaveLength(1);

    const failedRunner = adapterRunner({ kind: "launch_failed", error: new Error("spawn failed") });
    const failedAdapter = new ClaudeCodeAdapter(failedRunner);
    await failedAdapter.initialize(launchSpec());
    expect(failedAdapter.start(invocation())).toMatchObject({
      kind: "launch_failed",
      fact: { error: { code: "backend.claude_code_launch_failed" } },
    });
  });
});

describe("ClaudeCodeAdapter terminal JSON and session observation", () => {
  it("accepts authoritative structured success with extra fields", async () => {
    const runner = adapterRunner({
      kind: "completion",
      completion: exited(terminalJson({ usage: {}, uuid: "fixture-uuid", future_field: [1, 2] })),
    });
    const adapter = new ClaudeCodeAdapter(runner);
    await adapter.initialize(launchSpec());

    const execution = started(adapter.start(invocation()));
    await expect(execution.session).resolves.toBe("session-1");
    await expect(execution.completion).resolves.toMatchObject({ sessionId: "session-1" });
  });

  it.each([
    ["plain text", "plain result"],
    ["malformed JSON", "{not-json"],
    ["wrong root type", "[]"],
    ["wrong terminal type", terminalJson({ type: "other" })],
    ["error result", terminalJson({ is_error: true })],
    ["missing is_error", JSON.stringify({ type: "result", result: "ok", session_id: "session-1" })],
    ["invalid result", terminalJson({ result: { text: "no" } })],
  ])("maps %s to completion observation failure", async (_name, stdout) => {
    const runner = adapterRunner({ kind: "completion", completion: exited(stdout) });
    const adapter = new ClaudeCodeAdapter(runner);
    const supervisor = new BackendSupervisor(adapter);
    await expect(supervisor.initialize(launchSpec())).resolves.toEqual({ kind: "initialized" });

    const start = supervisor.start(invocation());
    if (start.kind !== "started") throw new Error("Expected Supervisor to start fixture.");
    await expect(start.invocation.failure).resolves.toMatchObject({ code: "completion_observation_failed" });
    await expect(start.invocation.result).resolves.toBeUndefined();
  });

  it.each([
    ["missing session", terminalJson({ session_id: undefined }), { mode: "create" } as const],
    ["empty session", terminalJson({ session_id: "" }), { mode: "create" } as const],
    ["resume mismatch", terminalJson({ session_id: "other-session" }), { mode: "resume", session_id: "wanted-session" } as const],
  ])("maps %s to session observation failure", async (_name, stdout, session) => {
    const runner = adapterRunner({ kind: "completion", completion: exited(stdout) });
    const adapter = new ClaudeCodeAdapter(runner);
    const supervisor = new BackendSupervisor(adapter);
    await expect(supervisor.initialize(launchSpec())).resolves.toEqual({ kind: "initialized" });

    const start = supervisor.start(invocation({ session }));
    if (start.kind !== "started") throw new Error("Expected Supervisor to start fixture.");
    await expect(start.invocation.failure).resolves.toMatchObject({ code: "session_observation_failed" });
    await expect(start.invocation.result).resolves.toBeUndefined();
  });

  it("preserves non-zero exit when structured result and session are valid", async () => {
    const runner = adapterRunner({
      kind: "completion",
      completion: exited(terminalJson(), 9, "backend diagnostic"),
    });
    const adapter = new ClaudeCodeAdapter(runner);
    await adapter.initialize(launchSpec());

    const execution = started(adapter.start(invocation()));
    await expect(execution.completion).resolves.toEqual({
      sessionId: "session-1",
      process: { status: "exited", exit_code: 9 },
    });
  });

  it("does not synthesize a result or session for non-zero invalid output", async () => {
    const runner = adapterRunner({ kind: "completion", completion: exited("plain failure", 9) });
    const adapter = new ClaudeCodeAdapter(runner);
    await adapter.initialize(launchSpec());

    const execution = started(adapter.start(invocation()));
    const session = expect(execution.session).resolves.toBeUndefined();
    const completion = expect(execution.completion).rejects.toBeDefined();
    await Promise.all([session, completion]);
  });

  it("returns observed stopped without parsing partial output or inventing a session", async () => {
    const runner = adapterRunner({
      kind: "completion",
      completion: { stdout: "partial", stderr: "", process: { status: "stopped" } },
    });
    const adapter = new ClaudeCodeAdapter(runner);
    await adapter.initialize(launchSpec());

    const execution = started(adapter.start(invocation()));
    await expect(execution.session).resolves.toBeUndefined();
    await expect(execution.completion).resolves.toEqual({ process: { status: "stopped" } });
  });

  it("maps asynchronous process errors and unknown liveness to completion observation failure", async () => {
    const runner = adapterRunner({ kind: "rejected", error: new Error("unknown process liveness") });
    const adapter = new ClaudeCodeAdapter(runner);
    const supervisor = new BackendSupervisor(adapter);
    await expect(supervisor.initialize(launchSpec())).resolves.toEqual({ kind: "initialized" });

    const start = supervisor.start(invocation());
    if (start.kind !== "started") throw new Error("Expected Supervisor to start fixture.");
    await expect(start.invocation.failure).resolves.toMatchObject({ code: "completion_observation_failed" });
    await expect(start.invocation.result).resolves.toBeUndefined();
  });
});
