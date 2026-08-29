import { billRepository, BillRepository } from "@/repositories/bill.repository";
import { accountRepository, AccountRepository } from "@/repositories/account.repository";
import { categoryRepository, CategoryRepository } from "@/repositories/category.repository";
import { Transaction } from "@/models/Transaction";
import { parseToMinorUnits } from "@/lib/money/money";
import { CreateBillInput, UpdateBillInput, PayBillInput } from "@/schemas/bill.schema";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/errors";
import { IBill } from "@/models/Bill";
import mongoose from "mongoose";

export interface BillDto {
  id: string;
  name: string;
  amountMinor: number;
  currency: string;
  accountId?: string | null;
  accountName?: string;
  categoryId?: string | null;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  dueDate: Date;
  status: "upcoming" | "paid" | "overdue" | "skipped";
  isRecurring: boolean;
  recurringFrequency?: string | null;
  paidAt?: Date | null;
  paidTransactionId?: string | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BillService {
  constructor(
    private billRepo: BillRepository = billRepository,
    private accRepo: AccountRepository = accountRepository,
    private catRepo: CategoryRepository = categoryRepository
  ) {}

  private mapToDto(bill: IBill): BillDto {
    const accObj = bill.accountId as unknown as { _id?: unknown; name?: string };
    const catObj = bill.categoryId as unknown as {
      _id?: unknown;
      name?: string;
      icon?: string;
      colorToken?: string;
    };

    return {
      id: bill._id.toString(),
      name: bill.name,
      amountMinor: bill.amountMinor,
      currency: bill.currency,
      accountId: accObj?._id ? accObj._id.toString() : bill.accountId ? bill.accountId.toString() : null,
      accountName: accObj?.name,
      categoryId: catObj?._id ? catObj._id.toString() : bill.categoryId ? bill.categoryId.toString() : null,
      categoryName: catObj?.name,
      categoryIcon: catObj?.icon,
      categoryColor: catObj?.colorToken,
      dueDate: bill.dueDate,
      status: bill.status,
      isRecurring: bill.isRecurring,
      recurringFrequency: bill.recurringFrequency,
      paidAt: bill.paidAt,
      paidTransactionId: bill.paidTransactionId ? bill.paidTransactionId.toString() : null,
      notes: bill.notes,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };
  }

  async listBills(userId: string, status?: string): Promise<BillDto[]> {
    const bills = await this.billRepo.findByUserId(userId, status);
    const now = new Date();

    return Promise.all(
      bills.map(async (bill) => {
        // Auto mark as overdue if unpaid and past due
        if (bill.status === "upcoming" && new Date(bill.dueDate) < now) {
          const updated = await this.billRepo.update(bill._id, userId, { status: "overdue" });
          return this.mapToDto(updated || bill);
        }
        return this.mapToDto(bill);
      })
    );
  }

  async getBill(id: string, userId: string): Promise<BillDto> {
    const bill = await this.billRepo.findByIdAndUserId(id, userId);
    if (!bill) throw new NotFoundError("Bill not found.");
    return this.mapToDto(bill);
  }

  async createBill(userId: string, input: CreateBillInput): Promise<BillDto> {
    const amountMinor = parseToMinorUnits(input.amount);
    if (amountMinor <= 0) {
      throw new ValidationError("Amount must be greater than zero.");
    }

    let accId: mongoose.Types.ObjectId | null = null;
    if (input.accountId) {
      const acc = await this.accRepo.findByIdAndUserId(input.accountId, userId);
      if (!acc) throw new NotFoundError("Account not found.");
      accId = new mongoose.Types.ObjectId(input.accountId);
    }

    let catId: mongoose.Types.ObjectId | null = null;
    if (input.categoryId) {
      const cat = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
      if (!cat) throw new NotFoundError("Category not found.");
      catId = new mongoose.Types.ObjectId(input.categoryId);
    }

    const created = await this.billRepo.create({
      userId,
      name: input.name,
      amountMinor,
      currency: input.currency || "INR",
      accountId: accId,
      categoryId: catId,
      dueDate: input.dueDate,
      isRecurring: input.isRecurring,
      recurringFrequency: input.recurringFrequency,
      notes: input.notes,
    });

    const populated = await this.billRepo.findByIdAndUserId(created._id, userId);
    return this.mapToDto(populated || created);
  }

  async updateBill(
    id: string,
    userId: string,
    input: UpdateBillInput
  ): Promise<BillDto> {
    const existing = await this.billRepo.findByIdAndUserId(id, userId);
    if (!existing) throw new NotFoundError("Bill not found.");

    const updates: Partial<IBill> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.dueDate !== undefined) updates.dueDate = input.dueDate;
    if (input.status !== undefined) updates.status = input.status;
    if (input.isRecurring !== undefined) updates.isRecurring = input.isRecurring;
    if (input.recurringFrequency !== undefined) updates.recurringFrequency = input.recurringFrequency;
    if (input.notes !== undefined) updates.notes = input.notes;

    if (input.amount !== undefined) {
      const amountMinor = parseToMinorUnits(input.amount);
      if (amountMinor <= 0) throw new ValidationError("Amount must be greater than zero.");
      updates.amountMinor = amountMinor;
    }

    if (input.accountId !== undefined) {
      if (input.accountId) {
        const acc = await this.accRepo.findByIdAndUserId(input.accountId, userId);
        if (!acc) throw new NotFoundError("Account not found.");
        updates.accountId = new mongoose.Types.ObjectId(input.accountId);
      } else {
        updates.accountId = null;
      }
    }

    if (input.categoryId !== undefined) {
      if (input.categoryId) {
        const cat = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
        if (!cat) throw new NotFoundError("Category not found.");
        updates.categoryId = new mongoose.Types.ObjectId(input.categoryId);
      } else {
        updates.categoryId = null;
      }
    }

    const updated = await this.billRepo.update(id, userId, updates);
    if (!updated) throw new NotFoundError("Bill not found.");
    return this.mapToDto(updated);
  }

