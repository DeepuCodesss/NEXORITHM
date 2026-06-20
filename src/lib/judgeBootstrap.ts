import "server-only";

import { logger } from "@/lib/logger";
import { detectToolchain, runJudgeSelfTest } from "@/lib/judge";

let bootstrapPromise: Promise<void> | null = null;
const isRemoteJavaJudgeConfigured = () => Boolean(process.env.JAVA_JUDGE_SERVICE_URL?.trim());
const isProduction = () => process.env.NODE_ENV === "production";

export const ensureJudgeBootstrapLogged = () => {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const languages: Array<"javascript" | "python" | "java" | "c" | "cpp"> = isRemoteJavaJudgeConfigured()
      ? ["javascript", "python", "c", "cpp"]
      : ["javascript", "python", "java", "c", "cpp"];
    const shouldRunSelfTests = !isProduction();
    const bootstrapStartedAt = Date.now();
    logger.info("judge.bootstrap_start", {
      nodeVersion: process.version,
      skipEnvValidation: process.env.SKIP_ENV_VALIDATION ?? null,
      executionMode: process.env.JUDGE_USE_DOCKER === "true" ? "docker-preferred" : "native-preferred",
      remoteJavaConfigured: isRemoteJavaJudgeConfigured(),
      runSelfTests: shouldRunSelfTests,
    });
    const toolchains = await Promise.all(languages.map((language) => detectToolchain(language)));
    const selfTests = shouldRunSelfTests ? await runJudgeSelfTest() : [];

    for (const toolchain of toolchains) {
      logger.info("judge.boot", {
        language: toolchain.language,
        runtimeFound: toolchain.runtimeFound,
        compilerFound: toolchain.compilerFound,
        version: toolchain.runtimeVersion ?? toolchain.compilerVersion ?? "unknown",
        executionMode: toolchain.executionMode,
      });
    }

    logger.info("judge.boot_self_test", {
      results: selfTests.map((result) => ({
        language: result.language,
        passed: result.passed,
        status: result.status,
        executionMode: result.executionMode,
      })),
    });

    console.log(
      JSON.stringify({
        level: "info",
        event: "judge.bootstrap_summary",
        timestamp: new Date().toISOString(),
        toolchains: toolchains.map((toolchain) => ({
          language: toolchain.language,
          runtimeFound: toolchain.runtimeFound,
          compilerFound: toolchain.compilerFound,
          runtimeVersion: toolchain.runtimeVersion,
        compilerVersion: toolchain.compilerVersion,
        executionMode: toolchain.executionMode,
      })),
        selfTests: selfTests.map((result) => ({
          language: result.language,
          passed: result.passed,
          status: result.status,
          executionMode: result.executionMode,
        })),
        durationMs: Date.now() - bootstrapStartedAt,
      }),
    );
  })().catch((error) => {
    logger.error("judge.boot_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return bootstrapPromise;
};
