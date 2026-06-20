import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import type { JudgeLanguage } from "@/lib/languages";
import type { Problem } from "@/lib/mockData";
import { logger } from "@/lib/logger";

export type { JudgeLanguage } from "@/lib/languages";

export interface JudgeCaseResult {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

export interface JudgeResult {
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Unsupported Language";
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  cases: JudgeCaseResult[];
  message: string;
}

type LanguageConfig = {
  filename: string;
  compile?: string[];
  run: string[];
  needsPythonRunner?: boolean;
  sourceFilename?: string;
  runnerFilename?: string;
};

type JudgeMode = "native" | "docker" | "unavailable";

export type JudgeToolchainStatus = {
  language: JudgeLanguage;
  executionMode: JudgeMode;
  runtimeFound: boolean;
  compilerFound: boolean;
  runtimePath: string | null;
  compilerPath: string | null;
  runtimeVersion: string | null;
  compilerVersion: string | null;
  reason?: string;
};

export type JudgeSelfTestResult = {
  language: JudgeLanguage;
  passed: boolean;
  status: JudgeResult["status"];
  message: string;
  expected: string;
  actual: string;
  runtimeMs: number;
  executionMode: JudgeMode;
};

const isWin = process.platform === "win32";
const nativeBinary = isWin ? "main.exe" : "./main";

const nativeConfigs: Partial<Record<JudgeLanguage, LanguageConfig>> = {
  javascript: {
    filename: "main.js",
    run: ["node", "main.js"],
  },
  python: {
    filename: "main.py",
    run: isWin ? ["py", "-3", "main.py"] : ["python3", "main.py"],
    needsPythonRunner: true,
  },
  cpp: {
    filename: "main.cpp",
    compile: ["g++", "main.cpp", "-std=c++17", "-O2", "-o", isWin ? "main.exe" : "main"],
    run: isWin ? ["main.exe"] : [nativeBinary],
  },
  c: {
    filename: "main.c",
    compile: ["gcc", "main.c", "-o", isWin ? "main.exe" : "main"],
    run: isWin ? ["main.exe"] : [nativeBinary],
  },
  java: {
    filename: "Main.java",
    compile: ["javac", "Main.java"],
    run: ["java", "-cp", ".", "Main"],
  },
  go: {
    filename: "Main.go",
    run: ["go", "run", "Main.go"],
  },
  rust: {
    filename: "Main.rs",
    compile: ["rustc", "Main.rs", "-O", "-o", isWin ? "main.exe" : "main"],
    run: isWin ? ["main.exe"] : [nativeBinary],
  },
  php: {
    filename: "Main.php",
    run: ["php", "Main.php"],
  },
  ruby: {
    filename: "Main.rb",
    run: ["ruby", "Main.rb"],
  },
};

const dockerConfigs: Partial<Record<JudgeLanguage, LanguageConfig & { image: string; shellCommand: string }>> = {
  javascript: {
    image: "node:22-bookworm-slim",
    filename: "main.js",
    shellCommand: "node main.js",
    run: [],
  },
  python: {
    image: "python:3.12-alpine",
    filename: "main.py",
    shellCommand: "python3 main.py",
    run: [],
    needsPythonRunner: true,
  },
  cpp: {
    image: "gcc:14",
    filename: "main.cpp",
    shellCommand: "g++ main.cpp -std=c++17 -O2 -o main && ./main",
    run: [],
  },
  c: {
    image: "gcc:14",
    filename: "main.c",
    shellCommand: "gcc main.c -o main && ./main",
    run: [],
  },
  java: {
    image: "eclipse-temurin:21-jdk",
    filename: "Main.java",
    shellCommand: "javac Main.java && java -cp . Main",
    run: [],
  },
  go: {
    image: "golang:1.23-alpine",
    filename: "Main.go",
    shellCommand: "go run Main.go",
    run: [],
  },
  rust: {
    image: "rust:1.83-alpine",
    filename: "Main.rs",
    shellCommand: "rustc Main.rs -O -o main && ./main",
    run: [],
  },
  php: {
    image: "php:8.4-cli-alpine",
    filename: "Main.php",
    shellCommand: "php Main.php",
    run: [],
  },
  ruby: {
    image: "ruby:3.4-alpine",
    filename: "Main.rb",
    shellCommand: "ruby Main.rb",
    run: [],
  },
};

const normalizeOutput = (value: unknown) => String(value ?? "").replace(/\r\n/g, "\n").trim();

const parseBinaryOutput = (value: string) => normalizeOutput(value.split(/\r?\n/)[0] ?? "");

const getJavaJudgeServiceUrl = () => process.env.JAVA_JUDGE_SERVICE_URL?.trim() ?? "";

type ProbeCommand = readonly [string, string[]];

const jsRunner = (functionName: string) => `
const fs = require("fs");
${functionName}
const input = fs.readFileSync(0, "utf8");
const result = ${functionName}(input);
if (result !== undefined && result !== null) {
  process.stdout.write(String(result));
}
`;

const pythonRunner = (functionName: string) => `
import sys

${functionName}
if __name__ == "__main__":
    result = ${functionName}(sys.stdin.read())
    if result is not None:
        print(result, end="")
`;

type ProcessResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  exitCode: number | null;
  spawnError?: string;
};

