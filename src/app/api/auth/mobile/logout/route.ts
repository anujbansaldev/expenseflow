import { NextRequest } from "next/server";
import { mobileAuthService } from "@/services/mobile-auth.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const refreshToken = body.refreshToken;

    if (refreshToken) {
      await mobileAuthService.logout(refreshToken);
    }

    return jsonSuccess({ loggedOut: true }, { message: "Mobile session revoked successfully" });
  } catch (error) {
    return jsonError(error);
  }
}
