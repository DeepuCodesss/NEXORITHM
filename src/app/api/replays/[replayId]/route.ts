import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ replayId: string }> }) {
  const { replayId } = await params;
  const prisma = getPrisma();
  const replay = await prisma.solutionReplay.findUnique({
    where: { id: replayId },
    select: {
      id: true,
      problemId: true,
      submissionId: true,
      language: true,
      replayData: true,
      solveTimeSeconds: true,
      pasteCount: true,
      pastedCharacters: true,
      runCount: true,
      tabSwitchCount: true,
      createdAt: true,
      user: { select: { username: true, fullName: true, avatarUrl: true } },
      problem: { select: { title: true, slug: true } },
    },
  });

  if (!replay) return apiError("Replay not found.", 404);
  return apiSuccess({ replay });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ replayId: string }> }) {
  const clerkUser = await currentUser();
  if (!clerkUser?.publicMetadata || clerkUser.publicMetadata.role !== "admin") {
    return apiError("Admin access required.", 403);
  }
  const { replayId } = await params;
  const prisma = getPrisma();
  await prisma.solutionReplay.delete({ where: { id: replayId } });
  return apiSuccess({ deleted: true });
}
