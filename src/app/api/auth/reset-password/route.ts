import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { enforceRateLimit } from "@/lib/rate-limit/rate-limit";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    enforceRateLimit(`reset-pw:${ip}`, 5, 60 * 1000);

    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);

    const result = await authService.resetPassword(validated);
    return jsonSuccess(result);
  } catch (error) {
    return jsonError(error);
  }
}
