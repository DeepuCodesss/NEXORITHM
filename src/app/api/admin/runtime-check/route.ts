import { currentUser } from "@clerk/nextjs/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { runJudgeSelfTest } from "@/lib/judge";
import { ensureJudgeBootstrapLogged } from "@/lib/judgeBootstrap";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

const probeVersion = async (command: string, args: string[]) => {
  const { spawn } = await import("child_process");
  return await new Promise<{ found: boolean; version: string }>((resolve) => {
    const child = spawn(command, args, { windowsHide: true, env: { ...process.env, NO_COLOR: "1" } });
    let output = "";
    let done = false;
    const finish = (found: boolean) => {
      if (done) return;
      done = true;
      resolve({ found, version: output.trim().split(/\r?\n/)[0] ?? "" });
    };
    child.stdout.on("data", (chunk) => (output += chunk.toString()));
    child.stderr.on("data", (chunk) => (output += chunk.toString()));
    child.on("error", () => finish(false));
    child.on("close", (code) => finish(code === 0));
  });
};

export async function GET() {
  await ensureJudgeBootstrapLogged();
  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) return apiError("Admin access required.", 403);

  const [node, python, java, javac, gcc, gpp, selfTests] = await Promise.all([
    Promise.resolve({ found: true, version: process.version }),
    probeVersion(process.platform === "win32" ? "py" : "python3", process.platform === "win32" ? ["-3", "--version"] : ["--version"]),
    probeVersion("java", ["-version"]),
    probeVersion("javac", ["-version"]),
    probeVersion("gcc", ["--version"]),
    probeVersion("g++", ["--version"]),
    runJudgeSelfTest(),
  ]);

  console.log(
    JSON.stringify({
      level: "info",
      event: "admin.runtime_check.probe",
      timestamp: new Date().toISOString(),
      node,
      python,
      java,
      javac,
      gcc,
      gpp,
      selfTests: selfTests.map((entry) => ({
        language: entry.language,
        passed: entry.passed,
        status: entry.status,
        executionMode: entry.executionMode,
      })),
    }),
  );

  logger.info("admin.runtime_check", {
    node: node.version,
    python: python.version,
    java: java.version,
    javac: javac.version,
    gcc: gcc.version,
    gpp: gpp.version,
    selfTestsPassed: selfTests.every((entry) => entry.passed),
  });

  const diagnostics = [
    { language: "Node", runtimeFound: node.found, compilerFound: true, version: node.version, executionMode: "native" },
    { language: "Python", runtimeFound: python.found, compilerFound: python.found, version: python.version, executionMode: "native" },
    { language: "Java", runtimeFound: java.found, compilerFound: javac.found, version: java.version, executionMode: "native" },
    { language: "C", runtimeFound: gcc.found, compilerFound: gcc.found, version: gcc.version, executionMode: "native" },
    { language: "C++", runtimeFound: gpp.found, compilerFound: gpp.found, version: gpp.version, executionMode: "native" },
  ];

  return apiSuccess({
    node,
    python,
    java,
    javac,
    gcc,
    gpp,
    diagnostics,
    selfTests,
    allPassing: selfTests.every((entry) => entry.passed) && diagnostics.every((entry) => entry.runtimeFound && entry.compilerFound),
  });
}
