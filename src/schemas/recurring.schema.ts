import { z } from "zod";

export const createRecurringRuleSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.union([z.string(), z.number()], {
    required_error: "Amount is required",
  }),
  currency: z.string().default("INR").transform((v) => v.toUpperCase().trim()),
  accountId: z.string({ required_error: "Account is required" }).min(1),
  categoryId: z.string({ required_error: "Category is required" }).min(1),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).default("monthly"),
  interval: z.coerce.number().int().min(1).default(1),
  startDate: z
    .union([z.string(), z.date()])
    .default(() => new Date().toISOString())
    .transform((val) => (val instanceof Date ? val : new Date(val))),
  endDate: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? (val instanceof Date ? val : new Date(val)) : null)),
  merchant: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateRecurringRuleInput = z.infer<typeof createRecurringRuleSchema>;

export const updateRecurringRuleSchema = z.object({
  amount: z.union([z.string(), z.number()]).optional(),
  accountId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  interval: z.coerce.number().int().min(1).optional(),
  endDate: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? (val instanceof Date ? val : new Date(val)) : null)),
  isActive: z.boolean().optional(),
  merchant: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type UpdateRecurringRuleInput = z.infer<typeof updateRecurringRuleSchema>;
