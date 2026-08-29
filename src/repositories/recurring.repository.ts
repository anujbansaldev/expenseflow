import { connectToDatabase } from "@/lib/db/mongodb";
import { RecurringRule, IRecurringRule } from "@/models/RecurringRule";
import mongoose from "mongoose";

export class RecurringRepository {
  async findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IRecurringRule[]> {
    await connectToDatabase();
    return RecurringRule.find({ userId })
      .populate("accountId", "name type currency")
      .populate("categoryId", "name icon colorToken type")
      .sort({ nextRunAt: 1 })
      .exec();
  }

  async findByIdAndUserId(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IRecurringRule | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return RecurringRule.findOne({ _id: id, userId })
      .populate("accountId", "name type currency")
      .populate("categoryId", "name icon colorToken type")
      .exec();
  }

  async findDueRules(now: Date = new Date()): Promise<IRecurringRule[]> {
    await connectToDatabase();
    return RecurringRule.find({
      isActive: true,
      nextRunAt: { $lte: now },
    }).exec();
  }

  async create(data: {
    userId: string | mongoose.Types.ObjectId;
    type: "income" | "expense";
    amountMinor: number;
    currency?: string;
    accountId: string | mongoose.Types.ObjectId;
    categoryId: string | mongoose.Types.ObjectId;
    frequency?: "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;
    startDate: Date;
    endDate?: Date | null;
    nextRunAt: Date;
    merchant?: string;
    notes?: string;
  }): Promise<IRecurringRule> {
    await connectToDatabase();
    const rule = new RecurringRule({
      userId: data.userId,
      type: data.type,
      amountMinor: data.amountMinor,
      currency: data.currency || "INR",
      accountId: data.accountId,
      categoryId: data.categoryId,
      frequency: data.frequency || "monthly",
      interval: data.interval || 1,
      startDate: data.startDate,
      endDate: data.endDate || null,
      nextRunAt: data.nextRunAt,
      merchant: data.merchant?.trim(),
      notes: data.notes?.trim(),
      isActive: true,
    });
    return rule.save();
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<IRecurringRule>
  ): Promise<IRecurringRule | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return RecurringRule.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    )
      .populate("accountId", "name type currency")
      .populate("categoryId", "name icon colorToken type")
      .exec();
  }

  async delete(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IRecurringRule | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return RecurringRule.findOneAndDelete({ _id: id, userId }).exec();
  }
}

export const recurringRepository = new RecurringRepository();
