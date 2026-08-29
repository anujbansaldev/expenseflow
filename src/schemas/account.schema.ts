import { z } from "zod";

export const accountTypeEnum = z.enum([
  "bank",
  "cash",
  "wallet",
  "credit_card",
  "savings",
  "other",
]);

export type AccountType = z.infer<typeof accountTypeEnum>;

export const createAccountSchema = z.object({
  name: z
    .string({ required_error: "Account name is required" })
    .trim()
    .min(1, "Account name is required")
    .max(100, "Account name cannot exceed 100 characters"),
  type: accountTypeEnum.default("bank"),
  currency: z.string().default("INR").transform((val) => val.toUpperCase().trim()),
  openingBalance: z.union([z.string(), z.number()]).default("0"),
  institution: z.string().trim().max(100).optional(),
  last4: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "Last 4 digits must contain up to 4 digits")
    .optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  type: accountTypeEnum.optional(),
  institution: z.string().trim().max(100).optional(),
  last4: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "Last 4 digits must contain up to 4 digits")
    .optional(),
  notes: z.string().trim().max(500).optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
