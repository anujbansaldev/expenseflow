import { z } from "zod";

export const createBillSchema = z.object({
  name: z.string({ required_error: "Bill name is required" }).trim().min(1, "Name is required").max(120),
  amount: z.union([z.string(), z.number()], {
    required_error: "Amount is required",
  }),
  currency: z.string().default("INR").transform((v) => v.toUpperCase().trim()),
  accountId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  dueDate: z
    .union([z.string(), z.date()])
    .transform((val) => (val instanceof Date ? val : new Date(val))),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["monthly", "yearly", "weekly"]).optional().nullable(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;

export const updateBillSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  accountId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  dueDate: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => (val ? (val instanceof Date ? val : new Date(val)) : undefined)),
  status: z.enum(["upcoming", "paid", "overdue", "skipped"]).optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["monthly", "yearly", "weekly"]).optional().nullable(),
  notes: z.string().trim().max(500).optional(),
});

export type UpdateBillInput = z.infer<typeof updateBillSchema>;

export const payBillSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  paidAt: z
    .union([z.string(), z.date()])
    .default(() => new Date().toISOString())
    .transform((val) => (val instanceof Date ? val : new Date(val))),
});

export type PayBillInput = z.infer<typeof payBillSchema>;
