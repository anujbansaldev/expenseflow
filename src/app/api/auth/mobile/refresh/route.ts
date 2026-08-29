import { NextRequest } from "next/server";
import { mobileAuthService } from "@/services/mobile-auth.service";
import { jsonSuccess, jsonError, ValidationError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const body = await req.json();

    const refreshToken = body.refreshToken;
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new ValidationError("Valid refreshToken string is required.");
    }

    const deviceId = req.headers.get("x-device-id") || body.deviceId;
    const deviceName = req.headers.get("x-device-name") || body.deviceName;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await mobileAuthService.refreshToken(refreshToken, {
      deviceId,
      deviceName,
      ipAddress: ip,
      userAgent,
    });

    return jsonSuccess(result, { message: "Token refreshed successfully" });
  } catch (error) {
    return jsonError(error);
  }
}
