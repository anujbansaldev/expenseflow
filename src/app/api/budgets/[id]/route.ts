import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateBudgetSchema } from "@/schemas/budget.schema";
import { budgetService } from "@/services/budget.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const budget = await budgetService.getBudget(id, session.userId);
    return jsonSuccess(budget);
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
    const validated = updateBudgetSchema.parse(body);

    const updated = await budgetService.updateBudget(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Budget updated successfully." });
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
    const deleted = await budgetService.deleteBudget(id, session.userId);
    return jsonSuccess(deleted, { message: "Budget deleted successfully." });
  } catch (error) {
    return jsonError(error);
  }
}
