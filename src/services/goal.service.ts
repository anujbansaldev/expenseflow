import { goalRepository, GoalRepository } from "@/repositories/goal.repository";
import { parseToMinorUnits } from "@/lib/money/money";
import { CreateGoalInput, UpdateGoalInput, ContributeGoalInput } from "@/schemas/goal.schema";
import { NotFoundError, ValidationError } from "@/lib/errors/errors";
import { differenceInDays } from "date-fns";
import { IGoal } from "@/models/Goal";

export interface GoalContributionDto {
  id: string;
  amountMinor: number;
  date: Date;
  notes?: string;
  accountId?: string | null;
}

export interface GoalDto {
  id: string;
  name: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  remainingMinor: number;
  progressPercent: number;
  isCompleted: boolean;
  currency: string;
  targetDate?: Date | null;
  daysRemaining?: number | null;
  colorToken?: string;
  icon?: string;
  isArchived: boolean;
  contributions: GoalContributionDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class GoalService {
  constructor(private goalRepo: GoalRepository = goalRepository) {}

  private mapToDto(goal: IGoal): GoalDto {
    const target = goal.targetAmountMinor;
    const current = goal.currentAmountMinor;
    const remainingMinor = Math.max(0, target - current);
    const progressPercent = target > 0 ? Number(((current / target) * 100).toFixed(1)) : 0;
    const isCompleted = current >= target;

    let daysRemaining: number | null = null;
    if (goal.targetDate) {
      daysRemaining = Math.max(0, differenceInDays(new Date(goal.targetDate), new Date()));
    }

    return {
      id: goal._id.toString(),
      name: goal.name,
      targetAmountMinor: target,
      currentAmountMinor: current,
      remainingMinor,
      progressPercent,
      isCompleted,
      currency: goal.currency,
      targetDate: goal.targetDate,
      daysRemaining,
      colorToken: goal.colorToken,
      icon: goal.icon,
      isArchived: goal.isArchived,
      contributions: (goal.contributions || []).map((c) => ({
        id: c._id ? c._id.toString() : "",
        amountMinor: c.amountMinor,
        date: c.date,
        notes: c.notes,
        accountId: c.accountId ? c.accountId.toString() : null,
      })),
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async listGoals(userId: string, includeArchived = false): Promise<GoalDto[]> {
    const goals = await this.goalRepo.findByUserId(userId, includeArchived);
    return goals.map((g) => this.mapToDto(g));
  }

  async getGoal(id: string, userId: string): Promise<GoalDto> {
    const goal = await this.goalRepo.findByIdAndUserId(id, userId);
    if (!goal) throw new NotFoundError("Savings goal not found.");
    return this.mapToDto(goal);
  }

  async createGoal(userId: string, input: CreateGoalInput): Promise<GoalDto> {
    const targetMinor = parseToMinorUnits(input.targetAmount);
    if (targetMinor <= 0) {
      throw new ValidationError("Target amount must be greater than zero.");
    }

    let initialMinor = 0;
    if (input.initialAmount) {
      initialMinor = parseToMinorUnits(input.initialAmount);
      if (initialMinor < 0) throw new ValidationError("Initial amount cannot be negative.");
    }

    const created = await this.goalRepo.create({
      userId,
      name: input.name,
      targetAmountMinor: targetMinor,
      currentAmountMinor: initialMinor,
      currency: input.currency || "INR",
      targetDate: input.targetDate,
      colorToken: input.colorToken,
      icon: input.icon,
    });

    return this.mapToDto(created);
  }

  async updateGoal(
    id: string,
    userId: string,
    input: UpdateGoalInput
  ): Promise<GoalDto> {
    const existing = await this.goalRepo.findByIdAndUserId(id, userId);
    if (!existing) throw new NotFoundError("Savings goal not found.");

    const updates: Partial<IGoal> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.targetDate !== undefined) updates.targetDate = input.targetDate;
    if (input.colorToken !== undefined) updates.colorToken = input.colorToken;
    if (input.icon !== undefined) updates.icon = input.icon;
    if (input.isArchived !== undefined) updates.isArchived = input.isArchived;

    if (input.targetAmount !== undefined) {
      const targetMinor = parseToMinorUnits(input.targetAmount);
      if (targetMinor <= 0) throw new ValidationError("Target amount must be greater than zero.");
      updates.targetAmountMinor = targetMinor;
    }

    const updated = await this.goalRepo.update(id, userId, updates);
    if (!updated) throw new NotFoundError("Savings goal not found.");
    return this.mapToDto(updated);
  }

  async addContribution(
    id: string,
    userId: string,
    input: {
      amount: string | number;
      date?: Date;
      notes?: string;
      accountId?: string | null;
    }
  ): Promise<GoalDto> {
    const amountMinor = parseToMinorUnits(input.amount);
    if (amountMinor <= 0) {
      throw new ValidationError("Contribution amount must be greater than zero.");
    }

    const updated = await this.goalRepo.addContribution(id, userId, {
      amountMinor,
      date: input.date || new Date(),
      notes: input.notes,
      accountId: input.accountId,
    });

    if (!updated) throw new NotFoundError("Savings goal not found.");
    return this.mapToDto(updated);
  }

  async deleteGoal(id: string, userId: string): Promise<GoalDto> {
    const deleted = await this.goalRepo.delete(id, userId);
    if (!deleted) throw new NotFoundError("Savings goal not found.");
    return this.mapToDto(deleted);
  }
}

export const goalService = new GoalService();
