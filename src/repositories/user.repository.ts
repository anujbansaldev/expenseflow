import { connectToDatabase } from "@/lib/db/mongodb";
import { User, IUser } from "@/models/User";
import mongoose from "mongoose";

export class UserRepository {
  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    await connectToDatabase();
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    await connectToDatabase();
    return User.findById(id).exec();
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    status?: "active" | "disabled";
  }): Promise<IUser> {
    await connectToDatabase();
    const user = new User({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      status: data.status || "active",
    });
    return user.save();
  }

  async updateLastLogin(id: string | mongoose.Types.ObjectId): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async updatePassword(
    id: string | mongoose.Types.ObjectId,
    passwordHash: string
  ): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(id, { passwordHash }).exec();
  }
}

export const userRepository = new UserRepository();
