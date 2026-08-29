import { NextRequest } from "next/server";
import { loginSchema } from "@/schemas/auth.schema";
import { mobileAuthService } from "@/services/mobile-auth.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";
import { rateLimit } from "@/lib/rate-limit/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const isAllowed = await rateLimit(`mobile-login:${ip}`, 10, 60);
    if (!isAllowed) {
      return jsonError(new Error("Too many login attempts. Please try again in 1 minute."));
    }

    const body = await req.json();
    const validated = loginSchema.parse(body);

    const deviceId = req.headers.get("x-device-id") || body.deviceId;
    const deviceName = req.headers.get("x-device-name") || body.deviceName;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await mobileAuthService.login(validated, {
      deviceId,
      deviceName,
      ipAddress: ip,
      userAgent,
    });

    return jsonSuccess(result, { message: "Login successful" });
  } catch (error) {
    return jsonError(error);
  }
}
