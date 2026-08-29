import { requireAuthUser } from "@/lib/auth/session";
import { authService } from "@/services/auth.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET() {
  try {
    const session = await requireAuthUser();
    const result = await authService.getMe(session.userId);
    return jsonSuccess(result);
  } catch (error) {
    return jsonError(error);
  }
}