const logProcess = (phase: "compile" | "runtime", language: JudgeLanguage, execution: ProcessResult, command: string[]) => {
  logger.info("judge.process", {
    language,
    phase,
    command: command.join(" "),
    stdout: normalizeOutput(execution.stdout),
    stderr: normalizeOutput(execution.stderr),
    timedOut: execution.timedOut,
    exitCode: execution.exitCode,
    spawnError: execution.spawnError ?? null,
  });
};

const runProcess = (
  command: string,
  args: string[],
  cwd: string,
  input: string,
  timeoutMs: number,
): Promise<ProcessResult> =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      windowsHide: true,
      timeout: timeoutMs,
      killSignal: "SIGKILL",
      env: { ...process.env, NO_COLOR: "1" },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let spawnError: string | undefined;
    const outputLimit = 1_048_576;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length + stderr.length > outputLimit) {
        timedOut = true;
        child.kill("SIGKILL");
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stdout.length + stderr.length > outputLimit) {
        timedOut = true;
        child.kill("SIGKILL");
      }
    });
    child.on("error", (error) => {
      spawnError = error.message;
    });
    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, timedOut, exitCode, spawnError });
    });

  if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });

const detectBinary = async (command: string, args: string[], cwd = process.cwd()) => {
  const execution = await runProcess(command, args, cwd, "", 4000);
  return {
    found: !execution.spawnError && execution.exitCode === 0 && !execution.timedOut,
    path: execution.spawnError ? null : command,
    version: parseBinaryOutput(execution.stdout || execution.stderr),
  };
};

const versionProbeFor = (language: JudgeLanguage): { runtime: ProbeCommand | null; compiler: ProbeCommand | null } => {
  switch (language) {
    case "javascript":
      return { runtime: ["node", ["--version"]] as const, compiler: null };
    case "python":
      return { runtime: [isWin ? "py" : "python3", isWin ? ["-3", "--version"] : ["--version"]] as const, compiler: null };
    case "java":
      return { runtime: ["java", ["-version"]] as const, compiler: ["javac", ["-version"]] as const };
    case "c":
      return { runtime: ["gcc", ["--version"]] as const, compiler: ["gcc", ["--version"]] as const };
    case "cpp":
      return { runtime: ["g++", ["--version"]] as const, compiler: ["g++", ["--version"]] as const };
    case "go":
      return { runtime: ["go", ["version"]] as const, compiler: null };
    case "rust":
      return { runtime: ["rustc", ["--version"]] as const, compiler: ["rustc", ["--version"]] as const };
    case "php":
      return { runtime: ["php", ["-v"]] as const, compiler: null };
    case "ruby":
      return { runtime: ["ruby", ["-v"]] as const, compiler: null };
    default:
      return { runtime: null, compiler: null };
  }
};

const formatProcessError = (execution: ProcessResult) => {
  if (execution.spawnError) {
    if (execution.spawnError.includes("ENOENT")) {
      return `Runtime not found: install the language toolchain locally, or set JUDGE_USE_DOCKER=true with Docker Desktop running.`;
    }
    return execution.spawnError;
  }
  if (execution.timedOut) return "Execution timed out.";
  if (execution.exitCode === 0) return undefined;
  return normalizeOutput(execution.stderr || `Process exited with code ${execution.exitCode}.`);
};

