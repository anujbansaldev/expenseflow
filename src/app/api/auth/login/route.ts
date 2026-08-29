import { NextRequest } from "next/server";
import { loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/rate-limit/rate-limit";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    enforceRateLimit(`login:${ip}`, 10, 60 * 1000);

    const body = await req.json();
    const validated = loginSchema.parse(body);

    const result = await authService.login(validated);
    await setSessionCookie(result.token);

    return jsonSuccess(result.user, { message: "Successfully logged in." });
  } catch (error) {
    return jsonError(error);
  }
}
