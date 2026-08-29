import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateAccountSchema } from "@/schemas/account.schema";
import { accountService } from "@/services/account.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const account = await accountService.getAccount(id, session.userId);
    return jsonSuccess(account);
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
    const validated = updateAccountSchema.parse(body);

    const updated = await accountService.updateAccount(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Account updated successfully." });
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
    const archived = await accountService.archiveAccount(id, session.userId, true);
    return jsonSuccess(archived, { message: "Account archived successfully." });
  } catch (error) {
    return jsonError(error);
  }
}
