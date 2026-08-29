import { describe, it, expect, vi } from "vitest";
import { AccountService } from "@/services/account.service";
import { CategoryService } from "@/services/category.service";
import { NotFoundError } from "@/lib/errors/errors";

describe("Cross-User Ownership Authorization", () => {
  const userA = "64b0f89e2c1e4b001a111111";
  const userB = "64b0f89e2c1e4b001a222222";
  const accountOfUserB = "64b0f89e2c1e4b001abbbbbb";
  const categoryOfUserB = "64b0f89e2c1e4b001acccccc";

  const mockTxRepo: any = {
    getAccountLedgerDelta: vi.fn().mockResolvedValue(0),
  };

  it("prevents User A from viewing User B's account", async () => {
    const mockRepo: any = {
      findByIdAndUserId: vi.fn().mockImplementation((id: string, userId: string) => {
        // Only returns if owner matches
        if (id === accountOfUserB && userId === userB) {
          return Promise.resolve({
            _id: accountOfUserB,
            userId: userB,
            name: "User B Secret Account",
            type: "bank",
            currency: "INR",
            openingBalanceMinor: 100000,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      }),
    };

    const service = new AccountService(mockRepo, mockTxRepo);

    // User B can access their own account
    const accB = await service.getAccount(accountOfUserB, userB);
    expect(accB.name).toBe("User B Secret Account");

    // User A attempting to access User B's account ID receives NotFoundError (404)
    await expect(service.getAccount(accountOfUserB, userA)).rejects.toThrow(NotFoundError);
    expect(mockRepo.findByIdAndUserId).toHaveBeenCalledWith(accountOfUserB, userA);
  });

  it("prevents User A from updating or archiving User B's account", async () => {
    const mockRepo: any = {
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
      archive: vi.fn().mockResolvedValue(null),
    };

    const service = new AccountService(mockRepo, mockTxRepo);

    await expect(
      service.updateAccount(accountOfUserB, userA, { name: "Hacked Name" })
    ).rejects.toThrow(NotFoundError);

    await expect(
      service.archiveAccount(accountOfUserB, userA, true)
    ).rejects.toThrow(NotFoundError);
  });

  it("prevents User A from viewing, updating or archiving User B's category", async () => {
    const mockRepo: any = {
      findByIdAndUserId: vi.fn().mockImplementation((id: string, userId: string) => {
        if (id === categoryOfUserB && userId === userB) {
          return Promise.resolve({
            _id: categoryOfUserB,
            userId: userB,
            name: "User B Custom Category",
            type: "expense",
            isSystemDefault: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      }),
      update: vi.fn().mockResolvedValue(null),
      archive: vi.fn().mockResolvedValue(null),
    };

    const service = new CategoryService(mockRepo);

    const catB = await service.getCategory(categoryOfUserB, userB);
    expect(catB.name).toBe("User B Custom Category");

    await expect(service.getCategory(categoryOfUserB, userA)).rejects.toThrow(NotFoundError);
    await expect(
      service.updateCategory(categoryOfUserB, userA, { name: "Hacked" })
    ).rejects.toThrow(NotFoundError);
    await expect(
      service.archiveCategory(categoryOfUserB, userA, true)
    ).rejects.toThrow(NotFoundError);
  });
});
