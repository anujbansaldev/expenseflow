import { NextRequest } from "next/server";
import { registerSchema } from "@/schemas/auth.schema";
import { mobileAuthService } from "@/services/mobile-auth.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";
import { rateLimit } from "@/lib/rate-limit/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const isAllowed = await rateLimit(`mobile-reg:${ip}`, 5, 60);
    if (!isAllowed) {
      return jsonError(new Error("Too many registration attempts. Please try again in 1 minute."));
    }

    const body = await req.json();
    const validated = registerSchema.parse(body);

    const deviceId = req.headers.get("x-device-id") || body.deviceId;
    const deviceName = req.headers.get("x-device-name") || body.deviceName;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await mobileAuthService.register(validated, {
      deviceId,
      deviceName,
      ipAddress: ip,
      userAgent,
    });

    return jsonSuccess(result, { message: "Account created successfully" }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
