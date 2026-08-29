import { describe, it, expect, vi } from "vitest";
import { GoalService } from "@/services/goal.service";
import { ValidationError } from "@/lib/errors/errors";

describe("Savings Goal Milestone & Contribution Engine", () => {
  const userId = "64b0f89e2c1e4b001a111111";
  const goalId = "64b0f89e2c1e4b001abbbbbb";

  it("calculates progress percentage and marks goal completed when target met", async () => {
    const mockGoal = {
      _id: goalId,
      userId,
      name: "Emergency Fund",
      targetAmountMinor: 1000000, // ₹10,000.00
      currentAmountMinor: 750000, // ₹7,500.00 (75%)
      currency: "INR",
      isArchived: false,
      contributions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockGoalRepo: any = {
      findByIdAndUserId: vi.fn().mockResolvedValue(mockGoal),
    };

    const service = new GoalService(mockGoalRepo);
    const goal = await service.getGoal(goalId, userId);

    expect(goal.progressPercent).toBe(75.0);
    expect(goal.remainingMinor).toBe(250000);
    expect(goal.isCompleted).toBe(false);
  });

  it("prevents negative contribution amounts", async () => {
    const service = new GoalService({} as any);

    await expect(
      service.addContribution(goalId, userId, {
        amount: "-500",
      })
    ).rejects.toThrow(ValidationError);
  });
});
