import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { exportCsvSchema } from "@/schemas/report.schema";
import { reportService } from "@/services/report.service";
import { jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);

    const filterInput = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      type: searchParams.get("type") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    };

    const validated = exportCsvSchema.parse(filterInput);
    const csvContent = await reportService.exportCsv(session.userId, validated);

    const filename = `expenseflow_transactions_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