  async deleteBill(id: string, userId: string): Promise<BillDto> {
    const deleted = await this.billRepo.delete(id, userId);
    if (!deleted) throw new NotFoundError("Bill not found.");
    return this.mapToDto(deleted);
  }

  /**
   * Mark bill as paid: creates ledger expense and updates bill status without double counting
   */
  async markPaid(
    id: string,
    userId: string,
    input: Partial<PayBillInput> = {}
  ): Promise<BillDto> {
    const bill = await this.billRepo.findByIdAndUserId(id, userId);
    if (!bill) throw new NotFoundError("Bill not found.");

    if (bill.status === "paid") {
      throw new ConflictError("This bill is already marked as paid.");
    }

    const accountId = input.accountId || (bill.accountId ? bill.accountId.toString() : null);
    const categoryId = input.categoryId || (bill.categoryId ? bill.categoryId.toString() : null);

    let paidTxId: mongoose.Types.ObjectId | null = null;

    if (accountId && categoryId) {
      // Record ledger expense transaction
      const tx = await Transaction.create({
        userId,
        type: "expense",
        amountMinor: bill.amountMinor,
        currency: bill.currency,
        accountId: new mongoose.Types.ObjectId(accountId),
        categoryId: new mongoose.Types.ObjectId(categoryId),
        occurredAt: input.paidAt || new Date(),
        merchant: bill.name,
        description: `Bill Payment: ${bill.name}`,
        notes: bill.notes,
        source: "manual",
      });
      paidTxId = tx._id;
    }

    const updated = await this.billRepo.update(id, userId, {
      status: "paid",
      paidAt: input.paidAt || new Date(),
      paidTransactionId: paidTxId,
      ...(accountId ? { accountId: new mongoose.Types.ObjectId(accountId) } : {}),
      ...(categoryId ? { categoryId: new mongoose.Types.ObjectId(categoryId) } : {}),
    });

    if (!updated) throw new NotFoundError("Bill not found.");
    return this.mapToDto(updated);
  }
}

export const billService = new BillService();
