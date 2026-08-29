import { connectToDatabase } from "@/lib/db/mongodb";
import { User, IUser } from "@/models/User";
import { RefreshToken } from "@/models/RefreshToken";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { generateSecureToken, hashToken } from "@/lib/auth/tokens";
import { createAccessToken } from "@/lib/auth/session";
import { UnauthorizedError, ConflictError, ValidationError } from "@/lib/errors/errors";
import { LoginInput, RegisterInput } from "@/schemas/auth.schema";
import { userRepository } from "@/repositories/user.repository";
import { settingsRepository } from "@/repositories/settings.repository";
import { Account } from "@/models/Account";
import { Category } from "@/models/Category";

const REFRESH_TOKEN_EXPIRATION_DAYS = 30;

export interface MobileAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number; // in seconds (e.g. 900 for 15m)
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface DeviceMetadata {
  deviceId?: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class MobileAuthService {
  /**
   * Logs in a user from a mobile device and issues JWT access token + long-lived refresh token.
   */
  async login(input: LoginInput, deviceMeta: DeviceMetadata = {}): Promise<MobileAuthResponse> {
    const user = await userRepository.findByEmail(input.email, true);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (user.status === "disabled") {
      throw new UnauthorizedError("Your account has been disabled. Please contact support.");
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    await userRepository.updateLastLogin(user._id);

    return await this.issueTokenPair(user, deviceMeta);
  }

  /**
   * Registers a new user on mobile, seeds starter data, and issues token pair.
   */
  async register(input: RegisterInput, deviceMeta: DeviceMetadata = {}): Promise<MobileAuthResponse> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const userId = user._id;

    // Seed default user settings
    await settingsRepository.createDefaultSettings(userId, {
      baseCurrency: "INR",
      timezone: "Asia/Kolkata",
    });

    // Seed starter accounts & categories
    await connectToDatabase();
    await Account.create([
      {
        userId,
        name: "Primary Checking",
        type: "bank",
        currency: "INR",
        openingBalanceMinor: 0,
      },
      {
        userId,
        name: "Cash Wallet",
        type: "cash",
        currency: "INR",
        openingBalanceMinor: 0,
      },
    ]);

    await Category.create([
      { userId, name: "Salary", type: "income", isSystemDefault: true, icon: "Briefcase" },
      { userId, name: "Freelance", type: "income", isSystemDefault: true, icon: "Laptop" },
      { userId, name: "Investments", type: "income", isSystemDefault: true, icon: "TrendingUp" },
      { userId, name: "Other Income", type: "income", isSystemDefault: true, icon: "PlusCircle" },
      { userId, name: "Groceries & Supermarket", type: "expense", isSystemDefault: true, icon: "ShoppingCart" },
      { userId, name: "Rent & Housing", type: "expense", isSystemDefault: true, icon: "Home" },
      { userId, name: "Utilities & Bills", type: "expense", isSystemDefault: true, icon: "Zap" },
      { userId, name: "Dining & Restaurants", type: "expense", isSystemDefault: true, icon: "Utensils" },
      { userId, name: "Transportation", type: "expense", isSystemDefault: true, icon: "Car" },
      { userId, name: "Shopping", type: "expense", isSystemDefault: true, icon: "ShoppingBag" },
      { userId, name: "Health & Medical", type: "expense", isSystemDefault: true, icon: "HeartPulse" },
      { userId, name: "Entertainment", type: "expense", isSystemDefault: true, icon: "Film" },
      { userId, name: "Education", type: "expense", isSystemDefault: true, icon: "BookOpen" },
    ]);

    return await this.issueTokenPair(user, deviceMeta);
  }

  /**
   * Rotates a refresh token: issues a new access token and a new refresh token.
   * Includes reuse detection: if a revoked token is used, all tokens for the user are invalidated.
   */
  async refreshToken(rawRefreshToken: string, deviceMeta: DeviceMetadata = {}): Promise<MobileAuthResponse> {
    await connectToDatabase();

    if (!rawRefreshToken) {
      throw new ValidationError("Refresh token is required.");
    }

    const tokenHash = hashToken(rawRefreshToken);
    const existingDoc = await RefreshToken.findOne({ tokenHash });

    if (!existingDoc) {
      throw new UnauthorizedError("Invalid refresh token.");
    }

    // Reuse detection: token already revoked means potential token theft
    if (existingDoc.isRevoked) {
      // Revoke all tokens for this user as a security measure
      await RefreshToken.updateMany({ userId: existingDoc.userId }, { isRevoked: true });
      throw new UnauthorizedError("Revoked refresh token reuse detected. All sessions terminated.");
    }

    // Check expiration
    if (new Date() > existingDoc.expiresAt) {
      existingDoc.isRevoked = true;
      await existingDoc.save();
      throw new UnauthorizedError("Refresh token expired. Please log in again.");
    }

    const user = await User.findById(existingDoc.userId);
    if (!user || user.status === "disabled") {
      throw new UnauthorizedError("User account not available.");
    }

    // Revoke old token and issue new pair (rotation)
    existingDoc.isRevoked = true;
    await existingDoc.save();

    return await this.issueTokenPair(user, {
      deviceId: deviceMeta.deviceId || existingDoc.deviceId,
      deviceName: deviceMeta.deviceName || existingDoc.deviceName,
      ipAddress: deviceMeta.ipAddress || existingDoc.ipAddress,
      userAgent: deviceMeta.userAgent || existingDoc.userAgent,
    });
  }

  /**
   * Revokes a specific refresh token (mobile logout).
   */
  async logout(rawRefreshToken: string): Promise<void> {
    await connectToDatabase();

    if (!rawRefreshToken) return;

    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
  }

  /**
   * Revokes all mobile refresh tokens for a user (e.g. log out of all devices).
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await connectToDatabase();
    await RefreshToken.updateMany({ userId }, { isRevoked: true });
  }

  /**
   * Lists active device sessions for a user.
   */
  async listActiveSessions(userId: string) {
    await connectToDatabase();
    return await RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastUsedAt: -1 });
  }

  /**
   * Issues an access token (15 mins) and a cryptographically secure refresh token (30 days).
   */
  private async issueTokenPair(user: IUser, deviceMeta: DeviceMetadata): Promise<MobileAuthResponse> {
    await connectToDatabase();
    const rawRefreshToken = generateSecureToken();
    const tokenHash = hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      deviceId: deviceMeta.deviceId,
      deviceName: deviceMeta.deviceName || "Mobile Device",
      ipAddress: deviceMeta.ipAddress,
      userAgent: deviceMeta.userAgent,
      expiresAt,
      lastUsedAt: new Date(),
    });

    const accessToken = await createAccessToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      tokenType: "Bearer",
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };
  }
}

export const mobileAuthService = new MobileAuthService();