const writeLanguageFiles = async (
  workdir: string,
  language: JudgeLanguage,
  problem: Problem,
  code: string,
  config: LanguageConfig,
) => {
  if (language === "javascript") {
    await writeFile(path.join(workdir, config.filename), `${code}\n${jsRunner(`solve${problem.level}`)}`, "utf8");
    return;
  }

  if (language === "python") {
    await writeFile(path.join(workdir, config.filename), `${code}\n${pythonRunner(`solve${problem.level}`)}`, "utf8");
    return;
  }

  await writeFile(path.join(workdir, config.filename), code, "utf8");
};

let dockerReady: boolean | null = null;

const shouldUseDocker = () => process.env.JUDGE_USE_DOCKER === "true";

const isRemoteJavaJudgeConfigured = () => Boolean(getJavaJudgeServiceUrl());

const checkDockerReady = async () => {
  if (!shouldUseDocker()) return false;
  if (dockerReady !== null) return dockerReady;

  const probe = await runProcess("docker", ["info"], process.cwd(), "", 4000);
  dockerReady = !probe.spawnError && probe.exitCode === 0 && !probe.timedOut;
  return dockerReady;
};

export const detectToolchain = async (language: JudgeLanguage): Promise<JudgeToolchainStatus> => {
  const config = nativeConfigs[language];
  if (language === "java" && isRemoteJavaJudgeConfigured()) {
    return {
      language,
      executionMode: "docker",
      runtimeFound: false,
      compilerFound: false,
      runtimePath: null,
      compilerPath: null,
      runtimeVersion: null,
      compilerVersion: null,
      reason: "Java is delegated to the remote Docker judge service.",
    };
  }

  const dockerReadyNow = await checkDockerReady();
  const probes = versionProbeFor(language);

  if (!config) {
    return {
      language,
      executionMode: dockerReadyNow ? "docker" : "unavailable",
      runtimeFound: false,
      compilerFound: false,
      runtimePath: null,
      compilerPath: null,
      runtimeVersion: null,
      compilerVersion: null,
      reason: `Language ${language} is not configured for native execution.`,
    };
  }

  const runtimeProbe = probes.runtime ? await detectBinary(probes.runtime[0], probes.runtime[1]) : { found: false, path: null, version: null };
  const compilerProbe =
    probes.compiler && config.compile ? await detectBinary(probes.compiler[0], probes.compiler[1]) : runtimeProbe;
  const runtimeFound = runtimeProbe.found;
  const compilerFound = config.compile ? compilerProbe.found : runtimeProbe.found;
  const executionMode: JudgeMode = runtimeFound && compilerFound ? "native" : dockerReadyNow ? "docker" : "unavailable";

  return {
    language,
    executionMode,
    runtimeFound,
    compilerFound,
    runtimePath: runtimeProbe.path,
    compilerPath: config.compile ? compilerProbe.path : runtimeProbe.path,
    runtimeVersion: runtimeProbe.version,
    compilerVersion: config.compile ? compilerProbe.version : runtimeProbe.version,
    reason: executionMode === "unavailable" ? "Neither native toolchain nor Docker were available." : undefined,
  };
};

const runNativeCase = async (
  workdir: string,
  language: JudgeLanguage,
  config: LanguageConfig,
  input: string,
  timeoutMs: number,
  compiled: boolean,
) => {
  if (config.compile && !compiled) {
    const compileResult = await runProcess(config.compile[0], config.compile.slice(1), workdir, "", 15000);
    logProcess("compile", language, compileResult, config.compile);
    const compileError = formatProcessError(compileResult);
    if (compileError) {
      return { execution: compileResult, compileError };
    }
  }

  const execution = await runProcess(config.run[0], config.run.slice(1), workdir, input, timeoutMs);
  logProcess("runtime", language, execution, config.run);
  return { execution, compileError: undefined as string | undefined };
};

const runNativeJudge = async (problem: Problem, language: JudgeLanguage, code: string) => {
  const config = nativeConfigs[language];
  if (!config) {
    throw new Error(`Language ${language} is not configured for native execution.`);
  }

  const workdir = await mkdtemp(path.join(tmpdir(), `nexorithm-${language}-${randomUUID()}-`));
  try {
    await writeLanguageFiles(workdir, language, problem, code, config);

    const results = [];
    let compiled = !config.compile;

    for (const testCase of problem.testCases) {
      const { execution, compileError } = await runNativeCase(workdir, language, config, testCase.input, 8000, compiled);
      if (config.compile && !compiled && !compileError) {
        compiled = true;
      }

      const error = compileError ?? formatProcessError(execution);
      results.push({
        id: testCase.id,
        actual: execution.stdout,
        error,
      });

      if (compileError) break;
    }

    return results;
  } finally {
    await rm(workdir, { force: true, recursive: true });
  }
};

