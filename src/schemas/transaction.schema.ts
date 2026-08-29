import { z } from "zod";

export const transactionTypeEnum = z.enum(["income", "expense", "transfer"]);
export type TransactionType = z.infer<typeof transactionTypeEnum>;

export const createTransactionSchema = z
  .object({
    type: transactionTypeEnum,
    amount: z.union([z.string(), z.number()], {
      required_error: "Amount is required",
    }),
    currency: z.string().default("INR").transform((v) => v.toUpperCase().trim()),
    accountId: z.string({ required_error: "Source account is required" }).min(1),
    destinationAccountId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    occurredAt: z
      .union([z.string(), z.date()])
      .default(() => new Date().toISOString())
      .transform((val) => (val instanceof Date ? val : new Date(val))),
    merchant: z.string().trim().max(100).optional(),
    description: z.string().trim().max(255).optional(),
    notes: z.string().trim().max(1000).optional(),
    tags: z.array(z.string().trim().max(30)).max(10).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer") {
      if (!data.destinationAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Destination account is required for transfers.",
          path: ["destinationAccountId"],
        });
      }
      if (data.destinationAccountId && data.destinationAccountId === data.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Source and destination accounts cannot be the same.",
          path: ["destinationAccountId"],
        });
      }
    } else {
      if (!data.categoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Category is required for ${data.type} transactions.`,
          path: ["categoryId"],
        });
      }
    }
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z
  .object({
    type: transactionTypeEnum.optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    currency: z.string().optional().transform((v) => v?.toUpperCase().trim()),
    accountId: z.string().min(1).optional(),
    destinationAccountId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    occurredAt: z
      .union([z.string(), z.date()])
      .optional()
      .transform((val) => (val ? (val instanceof Date ? val : new Date(val)) : undefined)),
    merchant: z.string().trim().max(100).optional(),
    description: z.string().trim().max(255).optional(),
    notes: z.string().trim().max(1000).optional(),
    tags: z.array(z.string().trim().max(30)).max(10).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer" && data.accountId && data.destinationAccountId) {
      if (data.accountId === data.destinationAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Source and destination accounts cannot be the same.",
          path: ["destinationAccountId"],
        });
      }
    }
  });

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: transactionTypeEnum.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z
    .string()
    .trim()
    .max(50, "Search query too long")
    .optional()
    .transform((val) => (val ? val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : undefined)),
  sortBy: z.enum(["occurredAt", "amountMinor", "createdAt"]).default("occurredAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
