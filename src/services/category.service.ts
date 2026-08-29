import { categoryRepository, CategoryRepository } from "@/repositories/category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "@/schemas/category.schema";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/errors";
import { ICategory } from "@/models/Category";
import mongoose from "mongoose";

export interface CategoryDto {
  id: string;
  name: string;
  type: "income" | "expense";
  parentId?: string | null;
  icon?: string;
  colorToken?: string;
  isSystemDefault: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryService {
  constructor(private categoryRepo: CategoryRepository = categoryRepository) {}

  private mapToDto(category: ICategory): CategoryDto {
    return {
      id: category._id.toString(),
      name: category.name,
      type: category.type,
      parentId: category.parentId ? category.parentId.toString() : null,
      icon: category.icon,
      colorToken: category.colorToken,
      isSystemDefault: category.isSystemDefault,
      isArchived: category.isArchived,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async listCategories(
    userId: string,
    type?: "income" | "expense",
    includeArchived = false
  ): Promise<CategoryDto[]> {
    const categories = await this.categoryRepo.findByUserId(userId, type, includeArchived);
    return categories.map((cat) => this.mapToDto(cat));
  }

  async getCategory(id: string, userId: string): Promise<CategoryDto> {
    const category = await this.categoryRepo.findByIdAndUserId(id, userId);
    if (!category) {
      throw new NotFoundError("Category not found.");
    }
    return this.mapToDto(category);
  }

  async createCategory(
    userId: string,
    input: CreateCategoryInput
  ): Promise<CategoryDto> {
    const existing = await this.categoryRepo.findByNameAndType(
      userId,
      input.name,
      input.type
    );
    if (existing && !existing.isArchived) {
      throw new ConflictError(
        `A ${input.type} category named "${input.name}" already exists.`
      );
    }

    let parentObjectId: mongoose.Types.ObjectId | null = null;
    if (input.parentId) {
      if (!mongoose.Types.ObjectId.isValid(input.parentId)) {
        throw new ValidationError("Invalid parent category ID.");
      }
      const parent = await this.categoryRepo.findByIdAndUserId(input.parentId, userId);
      if (!parent) {
        throw new NotFoundError("Parent category not found.");
      }
      if (parent.type !== input.type) {
        throw new ValidationError("Parent category must share the same type (income/expense).");
      }
      parentObjectId = new mongoose.Types.ObjectId(input.parentId);
    }

    const category = await this.categoryRepo.create({
      userId,
      name: input.name,
      type: input.type,
      parentId: parentObjectId,
      icon: input.icon,
      colorToken: input.colorToken,
    });

    return this.mapToDto(category);
  }

  async updateCategory(
    id: string,
    userId: string,
    input: UpdateCategoryInput
  ): Promise<CategoryDto> {
    const existing = await this.categoryRepo.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new NotFoundError("Category not found.");
    }

    let parentObjectId: mongoose.Types.ObjectId | null | undefined = undefined;
    if (input.parentId !== undefined) {
      if (input.parentId === null) {
        parentObjectId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(input.parentId)) {
          throw new ValidationError("Invalid parent category ID.");
        }
        if (input.parentId === id) {
          throw new ValidationError("Category cannot be its own parent.");
        }
        const parent = await this.categoryRepo.findByIdAndUserId(input.parentId, userId);
        if (!parent) {
          throw new NotFoundError("Parent category not found.");
        }
        parentObjectId = new mongoose.Types.ObjectId(input.parentId);
      }
    }

    const updated = await this.categoryRepo.update(id, userId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(parentObjectId !== undefined ? { parentId: parentObjectId ?? undefined } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(input.colorToken !== undefined ? { colorToken: input.colorToken } : {}),
      ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
    });

    if (!updated) {
      throw new NotFoundError("Category not found.");
    }

    return this.mapToDto(updated);
  }

  async archiveCategory(
    id: string,
    userId: string,
    isArchived = true
  ): Promise<CategoryDto> {
    const category = await this.categoryRepo.archive(id, userId, isArchived);
    if (!category) {
      throw new NotFoundError("Category not found.");
    }
    return this.mapToDto(category);
  }
}

export const categoryService = new CategoryService();
