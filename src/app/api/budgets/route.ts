import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { createBudgetSchema } from "@/schemas/budget.schema";
import { budgetService } from "@/services/budget.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET() {
  try {
    const session = await requireAuthUser();
    const budgets = await budgetService.listBudgets(session.userId);
    return jsonSuccess(budgets);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = createBudgetSchema.parse(body);

    const budget = await budgetService.createBudget(session.userId, validated);
    return jsonSuccess(budget, { message: "Budget created successfully." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
