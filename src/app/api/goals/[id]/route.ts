import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateGoalSchema } from "@/schemas/goal.schema";
import { goalService } from "@/services/goal.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const goal = await goalService.getGoal(id, session.userId);
    return jsonSuccess(goal);
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
    const validated = updateGoalSchema.parse(body);

    const updated = await goalService.updateGoal(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Goal updated successfully." });
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
    const deleted = await goalService.deleteGoal(id, session.userId);
    return jsonSuccess(deleted, { message: "Goal deleted successfully." });
  } catch (error) {
    return jsonError(error);
  }
}
