import "server-only";

import { logger } from "@/lib/logger";
import { detectToolchain, runJudgeSelfTest } from "@/lib/judge";

let bootstrapPromise: Promise<void> | null = null;

export const ensureJudgeBootstrapLogged = () => {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const languages: Array<"javascript" | "python" | "java" | "c" | "cpp"> = ["javascript", "python", "java", "c", "cpp"];
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
  })().catch((error) => {
    logger.error("judge.boot_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return bootstrapPromise;
};
