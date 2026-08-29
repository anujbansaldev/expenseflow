import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateRecurringRuleSchema } from "@/schemas/recurring.schema";
import { recurringService } from "@/services/recurring.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const rule = await recurringService.getRule(id, session.userId);
    return jsonSuccess(rule);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const body = await req.json();
    const validated = updateRecurringRuleSchema.parse(body);

    const updated = await recurringService.updateRule(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Recurring rule updated." });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const deleted = await recurringService.deleteRule(id, session.userId);
    return jsonSuccess(deleted, { message: "Recurring rule deleted." });
  } catch (error) {
    return jsonError(error);
  }
}
