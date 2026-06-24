import { judgeSubmissionLocal } from "@/lib/judge";
import { isJudgeLanguage } from "@/lib/languages";
import { MOCK_PROBLEMS } from "@/lib/mockData";
import { apiError } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

  const result = await judgeSubmissionLocal(problem, language, code);
  return Response.json(result);
}
