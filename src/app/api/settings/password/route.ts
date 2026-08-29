import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { changePasswordSchema } from "@/schemas/settings.schema";
import { settingsService } from "@/services/settings.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = changePasswordSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await settingsService.changePassword(
      session.userId,
      validated,
      ip,
      userAgent
    );
    return jsonSuccess(result);
  } catch (error) {
    return jsonError(error);
  }
}
