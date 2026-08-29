import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { contributeGoalSchema } from "@/schemas/goal.schema";
import { goalService } from "@/services/goal.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const body = await req.json();
    const validated = contributeGoalSchema.parse(body);

    const updated = await goalService.addContribution(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Contribution added successfully!" });
  } catch (error) {
    return jsonError(error);
  }
}
