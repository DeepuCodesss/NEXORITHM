import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const apiSuccess = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const apiError = (message: string, status: number) =>
  NextResponse.json({ success: false, error: message, errorId: randomUUID() }, { status });
