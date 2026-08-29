import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required" }).min(1, "Token is required"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
