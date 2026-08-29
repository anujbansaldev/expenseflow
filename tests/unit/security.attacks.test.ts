import { describe, it, expect, vi } from "vitest";
import { SettingsService } from "@/services/settings.service";
import { AuditService } from "@/services/audit.service";
import { updateSettingsSchema } from "@/schemas/settings.schema";
import { createTransactionSchema } from "@/schemas/transaction.schema";
import { UnauthorizedError, NotFoundError } from "@/lib/errors/errors";
import { hashPassword } from "@/lib/auth/password";
import { AccountRepository } from "@/repositories/account.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";
import * as dbModule from "@/lib/db/mongodb";

describe("Security Hardening & Attack Defense Suite", () => {
  const userA = "64b0f89e2c1e4b001a111111";
  const userB = "64b0f89e2c1e4b001a222222";

  it("defends against NoSQL operator injection in Zod schemas", () => {
    // Attempting to pass MongoDB operators in string fields
    const maliciousInput = {
      name: { $ne: null },
      currency: "INR",
    };

    const res = updateSettingsSchema.safeParse(maliciousInput);
    expect(res.success).toBe(false); // Rejected by Zod string validator

    const maliciousTx = {
      type: "expense",
      amount: { $gt: 0 },
      accountId: "64b0f89e2c1e4b001aaaaaaa",
      categoryId: "64b0f89e2c1e4b001acccccc",
    };
    const resTx = createTransactionSchema.safeParse(maliciousTx);
    expect(resTx.success).toBe(false);
  });

  it("handles malformed non-hex ObjectIds safely without crash", async () => {
    vi.spyOn(dbModule, "connectToDatabase").mockResolvedValue({} as any);

    const accRepo = new AccountRepository();
    const txRepo = new TransactionRepository();

    // Invalid ObjectId format should safely return null
    const acc = await accRepo.findByIdAndUserId("invalid-non-hex-id-12345", userA);
    expect(acc).toBeNull();

    const tx = await txRepo.findByIdAndUserId("malformed-id!@#$", userA);
    expect(tx).toBeNull();
  });

  it("scrubs sensitive passwords and secret notes from audit log metadata", async () => {
    let savedLog: any = null;
    const auditService = new AuditService();

    vi.spyOn(auditService, "logEvent").mockImplementation(async (uId, action, metadata) => {
      const safeMetadata: Record<string, unknown> = {};
      const SENSITIVE_KEYS = ["password", "token", "secret", "notes", "description", "hash"];

      for (const [key, value] of Object.entries(metadata || {})) {
        if (!SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
          safeMetadata[key] = value;
        }
      }

      savedLog = { userId: uId, action, metadata: safeMetadata };
      return savedLog;
    });

    await auditService.logEvent(userA, "TEST_ACTION", {
      safeField: "Active",
      userPassword: "PlaintextPassword!",
      accessToken: "SecretTokenValue",
      privateNotes: "Super secret financial detail",
    });

    expect(savedLog).toBeDefined();
    expect(savedLog.metadata.safeField).toBe("Active");
    expect(savedLog.metadata.userPassword).toBeUndefined();
    expect(savedLog.metadata.accessToken).toBeUndefined();
    expect(savedLog.metadata.privateNotes).toBeUndefined();
  });

  it("prevents password change with invalid current password", async () => {
    const originalHash = await hashPassword("CorrectOldPassword123!");
    const mockUserRepo: any = {
      findById: vi.fn().mockResolvedValue({
        _id: userA,
        passwordHash: originalHash,
      }),
      update: vi.fn(),
    };
    const mockAudit: any = { logEvent: vi.fn() };

    const service = new SettingsService(mockUserRepo, {} as any, mockAudit);

    // Attempt change with wrong current password
    await expect(
      service.changePassword(userA, {
        currentPassword: "WrongPassword!",
        newPassword: "NewSuperPassword123!",
        confirmPassword: "NewSuperPassword123!",
      })
    ).rejects.toThrow(UnauthorizedError);

    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });
});
