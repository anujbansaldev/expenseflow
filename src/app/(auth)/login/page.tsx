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
    <Card className="w-full shadow-xl border-border/80 glass-panel">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to securely access your personal expense ledger.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
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
            className="w-full font-semibold gap-2 shadow-md shadow-primary/20 mt-2"
            size="lg"
            isLoading={isLoading}
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">
                Instant Demo Access
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/40 hover:bg-primary/10 text-primary font-semibold text-xs h-10 gap-1.5"
            onClick={async () => {
              await onSubmit({ email: "demo@expenseflow.app", password: "Password123!" });
            }}
          >
            ⚡ Sign In as Demo User (Pre-seeded Data)
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col items-center gap-2 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
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
        <Card className="w-full shadow-xl border-border/80 glass-panel p-6 space-y-4">
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
