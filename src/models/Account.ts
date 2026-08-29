import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "cash" | "bank" | "wallet" | "credit_card" | "savings" | "other";
  currency: string;
  openingBalanceMinor: number;
  institution?: string;
  last4?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["cash", "bank", "wallet", "credit_card", "savings", "other"],
      default: "bank",
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    openingBalanceMinor: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "openingBalanceMinor must be an integer",
      },
    },
    institution: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    last4: {
      type: String,
      trim: true,
      maxlength: 4,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AccountSchema.index({ userId: 1, isArchived: 1, name: 1 });
AccountSchema.index({ userId: 1, createdAt: -1 });

export const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);
