import { NextResponse } from "next/server";
import { MOCK_PROBLEMS } from "@/lib/mockData";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = await params;
  const problem = MOCK_PROBLEMS.find((item) => item.id === problemId);
  if (!problem) {
    return NextResponse.json({ success: false, error: "Problem not found." }, { status: 404 });
  }

  return NextResponse.json(
    { success: true, data: { problem } },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
  );
}
