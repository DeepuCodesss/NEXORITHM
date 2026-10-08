import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getProblemFromDatabase } from "@/lib/problemCatalog";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = await params;
  const problem = await getProblemFromDatabase(problemId);
  if (!problem) {
    return apiError("Problem not found.", 404);
  }

  const response = apiSuccess({ problem });
  response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
  return response;
}
