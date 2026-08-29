import { connectToDatabase } from "@/lib/db/mongodb";
import { UserSettings, IUserSettings } from "@/models/UserSettings";
import mongoose from "mongoose";

export class SettingsRepository {
  async findByUserId(
    userId: string | mongoose.Types.ObjectId
  ): Promise<IUserSettings | null> {
    await connectToDatabase();
    return UserSettings.findOne({ userId }).exec();
  }

  async createDefaultSettings(
    userId: string | mongoose.Types.ObjectId,
    defaults: Partial<IUserSettings> = {}
  ): Promise<IUserSettings> {
    await connectToDatabase();
    const settings = new UserSettings({
      userId,
      baseCurrency: defaults.baseCurrency || "INR",
      timezone: defaults.timezone || "Asia/Kolkata",
      locale: defaults.locale || "en-IN",
      dateFormat: defaults.dateFormat || "dd MMM yyyy",
      theme: defaults.theme || "system",
      weekStartsOn: defaults.weekStartsOn ?? 1,
    });
    return settings.save();
  }

  async updateSettings(
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<IUserSettings>
  ): Promise<IUserSettings | null> {
    await connectToDatabase();
    return UserSettings.findOneAndUpdate({ userId }, { $set: updates }, {
      new: true,
      upsert: true,
    }).exec();
  }
}

export const settingsRepository = new SettingsRepository();