const dockerArgs = (workdir: string, image: string, shellCommand: string) => [
  "run",
  "--rm",
  "--network",
  "none",
  "--cpus",
  "1",
  "--memory",
  "256m",
  "-v",
  `${workdir}:/workspace`,
  "-w",
  "/workspace",
  image,
  "sh",
  "-lc",
  shellCommand,
];

const runDockerCase = (workdir: string, image: string, shellCommand: string, input: string, timeoutMs: number) =>
  runProcess("docker", dockerArgs(workdir, image, shellCommand), process.cwd(), input, timeoutMs);

const runDockerJudge = async (problem: Problem, language: JudgeLanguage, code: string) => {
  const config = dockerConfigs[language];
  if (!config) {
    throw new Error(`Language ${language} is not configured for Docker execution.`);
  }

  const workdir = await mkdtemp(path.join(tmpdir(), `nexorithm-${language}-${randomUUID()}-`));
  try {
    await writeLanguageFiles(workdir, language, problem, code, config);

    const results = [];
    for (const testCase of problem.testCases) {
      const execution = await runDockerCase(workdir, config.image, config.shellCommand, testCase.input, 12000);
      logProcess("runtime", language, execution, ["docker", ...dockerArgs(workdir, config.image, config.shellCommand)]);
      results.push({
        id: testCase.id,
        actual: execution.stdout,
        error: formatProcessError(execution),
      });
    }
    return results;
  } finally {
    await rm(workdir, { force: true, recursive: true });
  }
};

const runRemoteJavaJudge = async (problem: Problem, code: string) => {
  const serviceUrl = getJavaJudgeServiceUrl();
  if (!serviceUrl) {
    throw new Error("Java remote judge service is not configured. Set JAVA_JUDGE_SERVICE_URL to the Docker judge endpoint.");
  }

  const response = await fetch(serviceUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      problemId: problem.id,
      language: "java",
      code,
      testCases: problem.testCases,
      judge: problem.judge,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        status?: JudgeResult["status"];
        passedCount?: number;
        totalCount?: number;
        runtimeMs?: number;
        cases?: JudgeCaseResult[];
        message?: string;
        error?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? `Java judge service responded with HTTP ${response.status}.`);
  }

  if (
    !payload ||
    typeof payload.status !== "string" ||
    typeof payload.passedCount !== "number" ||
    typeof payload.totalCount !== "number" ||
    typeof payload.runtimeMs !== "number" ||
    !Array.isArray(payload.cases) ||
    typeof payload.message !== "string"
  ) {
    throw new Error("Java judge service returned an invalid response.");
  }

  return {
    status: payload.status,
    passedCount: payload.passedCount,
    totalCount: payload.totalCount,
    runtimeMs: payload.runtimeMs,
    cases: payload.cases,
    message: payload.message,
  } satisfies JudgeResult;
};

const makeSelfTestProblem = (): Problem => ({
  id: "runtime-self-test",
  title: "Runtime Self Test",
  slug: "runtime-self-test",
  difficulty: "Easy",
  level: 1,
  topic: "Infrastructure",
  pattern: "Judge Health",
  xpReward: 0,
  coinReward: 0,
  description: "Judge self test.",
  discussions: [],
  editorial: { overview: "", approach: [], complexity: { time: "O(1)", space: "O(1)" } },
  optimizedSolutions: [],
  judge: { kind: "sum" },
  starterCode: {
    javascript: "function solve1(input) { return input.trim(); }",
    python: "def solve1(input):\n    return input.strip()\n",
    cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);string s; if(!(cin>>s)) return 0; cout<<s; return 0;}",
    c: "#include <stdio.h>\nint main(void){char s[64]; if(scanf(\"%63s\", s)!=1) return 0; printf(\"%s\", s); return 0;}",
    java: "import java.io.*;\npublic class Main { public static void main(String[] args) throws Exception { BufferedReader br = new BufferedReader(new InputStreamReader(System.in)); String s = br.readLine(); if (s != null) System.out.print(s.trim()); } }",
    go: "package main\nimport (\n  \"bufio\"\n  \"fmt\"\n  \"os\"\n)\nfunc main(){in:=bufio.NewReader(os.Stdin); var s string; fmt.Fscan(in,&s); fmt.Print(s)}",
    rust: "fn main() {}",
    php: "<?php $s = trim(stream_get_contents(STDIN)); echo $s;",
    ruby: "print STDIN.read.strip",
  },
  testCases: [{ id: 1, input: "5", expected: "5" }],
});

