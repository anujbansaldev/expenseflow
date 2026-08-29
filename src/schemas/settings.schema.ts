import { z } from "zod";

export const updateSettingsSchema = z.object({
  currency: z.string().min(3).max(3).optional().transform((v) => v?.toUpperCase().trim()),
  dateFormat: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
