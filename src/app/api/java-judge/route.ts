import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { NextResponse } from "next/server";

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

const runProcess = (
  command: string,
  args: string[],
  cwd: string,
  input: string,
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean; spawnError?: string }> =>
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
      resolve({ stdout, stderr, exitCode, timedOut, spawnError });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });

const compileAndRun = async (workdir: string, code: string, input: string) => {
  await writeFile(path.join(workdir, "Main.java"), `${code}\n`, "utf8");

  const compile = await runProcess("javac", ["Main.java"], workdir, "", 15000);
  if (compile.spawnError || compile.timedOut || compile.exitCode !== 0) {
    return {
      execution: compile,
      error:
        compile.spawnError ??
        (compile.timedOut ? "Execution timed out." : normalizeOutput(compile.stderr || "Compilation failed.")),
    };
  }

  const execution = await runProcess("java", ["-cp", ".", "Main"], workdir, input, 12000);
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

  const workdir = await mkdtemp(path.join(tmpdir(), `nexorithm-java-${randomUUID()}-`));
  try {
    const results: Array<{ id: number; actual: string; error?: string }> = [];
    for (const testCase of testCases) {
      const executionResult = await compileAndRun(workdir, code, testCase.input);
      results.push({
        id: testCase.id,
        actual: executionResult.execution.stdout,
        error: executionResult.error ?? (executionResult.execution.exitCode === 0 ? undefined : normalizeOutput(executionResult.execution.stderr || `Process exited with code ${executionResult.execution.exitCode}.`)),
      });
      if (executionResult.error?.includes("Compilation")) {
        break;
      }
    }

    return NextResponse.json(buildResult(testCases, startedAt, results));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
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
  } finally {
    await rm(workdir, { force: true, recursive: true });
  }
}
