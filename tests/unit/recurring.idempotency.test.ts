import { describe, it, expect, vi } from "vitest";
import { RecurringService, computeNextRun } from "@/services/recurring.service";
import { Transaction } from "@/models/Transaction";

describe("Recurring Rules Scheduling & Idempotency", () => {
  const userId = "64b0f89e2c1e4b001a111111";
  const accountId = "64b0f89e2c1e4b001aaaaaaa";
  const categoryId = "64b0f89e2c1e4b001acccccc";
  const ruleId = "64b0f89e2c1e4b001adddddd";

  it("computes next run dates accurately for various intervals", () => {
    const base = new Date("2026-08-01T00:00:00.000Z");

    const daily = computeNextRun(base, "daily", 1);
    expect(daily.toISOString().split("T")[0]).toBe("2026-08-02");

    const weekly = computeNextRun(base, "weekly", 1);
    expect(weekly.toISOString().split("T")[0]).toBe("2026-08-08");

    const monthly = computeNextRun(base, "monthly", 1);
    expect(monthly.toISOString().split("T")[0]).toBe("2026-09-01");

    const yearly = computeNextRun(base, "yearly", 1);
    expect(yearly.toISOString().split("T")[0]).toBe("2027-08-01");
  });

  it("guarantees idempotency: retry on same rule does not create duplicate transaction", async () => {
    const executedTransactions: any[] = [];

    const mockRule = {
      _id: ruleId,
      userId,
      type: "expense",
      amountMinor: 50000,
      currency: "INR",
      accountId,
      categoryId,
      frequency: "monthly",
      interval: 1,
      nextRunAt: new Date("2026-08-01T00:00:00.000Z"),
      isActive: true,
      merchant: "Netflix",
    };

    const mockRecRepo: any = {
      findDueRules: vi.fn().mockResolvedValue([mockRule]),
      update: vi.fn().mockResolvedValue(mockRule),
    };

    // Spy on Transaction.findOne and Transaction.create
    vi.spyOn(Transaction, "findOne").mockImplementation(((query: any) => ({
      exec: () => {
        const found = executedTransactions.find(
          (t) => t.recurringOccurrenceKey === query.recurringOccurrenceKey
        );
        return Promise.resolve(found || null);
      },
    })) as any);

    vi.spyOn(Transaction, "create").mockImplementation(((data: any) => {
      executedTransactions.push(data);
      return Promise.resolve(data);
    }) as any);

    const service = new RecurringService(mockRecRepo, {} as any, {} as any);

    // First run: Should generate transaction
    const res1 = await service.processDueRules(userId);
    expect(res1.generated).toBe(1);
    expect(executedTransactions.length).toBe(1);

    // Second run (simulated retry on same scheduled execution): Should skip creation
    const res2 = await service.processDueRules(userId);
    expect(res2.generated).toBe(0);
    expect(executedTransactions.length).toBe(1); // No duplicates!
  });
});
