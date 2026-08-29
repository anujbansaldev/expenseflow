import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { enforceRateLimit } from "@/lib/rate-limit/rate-limit";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    enforceRateLimit(`forgot-pw:${ip}`, 5, 60 * 1000);

    const body = await req.json();
    const validated = forgotPasswordSchema.parse(body);

    const result = await authService.forgotPassword(validated);
    return jsonSuccess(result);
  } catch (error) {
    return jsonError(error);
  }
}
