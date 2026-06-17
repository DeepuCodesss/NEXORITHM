import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function GET() {
  return apiSuccess({ status: "ok" });
}
