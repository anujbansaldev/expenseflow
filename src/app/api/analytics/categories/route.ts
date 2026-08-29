import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { getDateRangeFromPreset, DateRangePreset } from "@/lib/dates/dates";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const preset = (searchParams.get("preset") || "this_month") as DateRangePreset;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      const range = getDateRangeFromPreset(preset);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const categories = await analyticsRepository.getCategorySpending(
      session.userId,
      startDate,
      endDate
    );

    return jsonSuccess(categories);
  } catch (error) {
    return jsonError(error);
  }
}
