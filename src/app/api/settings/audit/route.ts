import { requireAuthUser } from "@/lib/auth/session";
import { auditService } from "@/services/audit.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET() {
  try {
    const session = await requireAuthUser();
    const logs = await auditService.listLogs(session.userId, 25);
    return jsonSuccess(logs);
  } catch (error) {
    return jsonError(error);
  }
}
