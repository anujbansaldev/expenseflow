import { clearSessionCookie } from "@/lib/auth/session";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonSuccess({ success: true }, { message: "Successfully logged out." });
  } catch (error) {
    return jsonError(error);
  }
}
