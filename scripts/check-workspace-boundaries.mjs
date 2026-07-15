  import { spawnSync } from "node:child_process";
  import { fileURLToPath } from "node:url";
  import {
    existsSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
    writeFileSync
  } from "node:fs";
  import { dirname, isAbsolute, join, relative, resolve } from "node:path";

  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const pnpmEntry = process.env.npm_execpath ?? "";
  if (pnpmEntry.length === 0 || !isAbsolute(pnpmEntry)) {
    console.error("BOUNDARY CHECK FAILED: run this checker through `pnpm check:boundaries` so npm_execpath is an absolute pnpm entry file.");
    process.exit(1);
  }
  try {
    if (!statSync(pnpmEntry).isFile()) throw new Error("npm_execpath is not a file");
  } catch {
    console.error("BOUNDARY CHECK FAILED: run this checker through `pnpm check:boundaries` so npm_execpath points to a readable pnpm entry file.");
    process.exit(1);
  }

  function normalizeCheckerArgs(args) {
    if (args.length === 0) return [];
    if (args.length === 1 && args[0] === "--git-clean") return ["--git-clean"];
    if (args.length === 2 && args[0] === "--" && args[1] === "--git-clean") return ["--git-clean"];
    return undefined;
  }

  function runArgumentMatcherRegressionChecks() {
    const accepted = [
      { input: [], output: [] },
      { input: ["--git-clean"], output: ["--git-clean"] },
      { input: ["--", "--git-clean"], output: ["--git-clean"] }
    ];
    for (const test of accepted) {
      check(same(normalizeCheckerArgs(test.input), test.output), `regression: accepted argument form was rejected: ${JSON.stringify(test.input)}`);
    }

    const rejected = [
      ["--"],
      ["--", "--"],
      ["--git-clean", "extra"],
      ["--", "--git-clean", "extra"],
      ["--git-clean", "--git-clean"],
      ["--", "--git-clean", "--git-clean"],
      ["--unknown"]
    ];
    for (const input of rejected) {
      check(normalizeCheckerArgs(input) === undefined, `regression: invalid argument form was accepted: ${JSON.stringify(input)}`);
    }
  }

  const checkerArgs = normalizeCheckerArgs(process.argv.slice(2));
  if (checkerArgs === undefined) {
    console.error("BOUNDARY CHECK FAILED: supported invocation is `pnpm check:boundaries` with optional `-- --git-clean`.");
    process.exit(1);
  }
  const gitCleanMode = checkerArgs[0] === "--git-clean";
  const contractName = "@ai-block/runtime-contracts";
  const appNames = [
    "@ai-block/runtime-server",
    "@ai-block/actor-host",
    "@ai-block/runtime-cli"
  ];
  const expectedRuntimeExports = [
    "AckPayloadSchema",
    "ActorConfigSnapshotIdSchema",
    "ActorIdSchema",
    "ActorLaunchSpecSchema",
    "ActorTemplateIdSchema",
    "BackendAdapterIdSchema",
    "BackendAdapterLaunchConfigSchema",
    "BackendSessionIdSchema",
    "BrickPromptSchema",
    "BrickSysPromptSchema",
    "CanonicalTimestampSchema",
    "ClientPrincipalIdSchema",
    "CompositeBrickPromptSchema",
    "CONTRACT_SCHEMA_VERSION",
    "CompletionRequestPayloadSchema",
    "ContractErrorEnvelopeSchema",
    "ContractSchemaVersionSchema",
    "CreateSessionDirectiveSchema",
    "ContentHashSchema",
    "DeliveryIdSchema",
    "DeliverySchema",
    "DeliveryStateSchema",
    "ExitedProcessFactSchema",
    "GraphIdSchema",
    "HeartbeatPayloadSchema",
    "HostFaultPayloadSchema",
    "HostHelloPayloadSchema",
    "HostInstanceIdSchema",
    "HostMessageIdSchema",
    "HostProtocolVersionSchema",
    "HostReadyPayloadSchema",
    "HostToServerMessageSchema",
    "HostToServerPayloadSchema",
    "InitializeActorHostPayloadSchema",
    "InvocationIdSchema",
    "InvocationProcessFactSchema",
    "InvocationResultPayloadSchema",
    "InvocationResultSchema",
    "InvocationSpecSchema",
    "JsonObjectSchema",
    "JsonValueSchema",
    "LaunchFailedProcessFactSchema",
    "PackageCreatorSchema",
    "PackageHashMaterialSchema",
    "PackageHeadSchema",
    "PackageIdSchema",
    "PackagePublishRequestPayloadSchema",
    "PackageProvenanceSchema",
    "PackageRefSchema",
    "PackageSchema",
    "PackageSchemaVersionSchema",
    "PackageTypeSchema",
    "PACKAGE_SCHEMA_VERSION",
    "ProjectIdSchema",
    "ResumeSessionDirectiveSchema",
    "RunIdSchema",
    "ServerToHostMessageSchema",
    "ServerToHostPayloadSchema",
    "SessionDirectiveSchema",
    "SessionReportPayloadSchema",
    "ShutdownHostPayloadSchema",
    "SignaledProcessFactSchema",
    "StartInvocationPayloadSchema",
    "StopInvocationPayloadSchema",
    "StoppedProcessFactSchema",
    "TextBrickPromptSchema",
    "ToolProviderIdSchema",
    "ToolProviderLaunchConfigSchema",
    "computePackageContentHash",
    "decodeContract",
    "derivePackageHashMaterial",
    "verifyPackageContentHash",
    "HOST_PROTOCOL_VERSION"
  ].sort();
  const expectedPublicTypeExports = [
    "AckPayload",
    "ActorConfigSnapshotId",
    "ActorId",
    "ActorLaunchSpec",
    "ActorTemplateId",
    "BackendAdapterId",
    "BackendAdapterLaunchConfig",
    "BackendSessionId",
    "BrickPrompt",
    "BrickSysPrompt",
    "CanonicalTimestamp",
    "ClientPrincipalId",
    "CompletionRequestPayload",
    "CompositeBrickPrompt",
    "ContractDecodeResult",
    "ContractErrorEnvelope",
    "ContractSchemaVersion",
    "ContractValue",
    "ContentHash",
    "CreateSessionDirective",
    "Delivery",
    "DeliveryId",
    "DeliveryState",
    "ExitedProcessFact",
    "GraphId",
    "HeartbeatPayload",
    "HostFaultPayload",
    "HostHelloPayload",
    "HostInstanceId",
    "HostMessageId",
    "HostProtocolVersion",
    "HostReadyPayload",
    "HostToServerMessage",
    "HostToServerPayload",
    "InitializeActorHostPayload",
    "InvocationId",
    "InvocationProcessFact",
    "InvocationResult",
    "InvocationResultPayload",
    "InvocationSpec",
    "JsonObject",
    "JsonValue",
    "LaunchFailedProcessFact",
    "Package",
    "PackageCreator",
    "PackageHashMaterial",
    "PackageHead",
    "PackageId",
    "PackageProvenance",
    "PackagePublishRequestPayload",
    "PackageRef",
    "PackageSchemaVersion",
    "PackageType",
    "ProjectId",
    "ResumeSessionDirective",
    "RunId",
    "ServerToHostMessage",
    "ServerToHostPayload",
    "SessionDirective",
    "SessionReportPayload",
    "ShutdownHostPayload",
    "SignaledProcessFact",
    "StartInvocationPayload",
    "StopInvocationPayload",
    "StoppedProcessFact",
    "TextBrickPrompt",
    "ToolProviderId",
    "ToolProviderLaunchConfig"
  ].sort();
  const contracts = {
    kind: "contracts",
    name: contractName,
    dir: join(root, "packages", "runtime-contracts")
  };
  const compatibilityFixturePath = join(contracts.dir, "test", "compatibility", "fixtures.json");
  const apps = [
    { kind: "app", name: "@ai-block/runtime-server", dir: join(root, "apps", "runtime-server") },
    { kind: "app", name: "@ai-block/actor-host", dir: join(root, "apps", "actor-host") },
    { kind: "app", name: "@ai-block/runtime-cli", dir: join(root, "apps", "runtime-cli") }
  ];
  const units = [...apps, contracts];
  const failures = [];

  function fail(message) {
    failures.push(message);
  }

  function check(condition, message) {
    if (!condition) fail(message);
  }

  runArgumentMatcherRegressionChecks();

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
    return value;
  }

  function same(left, right) {
    return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
  }

  function readJson(path) {
    try {
      return JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      fail(`cannot read JSON ${path}: ${error.message}`);
      return {};
    }
  }

  function readText(path) {
    try {
      return readFileSync(path, "utf8");
    } catch (error) {
      fail(`cannot read text ${path}: ${error.message}`);
      return "";
    }
  }

  function directories(path) {
    if (!existsSync(path)) return [];
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  }

  function checkManifestShape() {
    const expectedRoot = {
      name: "ai-block",
      version: "0.0.0",
      private: true,
      type: "module",
      packageManager: "pnpm@11.10.0",
      engines: { node: ">=24 <25", pnpm: "11.10.0" },
      scripts: {
        build: "tsc -b tsconfig.json",
        clean: "tsc -b tsconfig.json --clean",
        "check:types": "tsc -b tsconfig.json --pretty false",
        "check:boundaries": "node scripts/check-workspace-boundaries.mjs",
        "test:contracts": "pnpm --filter @ai-block/runtime-contracts test",
        verify: "pnpm install --frozen-lockfile && git diff --exit-code && pnpm build && pnpm test:contracts && pnpm check:boundaries && pnpm clean && pnpm check:boundaries -- --git-clean && git diff --exit-code"
      },
      devDependencies: { "@types/node": "24.13.3", typescript: "7.0.2" }
    };
    check(same(readJson(join(root, "package.json")), expectedRoot), "root package manifest has extra, missing, or altered fields");

    for (const app of apps) {
      const expected = {
        name: app.name,
        version: "0.0.0",
        private: true,
        type: "module",
        dependencies: { [contractName]: "workspace:*" }
      };
      check(same(readJson(join(app.dir, "package.json")), expected), `${app.dir}: complete application manifest mismatch`);
    }

    const expectedContracts = {
      name: contractName,
      version: "0.0.0",
      private: true,
      type: "module",
      scripts: {
        test: "vitest run && pnpm run test:types",
        "test:types": "tsc --ignoreConfig --noEmit --target ES2023 --module NodeNext --moduleResolution NodeNext --strict --verbatimModuleSyntax --types node --skipLibCheck test/validation/contract-kernel.test.ts test/identity/identity.test.ts test/error/error-envelope.test.ts test/brick/brick.test.ts test/package/package.test.ts test/package/hash.test.ts test/actor/actor.test.ts test/host/host.test.ts test/compatibility/compatibility.test.ts test/types/public-types.ts --pretty false"
      },
      dependencies: { ajv: "8.20.0", "ajv-formats": "3.0.1", canonicalize: "3.0.0", typebox: "1.3.6" },
      devDependencies: { "fast-check": "4.8.0", vitest: "4.1.10" },
      types: "./dist/index.d.ts",
      exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } }
    };
    check(same(readJson(join(contracts.dir, "package.json")), expectedContracts), "Runtime Contracts complete manifest mismatch");
  }

  function checkDirectories() {
    check(same(directories(join(root, "apps")), ["actor-host", "runtime-cli", "runtime-server"]), "apps directory policy mismatch");
    check(same(directories(join(root, "packages")), ["runtime-contracts"]), "packages directory policy mismatch");
    const authorizedSourceFiles = new Map([
      [contracts, "index.ts"],
      [apps[0], "main.ts"],
      [apps[1], "main.ts"],
      [apps[2], "main.ts"]
    ]);
    for (const unit of units) {
      const expectedOwned = unit.kind === "contracts" ? ["src", "test"] : ["src"];
      const owned = directories(unit.dir).filter((name) => name !== "dist" && name !== "node_modules");
      check(same(owned, expectedOwned), `${unit.dir}: unexpected owned directory`);
      const sourceRoot = join(unit.dir, "src");
      const entries = existsSync(sourceRoot) ? readdirSync(sourceRoot, { withFileTypes: true }) : [];
      if (unit.kind === "app") {
        const expectedFile = authorizedSourceFiles.get(unit);
        check(entries.length === 1 && entries[0].isFile() && entries[0].name === expectedFile, `${sourceRoot} must contain exactly ${expectedFile} and no subdirectory`);
      } else {
        check(same(entries.map((entry) => entry.name).sort(), ["actor", "brick", "error", "host", "identity", "index.ts", "package", "validation"]), `${sourceRoot}: B.3 source topology mismatch`);
        check(entries.find((entry) => entry.name === "index.ts")?.isFile() === true, `${sourceRoot}/index.ts is missing`);
        const expectedSubdirectories = new Map([
          ["actor", ["index.ts", "schemas.ts"]],
          ["brick", ["index.ts", "schemas.ts"]],
          ["validation", ["decode.ts", "schemas.ts"]],
          ["identity", ["identity.ts"]],
          ["error", ["error.ts"]],
          ["host", ["index.ts", "schemas.ts"]],
          ["package", ["hash.ts", "index.ts", "node-crypto.d.ts", "schemas.ts"]]
        ]);
        for (const [directory, files] of expectedSubdirectories) {
          const directoryPath = join(sourceRoot, directory);
          check(same(readdirSync(directoryPath, { withFileTypes: true }).map((entry) => entry.name).sort(), files), `${directoryPath}: B.1 source files mismatch`);
        }
      }
      if (unit.kind === "contracts") {
        const testRoot = join(unit.dir, "test");
        check(same(directories(testRoot), ["actor", "brick", "compatibility", "error", "fixtures", "host", "identity", "package", "types", "validation"]), `${testRoot}: B.4 test topology mismatch`);
        const expectedTests = new Map([
          ["actor", ["actor.test.ts"]],
          ["brick", ["brick.test.ts"]],
          ["compatibility", ["compatibility.test.ts", "fixtures.json", "fixtures.ts"]],
          ["validation", ["contract-kernel.test.ts"]],
          ["identity", ["identity.test.ts"]],
          ["error", ["error-envelope.test.ts"]],
          ["host", ["host.test.ts"]],
          ["package", ["hash.test.ts", "package.test.ts"]],
          ["types", ["public-types.ts"]]
        ]);
        for (const [directory, files] of expectedTests) {
          const directoryPath = join(testRoot, directory);
          check(same(readdirSync(directoryPath, { withFileTypes: true }).map((entry) => entry.name).sort(), files), `${directoryPath}: B.1 test files mismatch`);
        }
        const fixtureRoot = join(testRoot, "fixtures");
        check(same(readdirSync(fixtureRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["rfc8785"]), `${fixtureRoot}: fixture topology mismatch`);
        check(same(readdirSync(join(fixtureRoot, "rfc8785"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["README.md", "vectors.json"]), `${fixtureRoot}/rfc8785: fixture files mismatch`);
      }
    }
    const forbiddenCatchAll = new Set(["common", "shared", "core", "utils"]);
    for (const tree of [join(root, "apps"), join(root, "packages"), join(root, "scripts")]) {
      const pending = [tree];
      while (pending.length > 0) {
        const current = pending.pop();
        for (const entry of readdirSync(current, { withFileTypes: true })) {
          if (!entry.isDirectory() || entry.name === "node_modules" || entry.name === "dist") continue;
          const child = join(current, entry.name);
          check(!forbiddenCatchAll.has(entry.name), `${child}: generic catch-all directory is forbidden`);
          pending.push(child);
        }
      }
    }
  }

  function checkTsGraph() {
    const compilerOptions = { composite: true, declaration: true, rootDir: "src", outDir: "dist", noEmit: false };
    const expectedRoot = {
      files: [],
      references: [
        { path: "./packages/runtime-contracts" },
        { path: "./apps/runtime-server" },
        { path: "./apps/actor-host" },
        { path: "./apps/runtime-cli" }
      ]
    };
    check(same(readJson(join(root, "tsconfig.json")), expectedRoot), "complete root TypeScript solution mismatch");
    for (const unit of units) {
      const expected = {
        extends: "../../tsconfig.base.json",
        compilerOptions,
        include: ["src/**/*.ts"],
        ...(unit.kind === "app" ? { references: [{ path: "../../packages/runtime-contracts" }] } : {})
      };
      check(same(readJson(join(unit.dir, "tsconfig.json")), expected), `${unit.dir}: complete local TypeScript project mismatch`);
    }
  }

  function checkSources() {
    const expectedConsumer = `import type {
  ActorLaunchSpec,
  HostToServerMessage,
  Package,
} from "@ai-block/runtime-contracts";

export type RuntimeContractsConsumerFixture = ActorLaunchSpec | HostToServerMessage | Package;
`;
    for (const app of apps) {
      const entry = join(app.dir, "src", "main.ts");
      check(readText(entry).replaceAll("\r\n", "\n") === expectedConsumer, `${entry}: source must be the exact type-only package-root consumer fixture`);
    }
    const contractEntry = join(contracts.dir, "src", "index.ts");
    const contractSource = readText(contractEntry);
    check(contractSource.length > 0, `${contractEntry}: Runtime Contracts source is missing`);
  }

  function checkDocumentation() {
    const readme = readText(join(contracts.dir, "README.md"));
    check(readme.includes("@ai-block/runtime-contracts"), "Runtime Contracts README is missing the package identity");
    check(readme.includes("decodeContract"), "Runtime Contracts README is missing root decoder usage");
    check(readme.includes("deep import"), "Runtime Contracts README is missing the deep-import boundary rule");

    const guide = readText(join(root, "docs", "construction", "serena-lsp-worker-guide.md"));
    for (const phrase of ["stateless", "no-memory", "Git/tests-authoritative", "Windows", "fallback"]) {
      check(guide.includes(phrase), `Serena guide is missing required topic: ${phrase}`);
    }
  }

  function outputText(value) {
    return typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
  }

  function normalizedOutput(stdout, stderr) {
    return `${stdout}\n${stderr}`.replaceAll("\\", "/");
  }

  function parseTscDiagnostics(stdout, stderr) {
    const diagnostics = [];
    for (const line of normalizedOutput(stdout, stderr).split(/\r?\n/)) {
      const match = line.match(/error (TS\d+):\s*(.*)$/i);
      if (match) diagnostics.push({ code: match[1].toUpperCase(), message: match[2] });
    }
    return diagnostics;
  }

  function tscExpectationMatches(status, stdout, stderr, expected) {
    const diagnostics = parseTscDiagnostics(stdout, stderr);
    if (expected.success) return status === 0 && diagnostics.length === 0;
    if (status !== expected.status || diagnostics.length !== expected.codes.length) return false;
    const actualCodes = diagnostics.map((diagnostic) => diagnostic.code).sort();
    const expectedCodes = [...expected.codes].map((code) => code.toUpperCase()).sort();
    if (JSON.stringify(actualCodes) !== JSON.stringify(expectedCodes)) return false;
    const output = normalizedOutput(stdout, stderr);
    return expected.fragments.every((fragment) => output.includes(fragment.replaceAll("\\", "/")));
  }

  function nodeExpectationMatches(status, stdout, stderr, expected) {
    if (status !== expected.status) return false;
    if (expected.stdout !== undefined && stdout !== expected.stdout) return false;
    if (expected.stderr !== undefined && stderr !== expected.stderr) return false;
    if (expected.code !== undefined && !stderr.includes(`Error [${expected.code}]:`)) return false;
    return (expected.stdoutIncludes ?? []).every((fragment) => stdout.includes(fragment))
      && (expected.stderrIncludes ?? []).every((fragment) => stderr.includes(fragment));
  }

  function runProbeMatcherRegressionChecks() {
    const expectedTsc = {
      status: 1,
      codes: ["TS6059"],
      fragments: ["expected-target.ts", "is not under 'rootDir'"]
    };
    check(!tscExpectationMatches(1, "probe.mts(1,1): error TS2307: unrelated module", "", expectedTsc), "regression: unrelated TypeScript diagnostic was accepted");
    check(!tscExpectationMatches(1, "error TS6059: wrong boundary evidence", "", expectedTsc), "regression: TypeScript diagnostic without exact path/message evidence was accepted");
    check(!tscExpectationMatches(42, "error TS6059: expected-target.ts is not under 'rootDir'", "", expectedTsc), "regression: TypeScript exit 42 was accepted");
    const expectedNode = { status: 1, stdout: "", code: "ERR_PACKAGE_PATH_NOT_EXPORTED", stderrIncludes: ["Package subpath './src/index.js'"] };
    check(!nodeExpectationMatches(42, "", "Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './src/index.js'", expectedNode), "regression: Node exit 42 was accepted");
    check(!nodeExpectationMatches(1, "", "Error [ERR_MODULE_NOT_FOUND]: unrelated", expectedNode), "regression: unrelated Node error was accepted");
  }

  function validateProcess(label, result, expected) {
    const stdout = outputText(result.stdout);
    const stderr = outputText(result.stderr);
    if (result.error) {
      fail(`${label}: launch error: ${result.error.message}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    if (result.signal !== null) {
      fail(`${label}: process terminated by signal ${String(result.signal)}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    if (!Number.isInteger(result.status)) {
      fail(`${label}: missing or non-numeric process status\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    if (!expected(result.status, stdout, stderr)) {
      fail(`${label}: unexpected process status or output; status=${result.status}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
      return undefined;
    }
    return { status: result.status, stdout, stderr };
  }

  function runPnpm(label, pnpmArgs, expected) {
    const result = spawnSync(process.execPath, [pnpmEntry, ...pnpmArgs], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      shell: false
    });
    return validateProcess(label, result, expected);
  }

  function checkToolchain() {
    runPnpm("pnpm version", ["--version"], (status, stdout, stderr) => status === 0 && stdout.trim() === "11.10.0" && stderr.trim() === "");
    runPnpm("TypeScript version", ["exec", "tsc", "--version"], (status, stdout, stderr) => status === 0 && stdout.trim() === "Version 7.0.2" && stderr.trim() === "");
  }

  function checkArtifacts() {
    const isFile = (path) => {
      try {
        return statSync(path).isFile();
      } catch {
        return false;
      }
    };
    for (const app of apps) check(isFile(join(app.dir, "dist", "main.js")), `${app.dir}: dist/main.js missing or not a file`);
    check(isFile(join(contracts.dir, "dist", "index.js")), "Runtime Contracts dist/index.js missing or not a file");
    check(isFile(join(contracts.dir, "dist", "index.d.ts")), "Runtime Contracts dist/index.d.ts missing or not a file");
  }

  function checkGitClean() {
    const result = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      shell: false
    });
    return validateProcess("Git cleanliness", result, (status, stdout, stderr) => status === 0 && stdout.trim() === "" && stderr.trim() === "");
  }

  function runNodeProbe(file, source, expected) {
    writeFileSync(file, source, "utf8");
    const result = spawnSync(process.execPath, [file], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      shell: false
    });
    return validateProcess(`Node probe ${file}`, result, (status, stdout, stderr) => nodeExpectationMatches(status, stdout, stderr, expected));
  }

  function runTscProbe(label, directory, source, expected) {
    const sourceFile = join(directory, `${label}.mts`);
    const configFile = join(directory, `${label}.tsconfig.json`);
    const config = {
      compilerOptions: {
        target: "ES2023",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        verbatimModuleSyntax: true,
        noUncheckedSideEffectImports: true,
        skipLibCheck: true,
        rootDir: "."
      },
      files: [sourceFile]
    };
    writeFileSync(sourceFile, source, "utf8");
    writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    return runPnpm(`tsc probe ${label}`, ["exec", "tsc", "--project", configFile, "--noEmit", "--pretty", "false"], (status, stdout, stderr) => tscExpectationMatches(status, stdout, stderr, expected));
  }

  function toImportPath(path) {
    const value = path.replaceAll("\\", "/");
    return value.startsWith(".") ? value : `./${value}`;
  }

  function diagnosticPath(path) {
    return resolve(path).replaceAll("\\", "/");
  }

  function rootDirExpectation(target, directory) {
    return {
      status: 1,
      codes: ["TS6059"],
      fragments: [
        `File '${diagnosticPath(target)}' is not under 'rootDir' '${diagnosticPath(directory)}'.`,
        "'rootDir' is expected to contain all source files."
      ]
    };
  }

  function runBoundaryProbes() {
    const temporary = [];
    try {
      for (const app of apps) {
        const dir = mkdtempSync(join(join(app.dir, "node_modules"), ".ai-block-boundaries-"));
        temporary.push(dir);
        const rootTypeSource = `import type { ${expectedPublicTypeExports.join(", ")} } from ${JSON.stringify(contractName)};\ntype ConsumerFixture = {\n${expectedPublicTypeExports.map((name) => `  ${name}: ${name === "ContractDecodeResult" || name === "ContractValue" ? `${name}<unknown>` : name};`).join("\n")}\n};\nconst fixture: ConsumerFixture | undefined = undefined;\nvoid fixture;\n`;
        const rootRuntimeSource = `import * as contracts from ${JSON.stringify(contractName)};\nconst expected = ${JSON.stringify(expectedRuntimeExports)};\nif (JSON.stringify(Object.keys(contracts).sort()) !== JSON.stringify(expected)) process.exit(1);\n`;
        const builtCompatibilitySource = `import { readFileSync } from "node:fs";\nimport * as contracts from ${JSON.stringify(contractName)};\nconst fixtures = JSON.parse(readFileSync(${JSON.stringify(compatibilityFixturePath)}, "utf8"));\nconst schemas = {\n  ContractErrorEnvelopeSchema: contracts.ContractErrorEnvelopeSchema,\n  PackageSchema: contracts.PackageSchema,\n  DeliverySchema: contracts.DeliverySchema,\n  ActorLaunchSpecSchema: contracts.ActorLaunchSpecSchema,\n  ServerToHostMessageSchema: contracts.ServerToHostMessageSchema,\n  HostToServerMessageSchema: contracts.HostToServerMessageSchema\n};\nif (!Array.isArray(fixtures) || fixtures.length !== 6) process.exit(1);\nfor (const fixture of fixtures) {\n  const schema = schemas[fixture.schema];\n  if (schema === undefined) {\n    console.error(\`unknown schema: \${fixture.schema}\`);\n    process.exit(1);\n  }\n  const decoded = contracts.decodeContract(schema, fixture.value);\n  if (!decoded.ok) {\n    console.error(\`fixture failed: \${fixture.name}\`);\n    process.exit(1);\n  }\n  const roundTripped = contracts.decodeContract(schema, JSON.parse(JSON.stringify(decoded.value)));\n  if (!roundTripped.ok) {\n    console.error(\`fixture round-trip failed: \${fixture.name}\`);\n    process.exit(1);\n  }\n}\n`;
        check(runTscProbe(`root-${app.name.split("/").pop()}`, dir, rootTypeSource, { success: true }) !== undefined, `${app.name}: package-root TypeScript probe failed`);
        check(runNodeProbe(join(dir, "root.mjs"), rootRuntimeSource, { status: 0, stdout: "", stderr: "" }) !== undefined, `${app.name}: package-root runtime/export probe failed`);
        check(runNodeProbe(join(dir, "compatibility.mjs"), builtCompatibilitySource, { status: 0, stdout: "", stderr: "" }) !== undefined, `${app.name}: built package-root compatibility probe failed`);
      }

      const appDir = temporary[0];
      const deepSpecifier = `${contractName}/src/index.js`;
      check(runNodeProbe(join(appDir, "deep.mjs"), `import ${JSON.stringify(deepSpecifier)};\n`, {
        status: 1,
        stdout: "",
        code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
        stderrIncludes: ["Package subpath './src/index.js' is not defined by \"exports\""]
      }) !== undefined, "Runtime Contracts deep-import runtime probe did not fail for the exact exports boundary reason");

      const appPackageSpecifier = appNames[1];
      check(runNodeProbe(join(appDir, "app-package.mjs"), `import ${JSON.stringify(appPackageSpecifier)};\n`, {
        status: 1,
        stdout: "",
        code: "ERR_MODULE_NOT_FOUND",
        stderrIncludes: ["Cannot find package '@ai-block/actor-host'"]
      }) !== undefined, "application-to-application package runtime probe did not fail for the exact package-resolution reason");

      const appRelativeFile = join(appDir, "relative-application.mts");
      const appRelativeTarget = join(apps[1].dir, "src", "main.ts");
      const appRelativeSpec = toImportPath(relative(dirname(appRelativeFile), appRelativeTarget)).replace(/\.ts$/, ".js");
      check(runTscProbe("relative-application", appDir, `import ${JSON.stringify(appRelativeSpec)};\n`, rootDirExpectation(appRelativeTarget, appDir)) !== undefined, "application-to-application relative TypeScript probe did not fail with exact TS6059 evidence");

      const contractsDir = mkdtempSync(join(join(root, "node_modules"), ".ai-block-boundaries-contracts-"));
      temporary.push(contractsDir);
      const contractsAppFile = join(contractsDir, "contracts-application.mts");
      const contractsAppTarget = join(apps[0].dir, "src", "main.ts");
      const contractsAppSpec = toImportPath(relative(dirname(contractsAppFile), contractsAppTarget)).replace(/\.ts$/, ".js");
      check(runTscProbe("contracts-application", contractsDir, `import ${JSON.stringify(contractsAppSpec)};\n`, rootDirExpectation(contractsAppTarget, contractsDir)) !== undefined, "Runtime Contracts-to-application TypeScript probe did not fail with exact TS6059 evidence");

      const infrastructureSpecifier = "infrastructure/internal.js";
      check(runTscProbe("contracts-infrastructure", contractsDir, `import ${JSON.stringify(infrastructureSpecifier)};\n`, {
        status: 1,
        codes: ["TS2882"],
        fragments: [`Cannot find module or type declarations for side-effect import of '${infrastructureSpecifier}'.`]
      }) !== undefined, "Runtime Contracts-to-infrastructure TypeScript probe did not fail with exact TS2882 evidence");
    } catch (error) {
      fail(`probe setup or execution threw: ${error.message}`);
    } finally {
      for (const dir of temporary) {
        try {
          rmSync(dir, { recursive: true, force: true });
          if (existsSync(dir)) fail(`probe cleanup failed: ${dir} still exists`);
        } catch (error) {
          fail(`probe cleanup failed for ${dir}: ${error.message}`);
        }
      }
    }
  }

  runProbeMatcherRegressionChecks();
  checkToolchain();
  if (gitCleanMode) {
    checkGitClean();
  } else {
    checkManifestShape();
    checkDirectories();
    checkTsGraph();
    checkSources();
    checkDocumentation();
    checkArtifacts();
    runBoundaryProbes();
  }

  if (failures.length > 0) {
    console.error("BOUNDARY CHECK FAILED");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(gitCleanMode
      ? "PASS: Git worktree clean; no nonignored tracked or untracked paths remain"
      : "PASS: workspace boundaries, manifests, references, artifacts, and probes verified");
  }
