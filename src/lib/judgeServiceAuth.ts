import "server-only";

import { timingSafeEqual } from "node:crypto";
import { currentUser } from "@clerk/nextjs/server";
import { apiError } from "@/lib/apiResponse";

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const authorizeJudgeService = async (request: Request) => {
  const configuredSecret = process.env.JUDGE_SERVICE_SECRET?.trim();
  const providedSecret = request.headers.get("x-judge-service-secret")?.trim() ?? "";

  if (configuredSecret) {
    if (providedSecret && safeEqual(providedSecret, configuredSecret)) return null;
    return apiError("Judge service authentication failed.", 401);
  }

  const clerkUser = await currentUser();
  if (clerkUser) return null;
  return apiError("Judge service is not configured.", 503);
};
