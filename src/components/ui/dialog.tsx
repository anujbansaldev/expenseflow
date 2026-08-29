"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div
        className={cn(
          "w-full max-w-lg rounded-lg border border-border bg-card p-5 sm:p-6 text-card-foreground shadow-lg animate-in zoom-in-98 duration-150",
          className
        )}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-border/80 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
