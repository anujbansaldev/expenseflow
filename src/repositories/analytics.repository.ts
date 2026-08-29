import { connectToDatabase } from "@/lib/db/mongodb";
import { Transaction } from "@/models/Transaction";
import mongoose from "mongoose";

export interface CashFlowTrendPoint {
  date: string;
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
}

export interface CategorySpendingPoint {
  categoryId: string;
  categoryName: string;
  icon?: string;
  colorToken?: string;
  amountMinor: number;
  count: number;
  percentage: number;
}

export class AnalyticsRepository {
  async getCashFlowTrend(
    userId: string | mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<CashFlowTrendPoint[]> {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          type: { $in: ["income", "expense"] }, // Transfers strictly excluded
          occurredAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" } },
          incomeMinor: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amountMinor", 0],
            },
          },
          expenseMinor: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amountMinor", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((item) => ({
      date: item._id,
      incomeMinor: item.incomeMinor || 0,
      expenseMinor: item.expenseMinor || 0,
      netMinor: (item.incomeMinor || 0) - (item.expenseMinor || 0),
    }));
  }

  async getCategorySpending(
    userId: string | mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<CategorySpendingPoint[]> {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          type: "expense",
          occurredAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          amountMinor: { $sum: "$amountMinor" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $sort: { amountMinor: -1 } },
    ]);

    const totalExpenseMinor = result.reduce(
      (sum, item) => sum + (item.amountMinor || 0),
      0
    );

    return result.map((item) => {
      const amount = item.amountMinor || 0;
      const percentage =
        totalExpenseMinor > 0 ? (amount / totalExpenseMinor) * 100 : 0;

      return {
        categoryId: item._id ? item._id.toString() : "uncategorized",
        categoryName: item.category?.name || "Uncategorized",
        icon: item.category?.icon || "Tags",
        colorToken: item.category?.colorToken || "#f43f5e",
        amountMinor: amount,
        count: item.count || 0,
        percentage: Number(percentage.toFixed(1)),
      };
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
