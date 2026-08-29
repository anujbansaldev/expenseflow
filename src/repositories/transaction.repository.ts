import { connectToDatabase } from "@/lib/db/mongodb";
import { Transaction, ITransaction } from "@/models/Transaction";
import { TransactionFilterInput } from "@/schemas/transaction.schema";
import mongoose from "mongoose";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TransactionRepository {
  async create(data: {
    userId: string | mongoose.Types.ObjectId;
    type: "income" | "expense" | "transfer";
    amountMinor: number;
    currency: string;
    accountId: string | mongoose.Types.ObjectId;
    destinationAccountId?: string | mongoose.Types.ObjectId | null;
    categoryId?: string | mongoose.Types.ObjectId | null;
    occurredAt: Date;
    merchant?: string;
    description?: string;
    notes?: string;
    tags?: string[];
    source?: "manual" | "recurring" | "import" | "system";
  }): Promise<ITransaction> {
    await connectToDatabase();
    const transaction = new Transaction({
      userId: data.userId,
      type: data.type,
      amountMinor: data.amountMinor,
      currency: data.currency,
      accountId: data.accountId,
      destinationAccountId: data.destinationAccountId || undefined,
      categoryId: data.categoryId || undefined,
      occurredAt: data.occurredAt,
      merchant: data.merchant?.trim(),
      description: data.description?.trim(),
      notes: data.notes?.trim(),
      tags: data.tags || [],
      source: data.source || "manual",
    });
    return transaction.save();
  }

  async findByIdAndUserId(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<ITransaction | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return null;
    }
    return Transaction.findOne({ _id: id, userId })
      .populate("accountId", "name type currency")
      .populate("destinationAccountId", "name type currency")
      .populate("categoryId", "name type icon colorToken")
      .exec();
  }

  async findPaginated(
    userId: string | mongoose.Types.ObjectId,
    filters: TransactionFilterInput
  ): Promise<PaginatedResult<ITransaction>> {
    await connectToDatabase();
    const query: Record<string, unknown> = { userId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.accountId && mongoose.Types.ObjectId.isValid(filters.accountId)) {
      query.$or = [
        { accountId: filters.accountId },
        { destinationAccountId: filters.accountId },
      ];
    }

    if (filters.categoryId && mongoose.Types.ObjectId.isValid(filters.categoryId)) {
      query.categoryId = filters.categoryId;
    }

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) {
        dateFilter.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateFilter.$lte = new Date(filters.endDate);
      }
      query.occurredAt = dateFilter;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      const searchConditions = [
        { merchant: searchRegex },
        { description: searchRegex },
        { notes: searchRegex },
        { tags: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const skip = (filters.page - 1) * filters.limit;
    const sort: Record<string, 1 | -1> = {
      [filters.sortBy]: filters.sortOrder === "asc" ? 1 : -1,
      _id: -1,
    };

    const [items, total] = await Promise.all([
      Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(filters.limit)
        .populate("accountId", "name type currency")
        .populate("destinationAccountId", "name type currency")
        .populate("categoryId", "name type icon colorToken")
        .exec(),
      Transaction.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit) || 1,
    };
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<ITransaction>
  ): Promise<ITransaction | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return null;
    }
    return Transaction.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    )
      .populate("accountId", "name type currency")
      .populate("destinationAccountId", "name type currency")
      .populate("categoryId", "name type icon colorToken")
      .exec();
  }

  async delete(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<ITransaction | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return null;
    }
    return Transaction.findOneAndDelete({ _id: id, userId }).exec();
  }

  /**
   * Calculates the net balance delta produced by the ledger for a specific account.
   */
  async getAccountLedgerDelta(
    accountId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<number> {
    await connectToDatabase();
    const accId = new mongoose.Types.ObjectId(accountId.toString());
    const uId = new mongoose.Types.ObjectId(userId.toString());

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          $or: [{ accountId: accId }, { destinationAccountId: accId }],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $switch: {
                branches: [
                  // Income to this account: +amount
                  {
                    case: {
                      $and: [
                        { $eq: ["$type", "income"] },
                        { $eq: ["$accountId", accId] },
                      ],
                    },
                    then: "$amountMinor",
                  },
                  // Expense from this account: -amount
                  {
                    case: {
                      $and: [
                        { $eq: ["$type", "expense"] },
                        { $eq: ["$accountId", accId] },
                      ],
                    },
                    then: { $multiply: ["$amountMinor", -1] },
                  },
                  // Transfer OUT from this account: -amount
                  {
                    case: {
                      $and: [
                        { $eq: ["$type", "transfer"] },
                        { $eq: ["$accountId", accId] },
                      ],
                    },
                    then: { $multiply: ["$amountMinor", -1] },
                  },
                  // Transfer IN to this account: +amount
                  {
                    case: {
                      $and: [
                        { $eq: ["$type", "transfer"] },
                        { $eq: ["$destinationAccountId", accId] },
                      ],
                    },
                    then: "$amountMinor",
                  },
                ],
                default: 0,
              },
            },
          },
        },
      },
    ]);

    return result.length > 0 ? (result[0].total as number) : 0;
  }

  /**
   * Calculates cash flow summary (total income, total expense, net flow) excluding transfers.
   */
  async getCashFlowSummary(
    userId: string | mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ incomeMinor: number; expenseMinor: number; netFlowMinor: number }> {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());
    const match: Record<string, unknown> = {
      userId: uId,
      type: { $in: ["income", "expense"] }, // Transfers strictly excluded
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      match.occurredAt = dateFilter;
    }

    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
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
    ]);

    if (result.length === 0) {
      return { incomeMinor: 0, expenseMinor: 0, netFlowMinor: 0 };
    }

    const incomeMinor = result[0].incomeMinor || 0;
    const expenseMinor = result[0].expenseMinor || 0;
    const netFlowMinor = incomeMinor - expenseMinor;

    return { incomeMinor, expenseMinor, netFlowMinor };
  }
}

export const transactionRepository = new TransactionRepository();
