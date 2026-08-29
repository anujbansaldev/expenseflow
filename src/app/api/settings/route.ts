import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateSettingsSchema } from "@/schemas/settings.schema";
import { settingsService } from "@/services/settings.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET() {
  try {
    const session = await requireAuthUser();
    const data = await settingsService.getUserSettings(session.userId);
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = updateSettingsSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const data = await settingsService.updateUserSettings(
      session.userId,
      validated,
      ip,
      userAgent
    );
    return jsonSuccess(data, { message: "Preferences updated." });
  } catch (error) {
    return jsonError(error);
  }
}
