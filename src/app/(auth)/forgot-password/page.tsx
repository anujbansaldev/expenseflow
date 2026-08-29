"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowLeft, Send } from "lucide-react";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [devToken, setDevToken] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      setIsSubmitted(true);
      toast.success("Instructions sent if the account exists.");

      if (json.data?.rawTokenForDev) {
        setDevToken(json.data.rawTokenForDev);
      }
    } catch {
      toast.error("Failed to request password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl border-border/80 glass-panel">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
        <CardDescription>
          Enter your registered email address and we will send you a secure password reset link.
        </CardDescription>
      </CardHeader>
      {isSubmitted ? (
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Check your inbox</p>
            If an account is associated with that email, we have dispatched a single-use password recovery link valid for 1 hour.
          </div>

          {devToken && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
              <p className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                Development Reset Link:
              </p>
              <Link
                href={`/reset-password?token=${devToken}`}
                className="text-primary font-mono underline break-all"
              >
                /reset-password?token={devToken}
              </Link>
            </div>
          )}

          <Link href="/login">
            <Button variant="outline" className="w-full font-semibold gap-2 mt-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      ) : (
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

            <Button
              type="submit"
              className="w-full font-semibold gap-2 shadow-md shadow-primary/20 mt-2"
              size="lg"
              isLoading={isLoading}
            >
              <span>Send Reset Instructions</span>
              <Send className="w-4 h-4" />
            </Button>
          </CardContent>
        </form>
      )}
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
