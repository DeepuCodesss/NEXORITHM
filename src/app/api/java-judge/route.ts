import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

type JavaJudgeTestCase = {
  id: number;
  input: string;
  expected: string;
};

type JavaJudgeRequestBody = {
  problemId?: string;
  language?: string;
  code?: string;
  testCases?: unknown;
  judge?: unknown;
};

type JavaJudgeCaseResult = {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
};

type JavaJudgeResult = {
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error";
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  cases: JavaJudgeCaseResult[];
  message: string;
};

const normalizeOutput = (value: unknown) => String(value ?? "").replace(/\r\n/g, "\n").trim();

const collectEnvironmentSnapshot = async () => {
  const probe = async (command: string, args: string[], label: string) =>
    await new Promise<{ found: boolean; version: string; spawnDelayMs: number; durationMs: number }>((resolve) => {
      const startedAt = Date.now();
      const child = spawn(command, args, { windowsHide: true, env: { ...process.env, NO_COLOR: "1" } });
      let output = "";
      let spawnDelayMs = 0;
      child.on("spawn", () => {
        spawnDelayMs = Date.now() - startedAt;
        logger.info("java_judge.environment_probe_spawned", {
          route: "/api/java-judge",
          label,
          command,
          spawnDelayMs,
        });
      });
      child.stdout.on("data", (chunk) => {
        output += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        output += chunk.toString();
      });
      child.on("error", () => resolve({ found: false, version: "", spawnDelayMs, durationMs: Date.now() - startedAt }));
      child.on("close", (code) =>
        resolve({
          found: code === 0,
          version: output.trim().split(/\r?\n/)[0] ?? "",
          spawnDelayMs,
          durationMs: Date.now() - startedAt,
        }),
      );
    });

  const startedAt = Date.now();
  logger.info("java_judge.environment_snapshot_start", { route: "/api/java-judge" });
  const [java, javac] = await Promise.all([probe("java", ["-version"], "java-version"), probe("javac", ["-version"], "javac-version")]);
  logger.info("java_judge.environment_snapshot_end", {
    route: "/api/java-judge",
    durationMs: Date.now() - startedAt,
    javaProbeMs: java.durationMs,
    javacProbeMs: javac.durationMs,
  });

  return {
    processVersion: process.version,
    javaVersion: java.version,
    javacVersion: javac.version,
    javaProbeMs: java.durationMs,
    javacProbeMs: javac.durationMs,
    javaSpawnDelayMs: java.spawnDelayMs,
    javacSpawnDelayMs: javac.spawnDelayMs,
    cpuCount: os.cpus().length,
    availableParallelism: typeof os.availableParallelism === "function" ? os.availableParallelism() : null,
    totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
    freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
  };
};

const runProcess = (
  command: string,
  args: string[],
  cwd: string,
  input: string,
  timeoutMs: number,
  label?: string,
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean; spawnError?: string }> =>
  new Promise((resolve) => {
    const startedAt = Date.now();
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
    let spawnDelayMs = 0;

    child.on("spawn", () => {
      spawnDelayMs = Date.now() - startedAt;
      logger.info("java_judge.process_spawned", {
        route: "/api/java-judge",
        label: label ?? command,
        command,
        spawnDelayMs,
      });
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      spawnError = error.message;
    });
    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      logger.info("java_judge.process_closed", {
        route: "/api/java-judge",
        label: label ?? command,
        command,
        durationMs: Date.now() - startedAt,
        spawnDelayMs,
        exitCode,
        timedOut,
        spawnError: spawnError ?? null,
      });
      resolve({ stdout, stderr, exitCode, timedOut, spawnError });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });

const compileJava = async (workdir: string, code: string) => {
  const writeStartedAt = Date.now();
  logger.info("java_judge.before_write_file", { route: "/api/java-judge", workdir });
  await writeFile(path.join(workdir, "Main.java"), `${code}\n`, "utf8");
  logger.info("java_judge.after_write_file", {
    route: "/api/java-judge",
    workdir,
    durationMs: Date.now() - writeStartedAt,
  });

  logger.info("java_judge.compile_started", { route: "/api/java-judge" });
  logger.info("java_judge.before_javac_spawn", { route: "/api/java-judge" });
  const startedAt = Date.now();
  const compile = await runProcess("javac", ["Main.java"], workdir, "", 15000, "javac");
  logger.info("java_judge.after_javac_spawn", {
    route: "/api/java-judge",
    durationMs: Date.now() - startedAt,
  });
  logger.info("java_judge.compile_finished", {
    route: "/api/java-judge",
    durationMs: Date.now() - startedAt,
    exitCode: compile.exitCode,
    timedOut: compile.timedOut,
    spawnError: compile.spawnError ?? null,
  });

  if (compile.spawnError || compile.timedOut || compile.exitCode !== 0) {
    return {
      ok: false as const,
      error:
        compile.spawnError ??
        (compile.timedOut ? "Execution timed out." : normalizeOutput(compile.stderr || "Compilation failed.")),
    };
  }

  return { ok: true as const };
};

