import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  categoryId?: mongoose.Types.ObjectId | null; // null = overall budget
  limitAmountMinor: number;
  currency: string;
  period: "monthly" | "weekly" | "yearly";
  warningThreshold: number; // e.g. 80 for 80%
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    limitAmountMinor: {
      type: Number,
      required: true,
      min: [1, "Limit must be greater than 0"],
      validate: {
        validator: Number.isInteger,
        message: "limitAmountMinor must be an integer",
      },
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    period: {
      type: String,
      enum: ["monthly", "weekly", "yearly"],
      default: "monthly",
    },
    warningThreshold: {
      type: Number,
      default: 80,
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ userId: 1, categoryId: 1 });

export const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
