import { connectToDatabase } from "@/lib/db/mongodb";
import { Goal, IGoal } from "@/models/Goal";
import mongoose from "mongoose";

export class GoalRepository {
  async findByUserId(
    userId: string | mongoose.Types.ObjectId,
    includeArchived = false
  ): Promise<IGoal[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = { userId };
    if (!includeArchived) {
      query.isArchived = false;
    }
    return Goal.find(query).sort({ targetDate: 1, createdAt: -1 }).exec();
  }

  async findByIdAndUserId(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IGoal | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Goal.findOne({ _id: id, userId }).exec();
  }

  async create(data: {
    userId: string | mongoose.Types.ObjectId;
    name: string;
    targetAmountMinor: number;
    currentAmountMinor?: number;
    currency?: string;
    targetDate?: Date | null;
    colorToken?: string;
    icon?: string;
  }): Promise<IGoal> {
    await connectToDatabase();
    const goal = new Goal({
      userId: data.userId,
      name: data.name.trim(),
      targetAmountMinor: data.targetAmountMinor,
      currentAmountMinor: data.currentAmountMinor || 0,
      currency: data.currency || "INR",
      targetDate: data.targetDate || null,
      colorToken: data.colorToken || "#6366f1",
      icon: data.icon || "Target",
      isArchived: false,
      contributions: [],
    });
    return goal.save();
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<IGoal>
  ): Promise<IGoal | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Goal.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    ).exec();
  }

  async addContribution(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    contribution: {
      amountMinor: number;
      date: Date;
      notes?: string;
      accountId?: string | mongoose.Types.ObjectId | null;
    }
  ): Promise<IGoal | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Goal.findOneAndUpdate(
      { _id: id, userId },
      {
        $inc: { currentAmountMinor: contribution.amountMinor },
        $push: {
          contributions: {
            amountMinor: contribution.amountMinor,
            date: contribution.date,
            notes: contribution.notes,
            accountId: contribution.accountId
              ? new mongoose.Types.ObjectId(contribution.accountId.toString())
              : null,
          },
        },
      },
      { new: true }
    ).exec();
  }

  async delete(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IGoal | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Goal.findOneAndDelete({ _id: id, userId }).exec();
  }
}

export const goalRepository = new GoalRepository();
