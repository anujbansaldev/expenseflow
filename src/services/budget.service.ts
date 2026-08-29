import { budgetRepository, BudgetRepository } from "@/repositories/budget.repository";
import { categoryRepository, CategoryRepository } from "@/repositories/category.repository";
import { parseToMinorUnits } from "@/lib/money/money";
import { CreateBudgetInput, UpdateBudgetInput } from "@/schemas/budget.schema";
import { NotFoundError, ValidationError } from "@/lib/errors/errors";
import { getDateRangeFromPreset } from "@/lib/dates/dates";
import { IBudget } from "@/models/Budget";
import mongoose from "mongoose";

export interface BudgetDto {
  id: string;
  name: string;
  categoryId?: string | null;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  limitAmountMinor: number;
  spentMinor: number;
  remainingMinor: number;
  progressPercent: number;
  currency: string;
  period: string;
  warningThreshold: number;
  isWarning: boolean;
  isExceeded: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BudgetService {
  constructor(
    private budgetRepo: BudgetRepository = budgetRepository,
    private catRepo: CategoryRepository = categoryRepository
  ) {}

  private async mapToDto(budget: IBudget, userId: string): Promise<BudgetDto> {
    const catObj = budget.categoryId as unknown as {
      _id?: unknown;
      name?: string;
      icon?: string;
      colorToken?: string;
    };

    const { startDate, endDate } = getDateRangeFromPreset("this_month");
    const spentMinor = await this.budgetRepo.getSpentForBudget(
      userId,
      budget.categoryId ? budget.categoryId.toString() : null,
      startDate,
      endDate
    );

    const limit = budget.limitAmountMinor;
    const remainingMinor = Math.max(0, limit - spentMinor);
    const progressPercent = limit > 0 ? Number(((spentMinor / limit) * 100).toFixed(1)) : 0;
    const isExceeded = spentMinor > limit;
    const isWarning = !isExceeded && progressPercent >= budget.warningThreshold;

    return {
      id: budget._id.toString(),
      name: budget.name,
      categoryId: catObj?._id ? catObj._id.toString() : budget.categoryId ? budget.categoryId.toString() : null,
      categoryName: catObj?.name || (budget.categoryId ? undefined : "Overall Budget"),
      categoryIcon: catObj?.icon,
      categoryColor: catObj?.colorToken,
      limitAmountMinor: limit,
      spentMinor,
      remainingMinor,
      progressPercent,
      currency: budget.currency,
      period: budget.period,
      warningThreshold: budget.warningThreshold,
      isWarning,
      isExceeded,
      isActive: budget.isActive,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  }

  async listBudgets(userId: string): Promise<BudgetDto[]> {
    const budgets = await this.budgetRepo.findByUserId(userId);
    return Promise.all(budgets.map((b) => this.mapToDto(b, userId)));
  }

  async getBudget(id: string, userId: string): Promise<BudgetDto> {
    const budget = await this.budgetRepo.findByIdAndUserId(id, userId);
    if (!budget) throw new NotFoundError("Budget not found.");
    return this.mapToDto(budget, userId);
  }

  async createBudget(userId: string, input: CreateBudgetInput): Promise<BudgetDto> {
    const limitMinor = parseToMinorUnits(input.limitAmount);
    if (limitMinor <= 0) {
      throw new ValidationError("Limit amount must be greater than zero.");
    }

    let catId: mongoose.Types.ObjectId | null = null;
    if (input.categoryId) {
      const category = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
      if (!category) throw new NotFoundError("Category not found.");
      if (category.type !== "expense") {
        throw new ValidationError("Budgets can only be set on expense categories.");
      }
      catId = new mongoose.Types.ObjectId(input.categoryId);
    }

    const created = await this.budgetRepo.create({
      userId,
      name: input.name,
      categoryId: catId,
      limitAmountMinor: limitMinor,
      currency: input.currency || "INR",
      period: input.period,
      warningThreshold: input.warningThreshold,
      isActive: input.isActive,
    });

    return this.mapToDto(created, userId);
  }

  async updateBudget(
    id: string,
    userId: string,
    input: UpdateBudgetInput
  ): Promise<BudgetDto> {
    const existing = await this.budgetRepo.findByIdAndUserId(id, userId);
    if (!existing) throw new NotFoundError("Budget not found.");

    const updates: Partial<IBudget> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.warningThreshold !== undefined) updates.warningThreshold = input.warningThreshold;
    if (input.isActive !== undefined) updates.isActive = input.isActive;

    if (input.limitAmount !== undefined) {
      const limitMinor = parseToMinorUnits(input.limitAmount);
      if (limitMinor <= 0) throw new ValidationError("Limit amount must be greater than zero.");
      updates.limitAmountMinor = limitMinor;
    }

    if (input.categoryId !== undefined) {
      if (input.categoryId) {
        const category = await this.catRepo.findByIdAndUserId(input.categoryId, userId);
        if (!category) throw new NotFoundError("Category not found.");
        if (category.type !== "expense") throw new ValidationError("Budgets must be expense categories.");
        updates.categoryId = new mongoose.Types.ObjectId(input.categoryId);
      } else {
        updates.categoryId = null;
      }
    }

    const updated = await this.budgetRepo.update(id, userId, updates);
    if (!updated) throw new NotFoundError("Budget not found.");
    return this.mapToDto(updated, userId);
  }

  async deleteBudget(id: string, userId: string): Promise<BudgetDto> {
    const deleted = await this.budgetRepo.delete(id, userId);
    if (!deleted) throw new NotFoundError("Budget not found.");
    return this.mapToDto(deleted, userId);
  }
}

export const budgetService = new BudgetService();
