import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecurringRule extends Document {
  userId: mongoose.Types.ObjectId;
  type: "income" | "expense";
  amountMinor: number;
  currency: string;
  accountId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number; // e.g. 1
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

const RecurringRuleSchema = new Schema<IRecurringRule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
      validate: {
        validator: Number.isInteger,
        message: "amountMinor must be an integer",
      },
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
      default: "monthly",
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    nextRunAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    merchant: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

RecurringRuleSchema.index({ isActive: 1, nextRunAt: 1 });

export const RecurringRule: Model<IRecurringRule> =
  mongoose.models.RecurringRule ||
  mongoose.model<IRecurringRule>("RecurringRule", RecurringRuleSchema);
