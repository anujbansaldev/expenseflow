"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create account");
        return;
      }

      toast.success("Account created! Default accounts and categories initialized.");
      router.push("/dashboard");
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold w-fit mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Auto-Seeded Onboarding</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription>
          Get started with ExpenseFlow. We will set up your base currency, initial accounts, and category templates.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Full Name
            </label>
            <Input
              placeholder="Alex Johnson"
              disabled={isLoading}
              error={errors.name?.message}
              {...register("name", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="alex@example.com"
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
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Password
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

          <Button
            type="submit"
            className="w-full font-semibold gap-2 shadow-md shadow-primary/20 mt-2"
            size="lg"
            isLoading={isLoading}
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
