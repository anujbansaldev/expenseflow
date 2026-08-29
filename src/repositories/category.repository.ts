import { connectToDatabase } from "@/lib/db/mongodb";
import { Category, ICategory } from "@/models/Category";
import mongoose from "mongoose";

export class CategoryRepository {
  async findByUserId(
    userId: string | mongoose.Types.ObjectId,
    type?: "income" | "expense",
    includeArchived = false
  ): Promise<ICategory[]> {
    await connectToDatabase();
    const filter: Record<string, unknown> = { userId };
    if (type) {
      filter.type = type;
    }
    if (!includeArchived) {
      filter.isArchived = false;
    }
    return Category.find(filter).sort({ name: 1 }).exec();
  }

  async findByIdAndUserId(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<ICategory | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return null;
    }
    return Category.findOne({ _id: id, userId }).exec();
  }

  async findByNameAndType(
    userId: string | mongoose.Types.ObjectId,
    name: string,
    type: "income" | "expense"
  ): Promise<ICategory | null> {
    await connectToDatabase();
    return Category.findOne({
      userId,
      type,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    }).exec();
  }

  async create(data: {
    userId: string | mongoose.Types.ObjectId;
    name: string;
    type: "income" | "expense";
    parentId?: mongoose.Types.ObjectId | null;
    icon?: string;
    colorToken?: string;
    isSystemDefault?: boolean;
  }): Promise<ICategory> {
    await connectToDatabase();
    const category = new Category({
      userId: data.userId,
      name: data.name.trim(),
      type: data.type,
      parentId: data.parentId || undefined,
      icon: data.icon?.trim(),
      colorToken: data.colorToken?.trim(),
      isSystemDefault: data.isSystemDefault || false,
      isArchived: false,
    });
    return category.save();
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    updates: Partial<ICategory>
  ): Promise<ICategory | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id.toString())) {
      return null;
    }
    return Category.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    ).exec();
  }

  async archive(
    id: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    isArchived = true
  ): Promise<ICategory | null> {
    return this.update(id, userId, { isArchived });
  }
}

export const categoryRepository = new CategoryRepository();
