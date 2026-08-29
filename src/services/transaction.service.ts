import { transactionRepository, TransactionRepository, PaginatedResult } from "@/repositories/transaction.repository";
import { accountRepository, AccountRepository } from "@/repositories/account.repository";
import { categoryRepository, CategoryRepository } from "@/repositories/category.repository";
import { parseToMinorUnits } from "@/lib/money/money";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from "@/schemas/transaction.schema";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/errors";
import { ITransaction } from "@/models/Transaction";
import mongoose from "mongoose";

export interface TransactionDto {
  id: string;
  type: "income" | "expense" | "transfer";
  amountMinor: number;
  currency: string;
  accountId: string;
  accountName?: string;
  destinationAccountId?: string | null;
  destinationAccountName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  occurredAt: Date;
  merchant?: string;
  description?: string;
  notes?: string;
  tags: string[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionService {
  constructor(
    private txRepo: TransactionRepository = transactionRepository,
    private accRepo: AccountRepository = accountRepository,
    private catRepo: CategoryRepository = categoryRepository
  ) {}

  private mapToDto(tx: ITransaction): TransactionDto {
    const accObj = tx.accountId as unknown as { _id?: unknown; name?: string };
    const destObj = tx.destinationAccountId as unknown as { _id?: unknown; name?: string };
    const catObj = tx.categoryId as unknown as {
      _id?: unknown;
      name?: string;
      icon?: string;
      colorToken?: string;
    };

    return {
      id: tx._id.toString(),
      type: tx.type,
      amountMinor: tx.amountMinor,
      currency: tx.currency,
      accountId: accObj?._id ? accObj._id.toString() : tx.accountId.toString(),
      accountName: accObj?.name,
      destinationAccountId: destObj?._id
        ? destObj._id.toString()
        : tx.destinationAccountId
        ? tx.destinationAccountId.toString()
        : null,
      destinationAccountName: destObj?.name,
      categoryId: catObj?._id
        ? catObj._id.toString()
        : tx.categoryId
        ? tx.categoryId.toString()
        : null,
      categoryName: catObj?.name,
      categoryIcon: catObj?.icon,
      categoryColor: catObj?.colorToken,
      occurredAt: tx.occurredAt,
      merchant: tx.merchant,
      description: tx.description,
      notes: tx.notes,
      tags: tx.tags || [],
      source: tx.source,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }

  async createTransaction(
    userId: string,
    input: CreateTransactionInput
  ): Promise<TransactionDto> {
    // 1. Parse and validate amount minor
    let amountMinor: number;
    try {
      amountMinor = parseToMinorUnits(input.amount);
    } catch {
      throw new ValidationError("Invalid monetary amount.", {
        amount: ["Please enter a valid numeric amount"],
      });
    }

    if (amountMinor <= 0) {
      throw new ValidationError("Transaction amount must be strictly greater than zero.", {
        amount: ["Amount must be greater than zero"],
      });
    }

    // 2. Validate source account ownership
    const sourceAccount = await this.accRepo.findByIdAndUserId(input.accountId, userId);
    if (!sourceAccount) {
      throw new NotFoundError("Source account not found or not accessible.");
    }
    if (sourceAccount.isArchived) {
      throw new ValidationError("Cannot create transactions on an archived account.");
    }

    // 3. Validate transfer destination or category
    let destAccountObjectId: mongoose.Types.ObjectId | null = null;
    let categoryObjectId: mongoose.Types.ObjectId | null = null;

    if (input.type === "transfer") {
      if (!input.destinationAccountId) {
        throw new ValidationError("Destination account is required for transfers.");
      }
      if (input.destinationAccountId === input.accountId) {
        throw new ValidationError("Source and destination accounts must be different.");
      }

      const destAccount = await this.accRepo.findByIdAndUserId(
        input.destinationAccountId,
        userId
      );
      if (!destAccount) {
        throw new NotFoundError("Destination account not found or not accessible.");
      }
      if (destAccount.isArchived) {
        throw new ValidationError("Cannot transfer into an archived account.");
      }
      destAccountObjectId = new mongoose.Types.ObjectId(input.destinationAccountId);
    } else {
      if (!input.categoryId) {
        throw new ValidationError(`Category is required for ${input.type} transactions.`);
      }

      const category = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
      if (!category) {
        throw new NotFoundError("Category not found or not accessible.");
      }
      if (category.type !== input.type) {
        throw new ValidationError(
          `Category "${category.name}" is an ${category.type} category, but transaction is marked as ${input.type}.`
        );
      }
      categoryObjectId = new mongoose.Types.ObjectId(input.categoryId);
    }

    const created = await this.txRepo.create({
      userId,
      type: input.type,
      amountMinor,
      currency: input.currency || sourceAccount.currency || "INR",
      accountId: new mongoose.Types.ObjectId(input.accountId),
      destinationAccountId: destAccountObjectId,
      categoryId: categoryObjectId,
      occurredAt: input.occurredAt || new Date(),
      merchant: input.merchant,
      description: input.description,
      notes: input.notes,
      tags: input.tags,
    });

    // Populate for clean response
    const populated = await this.txRepo.findByIdAndUserId(created._id, userId);
    return this.mapToDto(populated || created);
  }

  async listTransactions(
    userId: string,
    filters: TransactionFilterInput
  ): Promise<PaginatedResult<TransactionDto>> {
    const result = await this.txRepo.findPaginated(userId, filters);
    return {
      items: result.items.map((tx) => this.mapToDto(tx)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getTransaction(id: string, userId: string): Promise<TransactionDto> {
    const tx = await this.txRepo.findByIdAndUserId(id, userId);
    if (!tx) {
      throw new NotFoundError("Transaction not found.");
    }
    return this.mapToDto(tx);
  }

  async updateTransaction(
    id: string,
    userId: string,
    input: UpdateTransactionInput
  ): Promise<TransactionDto> {
    const existing = await this.txRepo.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new NotFoundError("Transaction not found.");
    }

    const updates: Partial<ITransaction> = {};

    if (input.type) {
      updates.type = input.type;
    }

    if (input.amount !== undefined) {
      const amountMinor = parseToMinorUnits(input.amount);
      if (amountMinor <= 0) {
        throw new ValidationError("Amount must be greater than zero.");
      }
      updates.amountMinor = amountMinor;
    }

    if (input.accountId) {
      const sourceAcc = await this.accRepo.findByIdAndUserId(input.accountId, userId);
      if (!sourceAcc) throw new NotFoundError("Source account not found.");
      updates.accountId = new mongoose.Types.ObjectId(input.accountId);
    }

    if (input.destinationAccountId !== undefined) {
      if (input.destinationAccountId) {
        const destAcc = await this.accRepo.findByIdAndUserId(input.destinationAccountId, userId);
        if (!destAcc) throw new NotFoundError("Destination account not found.");
        updates.destinationAccountId = new mongoose.Types.ObjectId(input.destinationAccountId);
      } else {
        updates.destinationAccountId = undefined;
      }
    }

    if (input.categoryId !== undefined) {
      if (input.categoryId) {
        const cat = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
        if (!cat) throw new NotFoundError("Category not found.");
        updates.categoryId = new mongoose.Types.ObjectId(input.categoryId);
      } else {
        updates.categoryId = undefined;
      }
    }

    if (input.occurredAt) updates.occurredAt = input.occurredAt;
    if (input.merchant !== undefined) updates.merchant = input.merchant;
    if (input.description !== undefined) updates.description = input.description;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.tags !== undefined) updates.tags = input.tags;

    const updated = await this.txRepo.update(id, userId, updates);
    if (!updated) throw new NotFoundError("Transaction not found.");

    return this.mapToDto(updated);
  }

  async deleteTransaction(id: string, userId: string): Promise<TransactionDto> {
    const deleted = await this.txRepo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("Transaction not found.");
    }
    return this.mapToDto(deleted);
  }

  async getCashFlowSummary(userId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.txRepo.getCashFlowSummary(userId, start, end);
  }

  /**
   * Helper to derive dynamic balance for any account
   */
  async calculateAccountBalance(accountId: string, userId: string): Promise<number> {
    const account = await this.accRepo.findByIdAndUserId(accountId, userId);
    if (!account) {
      throw new NotFoundError("Account not found.");
    }
    const delta = await this.txRepo.getAccountLedgerDelta(accountId, userId);
    return account.openingBalanceMinor + delta;
  }
}

export const transactionService = new TransactionService();
