import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "destructive" | "warning" | "gold";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-border/50",
    outline: "text-foreground border-border bg-card/60",
    success: "bg-success/15 text-success dark:text-emerald-400 border-success/30",
    destructive: "bg-destructive/15 text-destructive dark:text-rose-400 border-destructive/30",
    warning: "bg-warning/15 text-warning dark:text-amber-400 border-warning/30",
    gold: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold transition-colors border",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
