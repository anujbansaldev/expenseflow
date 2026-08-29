import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { recurringService } from "@/services/recurring.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(_req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const result = await recurringService.processDueRules(session.userId);
    return jsonSuccess(result, {
      message: `Processed ${result.processed} rules, generated ${result.generated} transactions.`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
