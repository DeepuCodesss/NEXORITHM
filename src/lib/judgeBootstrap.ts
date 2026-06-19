import "server-only";

import { logger } from "@/lib/logger";
import { detectToolchain, runJudgeSelfTest } from "@/lib/judge";

let bootstrapPromise: Promise<void> | null = null;

export const ensureJudgeBootstrapLogged = () => {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const languages: Array<"javascript" | "python" | "java" | "c" | "cpp"> = ["javascript", "python", "java", "c", "cpp"];
    logger.info("judge.bootstrap_start", {
      nodeVersion: process.version,
      skipEnvValidation: process.env.SKIP_ENV_VALIDATION ?? null,
      executionMode: process.env.JUDGE_USE_DOCKER === "true" ? "docker-preferred" : "native-preferred",
    });
    const [toolchains, selfTests] = await Promise.all([
      Promise.all(languages.map((language) => detectToolchain(language))),
      runJudgeSelfTest(),
    ]);

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
      }),
    );
  })().catch((error) => {
    logger.error("judge.boot_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return bootstrapPromise;
};