export const runJudgeSelfTest = async (): Promise<JudgeSelfTestResult[]> => {
  const selfTestProblem = makeSelfTestProblem();
  const inputs: JudgeLanguage[] = isRemoteJavaJudgeConfigured() ? ["javascript", "python", "c", "cpp"] : ["javascript", "python", "java", "c", "cpp"];
  const results: JudgeSelfTestResult[] = [];

  for (const language of inputs) {
    const toolchain = language === "javascript" ? null : await detectToolchain(language);
    const code = selfTestProblem.starterCode[language];
    const judgeResult = await judgeSubmission(selfTestProblem, language, code);
    const caseResult = judgeResult.cases[0];
    results.push({
      language,
      passed: judgeResult.status === "Accepted" && caseResult?.passed === true,
      status: judgeResult.status,
      message: judgeResult.message,
      expected: caseResult?.expected ?? "5",
      actual: caseResult?.actual ?? "",
      runtimeMs: judgeResult.runtimeMs,
      executionMode: toolchain?.executionMode ?? "native",
    });
  }

  return results;
};

const buildResult = (
  problem: Problem,
  startedAt: number,
  results: Array<{ id: number; actual: string; error?: string }>,
): JudgeResult => {
  const cases = problem.testCases.map((testCase) => {
    const result = results.find((item) => item.id === testCase.id);
    const actual = normalizeOutput(result?.actual);
    const expected = normalizeOutput(testCase.expected);
    const passed = !result?.error && actual === expected;
    return {
      ...testCase,
      actual,
      expected,
      passed,
      error: result?.error,
    };
  });
  const passedCount = cases.filter((testCase) => testCase.passed).length;
  const hasRuntimeError = cases.some((testCase) => Boolean(testCase.error));
  const hasCompileError = cases.some((testCase) =>
    Boolean(testCase.error?.includes("error:") || testCase.error?.includes("Compilation")),
  );

  return {
    status:
      passedCount === cases.length
        ? "Accepted"
        : hasCompileError
          ? "Compilation Error"
          : hasRuntimeError
            ? "Runtime Error"
            : "Wrong Answer",
    passedCount,
    totalCount: cases.length,
    runtimeMs: Date.now() - startedAt,
    cases,
    message: passedCount === cases.length ? "All test cases passed." : "Some test cases failed.",
  };
};

export async function judgeSubmission(
  problem: Problem,
  language: JudgeLanguage,
  code: string,
): Promise<JudgeResult> {
  const startedAt = Date.now();

  try {
    logger.info("judge.request", {
      language,
      selectedLanguage: language,
      executionMode: shouldUseDocker() ? "docker-preferred" : "native-preferred",
    });

    if (language === "java" && isRemoteJavaJudgeConfigured()) {
      logger.info("judge.remote_java_forward", {
        language,
        serviceUrl: getJavaJudgeServiceUrl(),
      });
      return await runRemoteJavaJudge(problem, code);
    }

    const toolchain = await detectToolchain(language);
    if (toolchain) {
      logger.info("judge.toolchain", {
        language: toolchain.language,
        executionMode: toolchain.executionMode,
        runtimeFound: toolchain.runtimeFound,
        compilerFound: toolchain.compilerFound,
        runtimePath: toolchain.runtimePath,
        compilerPath: toolchain.compilerPath,
        runtimeVersion: toolchain.runtimeVersion,
        compilerVersion: toolchain.compilerVersion,
      });
    }

    const results =
      toolchain.executionMode === "docker"
        ? await runDockerJudge(problem, language, code)
        : toolchain.executionMode === "native"
          ? await runNativeJudge(problem, language, code)
          : (() => {
              throw new Error(toolchain.reason ?? "Runtime not found: install the language toolchain locally, or set JUDGE_USE_DOCKER=true with Docker Desktop running.");
            })();

    return buildResult(problem, startedAt, results);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      status: "Runtime Error",
      passedCount: 0,
      totalCount: problem.testCases.length,
      runtimeMs: Date.now() - startedAt,
      cases: problem.testCases.map((testCase) => ({
        ...testCase,
        actual: "",
        passed: false,
        error: message,
      })),
      message,
    };
  }
}
