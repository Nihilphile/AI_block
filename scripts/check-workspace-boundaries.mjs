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
  import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";

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
  const contractName = "@ai-block/runtime-contracts";
  const appNames = [
    "@ai-block/runtime-server",
    "@ai-block/actor-host",
    "@ai-block/runtime-cli"
  ];
  const contracts = {
    kind: "contracts",
    name: contractName,
    dir: join(root, "packages", "runtime-contracts")
  };
  const apps = [
    { kind: "app", name: "@ai-block/runtime-server", dir: join(root, "apps", "runtime-server") },
    { kind: "app", name: "@ai-block/actor-host", dir: join(root, "apps", "actor-host") },
    { kind: "app", name: "@ai-block/runtime-cli", dir: join(root, "apps", "runtime-cli") }
  ];
  const units = [...apps, contracts];
  const failures = [];
  const appNameSet = new Set(appNames);

  function fail(message) {
    failures.push(message);
  }

  function check(condition, message) {
    if (!condition) fail(message);
  }

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

  function isWithin(parent, child) {
    const path = relative(parent, child);
    return path === "" || (!path.startsWith("..") && !path.includes(":") && !path.startsWith("/"));
  }

  function unitFor(path) {
    const absolute = resolve(path);
    return units.find((unit) => isWithin(unit.dir, absolute));
  }

  function directories(path) {
    if (!existsSync(path)) return [];
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  }

  function sourceFiles(path) {
    if (!existsSync(path)) return [];
    const files = [];
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "dist") {
        files.push(...sourceFiles(child));
      } else if (entry.isFile() && extname(entry.name) === ".ts") {
        files.push(child);
      }
    }
    return files.sort();
  }

  function importSpecs(source) {
    const specs = [];
    const pattern = /(?:import|export)\s+(?:type\s+)?(?:[^"'`;\r\n]*?\s+from\s+)?["']([^"']+)["']|(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g;
    for (const match of source.matchAll(pattern)) specs.push(match[1] ?? match[2]);
    return specs;
  }

  function sourceTarget(file, spec) {
    if (!spec.startsWith(".")) return undefined;
    let target = resolve(dirname(file), spec);
    if (target.endsWith(".js")) target = `${target.slice(0, -3)}.ts`;
    if (target.endsWith(".mjs")) target = `${target.slice(0, -4)}.mts`;
    if (existsSync(target)) return target;
    for (const candidate of [join(target, "index.ts"), join(target, "index.mts")]) {
      if (existsSync(candidate)) return candidate;
    }
    return target;
  }

  function importViolations(file, source) {
    const unit = unitFor(file);
    if (!unit) return [`source is outside a workspace unit: ${file}`];
    const violations = [];
    for (const spec of importSpecs(source)) {
      if (spec === contractName) {
        if (unit.kind !== "app") violations.push(`${file}: only applications may import ${contractName}`);
        continue;
      }
      if (spec.startsWith(`${contractName}/`)) {
        violations.push(`${file}: Runtime Contracts deep import ${spec}`);
        continue;
      }
      if (appNameSet.has(spec)) {
        violations.push(`${file}: application-to-application package import ${spec}`);
        continue;
      }
      if (spec.startsWith("@ai-block/")) {
        violations.push(`${file}: unknown or forbidden @ai-block package import ${spec}`);
        continue;
      }
      if (spec.startsWith(".")) {
        const target = sourceTarget(file, spec);
        const targetUnit = target && unitFor(target);
        if (targetUnit && targetUnit !== unit) {
          violations.push(`${file}: relative import crosses ${unit.name} to ${targetUnit.name}`);
        }
        if (unit.kind === "contracts" && spec.split(/[\\/]/).includes("infrastructure")) {
          violations.push(`${file}: Runtime Contracts imports infrastructure ${spec}`);
        }
        continue;
      }
      if (unit.kind === "contracts" && (spec === "infrastructure" || spec.startsWith("infrastructure/"))) {
        violations.push(`${file}: Runtime Contracts imports infrastructure ${spec}`);
      }
    }
    return violations;
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
      verify: "pnpm install --frozen-lockfile && git diff --exit-code && pnpm build && pnpm check:boundaries && pnpm clean && git diff --exit-code"
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
      const owned = directories(unit.dir).filter((name) => name !== "dist" && name !== "node_modules");
      check(same(owned, ["src"]), `${unit.dir}: unexpected owned directory`);
      const entries = existsSync(join(unit.dir, "src")) ? readdirSync(join(unit.dir, "src"), { withFileTypes: true }) : [];
      const expectedFile = authorizedSourceFiles.get(unit);
      check(entries.length === 1 && entries[0].isFile() && entries[0].name === expectedFile, `${unit.dir}/src must contain exactly ${expectedFile} and no subdirectory`);
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

  function checkSourcesAndImports() {
    const expected = "export {};\n";
    for (const unit of units) {
      const entry = join(unit.dir, "src", unit.kind === "app" ? "main.ts" : "index.ts");
      check(readText(entry) === expected, `${entry}: source is not the exact empty ESM module`);
      for (const file of sourceFiles(join(unit.dir, "src"))) {
        for (const violation of importViolations(file, readText(file))) fail(violation);
      }
    }
  }

  function outputText(value) {
    return typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
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

  function checkArtifactsAndToolchain() {
    runPnpm("pnpm version", ["--version"], (status, stdout) => status === 0 && stdout.trim() === "11.10.0");
    runPnpm("TypeScript version", ["exec", "tsc", "--version"], (status, stdout) => status === 0 && stdout.trim() === "Version 7.0.2");
    for (const app of apps) check(existsSync(join(app.dir, "dist", "main.js")), `${app.dir}: dist/main.js missing`);
    check(existsSync(join(contracts.dir, "dist", "index.js")), "Runtime Contracts dist/index.js missing");
    check(existsSync(join(contracts.dir, "dist", "index.d.ts")), "Runtime Contracts dist/index.d.ts missing");
  }

  function runNodeProbe(file, source, expectStatus) {
    writeFileSync(file, source, "utf8");
    const result = spawnSync(process.execPath, [file], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      shell: false
    });
    return validateProcess(`Node probe ${file}`, result, (status) => expectStatus(status));
  }

  function runTscProbe(label, directory, source, expectSuccess) {
    const sourceFile = join(directory, `${label}.mts`);
    const configFile = join(directory, `${label}.tsconfig.json`);
    const config = {
      compilerOptions: {
        target: "ES2023",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        verbatimModuleSyntax: true,
        skipLibCheck: true,
        rootDir: "."
      },
      files: [sourceFile]
    };
    writeFileSync(sourceFile, source, "utf8");
    writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    const result = runPnpm(`tsc probe ${label}`, ["exec", "tsc", "--project", configFile, "--noEmit", "--pretty", "false"], (status, stdout, stderr) => {
      if (expectSuccess) return status === 0;
      return status !== 0 && /error TS\d+:/i.test(`${stdout}\n${stderr}`);
    });
    return result;
  }

  function toImportPath(path) {
    const value = path.replaceAll("\\", "/");
    return value.startsWith(".") ? value : `./${value}`;
  }

  function runBoundaryProbes() {
    const temporary = [];
    try {
      for (const app of apps) {
        const dir = mkdtempSync(join(join(app.dir, "node_modules"), ".ai-block-boundaries-"));
        temporary.push(dir);
        runTscProbe(`root-${app.name.split("/").pop()}`, dir, `import ${JSON.stringify(contractName)};\n`, true);
        check(runNodeProbe(join(dir, "root.mjs"), `import ${JSON.stringify(contractName)};\n`, (status) => status === 0) !== undefined, `${app.name}: package-root runtime import did not return numeric status 0`);
      }

      const app = apps[0];
      const appDir = temporary[0];
      runTscProbe("deep", appDir, `import ${JSON.stringify(`${contractName}/src/index.js`)};\n`, false);
      check(runNodeProbe(join(appDir, "deep.mjs"), `import ${JSON.stringify(`${contractName}/src/index.js`)};\n`, (status) => status !== 0) !== undefined, "Runtime Contracts deep-import runtime probe did not return a numeric nonzero status");

      runTscProbe("app-package", appDir, `import ${JSON.stringify(appNames[1])};\n`, false);
      check(runNodeProbe(join(appDir, "app-package.mjs"), `import ${JSON.stringify(appNames[1])};\n`, (status) => status !== 0) !== undefined, "application-to-application package runtime probe did not return a numeric nonzero status");

      const relativeFile = join(appDir, "relative.mts");
      const relativeSpec = toImportPath(relative(dirname(relativeFile), join(contracts.dir, "src", "index.ts")));
      const relativeSource = `import ${JSON.stringify(relativeSpec)};\n`;
      runTscProbe("relative-contracts", appDir, relativeSource, false);
      check(importViolations(relativeFile, relativeSource).length > 0, "relative cross-package source probe was accepted by policy");

      const appRelativeFile = join(appDir, "relative-application.mts");
      const appRelativeSpec = toImportPath(relative(dirname(appRelativeFile), join(apps[1].dir, "src", "main.ts")));
      const appRelativeSource = `import ${JSON.stringify(appRelativeSpec)};\n`;
      runTscProbe("relative-application", appDir, appRelativeSource, false);
      check(importViolations(appRelativeFile, appRelativeSource).length > 0, "application-to-application relative source probe was accepted by policy");

      const contractsDir = mkdtempSync(join(join(root, "node_modules"), ".ai-block-boundaries-contracts-"));
      temporary.push(contractsDir);
      const contractsAppFile = join(contracts.dir, "synthetic-app-probe.mts");
      const contractsAppSource = `import ${JSON.stringify(toImportPath(relative(contracts.dir, join(apps[0].dir, "src", "main.ts"))))};\n`;
      runTscProbe("contracts-application", contractsDir, contractsAppSource, false);
      check(importViolations(contractsAppFile, contractsAppSource).length > 0, "Runtime Contracts-to-application probe was accepted");
      const infrastructureSource = 'import "infrastructure/internal.js";\n';
      runTscProbe("contracts-infrastructure", contractsDir, infrastructureSource, false);
      check(importViolations(join(contracts.dir, "src", "synthetic-infrastructure-probe.mts"), infrastructureSource).length > 0, "Runtime Contracts-to-infrastructure probe was accepted");
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

  checkManifestShape();
  checkDirectories();
  checkTsGraph();
  checkSourcesAndImports();
  checkArtifactsAndToolchain();
  runBoundaryProbes();

  if (failures.length > 0) {
    console.error("BOUNDARY CHECK FAILED");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("PASS: workspace boundaries, manifests, references, artifacts, and probes verified");
  }
