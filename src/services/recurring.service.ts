import { recurringRepository, RecurringRepository } from "@/repositories/recurring.repository";
import { accountRepository, AccountRepository } from "@/repositories/account.repository";
import { categoryRepository, CategoryRepository } from "@/repositories/category.repository";
import { Transaction } from "@/models/Transaction";
import { parseToMinorUnits } from "@/lib/money/money";
import { CreateRecurringRuleInput, UpdateRecurringRuleInput } from "@/schemas/recurring.schema";
import { NotFoundError, ValidationError } from "@/lib/errors/errors";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { IRecurringRule } from "@/models/RecurringRule";
import mongoose from "mongoose";

export interface RecurringRuleDto {
  id: string;
  type: "income" | "expense";
  amountMinor: number;
  currency: string;
  accountId: string;
  accountName?: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  frequency: string;
  interval: number;
  startDate: Date;
  endDate?: Date | null;
  nextRunAt: Date;
  lastRunAt?: Date | null;
  isActive: boolean;
  merchant?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function computeNextRun(
  current: Date,
  frequency: "daily" | "weekly" | "monthly" | "yearly",
  interval: number = 1
): Date {
  switch (frequency) {
    case "daily":
      return addDays(current, interval);
    case "weekly":
      return addWeeks(current, interval);
    case "monthly":
      return addMonths(current, interval);
    case "yearly":
      return addYears(current, interval);
    default:
      return addMonths(current, interval);
  }
}

export class RecurringService {
  constructor(
    private recRepo: RecurringRepository = recurringRepository,
    private accRepo: AccountRepository = accountRepository,
    private catRepo: CategoryRepository = categoryRepository
  ) {}

