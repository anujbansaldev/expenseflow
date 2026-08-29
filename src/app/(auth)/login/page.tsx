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
import { Lock, Mail, ArrowRight } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Failed to sign in");
        return;
      }

      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-none border-border bg-card">
      <CardHeader className="space-y-1 pb-4">
        <div className="w-7 h-7 rounded bg-primary text-primary-foreground font-serif font-bold text-xs flex items-center justify-center mb-2 border border-amber-500/30">
          EF
        </div>
        <CardTitle className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Sign In to Ledger</CardTitle>
        <CardDescription className="text-xs">
          Access your personal financial ledger and multi-account records.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-3.5 pt-0">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              error={errors.password?.message}
              {...register("password", { required: "Password is required" })}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-semibold gap-2 text-xs h-10 mt-1"
            isLoading={isLoading}
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <div className="relative my-2.5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">
                Instant Access
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-border hover:bg-muted text-foreground font-semibold text-xs h-9 gap-1.5"
            onClick={async () => {
              await onSubmit({ email: "demo@expenseflow.app", password: "Password123!" });
            }}
          >
            Sign In as Demo User (Pre-seeded Data)
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col items-center gap-1.5 border-t border-border/80 pt-3.5">
        <p className="text-[11px] text-muted-foreground">
          Demo: <code className="font-mono text-primary font-bold">demo@expenseflow.app</code> / <code className="font-mono text-primary font-bold">Password123!</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="w-full border-border bg-card p-6 space-y-4 shadow-none">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
