import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { transactionService } from "@/services/transaction.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const summary = await transactionService.getCashFlowSummary(
      session.userId,
      startDate,
      endDate
    );
    return jsonSuccess(summary);
  } catch (error) {
    return jsonError(error);
  }
}
