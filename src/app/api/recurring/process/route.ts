import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { recurringService } from "@/services/recurring.service";
import { jsonSuccess, jsonError, UnauthorizedError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // 1. Check if triggered by an authorized automated CRON job
    if (
      cronSecret &&
      authHeader &&
      authHeader.startsWith("Bearer ") &&
      authHeader.slice(7) === cronSecret
    ) {
      const result = await recurringService.processDueRules();
      return jsonSuccess(result, {
        message: `Cron execution: processed ${result.processed} rules, generated ${result.generated} transactions.`,
      });
    }

    // 2. Otherwise authenticate interactive user session
    const session = await getSessionUser();
    if (!session) {
      throw new UnauthorizedError("Authentication required to process recurring rules.");
    }

    const result = await recurringService.processDueRules(session.userId);
    return jsonSuccess(result, {
      message: `Processed ${result.processed} rules, generated ${result.generated} transactions.`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
