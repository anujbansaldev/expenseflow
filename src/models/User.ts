import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  imageUrl?: string;
  status: "active" | "disabled";
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    passwordHash: {
      type: String,
      select: false, // Do not return by default in queries
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    emailVerifiedAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose overwrite model error in development hot-reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
