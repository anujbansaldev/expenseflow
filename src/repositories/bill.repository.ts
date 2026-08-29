import { connectToDatabase } from "@/lib/db/mongodb";
import { Bill, IBill } from "@/models/Bill";
import mongoose from "mongoose";

export class BillRepository {
  async findByUserId(
    userId: string | mongoose.Types.ObjectId,
    status?: string
  ): Promise<IBill[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = { userId };
    if (status) {
      query.status = status;
    }
    return Bill.find(query)
      .populate("accountId", "name type currency")
      .populate("categoryId", "name icon colorToken type")
      .sort({ dueDate: 1 })
      .exec();
  }

  async findByIdAndUserId(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IBill | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Bill.findOne({ _id: id, userId })
      .populate("accountId", "name type currency")
      .populate("categoryId", "name icon colorToken type")
      .exec();
  }

  async create(data: {
    userId: string | mongoose.Types.ObjectId;
    name: string;
    amountMinor: number;
    currency?: string;
    accountId?: string | mongoose.Types.ObjectId | null;
    categoryId?: string | mongoose.Types.ObjectId | null;
    dueDate: Date;
    status?: "upcoming" | "paid" | "overdue" | "skipped";
    isRecurring?: boolean;
    recurringFrequency?: "monthly" | "yearly" | "weekly" | null;
    notes?: string;
  }): Promise<IBill> {
    await connectToDatabase();
    const bill = new Bill({
      userId: data.userId,
      name: data.name.trim(),
      amountMinor: data.amountMinor,
      currency: data.currency || "INR",
      accountId: data.accountId || null,
      categoryId: data.categoryId || null,
      dueDate: data.dueDate,
      status: data.status || "upcoming",
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.recurringFrequency || null,
      notes: data.notes?.trim(),
    });
    return bill.save();
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<IBill>
  ): Promise<IBill | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Bill.findOneAndUpdate(
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
  ): Promise<IBill | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) return null;
    return Bill.findOneAndDelete({ _id: id, userId }).exec();
  }
}

export const billRepository = new BillRepository();
