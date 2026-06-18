import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

export async function GET(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) return apiError("Admin access required.", 403);
  if (!isAdmin(clerkUser)) return apiError("Admin access required.", 403);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(10, Number(searchParams.get("pageSize") ?? 20)));
  const skip = (page - 1) * pageSize;
  const prisma = getPrisma();
  const [total, replays] = await Promise.all([
    prisma.solutionReplay.count(),
    prisma.solutionReplay.findMany({
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        solveTimeSeconds: true,
        language: true,
        pasteCount: true,
        pastedCharacters: true,
        runCount: true,
        tabSwitchCount: true,
        createdAt: true,
        user: { select: { username: true, fullName: true } },
        problem: { select: { title: true, slug: true } },
      },
    }),
  ]);

  return apiSuccess({
    replays,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
