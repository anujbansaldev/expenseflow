import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { createGoalSchema } from "@/schemas/goal.schema";
import { goalService } from "@/services/goal.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const goals = await goalService.listGoals(session.userId, includeArchived);
    return jsonSuccess(goals);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = createGoalSchema.parse(body);

    const goal = await goalService.createGoal(session.userId, validated);
    return jsonSuccess(goal, { message: "Savings goal created." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
