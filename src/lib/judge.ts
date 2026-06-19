import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Worker } from "worker_threads";
import type { JudgeLanguage } from "@/lib/languages";
import type { Problem } from "@/lib/mockData";

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
};

const isWin = process.platform === "win32";
const nativeBinary = isWin ? "main.exe" : "./main";

const nativeConfigs: Partial<Record<JudgeLanguage, LanguageConfig>> = {
  python: {
    filename: "solution.py",
    run: isWin ? ["py", "-3", "runner.py"] : ["python3", "runner.py"],
    needsPythonRunner: true,
  },
  cpp: {
    filename: "Main.cpp",
    compile: ["g++", "-std=c++20", "-O2", "Main.cpp", "-o", isWin ? "main.exe" : "main"],
    run: isWin ? ["main.exe"] : [nativeBinary],
  },
  c: {
    filename: "Main.c",
    compile: ["gcc", "-std=c17", "-O2", "Main.c", "-o", isWin ? "main.exe" : "main"],
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
  python: {
    image: "python:3.12-alpine",
    filename: "solution.py",
    shellCommand: "python3 runner.py",
    run: [],
    needsPythonRunner: true,
  },
  cpp: {
    image: "gcc:14",
    filename: "Main.cpp",
    shellCommand: "g++ -std=c++20 -O2 Main.cpp -o main && ./main",
    run: [],
  },
  c: {
    image: "gcc:14",
    filename: "Main.c",
    shellCommand: "gcc -std=c17 -O2 Main.c -o main && ./main",
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

const workerSource = `
const { parentPort, workerData } = require("worker_threads");
const vm = require("vm");

(async () => {
  const sandbox = Object.create(null);
  sandbox.console = { log() {}, error() {}, warn() {}, info() {} };
  vm.createContext(sandbox);
  const script = new vm.Script(workerData.code, { timeout: workerData.scriptTimeoutMs });
  script.runInContext(sandbox, { timeout: workerData.scriptTimeoutMs });

  const fn = sandbox[workerData.functionName];
  if (typeof fn !== "function") {
    throw new Error("Expected a function named " + workerData.functionName + ".");
  }

  const results = [];
  for (const testCase of workerData.testCases) {
    try {
      const actual = await fn(String(testCase.input));
      results.push({ id: testCase.id, actual: String(actual ?? "") });
    } catch (error) {
      results.push({
        id: testCase.id,
        actual: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  parentPort.postMessage({ results });
})().catch((error) => {
  parentPort.postMessage({
    error: error instanceof Error ? error.message : String(error),
  });
});
`;

const runJavaScriptWorker = (
  problem: Problem,
  code: string,
  timeoutMs: number,
): Promise<Array<{ id: number; actual: string; error?: string }>> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(workerSource, {
      eval: true,
      resourceLimits: {
        maxOldGenerationSizeMb: 128,
        maxYoungGenerationSizeMb: 32,
        stackSizeMb: 8,
      },
      workerData: {
        code,
        functionName: `solve${problem.level}`,
        testCases: problem.testCases,
        scriptTimeoutMs: 1000,
      },
    });

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error(`Execution timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    worker.once("message", (message: { results?: Array<{ id: number; actual: string; error?: string }>; error?: string }) => {
      clearTimeout(timeout);
      worker.terminate();
      if (message.error) {
        reject(new Error(message.error));
        return;
      }
      resolve(message.results ?? []);
    });

    worker.once("error", (error) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(error);
    });
  });

type ProcessResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  exitCode: number | null;
  spawnError?: string;
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

const pythonRunner = (functionName: string) => `
import importlib.util
import sys

spec = importlib.util.spec_from_file_location("solution", "solution.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
fn = getattr(module, "${functionName}", None)
if not callable(fn):
    raise RuntimeError("Expected a function named ${functionName}.")
result = fn(sys.stdin.read())
if result is not None:
    print(result, end="")
`;

const writeLanguageFiles = async (
  workdir: string,
  language: JudgeLanguage,
  problem: Problem,
  code: string,
  config: LanguageConfig,
) => {
  await writeFile(path.join(workdir, config.filename), code, "utf8");

  if (config.needsPythonRunner) {
    await writeFile(path.join(workdir, "runner.py"), pythonRunner(`solve${problem.level}`), "utf8");
  }
};

let dockerReady: boolean | null = null;

const shouldUseDocker = () => process.env.JUDGE_USE_DOCKER === "true";

const checkDockerReady = async () => {
  if (!shouldUseDocker()) return false;
  if (dockerReady !== null) return dockerReady;

  const probe = await runProcess("docker", ["info"], process.cwd(), "", 4000);
  dockerReady = !probe.spawnError && probe.exitCode === 0 && !probe.timedOut;
  return dockerReady;
};

const runNativeCase = async (
  workdir: string,
  config: LanguageConfig,
  input: string,
  timeoutMs: number,
  compiled: boolean,
) => {
  if (config.compile && !compiled) {
    const compileResult = await runProcess(config.compile[0], config.compile.slice(1), workdir, "", 15000);
    const compileError = formatProcessError(compileResult);
    if (compileError) {
      return { execution: compileResult, compileError };
    }
  }

  const execution = await runProcess(config.run[0], config.run.slice(1), workdir, input, timeoutMs);
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
      const { execution, compileError } = await runNativeCase(workdir, config, testCase.input, 8000, compiled);
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
    const results =
      language === "javascript"
        ? await runJavaScriptWorker(problem, code, 1600)
        : (await checkDockerReady())
          ? await runDockerJudge(problem, language, code)
          : await runNativeJudge(problem, language, code);

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
