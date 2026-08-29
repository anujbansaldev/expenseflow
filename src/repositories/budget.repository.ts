import { connectToDatabase } from "@/lib/db/mongodb";
import { Budget, IBudget } from "@/models/Budget";
import { Transaction } from "@/models/Transaction";
import mongoose from "mongoose";

export class BudgetRepository {
  async findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IBudget[]> {
    await connectToDatabase();
    return Budget.find({ userId })
      .populate("categoryId", "name icon colorToken type")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByIdAndUserId(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IBudget | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Budget.findOne({ _id: id, userId })
      .populate("categoryId", "name icon colorToken type")
      .exec();
  }

  async create(data: {
    userId: string | mongoose.Types.ObjectId;
    name: string;
    categoryId?: string | mongoose.Types.ObjectId | null;
    limitAmountMinor: number;
    currency?: string;
    period?: "monthly" | "weekly" | "yearly";
    warningThreshold?: number;
    isActive?: boolean;
  }): Promise<IBudget> {
    await connectToDatabase();
    const budget = new Budget({
      userId: data.userId,
      name: data.name.trim(),
      categoryId: data.categoryId || null,
      limitAmountMinor: data.limitAmountMinor,
      currency: data.currency || "INR",
      period: data.period || "monthly",
      warningThreshold: data.warningThreshold || 80,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    return budget.save();
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<IBudget>
  ): Promise<IBudget | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Budget.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    )
      .populate("categoryId", "name icon colorToken type")
      .exec();
  }

  async delete(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IBudget | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Budget.findOneAndDelete({ _id: id, userId }).exec();
  }

  /**
   * Computes the actual expense spent in minor units for a budget within the date range.
   * If categoryId is specified, filters by that category.
   * Otherwise (overall budget), sums all expenses.
   */
  async getSpentForBudget(
    userId: string | mongoose.Types.ObjectId,
    categoryId: string | mongoose.Types.ObjectId | null | undefined,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());
    const match: Record<string, unknown> = {
      userId: uId,
      type: "expense", // Strictly expense transactions
      occurredAt: { $gte: startDate, $lte: endDate },
    };

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId.toString())) {
      match.categoryId = new mongoose.Types.ObjectId(categoryId.toString());
    }

    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amountMinor" },
        },
      },
    ]);

    return result.length > 0 ? (result[0].totalSpent as number) : 0;
  }
}

export const budgetRepository = new BudgetRepository();
