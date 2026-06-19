import { currentUser } from "@clerk/nextjs/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { detectToolchain } from "@/lib/judge";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();
  if (clerkUser?.publicMetadata?.role !== "admin") {
    return apiError("Admin access required.", 403);
  }

  const diagnostics = await Promise.all(
    SUPPORTED_LANGUAGES.filter((language) => ["javascript", "python", "java", "c", "cpp"].includes(language.id)).map(async (language) => {
      if (language.id === "javascript") {
        return {
          language: language.label,
          runtimeFound: true,
          compilerFound: true,
          version: process.version,
          executionMode: "worker",
        };
      }
      const status = await detectToolchain(language.id as "python" | "java" | "c" | "cpp");
      return {
        language: language.label,
        runtimeFound: status.runtimeFound,
        compilerFound: status.compilerFound,
        version: status.runtimeVersion || status.compilerVersion || "unknown",
        executionMode: status.executionMode,
        runtimePath: status.runtimePath,
        compilerPath: status.compilerPath,
      };
    }),
  );

  return apiSuccess({ diagnostics });
}
