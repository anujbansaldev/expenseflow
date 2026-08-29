import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string({ required_error: "Goal name is required" }).trim().min(1, "Name is required").max(120),
  targetAmount: z.union([z.string(), z.number()], {
    required_error: "Target amount is required",
  }),
  initialAmount: z.union([z.string(), z.number()]).optional().default("0"),
  currency: z.string().default("INR").transform((v) => v.toUpperCase().trim()),
  targetDate: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? (val instanceof Date ? val : new Date(val)) : null)),
  colorToken: z.string().default("#6366f1"),
  icon: z.string().default("Target"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  targetAmount: z.union([z.string(), z.number()]).optional(),
  targetDate: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? (val instanceof Date ? val : new Date(val)) : null)),
  colorToken: z.string().optional(),
  icon: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export const contributeGoalSchema = z.object({
  amount: z.union([z.string(), z.number()], {
    required_error: "Contribution amount is required",
  }),
  date: z
    .union([z.string(), z.date()])
    .default(() => new Date().toISOString())
    .transform((val) => (val instanceof Date ? val : new Date(val))),
  notes: z.string().trim().max(250).optional(),
  accountId: z.string().optional().nullable(),
});

export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>;
