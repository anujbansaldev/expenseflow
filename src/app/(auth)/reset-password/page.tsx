"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Missing or invalid reset token.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Failed to reset password");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full shadow-xl border-border/80 glass-panel">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-destructive">Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or incomplete. Please request a new link.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/forgot-password" className="w-full">
            <Button variant="outline" className="w-full">
              Request New Link
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-border/80 glass-panel">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
        <CardDescription>
          Please choose a strong, new password for your ExpenseFlow account.
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4 text-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold">Your password has been updated!</p>
          <p className="text-xs text-muted-foreground">
            You can now log in using your new credentials.
          </p>
          <Link href="/login">
            <Button className="w-full font-semibold gap-2 mt-2">
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                New Password
              </label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                disabled={isLoading}
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Re-enter password"
                disabled={isLoading}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => val === password || "Passwords do not match",
                })}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-semibold gap-2 shadow-md shadow-primary/20 mt-2"
              size="lg"
              isLoading={isLoading}
            >
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="w-full shadow-xl border-border/80 glass-panel p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
