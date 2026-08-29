import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "income" | "expense" | "transfer";
  amountMinor: number;
  currency: string;
  accountId: mongoose.Types.ObjectId; // Source account
  destinationAccountId?: mongoose.Types.ObjectId; // Transfer only
  categoryId?: mongoose.Types.ObjectId; // Income/Expense only
  occurredAt: Date;
  merchant?: string;
  description?: string;
  notes?: string;
  tags: string[];
  source: "manual" | "recurring" | "import" | "system";
  recurringRuleId?: mongoose.Types.ObjectId;
  recurringOccurrenceKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
      index: true,
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
      index: true,
    },
    destinationAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },
    merchant: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ["manual", "recurring", "import", "system"],
      default: "manual",
    },
    recurringRuleId: {
      type: Schema.Types.ObjectId,
      ref: "RecurringRule",
    },
    recurringOccurrenceKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal ledger queries
TransactionSchema.index({ userId: 1, occurredAt: -1, _id: -1 });
TransactionSchema.index({ userId: 1, accountId: 1, occurredAt: -1 });
TransactionSchema.index({ userId: 1, categoryId: 1, occurredAt: -1 });
TransactionSchema.index(
  { userId: 1, recurringOccurrenceKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      recurringOccurrenceKey: { $type: "string" },
    },
  }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
