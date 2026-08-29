import { userRepository, UserRepository } from "@/repositories/user.repository";
import { settingsRepository, SettingsRepository } from "@/repositories/settings.repository";
import { auditService, AuditService } from "@/services/audit.service";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { UpdateSettingsInput, ChangePasswordInput } from "@/schemas/settings.schema";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors/errors";

export class SettingsService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private settingsRepo: SettingsRepository = settingsRepository,
    private audit: AuditService = auditService
  ) {}

  async getUserSettings(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found.");

    const settings = await this.settingsRepo.findByUserId(userId);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      settings: {
        currency: settings?.baseCurrency || "INR",
        dateFormat: settings?.dateFormat || "yyyy-MM-dd",
        timezone: settings?.timezone || "UTC",
        theme: settings?.theme || "system",
      },
    };
  }

  async updateUserSettings(
    userId: string,
    input: UpdateSettingsInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (input.name) {
      await this.userRepo.update(userId, { name: input.name });
    }

    const settingsUpdates: Record<string, string> = {};
    if (input.currency) settingsUpdates.baseCurrency = input.currency;
    if (input.dateFormat) settingsUpdates.dateFormat = input.dateFormat;
    if (input.timezone) settingsUpdates.timezone = input.timezone;
    if (input.theme) settingsUpdates.theme = input.theme;

    if (Object.keys(settingsUpdates).length > 0) {
      await this.settingsRepo.updateSettings(userId, settingsUpdates as any);
    }

    await this.audit.logEvent(
      userId,
      "SETTINGS_UPDATE",
      { updatedFields: Object.keys(input) },
      ipAddress,
      userAgent
    );

    return this.getUserSettings(userId);
  }

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await this.userRepo.findById(userId, true);
    if (!user) throw new NotFoundError("User not found.");
    if (!user.passwordHash) {
      throw new UnauthorizedError("No password set for this user.");
    }

    // Verify current password
    const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Current password is incorrect.");
    }

    if (input.currentPassword === input.newPassword) {
      throw new ValidationError("New password must be different from current password.", {
        newPassword: ["New password must be different from current password"],
      });
    }

    // Hash and update new password
    const newHash = await hashPassword(input.newPassword);
    await this.userRepo.updatePassword(userId, newHash);

    await this.audit.logEvent(
      userId,
      "PASSWORD_CHANGE",
      { method: "user_settings" },
      ipAddress,
      userAgent
    );

    return { message: "Password updated successfully." };
  }
}

export const settingsService = new SettingsService();