  private mapToDto(rule: IRecurringRule): RecurringRuleDto {
    const accObj = rule.accountId as unknown as { _id?: unknown; name?: string };
    const catObj = rule.categoryId as unknown as {
      _id?: unknown;
      name?: string;
      icon?: string;
      colorToken?: string;
    };

    return {
      id: rule._id.toString(),
      type: rule.type,
      amountMinor: rule.amountMinor,
      currency: rule.currency,
      accountId: accObj?._id ? accObj._id.toString() : rule.accountId.toString(),
      accountName: accObj?.name,
      categoryId: catObj?._id ? catObj._id.toString() : rule.categoryId.toString(),
      categoryName: catObj?.name,
      categoryIcon: catObj?.icon,
      categoryColor: catObj?.colorToken,
      frequency: rule.frequency,
      interval: rule.interval,
      startDate: rule.startDate,
      endDate: rule.endDate,
      nextRunAt: rule.nextRunAt,
      lastRunAt: rule.lastRunAt,
      isActive: rule.isActive,
      merchant: rule.merchant,
      notes: rule.notes,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  async listRules(userId: string): Promise<RecurringRuleDto[]> {
    const rules = await this.recRepo.findByUserId(userId);
    return rules.map((r) => this.mapToDto(r));
  }

  async getRule(id: string, userId: string): Promise<RecurringRuleDto> {
    const rule = await this.recRepo.findByIdAndUserId(id, userId);
    if (!rule) throw new NotFoundError("Recurring rule not found.");
    return this.mapToDto(rule);
  }

  async createRule(
    userId: string,
    input: CreateRecurringRuleInput
  ): Promise<RecurringRuleDto> {
    const amountMinor = parseToMinorUnits(input.amount);
    if (amountMinor <= 0) {
      throw new ValidationError("Amount must be greater than zero.");
    }

    const account = await this.accRepo.findByIdAndUserId(input.accountId, userId);
    if (!account) throw new NotFoundError("Account not found.");

    const category = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
    if (!category) throw new NotFoundError("Category not found.");
    if (category.type !== input.type) {
      throw new ValidationError(
        `Category "${category.name}" is ${category.type}, but recurring rule is ${input.type}.`
      );
    }

    const startDate = input.startDate || new Date();

    const created = await this.recRepo.create({
      userId,
      type: input.type,
      amountMinor,
      currency: input.currency || account.currency || "INR",
      accountId: new mongoose.Types.ObjectId(input.accountId),
      categoryId: new mongoose.Types.ObjectId(input.categoryId),
      frequency: input.frequency,
      interval: input.interval,
      startDate,
      endDate: input.endDate,
      nextRunAt: startDate,
      merchant: input.merchant,
      notes: input.notes,
    });

    const populated = await this.recRepo.findByIdAndUserId(created._id, userId);
    return this.mapToDto(populated || created);
  }

  async updateRule(
    id: string,
    userId: string,
    input: UpdateRecurringRuleInput
  ): Promise<RecurringRuleDto> {
    const existing = await this.recRepo.findByIdAndUserId(id, userId);
    if (!existing) throw new NotFoundError("Recurring rule not found.");

    const updates: Partial<IRecurringRule> = {};
    if (input.isActive !== undefined) updates.isActive = input.isActive;
    if (input.frequency !== undefined) updates.frequency = input.frequency;
    if (input.interval !== undefined) updates.interval = input.interval;
    if (input.merchant !== undefined) updates.merchant = input.merchant;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.endDate !== undefined) updates.endDate = input.endDate;

    if (input.amount !== undefined) {
      const amountMinor = parseToMinorUnits(input.amount);
      if (amountMinor <= 0) throw new ValidationError("Amount must be greater than zero.");
      updates.amountMinor = amountMinor;
    }

    if (input.accountId) {
      const acc = await this.accRepo.findByIdAndUserId(input.accountId, userId);
      if (!acc) throw new NotFoundError("Account not found.");
      updates.accountId = new mongoose.Types.ObjectId(input.accountId);
    }

    if (input.categoryId) {
      const cat = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
      if (!cat) throw new NotFoundError("Category not found.");
      updates.categoryId = new mongoose.Types.ObjectId(input.categoryId);
    }

    const updated = await this.recRepo.update(id, userId, updates);
    if (!updated) throw new NotFoundError("Recurring rule not found.");
    return this.mapToDto(updated);
  }

  async deleteRule(id: string, userId: string): Promise<RecurringRuleDto> {
    const deleted = await this.recRepo.delete(id, userId);
    if (!deleted) throw new NotFoundError("Recurring rule not found.");
    return this.mapToDto(deleted);
  }

  /**
   * Idempotent Processor Engine:
   * Processes all active rules whose nextRunAt <= now.
   * Generates unique occurrence key per date and writes transactions without duplicate risk.
   */
  async processDueRules(targetUserId?: string): Promise<{ processed: number; generated: number }> {
    const now = new Date();
    const dueRules = await this.recRepo.findDueRules(now);
    const filteredRules = targetUserId
      ? dueRules.filter((r) => r.userId.toString() === targetUserId)
      : dueRules;

    let generatedCount = 0;

    for (const rule of filteredRules) {
      const dateKey = rule.nextRunAt.toISOString().split("T")[0];
      const occurrenceKey = `${rule._id.toString()}_${dateKey}`;

      // Check idempotency key in Transaction collection
      const existingTx = await Transaction.findOne({
        userId: rule.userId,
        recurringOccurrenceKey: occurrenceKey,
      }).exec();

      if (!existingTx) {
        try {
          await Transaction.create({
            userId: rule.userId,
            type: rule.type,
            amountMinor: rule.amountMinor,
            currency: rule.currency,
            accountId: rule.accountId,
            categoryId: rule.categoryId,
            occurredAt: rule.nextRunAt,
            merchant: rule.merchant,
            description: `Recurring ${rule.type} (${rule.frequency})`,
            notes: rule.notes,
            source: "recurring",
            recurringRuleId: rule._id,
            recurringOccurrenceKey: occurrenceKey,
          });
          generatedCount++;
        } catch (err: any) {
          // If unique key collision occurred due to concurrent race, skip safely
          if (err.code !== 11000) {
            console.error("Error creating recurring transaction:", err);
          }
        }
      }

      // Compute next scheduled execution
      const nextRun = computeNextRun(rule.nextRunAt, rule.frequency, rule.interval);
      const isPastEnd = rule.endDate ? nextRun > rule.endDate : false;

      await this.recRepo.update(rule._id, rule.userId, {
        lastRunAt: rule.nextRunAt,
        nextRunAt: nextRun,
        isActive: !isPastEnd && rule.isActive,
      });
    }

    return {
      processed: filteredRules.length,
      generated: generatedCount,
    };
  }
}

export const recurringService = new RecurringService();
