import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBill extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  amountMinor: number;
  currency: string;
  accountId?: mongoose.Types.ObjectId | null;
  categoryId?: mongoose.Types.ObjectId | null;
  dueDate: Date;
  status: "upcoming" | "paid" | "overdue" | "skipped";
  isRecurring: boolean;
  recurringFrequency?: "monthly" | "yearly" | "weekly" | null;
  paidAt?: Date | null;
  paidTransactionId?: mongoose.Types.ObjectId | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
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
      default: null,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "paid", "overdue", "skipped"],
      default: "upcoming",
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["monthly", "yearly", "weekly"],
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paidTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
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

BillSchema.index({ userId: 1, dueDate: 1, status: 1 });

export const Bill: Model<IBill> =
  mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);
