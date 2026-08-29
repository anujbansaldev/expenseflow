import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  baseCurrency: string;
  timezone: string;
  locale: string;
  dateFormat: string;
  theme: "system" | "light" | "dark";
  weekStartsOn: 0 | 1;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    baseCurrency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },
    locale: {
      type: String,
      default: "en-IN",
      trim: true,
    },
    dateFormat: {
      type: String,
      default: "dd MMM yyyy",
      trim: true,
    },
    theme: {
      type: String,
      enum: ["system", "light", "dark"],
      default: "system",
    },
    weekStartsOn: {
      type: Number,
      enum: [0, 1], // 0 = Sunday, 1 = Monday
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);
