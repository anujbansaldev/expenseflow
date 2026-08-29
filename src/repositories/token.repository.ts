import { connectToDatabase } from "@/lib/db/mongodb";
import {
  PasswordResetToken,
  IPasswordResetToken,
} from "@/models/PasswordResetToken";
import mongoose from "mongoose";

export class TokenRepository {
  async createResetToken(data: {
    userId: mongoose.Types.ObjectId | string;
    email: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<IPasswordResetToken> {
    await connectToDatabase();
    // Invalidate existing tokens for this user
    await PasswordResetToken.deleteMany({ userId: data.userId }).exec();

    const tokenDoc = new PasswordResetToken({
      userId: data.userId,
      email: data.email.toLowerCase().trim(),
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
    return tokenDoc.save();
  }

  async findValidResetToken(
    tokenHash: string
  ): Promise<IPasswordResetToken | null> {
    await connectToDatabase();
    return PasswordResetToken.findOne({
      tokenHash,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).exec();
  }

  async markTokenConsumed(
    id: mongoose.Types.ObjectId | string
  ): Promise<void> {
    await connectToDatabase();
    await PasswordResetToken.findByIdAndUpdate(id, {
      consumedAt: new Date(),
    }).exec();
  }
}

export const tokenRepository = new TokenRepository();
