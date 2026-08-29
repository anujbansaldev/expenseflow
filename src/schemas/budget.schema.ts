import { z } from "zod";

export const createBudgetSchema = z.object({
  name: z.string({ required_error: "Budget name is required" }).trim().min(1, "Name is required").max(100),
  categoryId: z.string().optional().nullable(), // null = overall monthly budget
  limitAmount: z.union([z.string(), z.number()], {
    required_error: "Limit amount is required",
  }),
  currency: z.string().default("INR").transform((v) => v.toUpperCase().trim()),
  period: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
  warningThreshold: z.coerce.number().int().min(1).max(100).default(80),
  isActive: z.boolean().default(true),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  categoryId: z.string().optional().nullable(),
  limitAmount: z.union([z.string(), z.number()]).optional(),
  warningThreshold: z.coerce.number().int().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
