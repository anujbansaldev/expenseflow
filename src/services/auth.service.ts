import { userRepository, UserRepository } from "@/repositories/user.repository";
import { settingsRepository, SettingsRepository } from "@/repositories/settings.repository";
import { tokenRepository, TokenRepository } from "@/repositories/token.repository";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { generateSecureToken, hashToken } from "@/lib/auth/tokens";
import { createSessionToken, SessionPayload } from "@/lib/auth/session";
import { Account } from "@/models/Account";
import { Category } from "@/models/Category";
import { connectToDatabase } from "@/lib/db/mongodb";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/schemas/auth.schema";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from "@/lib/errors/errors";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
}

export class AuthService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private settingsRepo: SettingsRepository = settingsRepository,
    private tokenRepo: TokenRepository = tokenRepository
  ) {}

  /**
   * Registers a new user, creates default user settings, and seeds starter accounts & categories.
   */
  async register(
    input: RegisterInput
  ): Promise<{ user: UserDto; token: string }> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const userId = user._id;

    // 1. Seed default user settings
    await this.settingsRepo.createDefaultSettings(userId, {
      baseCurrency: "INR",
      timezone: "Asia/Kolkata",
    });

    // 2. Seed starter accounts
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

    // 3. Seed default category taxonomy
    await Category.create([
      // Income categories
      { userId, name: "Salary", type: "income", isSystemDefault: true, icon: "Briefcase" },
      { userId, name: "Freelance", type: "income", isSystemDefault: true, icon: "Laptop" },
      { userId, name: "Investments", type: "income", isSystemDefault: true, icon: "TrendingUp" },
      { userId, name: "Other Income", type: "income", isSystemDefault: true, icon: "PlusCircle" },

      // Expense categories
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

    const sessionPayload: SessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = await createSessionToken(sessionPayload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticates a user by email and password, issuing a JWT session token.
   */
  async login(input: LoginInput): Promise<{ user: UserDto; token: string }> {
    const user = await this.userRepo.findByEmail(input.email, true);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (user.status === "disabled") {
      throw new UnauthorizedError("Your account has been disabled. Please contact support.");
    }

    await this.userRepo.updateLastLogin(user._id);

    const sessionPayload: SessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = await createSessionToken(sessionPayload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Generates a single-use expiring password reset token without disclosing account existence.
   */
  async forgotPassword(
    input: ForgotPasswordInput
  ): Promise<{ message: string; rawTokenForDev?: string }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (user) {
      const rawToken = generateSecureToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      await this.tokenRepo.createResetToken({
        userId: user._id,
        email: user.email,
        tokenHash,
        expiresAt,
      });

      // In development or test environments, attach token for debugging/testing
      const isDev = process.env.NODE_ENV !== "production";
      return {
        message: "If an account exists with this email, password reset instructions have been sent.",
        ...(isDev ? { rawTokenForDev: rawToken } : {}),
      };
    }

    return {
      message: "If an account exists with this email, password reset instructions have been sent.",
    };
  }

  /**
   * Verifies the submitted token and resets the user's password.
   */
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const tokenHash = hashToken(input.token);
    const tokenDoc = await this.tokenRepo.findValidResetToken(tokenHash);

    if (!tokenDoc) {
      throw new ValidationError("Password reset token is invalid, expired, or already used.");
    }

    const newPasswordHash = await hashPassword(input.password);
    await this.userRepo.updatePassword(tokenDoc.userId, newPasswordHash);
    await this.tokenRepo.markTokenConsumed(tokenDoc._id);

    return {
      message: "Password has been successfully reset. You can now log in with your new password.",
    };
  }

  /**
   * Fetches profile data and settings for the authenticated user.
   */
  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const settings = await this.settingsRepo.findByUserId(userId);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
      },
      settings: settings || null,
    };
  }
}

export const authService = new AuthService();
