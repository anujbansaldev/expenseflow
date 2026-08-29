import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { reportFilterSchema } from "@/schemas/report.schema";
import { reportService } from "@/services/report.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);

    const filterInput = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      preset: searchParams.get("preset") || undefined,
      type: searchParams.get("type") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    };

    const validated = reportFilterSchema.parse(filterInput);
    const reportData = await reportService.getReportData(session.userId, validated);

    return jsonSuccess(reportData);
  } catch (error) {
    return jsonError(error);
  }
}
