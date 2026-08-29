import { connectToDatabase } from "@/lib/db/mongodb";
import { AuditLog, IAuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

export interface AuditLogDto {
  id: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class AuditService {
  /**
   * Logs a security or domain event safely without leaking sensitive notes, passwords, or tokens.
   */
  async logEvent(
    userId: string | mongoose.Types.ObjectId,
    action: string,
    metadata: Record<string, unknown> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<IAuditLog | null> {
    try {
      await connectToDatabase();

      // Scrub metadata of any sensitive keys
      const safeMetadata: Record<string, unknown> = {};
      const SENSITIVE_KEYS = ["password", "token", "secret", "notes", "description", "hash"];

      for (const [key, value] of Object.entries(metadata)) {
        if (!SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
          safeMetadata[key] = value;
        }
      }

      const log = new AuditLog({
        userId: new mongoose.Types.ObjectId(userId.toString()),
        action,
        ipAddress: ipAddress ? ipAddress.replace(/[^\w.:-]/g, "").slice(0, 45) : undefined,
        userAgent: userAgent ? userAgent.slice(0, 200) : undefined,
        metadata: safeMetadata,
      });

      return await log.save();
    } catch (err) {
      console.error("Failed to write audit log:", err);
      return null;
    }
  }

  async listLogs(userId: string | mongoose.Types.ObjectId, limit = 30): Promise<AuditLogDto[]> {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());
    const logs = await AuditLog.find({ userId: uId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return logs.map((l) => ({
      id: l._id.toString(),
      action: l.action,
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      metadata: l.metadata,
      createdAt: l.createdAt,
    }));
  }
}

export const auditService = new AuditService();
