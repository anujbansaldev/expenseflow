import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "income" | "expense";
  parentId?: mongoose.Types.ObjectId;
  icon?: string;
  colorToken?: string;
  isSystemDefault: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    icon: {
      type: String,
      trim: true,
    },
    colorToken: {
      type: String,
      trim: true,
    },
    isSystemDefault: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ userId: 1, type: 1, isArchived: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
