import { judgeSubmission } from "@/lib/judge";
import { isJudgeLanguage } from "@/lib/languages";
import { MOCK_PROBLEMS } from "@/lib/mockData";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const problemId = typeof body?.problemId === "string" ? body.problemId : "";
  const language = body?.language;
  const code = typeof body?.code === "string" ? body.code : "";
  const problem = MOCK_PROBLEMS.find((item) => item.id === problemId);

  if (!problem) {
    return Response.json({ error: "Problem not found." }, { status: 404 });
  }

  if (!code.trim()) {
    return Response.json({ error: "Code is required." }, { status: 400 });
  }

  if (!isJudgeLanguage(language)) {
    return Response.json({ error: "Unsupported language." }, { status: 400 });
  }

  const result = await judgeSubmission(problem, language, code);
  return Response.json({ problemId: problem.id, saved: false, ...result });
}
