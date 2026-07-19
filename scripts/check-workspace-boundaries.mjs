  import { spawnSync } from "node:child_process";
  import { fileURLToPath } from "node:url";
  import {
    existsSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    realpathSync,
    rmSync,
    statSync,
    writeFileSync
  } from "node:fs";
  import { dirname, isAbsolute, join, relative, resolve } from "node:path";
  import * as ts from "typescript/unstable/ast";

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
    "ACTOR_TEMPLATE_SPEC_SCHEMA_VERSION",
    "ACTOR_TEMPLATE_VALIDATION_ISSUE_CODES",
    "ActorConfigSnapshotIdSchema",
    "ActorConfigSnapshotSchema",
    "ActorIdSchema",
    "ActorLaunchSpecSchema",
    "ActorTemplateIdSchema",
    "ActorTemplateLabelsSchema",
    "ActorTemplateRevisionSummarySchema",
    "ActorTemplateRevisionViewSchema",
    "ActorTemplateSpecSchema",
    "ActorTemplateSpecSchemaVersionSchema",
    "ActorTemplateSummarySchema",
    "ActorTemplateValidationFailedDetailsSchema",
    "ActorTemplateValidationReportSchema",
    "BackendAdapterIdSchema",
    "BackendAdapterLaunchConfigSchema",
    "BackendBrickBodySchema",
    "BackendSessionIdSchema",
    "BrickKindSchema",
    "BrickPromptBodySchema",
    "BrickPromptSchema",
    "BrickSysPromptBodySchema",
    "BrickSysPromptSchema",
    "CanonicalTimestampSchema",
    "ClientPrincipalIdSchema",
    "CompositeBrickPromptSchema",
    "CONTRACT_SCHEMA_VERSION",
    "CompletionRequestPayloadSchema",
    "ConfigDigestSchema",
    "ContractErrorEnvelopeSchema",
    "ContractSchemaVersionSchema",
    "ContentHashSchema",
    "CreateActorTemplateCommandSchema",
    "CreateActorTemplateResultSchema",
    "CreateSessionDirectiveSchema",
    "DefinitionBrickDigestSchema",
    "DefinitionBrickRevisionIdSchema",
    "DefinitionBrickRevisionSchema",
    "DeliveryIdSchema",
    "DeliverySchema",
    "DeliveryStateSchema",
    "ExactBrickRefSchema",
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
    "HumanReadableIdSchema",
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
    "PositiveRevisionSchema",
    "ProjectIdSchema",
    "ResolvedBrickRefSchema",
    "ResumeSessionDirectiveSchema",
    "ReviseActorTemplateCommandSchema",
    "ReviseActorTemplateResultSchema",
    "RunIdSchema",
    "RuntimeConfigBrickBodySchema",
    "ServerToHostMessageSchema",
    "ServerToHostPayloadSchema",
    "SessionDirectiveSchema",
    "SessionReportPayloadSchema",
    "ShutdownHostPayloadSchema",
    "SignaledProcessFactSchema",
    "StartInvocationPayloadSchema",
    "StopInvocationPayloadSchema",
    "StoppedProcessFactSchema",
    "TemplateRevisionDigestSchema",
    "TextBrickPromptSchema",
    "ToolProviderBrickConfigSchema",
    "ToolProviderIdSchema",
    "ToolProviderLaunchConfigSchema",
    "ToolsetBrickBodySchema",
    "ValidateActorTemplateCandidateSchema",
    "ValidateActorTemplateCandidateResultSchema",
    "ValidationIssueCodeSchema",
    "ValidationIssueSchema",
    "computePackageContentHash",
    "decodeContract",
    "derivePackageHashMaterial",
    "verifyPackageContentHash",
    "HOST_PROTOCOL_VERSION"
  ].sort();
  const expectedPublicTypeExports = [
    "AckPayload",
    "ActorConfigSnapshot",
    "ActorConfigSnapshotId",
    "ActorId",
    "ActorLaunchSpec",
    "ActorTemplateId",
    "ActorTemplateRevisionSummary",
    "ActorTemplateRevisionView",
    "ActorTemplateSpec",
    "ActorTemplateSpecSchemaVersion",
    "ActorTemplateValidationFailedDetails",
    "ActorTemplateValidationReport",
    "ActorTemplateSummary",
    "BackendAdapterId",
    "BackendAdapterLaunchConfig",
    "BackendBrickBody",
    "BackendSessionId",
    "BrickKind",
    "BrickPrompt",
    "BrickPromptBody",
    "BrickSysPrompt",
    "BrickSysPromptBody",
    "CanonicalTimestamp",
    "ClientPrincipalId",
    "CompletionRequestPayload",
    "CompositeBrickPrompt",
    "ConfigDigest",
    "ContractDecodeResult",
    "ContractErrorEnvelope",
    "ContractSchemaVersion",
    "ContractValue",
    "ContentHash",
    "CreateActorTemplateCommand",
    "CreateActorTemplateResult",
    "CreateSessionDirective",
    "DefinitionBrickDigest",
    "DefinitionBrickRevision",
    "DefinitionBrickRevisionId",
    "Delivery",
    "DeliveryId",
    "DeliveryState",
    "ExactBrickRef",
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
    "HumanReadableId",
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
    "PositiveRevision",
    "ProjectId",
    "ResolvedBrickRef",
    "ResumeSessionDirective",
    "ReviseActorTemplateCommand",
    "ReviseActorTemplateResult",
    "RunId",
    "RuntimeConfigBrickBody",
    "ServerToHostMessage",
    "ServerToHostPayload",
    "SessionDirective",
    "SessionReportPayload",
    "ShutdownHostPayload",
    "SignaledProcessFact",
    "StartInvocationPayload",
    "StopInvocationPayload",
    "StoppedProcessFact",
    "TemplateRevisionDigest",
    "TextBrickPrompt",
    "ToolProviderBrickConfig",
    "ToolProviderId",
    "ToolProviderLaunchConfig",
    "ToolsetBrickBody",
    "ValidateActorTemplateCandidate",
    "ValidateActorTemplateCandidateResult",
    "ValidationIssue",
    "ValidationIssueCode"
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
  const productionImportPolicies = [
    {
      name: "Actor Module",
      root: resolve(apps[0].dir, "src", "modules", "actor"),
      allowedPackages: new Set(["@ai-block/runtime-contracts", "canonicalize", "node:crypto"])
    },
    {
      name: "Runtime Contracts",
      root: resolve(contracts.dir, "src"),
      allowedPackages: new Set(["typebox", "ajv", "ajv-formats", "canonicalize", "node:crypto"])
    }
  ];
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

  function sourceRelativePath(rootPath, sourcePath) {
    return relative(rootPath, sourcePath).replaceAll("\\", "/");
  }

  function isContainedPath(rootPath, targetPath) {
    const candidate = sourceRelativePath(rootPath, targetPath);
    return candidate === "" || (candidate !== ".." && !candidate.startsWith("../") && !isAbsolute(candidate));
  }

  function extractProductionImportReferences(sourceText) {
    const scanner = ts.createScanner(true, ts.LanguageVariant.Standard, sourceText);
    const tokens = [];
    for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFile; kind = scanner.scan()) {
      tokens.push({ kind, text: scanner.getTokenText(), value: scanner.getTokenValue() });
    }
    const references = [];
    const addStaticReference = (token) => {
      if (token?.kind === ts.SyntaxKind.StringLiteral) references.push({ specifier: token.value });
    };
    const isStringLiteral = (token) => token?.kind === ts.SyntaxKind.StringLiteral;
    const isOpenParen = (token) => token?.kind === ts.SyntaxKind.OpenParenToken;
    const isCloseParen = (token) => token?.kind === ts.SyntaxKind.CloseParenToken;
    const isRequireToken = (token) => token?.kind === ts.SyntaxKind.RequireKeyword || (token?.kind === ts.SyntaxKind.Identifier && token.text === "require");
    const addCallReference = (index, category) => {
      if (isStringLiteral(tokens[index + 1]) && isCloseParen(tokens[index + 2])) {
        references.push({ specifier: tokens[index + 1].value });
      } else {
        references.push({ category, specifier: "<non-literal>" });
      }
    };

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      const next = tokens[index + 1];
      if (token.kind === ts.SyntaxKind.FromKeyword && isStringLiteral(next)) {
        addStaticReference(next);
        continue;
      }
      if (token.kind === ts.SyntaxKind.ImportKeyword) {
        if (isStringLiteral(next)) {
          addStaticReference(next);
          continue;
        }
        if (isOpenParen(next)) {
          addCallReference(index + 1, "non_literal_dynamic_import");
          continue;
        }
        if (next?.kind === ts.SyntaxKind.QuestionDotToken && isOpenParen(tokens[index + 2])) {
          references.push({ category: "non_literal_dynamic_import", specifier: "<non-literal>" });
          continue;
        }
        if (tokens[index + 2]?.kind === ts.SyntaxKind.EqualsToken && isStringLiteral(tokens[index + 3])) {
          addStaticReference(tokens[index + 3]);
        }
        continue;
      }
      if (isRequireToken(token)) {
        if (isOpenParen(next)) {
          addCallReference(index + 1, "non_literal_require");
        } else if (next?.kind === ts.SyntaxKind.QuestionDotToken && isOpenParen(tokens[index + 2])) {
          references.push({ category: "non_literal_require", specifier: "<non-literal>" });
        }
      }
    }
    return references;
  }

  function resolveRelativeProductionImport(sourcePath, specifier) {
    const requestedPath = resolve(dirname(sourcePath), specifier);
    const extension = requestedPath.slice(requestedPath.lastIndexOf("."));
    const candidates = extension === ".js" || extension === ".jsx"
      ? [requestedPath.slice(0, -extension.length) + ".ts", requestedPath.slice(0, -extension.length) + ".tsx", requestedPath.slice(0, -extension.length) + ".d.ts", requestedPath]
      : [requestedPath, requestedPath + ".ts", requestedPath + ".tsx", requestedPath + ".d.ts", join(requestedPath, "index.ts"), join(requestedPath, "index.tsx"), join(requestedPath, "index.d.ts")];
    for (const candidate of candidates) {
      if (existsSync(candidate) && statSync(candidate).isFile()) return realpathSync(candidate);
    }
    return undefined;
  }

  function productionImportViolation(policy, sourcePath, specifier) {
    if (isAbsolute(specifier)) return "absolute_import";
    if (specifier.startsWith(".")) {
      const resolvedPath = resolveRelativeProductionImport(sourcePath, specifier);
      if (resolvedPath === undefined) return "unresolved_relative_import";
      return isContainedPath(policy.root, resolve(resolvedPath)) ? undefined : "relative_escape";
    }
    return policy.allowedPackages.has(specifier) ? undefined : "forbidden_external_import";
  }

  function productionImportViolations(policy, sourcePath, sourceText) {
    return extractProductionImportReferences(sourceText)
      .map((reference) => ({
        specifier: reference.specifier,
        category: reference.category ?? productionImportViolation(policy, sourcePath, reference.specifier)
      }))
      .filter((violation) => violation.category !== undefined);
  }

  function productionSourceFiles(sourceRoot) {
    const files = [];
    const pending = [sourceRoot];
    while (pending.length > 0) {
      const current = pending.pop();
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const child = join(current, entry.name);
        if (entry.isDirectory()) pending.push(child);
        else if (entry.isFile() && child.endsWith(".ts")) files.push(child);
      }
    }
    return files.sort();
  }

  function runProductionImportBoundaryRegressionChecks() {
    const actorPolicy = productionImportPolicies[0];
    const contractsPolicy = productionImportPolicies[1];
    const actorSource = join(actorPolicy.root, "application.ts");
    const contractsSource = join(contractsPolicy.root, "index.ts");
    const assertCategories = (label, policy, sourcePath, sourceText, expected) => {
      const actual = productionImportViolations(policy, sourcePath, sourceText)
        .map((violation) => violation.category);
      check(same(actual, expected), `${label}: import boundary self-test mismatch`);
    };

    assertCategories(
      "allowed type-only/root/local imports",
      actorPolicy,
      actorSource,
      'import type { ActorModulePorts } from "./ports.js"; export type { ActorModulePorts } from "./ports.js"; import type { ProjectId } from "@ai-block/runtime-contracts";',
      []
    );
    assertCategories(
      "Actor forbidden imports",
      actorPolicy,
      actorSource,
      'import "node:fs"; import "@ai-block/actor-host"; export * from "../host-gateway/ports.js";',
      ["forbidden_external_import", "forbidden_external_import", "relative_escape"]
    );
    assertCategories(
      "Actor dynamic import and require",
      actorPolicy,
      actorSource,
      'const fs = import("node:fs"); const host = require("@ai-block/actor-host");',
      ["forbidden_external_import", "forbidden_external_import"]
    );
    assertCategories(
      "Actor non-literal dynamic import and require",
      actorPolicy,
      actorSource,
      'const target = "@ai-block/actor-host"; import(target); import("@ai-block/host-gateway" + suffix); import(`@ai-block/runtime-server`); require?.(target); require("../host-gateway/ports.js", extra);',
      [
        "non_literal_dynamic_import",
        "non_literal_dynamic_import",
        "non_literal_dynamic_import",
        "non_literal_require",
        "non_literal_require"
      ]
    );
    assertCategories(
      "Actor import-equals",
      actorPolicy,
      actorSource,
      'import contracts = require("@ai-block/runtime-contracts"); import forbidden = require("@ai-block/runtime-server");',
      ["forbidden_external_import"]
    );
    assertCategories(
      "Contracts application import",
      contractsPolicy,
      contractsSource,
      'import "@ai-block/runtime-server";',
      ["forbidden_external_import"]
    );
    assertCategories(
      "Contracts relative application escape",
      contractsPolicy,
      contractsSource,
      'import "../../../apps/runtime-server/src/main.js";',
      ["relative_escape"]
    );
    assertCategories(
      "allowed Contracts value imports",
      contractsPolicy,
      contractsSource,
      'import Type from "typebox"; import { ProjectIdSchema } from "./identity/identity.js"; import canonicalize from "canonicalize"; import { createHash } from "node:crypto";',
      []
    );
  }

  function checkProductionImportBoundaries() {
    for (const policy of productionImportPolicies) {
      for (const sourcePath of productionSourceFiles(policy.root)) {
        const sourceRelative = sourceRelativePath(policy.root, sourcePath);
        for (const violation of productionImportViolations(policy, sourcePath, readText(sourcePath))) {
          check(
            false,
            `${policy.name} ${sourceRelative}: ${violation.specifier}: ${violation.category}`
          );
        }
      }
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
        "test:actor-host": "pnpm --filter @ai-block/actor-host test",
        "test:runtime-server": "pnpm --filter @ai-block/runtime-server test",
        "test:integration:build": "pnpm build",
        "test:integration:types": "pnpm exec tsc --project tsconfig.integration.json --noEmit --pretty false",
        "test:integration:focused": "pnpm exec vitest run --root . tests/integration/host-walking-skeleton/host-walking-skeleton.test.ts",
        "test:integration": "pnpm run test:integration:build && pnpm run test:integration:types && pnpm run test:integration:focused",
        verify: "pnpm install --frozen-lockfile && git diff --exit-code && pnpm build && pnpm test:contracts && pnpm test:actor-host && pnpm test:runtime-server && pnpm test:integration && pnpm check:boundaries && pnpm clean && pnpm check:boundaries -- --git-clean && git diff --exit-code"
      },
      devDependencies: { [contractName]: "workspace:*", "@types/node": "24.13.3", typescript: "7.0.2", vitest: "4.1.10" }
    };
    check(same(readJson(join(root, "package.json")), expectedRoot), "root package manifest has extra, missing, or altered fields");

    for (const app of apps) {
      const expected = app === apps[0]
        ? {
          name: app.name,
          version: "0.0.0",
          private: true,
          type: "module",
          scripts: {
            pretest: "pnpm --filter @ai-block/runtime-contracts exec tsc -b",
            test: "vitest run && pnpm run test:types",
            "test:types": "tsc --project tsconfig.test.json --noEmit --pretty false"
          },
          dependencies: { [contractName]: "workspace:*", canonicalize: "3.0.0", ws: "8.21.1" },
          devDependencies: { "@types/ws": "8.18.1", vitest: "4.1.10" }
        }
        : app === apps[1]
        ? {
          name: app.name,
          version: "0.0.0",
          private: true,
          type: "module",
          scripts: {
            pretest: "pnpm --filter @ai-block/runtime-contracts exec tsc -b",
            test: "vitest run && pnpm run test:types",
            "test:types": "tsc --project tsconfig.test.json --noEmit --pretty false"
          },
          dependencies: { [contractName]: "workspace:*", ws: "8.21.1" },
          devDependencies: { "@types/ws": "8.18.1", vitest: "4.1.10" }
        }
        : {
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
        "test:types": "tsc --ignoreConfig --noEmit --target ES2023 --module NodeNext --moduleResolution NodeNext --strict --verbatimModuleSyntax --types node --skipLibCheck test/validation/contract-kernel.test.ts test/identity/identity.test.ts test/error/error-envelope.test.ts test/brick/brick.test.ts test/package/package.test.ts test/package/hash.test.ts test/actor/actor.test.ts test/host/host.test.ts test/compatibility/compatibility.test.ts test/actor-template/actor-template.test.ts test/types/public-types.ts --pretty false"
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
    const integrationRoot = join(root, "tests", "integration", "host-walking-skeleton");
    check(same(directories(join(root, "tests")), ["integration"]), "root test directory policy mismatch");
    check(same(directories(join(root, "tests", "integration")), ["host-walking-skeleton"]), "root integration directory policy mismatch");
    check(
      existsSync(integrationRoot)
        && same(readdirSync(integrationRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["host-walking-skeleton.test.ts"]),
      `${integrationRoot}: integration test topology mismatch`
    );
    const authorizedSourceFiles = new Map([
      [contracts, "index.ts"],
      [apps[0], "main.ts"],
      [apps[2], "main.ts"]
    ]);
    for (const unit of units) {
      const expectedOwned = unit.kind === "contracts"
        ? ["src", "test"]
        : unit === apps[0] || unit === apps[1]
          ? ["src", "test"]
          : ["src"];
      const owned = directories(unit.dir).filter((name) => name !== "dist" && name !== "node_modules");
      check(same(owned, expectedOwned), `${unit.dir}: unexpected owned directory`);
      const sourceRoot = join(unit.dir, "src");
      const entries = existsSync(sourceRoot) ? readdirSync(sourceRoot, { withFileTypes: true }) : [];
      if (unit.kind === "app") {
        if (unit === apps[0]) {
          check(same(entries.map((entry) => entry.name).sort(), ["infrastructure", "main.ts", "modules"]), `${sourceRoot}: Runtime Server source topology mismatch`);
          const infrastructureRoot = join(sourceRoot, "infrastructure");
          check(same(readdirSync(infrastructureRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["actor-host-websocket"]), `${infrastructureRoot}: Runtime Server infrastructure topology mismatch`);
          check(same(readdirSync(join(infrastructureRoot, "actor-host-websocket"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["host-gateway-websocket-adapter.ts"]), `${infrastructureRoot}/actor-host-websocket: Runtime Server infrastructure files mismatch`);
          const modulesRoot = join(sourceRoot, "modules");
          check(same(readdirSync(modulesRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["actor", "host-gateway"]), `${modulesRoot}: Runtime Server module topology mismatch`);
          check(same(readdirSync(join(modulesRoot, "host-gateway"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["host-gateway.ts", "ports.ts"]), `${modulesRoot}/host-gateway: Runtime Server Host Gateway source files mismatch`);
          check(same(readdirSync(join(modulesRoot, "actor"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["application.ts", "compiler.ts", "index.ts", "ports.ts", "validation.ts", "values.ts"]), `${modulesRoot}/actor: Actor source files mismatch`);
        } else if (unit === apps[1]) {
          check(same(entries.map((entry) => entry.name).sort(), ["backend", "main.ts", "server-connection"]), `${sourceRoot}: ActorHost source topology mismatch`);
          const backendRoot = join(sourceRoot, "backend");
          check(same(readdirSync(backendRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["adapter.ts", "claude-code-adapter.ts", "fake-backend.ts", "process-runner.ts", "supervisor.ts"]), `${backendRoot}: ActorHost backend topology mismatch`);
          const serverConnectionRoot = join(sourceRoot, "server-connection");
          check(same(readdirSync(serverConnectionRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["command-processor.ts", "server-connection.ts", "ws-client.ts"]), `${serverConnectionRoot}: ActorHost server-connection topology mismatch`);
        } else {
          const expectedFile = authorizedSourceFiles.get(unit);
          check(entries.length === 1 && entries[0].isFile() && entries[0].name === expectedFile, `${sourceRoot} must contain exactly ${expectedFile} and no subdirectory`);
        }
      } else {
        check(same(entries.map((entry) => entry.name).sort(), ["actor", "actor-template", "brick", "error", "host", "identity", "index.ts", "package", "validation"]), `${sourceRoot}: B.3 source topology mismatch`);
        check(entries.find((entry) => entry.name === "index.ts")?.isFile() === true, `${sourceRoot}/index.ts is missing`);
        const expectedSubdirectories = new Map([
          ["actor", ["index.ts", "schemas.ts"]],
          ["brick", ["index.ts", "schemas.ts"]],
          ["validation", ["decode.ts", "schemas.ts"]],
          ["identity", ["identity.ts"]],
          ["error", ["error.ts"]],
          ["host", ["index.ts", "schemas.ts"]],
          ["actor-template", ["index.ts", "schemas.ts"]],
          ["package", ["hash.ts", "index.ts", "node-crypto.d.ts", "schemas.ts"]]
        ]);
        for (const [directory, files] of expectedSubdirectories) {
          const directoryPath = join(sourceRoot, directory);
          check(same(readdirSync(directoryPath, { withFileTypes: true }).map((entry) => entry.name).sort(), files), `${directoryPath}: B.1 source files mismatch`);
        }
      }
      if (unit.kind === "contracts") {
        const testRoot = join(unit.dir, "test");
        check(same(directories(testRoot), ["actor", "actor-template", "brick", "compatibility", "error", "fixtures", "host", "identity", "package", "types", "validation"]), `${testRoot}: B.4 test topology mismatch`);
        const expectedTests = new Map([
          ["actor", ["actor.test.ts"]],
          ["brick", ["brick.test.ts"]],
          ["compatibility", ["compatibility.test.ts", "fixtures.json", "fixtures.ts"]],
          ["validation", ["contract-kernel.test.ts"]],
          ["identity", ["identity.test.ts"]],
          ["error", ["error-envelope.test.ts"]],
          ["host", ["host.test.ts"]],
          ["package", ["hash.test.ts", "package.test.ts"]],
          ["actor-template", ["actor-template.test.ts", "fixtures.ts"]],
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
      if (unit === apps[1]) {
        const testRoot = join(unit.dir, "test");
        check(same(directories(testRoot), ["backend", "server-connection"]), `${testRoot}: ActorHost test topology mismatch`);
        check(same(readdirSync(join(testRoot, "backend"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["backend-supervisor.test.ts", "claude-code-adapter.test.ts"]), `${testRoot}/backend: ActorHost test files mismatch`);
        check(same(readdirSync(join(testRoot, "server-connection"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["command-processor.test.ts", "server-connection.test.ts", "ws-client.test.ts"]), `${testRoot}/server-connection: ActorHost test files mismatch`);
      }
      if (unit === apps[0]) {
        const testRoot = join(unit.dir, "test");
        check(same(directories(testRoot), ["infrastructure", "modules"]), `${testRoot}: Runtime Server test topology mismatch`);
        const infrastructureTestRoot = join(testRoot, "infrastructure");
        check(same(readdirSync(infrastructureTestRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["actor-host-websocket"]), `${infrastructureTestRoot}: Runtime Server infrastructure test topology mismatch`);
        check(same(readdirSync(join(infrastructureTestRoot, "actor-host-websocket"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["host-gateway-websocket-adapter.test.ts"]), `${infrastructureTestRoot}/actor-host-websocket: Runtime Server infrastructure test files mismatch`);
        const modulesRoot = join(testRoot, "modules");
        check(same(readdirSync(modulesRoot, { withFileTypes: true }).map((entry) => entry.name).sort(), ["actor", "host-gateway"]), `${modulesRoot}: Runtime Server test module topology mismatch`);
        check(same(readdirSync(join(modulesRoot, "host-gateway"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["host-gateway.test.ts"]), `${modulesRoot}/host-gateway: Runtime Server Host Gateway test files mismatch`);
        check(same(readdirSync(join(modulesRoot, "actor"), { withFileTypes: true }).map((entry) => entry.name).sort(), ["actor-application.test.ts", "actor-foundation.test.ts", "actor-validation-compiler.test.ts", "in-memory-adapters.ts"]), `${modulesRoot}/actor: Actor test files mismatch`);
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
    check(same(readJson(join(apps[1].dir, "tsconfig.test.json")), {
      extends: "../../tsconfig.base.json",
      compilerOptions: { noEmit: true, rootDir: ".", types: ["node"] },
      include: ["src/**/*.ts", "test/**/*.ts"]
    }), `${apps[1].dir}: complete ActorHost test TypeScript project mismatch`);
    check(same(readJson(join(apps[0].dir, "tsconfig.test.json")), {
      extends: "../../tsconfig.base.json",
      compilerOptions: { noEmit: true, rootDir: ".", types: ["node"] },
      include: ["src/**/*.ts", "test/**/*.ts"]
    }), `${apps[0].dir}: complete Runtime Server test TypeScript project mismatch`);
    check(same(readJson(join(root, "tsconfig.integration.json")), {
      extends: "./tsconfig.base.json",
      compilerOptions: { noEmit: true, rootDir: ".", types: ["node"] },
      include: ["tests/integration/host-walking-skeleton/host-walking-skeleton.test.ts"]
    }), "root integration TypeScript project mismatch");
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

    const runbook = readText(join(root, "docs", "construction", "runbook", "README.md"));
    const serenaSafety = readText(join(root, "docs", "construction", "runbook", "policies", "serena-safety.md"));
    const serenaOperations = readText(join(root, "docs", "construction", "runbook", "policies", "serena-operations.md"));
    const requiredRunbookAssertions = [
      ["explicit no-directory loading", "no directory-wide loading;"],
      ["lease-scoped load manifest", "lease.load_once"],
      ["References are not load directives", "Task `References` are audit pointers, not load directives."]
    ];
    const requiredSerenaSafetyAssertions = [
      ["no-memory rule", "The no-memory policy is mandatory:"],
      ["Git/tests authority", "Git diff, TypeScript, tests, boundary probes, and the final worktree remain authoritative."],
      ["no onboarding", "never run onboarding"],
      ["no .serena access", "never inspect, edit, stage, traverse, or rely on `.serena/`;" ]
    ];
    const requiredSerenaOperationAssertions = [
      ["allowed non-memory operation boundary", "## Allowed capabilities"],
      ["Windows guidance", "Windows paths may use backslashes"],
      ["fallback guidance", "## Known friction and fallback"]
    ];
    for (const [topic, phrase] of requiredRunbookAssertions) {
      check(runbook.includes(phrase), `Construction Runbook is missing required topic: ${topic}`);
    }
    for (const [topic, phrase] of requiredSerenaSafetyAssertions) {
      check(serenaSafety.includes(phrase), `Serena safety policy is missing required topic: ${topic}`);
    }
    for (const [topic, phrase] of requiredSerenaOperationAssertions) {
      check(serenaOperations.includes(phrase), `Serena operations policy is missing required topic: ${topic}`);
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
        const builtCompatibilitySource = `import { readFileSync } from "node:fs";\nimport * as contracts from ${JSON.stringify(contractName)};\nconst fixtures = JSON.parse(readFileSync(${JSON.stringify(compatibilityFixturePath)}, "utf8"));\nconst schemas = {\n  ContractErrorEnvelopeSchema: contracts.ContractErrorEnvelopeSchema,\n  PackageSchema: contracts.PackageSchema,\n  DeliverySchema: contracts.DeliverySchema,\n  ActorLaunchSpecSchema: contracts.ActorLaunchSpecSchema,\n  ServerToHostMessageSchema: contracts.ServerToHostMessageSchema,\n  HostToServerMessageSchema: contracts.HostToServerMessageSchema,\n  ActorTemplateSpecSchema: contracts.ActorTemplateSpecSchema,\n  ActorConfigSnapshotSchema: contracts.ActorConfigSnapshotSchema,\n  ActorTemplateValidationReportSchema: contracts.ActorTemplateValidationReportSchema,\n  ActorTemplateValidationFailedDetailsSchema: contracts.ActorTemplateValidationFailedDetailsSchema,\n  ValidateActorTemplateCandidateResultSchema: contracts.ValidateActorTemplateCandidateResultSchema,\n  CreateActorTemplateResultSchema: contracts.CreateActorTemplateResultSchema,\n  ReviseActorTemplateResultSchema: contracts.ReviseActorTemplateResultSchema\n};\nif (!Array.isArray(fixtures) || fixtures.length !== 13) process.exit(1);\nfor (const fixture of fixtures) {\n  const schema = schemas[fixture.schema];\n  if (schema === undefined) {\n    console.error(\`unknown schema: \${fixture.schema}\`);\n    process.exit(1);\n  }\n  const decoded = contracts.decodeContract(schema, fixture.value);\n  if (!decoded.ok) {\n    console.error(\`fixture failed: \${fixture.name}\`);\n    process.exit(1);\n  }\n  const roundTripped = contracts.decodeContract(schema, JSON.parse(JSON.stringify(decoded.value)));\n  if (!roundTripped.ok) {\n    console.error(\`fixture round-trip failed: \${fixture.name}\`);\n    process.exit(1);\n  }\n}\n`;
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
  runProductionImportBoundaryRegressionChecks();
  checkToolchain();
  if (gitCleanMode) {
    checkGitClean();
  } else {
    checkManifestShape();
    checkDirectories();
    checkTsGraph();
    checkSources();
    checkProductionImportBoundaries();
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
