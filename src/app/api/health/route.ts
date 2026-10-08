import { apiSuccess } from "@/lib/apiResponse";
import { apiError } from "@/lib/apiResponse";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return apiSuccess({ status: "ok", database: "ok" });
  } catch (error) {
    return apiError(error instanceof Error ? `Database unavailable: ${error.message}` : "Database unavailable.", 503);
  }
}
