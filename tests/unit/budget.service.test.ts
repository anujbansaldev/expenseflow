import { describe, it, expect, vi } from "vitest";
import { BudgetService } from "@/services/budget.service";

describe("Budget Service Expense-Only Calculations & Thresholds", () => {
  const userId = "64b0f89e2c1e4b001a111111";
  const categoryId = "64b0f89e2c1e4b001acccccc";

  it("calculates budget progress, warning threshold (80%), and exceeded (>100%) flags", async () => {
    const mockBudgetRepo: any = {
      findByUserId: vi.fn().mockResolvedValue([
        {
          _id: "budget-1",
          name: "Groceries Budget",
          categoryId: { _id: categoryId, name: "Groceries" },
          limitAmountMinor: 1000000, // ₹10,000.00
          currency: "INR",
          period: "monthly",
          warningThreshold: 80,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      getSpentForBudget: vi.fn().mockImplementation((_uId, _catId) => {
        // Spent ₹8,500.00 (85% of budget)
        return Promise.resolve(850000);
      }),
    };

    const mockCatRepo: any = {};
    const service = new BudgetService(mockBudgetRepo, mockCatRepo);

    const [budget] = await service.listBudgets(userId);

    expect(budget.limitAmountMinor).toBe(1000000);
    expect(budget.spentMinor).toBe(850000);
    expect(budget.remainingMinor).toBe(150000);
    expect(budget.progressPercent).toBe(85.0);
    expect(budget.isWarning).toBe(true);
    expect(budget.isExceeded).toBe(false);
  });

  it("flags budget as exceeded when spending exceeds 100%", async () => {
    const mockBudgetRepo: any = {
      findByUserId: vi.fn().mockResolvedValue([
        {
          _id: "budget-2",
          name: "Dining Out",
          categoryId: { _id: categoryId, name: "Dining" },
          limitAmountMinor: 500000, // ₹5,000.00
          currency: "INR",
          period: "monthly",
          warningThreshold: 80,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      getSpentForBudget: vi.fn().mockResolvedValue(550000), // 110%
    };

    const mockCatRepo: any = {};
    const service = new BudgetService(mockBudgetRepo, mockCatRepo);

    const [budget] = await service.listBudgets(userId);

    expect(budget.progressPercent).toBe(110.0);
    expect(budget.isWarning).toBe(false);
    expect(budget.isExceeded).toBe(true);
    expect(budget.remainingMinor).toBe(0);
  });
});
