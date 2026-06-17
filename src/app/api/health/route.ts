import { getPrisma } from "@/lib/db";
import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function GET() {
  const prisma = getPrisma();
  const database = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;

  return apiSuccess({
    status: "ok",
    database: Boolean(database[0]?.ok),
    timestamp: new Date().toISOString(),
  });
}
