import { judgeSubmission } from "@/lib/judge";
import { isJudgeLanguage } from "@/lib/languages";
import { MOCK_PROBLEMS } from "@/lib/mockData";
import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { apiError } from "@/lib/apiResponse";
import { apiSuccess } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import { ensureJudgeBootstrapLogged } from "@/lib/judgeBootstrap";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureJudgeBootstrapLogged();
  const body = await request.json().catch(() => null);
  const problemId = typeof body?.problemId === "string" ? body.problemId : "";
  const language = body?.language;
  const code = typeof body?.code === "string" ? body.code : "";
  const problem = MOCK_PROBLEMS.find((item) => item.id === problemId);

  if (!problem) {
    return apiError("Problem not found.", 404);
  }

  if (!code.trim()) {
    return apiError("Code is required.", 400);
  }

  if (!isJudgeLanguage(language)) {
    return apiError("Unsupported language.", 400);
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    logger.warn("auth.failure", { route: "/api/submissions/run", reason: "missing_user" });
    return apiError("Authentication required.", 401);
  }

  const rateLimit = await checkRateLimit(`run:${clerkUser.id}`);
  if (!rateLimit.allowed) {
    return apiError("Rate limit exceeded.", 429);
  }

  const result = await judgeSubmission(problem, language, code);
  logger.info("submission.run", {
    userId: clerkUser.id,
    problemId: problem.id,
    language,
    status: result.status,
  });
  return apiSuccess({ problemId: problem.id, saved: false, ...result });
}
