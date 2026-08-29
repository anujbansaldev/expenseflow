import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL deletion after expiry
    },
    consumedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    PasswordResetTokenSchema
  );
