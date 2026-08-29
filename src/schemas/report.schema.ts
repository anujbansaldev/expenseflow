import { z } from "zod";

export const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  preset: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;

export const exportCsvSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type ExportCsvInput = z.infer<typeof exportCsvSchema>;
