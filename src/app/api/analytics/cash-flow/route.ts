import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { analyticsService } from "@/services/analytics.service";
import { DateRangePreset } from "@/lib/dates/dates";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const preset = (searchParams.get("preset") || "this_month") as DateRangePreset;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await analyticsService.getAnalyticsData(
      session.userId,
      preset,
      startDate,
      endDate
    );

    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error);
  }
}
