import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { createAccountSchema } from "@/schemas/account.schema";
import { accountService } from "@/services/account.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const accounts = await accountService.listAccounts(session.userId, includeArchived);
    return jsonSuccess(accounts);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = createAccountSchema.parse(body);

    const account = await accountService.createAccount(session.userId, validated);
    return jsonSuccess(account, { message: "Account created successfully." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
