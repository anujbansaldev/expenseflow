import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGoalContribution {
  _id: mongoose.Types.ObjectId;
  amountMinor: number;
  date: Date;
  notes?: string;
  accountId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  currency: string;
  targetDate?: Date | null;
  colorToken?: string;
  icon?: string;
  isArchived: boolean;
  contributions: IGoalContribution[];
  createdAt: Date;
  updatedAt: Date;
}

const GoalContributionSchema = new Schema<IGoalContribution>(
  {
    amountMinor: {
      type: Number,
      required: true,
      min: [1, "Contribution must be greater than 0"],
      validate: {
        validator: Number.isInteger,
        message: "amountMinor must be an integer",
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GoalSchema = new Schema<IGoal>(
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
      maxlength: 120,
    },
    targetAmountMinor: {
      type: Number,
      required: true,
      min: [1, "Target amount must be greater than 0"],
      validate: {
        validator: Number.isInteger,
        message: "targetAmountMinor must be an integer",
      },
    },
    currentAmountMinor: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "currentAmountMinor must be an integer",
      },
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    colorToken: {
      type: String,
      default: "#6366f1",
    },
    icon: {
      type: String,
      default: "Target",
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    contributions: {
      type: [GoalContributionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

GoalSchema.index({ userId: 1, isArchived: 1 });

export const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
