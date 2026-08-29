import { NextRequest } from "next/server";
import { registerSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/rate-limit/rate-limit";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    enforceRateLimit(`register:${ip}`, 5, 60 * 1000);

    const body = await req.json();
    const validated = registerSchema.parse(body);

    const result = await authService.register(validated);
    await setSessionCookie(result.token);

    return jsonSuccess(result.user, { message: "Account successfully created." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
