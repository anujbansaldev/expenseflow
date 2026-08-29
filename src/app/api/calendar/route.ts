import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { calendarService } from "@/services/calendar.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);

    const now = new Date();
    const year = parseInt(searchParams.get("year") || now.getFullYear().toString(), 10);
    const month = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString(), 10);

    const dayMap = await calendarService.getMonthEvents(session.userId, year, month);
    return jsonSuccess(dayMap);
  } catch (error) {
    return jsonError(error);
  }
}
