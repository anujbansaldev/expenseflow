import { z } from "zod";

export const categoryTypeEnum = z.enum(["income", "expense"]);

export type CategoryType = z.infer<typeof categoryTypeEnum>;

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters"),
  type: categoryTypeEnum,
  parentId: z.string().optional().nullable(),
  icon: z.string().trim().optional(),
  colorToken: z.string().trim().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  parentId: z.string().optional().nullable(),
  icon: z.string().trim().optional(),
  colorToken: z.string().trim().optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
