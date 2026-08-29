import { connectToDatabase } from "@/lib/db/mongodb";
import { Account, IAccount } from "@/models/Account";
import mongoose from "mongoose";

export class AccountRepository {
  async findByUserId(
    userId: string | mongoose.Types.ObjectId,
    includeArchived = false
  ): Promise<IAccount[]> {
    await connectToDatabase();
    const filter: Record<string, unknown> = { userId };
    if (!includeArchived) {
      filter.isArchived = false;
    }
    return Account.find(filter).sort({ createdAt: 1 }).exec();
  }

  async findByIdAndUserId(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<IAccount | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return null;
    }
    return Account.findOne({ _id: id, userId }).exec();
  }

  async create(data: {
    userId: string | mongoose.Types.ObjectId;
    name: string;
    type: string;
    currency: string;
    openingBalanceMinor: number;
    institution?: string;
    last4?: string;
    notes?: string;
  }): Promise<IAccount> {
    await connectToDatabase();
    const account = new Account({
      userId: data.userId,
      name: data.name.trim(),
      type: data.type,
      currency: data.currency,
      openingBalanceMinor: data.openingBalanceMinor,
      institution: data.institution?.trim(),
      last4: data.last4?.trim(),
      notes: data.notes?.trim(),
      isArchived: false,
    });
    return account.save();
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<IAccount>
  ): Promise<IAccount | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return null;
    }
    return Account.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    ).exec();
  }

  async archive(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    isArchived = true
  ): Promise<IAccount | null> {
    return this.update(id, userId, { isArchived });
  }
}

export const accountRepository = new AccountRepository();