const runJavaCase = async (workdir: string, input: string) => {
  logger.info("java_judge.before_java_spawn", { route: "/api/java-judge" });
  const startedAt = Date.now();
  const execution = await runProcess("java", ["-cp", ".", "Main"], workdir, input, 12000, "java");
  logger.info("java_judge.after_java_spawn", {
    route: "/api/java-judge",
    durationMs: Date.now() - startedAt,
  });
  return {
    execution,
    error: execution.spawnError ?? (execution.timedOut ? "Execution timed out." : undefined),
  };
};

const buildResult = (testCases: JavaJudgeTestCase[], startedAt: number, results: Array<{ id: number; actual: string; error?: string }>): JavaJudgeResult => {
  const cases = testCases.map((testCase) => {
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
  const hasCompileError = cases.some((testCase) => Boolean(testCase.error?.includes("Compilation")));
  const hasRuntimeError = cases.some((testCase) => Boolean(testCase.error));

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

export async function POST(request: Request) {
  const startedAt = Date.now();
  logger.info("java_judge.request_received", { route: "/api/java-judge" });
  logger.info("java_judge.request_cpu_memory", {
    route: "/api/java-judge",
    cpuUsage: process.cpuUsage(),
    memoryUsageMb: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
  logger.info("java_judge.environment_snapshot", {
    route: "/api/java-judge",
    ...(await collectEnvironmentSnapshot()),
  });

  const body = (await request.json().catch(() => null)) as JavaJudgeRequestBody | null;
  const problemId = typeof body?.problemId === "string" ? body.problemId : "";
  const language = typeof body?.language === "string" ? body.language : "";
  const code = typeof body?.code === "string" ? body.code : "";
  const testCases = Array.isArray(body?.testCases) ? (body.testCases as JavaJudgeTestCase[]) : null;

  if (!problemId) {
    return NextResponse.json({ error: "problemId is required." }, { status: 400 });
  }
  if (language !== "java") {
    return NextResponse.json({ error: "Only Java is supported by this service." }, { status: 400 });
  }
  if (!code.trim()) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }
  if (!testCases?.length) {
    return NextResponse.json({ error: "testCases must be a non-empty array." }, { status: 400 });
  }

  const tempdirStartedAt = Date.now();
  const workdir = await mkdtemp(path.join(tmpdir(), `nexorithm-java-${randomUUID()}-`));
  logger.info("java_judge.tempdir_created", {
    route: "/api/java-judge",
    workdir,
    durationMs: Date.now() - tempdirStartedAt,
  });
  try {
    const compileResult = await compileJava(workdir, code);
    logger.info("java_judge.after_compile_cpu_memory", {
      route: "/api/java-judge",
      cpuUsage: process.cpuUsage(),
      memoryUsageMb: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
    if (!compileResult.ok) {
      const response = NextResponse.json({
        status: "Compilation Error",
        passedCount: 0,
        totalCount: testCases.length,
        runtimeMs: Date.now() - startedAt,
        cases: testCases.map((testCase) => ({
          ...testCase,
          actual: "",
          passed: false,
          error: compileResult.error,
        })),
        message: compileResult.error,
      });
      logger.info("java_judge.response_sent", {
        route: "/api/java-judge",
        durationMs: Date.now() - startedAt,
        status: "Compilation Error",
      });
      return response;
    }

    const results: Array<{ id: number; actual: string; error?: string }> = [];
    for (const testCase of testCases) {
      logger.info("java_judge.testcase_started", { route: "/api/java-judge", testcaseId: testCase.id });
      const testcaseStartedAt = Date.now();
      const executionResult = await runJavaCase(workdir, testCase.input);
      logger.info("java_judge.testcase_finished", {
        route: "/api/java-judge",
        testcaseId: testCase.id,
        durationMs: Date.now() - testcaseStartedAt,
        exitCode: executionResult.execution.exitCode,
        timedOut: executionResult.execution.timedOut,
      });
      results.push({
        id: testCase.id,
        actual: executionResult.execution.stdout,
        error:
          executionResult.error ??
          (executionResult.execution.exitCode === 0
            ? undefined
            : normalizeOutput(executionResult.execution.stderr || `Process exited with code ${executionResult.execution.exitCode}.`)),
      });
    }

    const response = NextResponse.json(buildResult(testCases, startedAt, results));
    logger.info("java_judge.response_sent", {
      route: "/api/java-judge",
      durationMs: Date.now() - startedAt,
      status: "ok",
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const response = NextResponse.json({
      status: "Runtime Error",
      passedCount: 0,
      totalCount: testCases.length,
      runtimeMs: Date.now() - startedAt,
      cases: testCases.map((testCase) => ({
        ...testCase,
        actual: "",
        passed: false,
        error: message,
      })),
      message,
    });
    logger.info("java_judge.response_sent", {
      route: "/api/java-judge",
      durationMs: Date.now() - startedAt,
      status: "Runtime Error",
    });
    return response;
  } finally {
    logger.info("java_judge.before_cleanup", {
      route: "/api/java-judge",
      workdir,
    });
    const cleanupStartedAt = Date.now();
    await rm(workdir, { force: true, recursive: true });
    logger.info("java_judge.after_cleanup", {
      route: "/api/java-judge",
      workdir,
      durationMs: Date.now() - cleanupStartedAt,
    });
  }
}
