import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { createRecurringRuleSchema } from "@/schemas/recurring.schema";
import { recurringService } from "@/services/recurring.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET() {
  try {
    const session = await requireAuthUser();
    const rules = await recurringService.listRules(session.userId);
    return jsonSuccess(rules);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = createRecurringRuleSchema.parse(body);

    const rule = await recurringService.createRule(session.userId, validated);
    return jsonSuccess(rule, { message: "Recurring rule created successfully." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
