"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { formatMinorUnits } from "@/lib/money/money";
import { toast } from "sonner";
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Sliders,
} from "lucide-react";
import { BudgetDto } from "@/services/budget.service";
import { CategoryDto } from "@/services/category.service";

export default function BudgetsPage() {
  const [budgets, setBudgets] = React.useState<BudgetDto[]>([]);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Dialog state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<BudgetDto | null>(null);

  // Form state
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [limitAmount, setLimitAmount] = React.useState("");
  const [warningThreshold, setWarningThreshold] = React.useState(80);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchBudgets = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/budgets");
      const json = await res.json();
      if (json.data) {
        setBudgets(json.data);
      }
    } catch {
      toast.error("Failed to load budgets.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBudgets();
    fetch("/api/categories?type=expense")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setCategories(j.data);
      });
  }, [fetchBudgets]);

  const handleOpenAdd = () => {
    setName("");
    setCategoryId("");
    setLimitAmount("");
    setWarningThreshold(80);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (b: BudgetDto) => {
    setEditingBudget(b);
    setName(b.name);
    setCategoryId(b.categoryId || "");
    setLimitAmount((b.limitAmountMinor / 100).toFixed(2));
    setWarningThreshold(b.warningThreshold || 80);
    setIsEditOpen(true);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Budget name is required");
      return;
    }
    if (!limitAmount || Number(limitAmount) <= 0) {
      toast.error("Limit must be greater than zero");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: categoryId || undefined,
          limitAmount,
          warningThreshold,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create budget");
        return;
      }

      toast.success("Budget created successfully!");
      setIsAddOpen(false);
      fetchBudgets();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: categoryId ? categoryId : null,
          limitAmount,
          warningThreshold,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update budget");
        return;
      }

      toast.success("Budget updated!");
      setIsEditOpen(false);
      fetchBudgets();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete budget");
        return;
      }
      toast.success("Budget deleted.");
      fetchBudgets();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const totalBudgetedMinor = budgets.reduce((sum, b) => sum + b.limitAmountMinor, 0);
  const totalSpentMinor = budgets.reduce((sum, b) => sum + b.spentMinor, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Monthly Envelopes &amp; Budgets</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Category spending allowances, warning thresholds, and proactive overspending prevention.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 gap-1.5 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" />
          Create Envelope
        </Button>
      </div>

      {/* Aggregate Overview KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-none">
          <CardHeader className="pb-1.5 p-4 sm:p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Budgeted Allowance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {formatMinorUnits(totalBudgetedMinor, { currency: "INR" })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-1.5 p-4 sm:p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Spent This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-800 dark:text-rose-400">
              {formatMinorUnits(totalSpentMinor, { currency: "INR" })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-1.5 p-4 sm:p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Remaining Allowance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {formatMinorUnits(Math.max(0, totalBudgetedMinor - totalSpentMinor), {
                currency: "INR",
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-8 text-center shadow-none">
          <h3 className="text-sm font-serif font-bold text-foreground">No active budget envelopes</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Set up a monthly category budget to receive proactive alerts when approaching spending limits.
          </p>
          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create First Envelope
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const barColor = b.isExceeded
              ? "bg-primary"
              : b.isWarning
              ? "bg-amber-600 dark:bg-amber-500"
              : "bg-emerald-700 dark:bg-emerald-500";

            return (
              <Card key={b.id} className="shadow-none">
                <CardHeader className="flex flex-row items-start justify-between pb-1.5 p-4 sm:p-5">
                  <div>
                    <CardTitle className="text-sm sm:text-base font-serif font-bold flex items-center gap-2 text-foreground">
                      {b.name}
                      {b.isExceeded ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Exceeded
                        </Badge>
                      ) : b.isWarning ? (
                        <Badge variant="warning" className="text-[10px]">
                          Warning ({b.warningThreshold}%)
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px]">
                          On Track
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-[11px] mt-0.5">
                      {b.categoryName || "Overall Budget"} • Monthly Cap
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => handleOpenEdit(b)}
                      aria-label="Edit budget"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteBudget(b.id)}
                      aria-label="Delete budget"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 p-4 sm:p-5 pt-0">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-mono font-bold text-xs text-foreground">
                      {formatMinorUnits(b.spentMinor, { currency: b.currency })}
                      <span className="text-[11px] text-muted-foreground font-normal">
                        {" "}
                        of {formatMinorUnits(b.limitAmountMinor, { currency: b.currency })}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-xs text-foreground">{b.progressPercent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(100, b.progressPercent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {b.isExceeded
                        ? `Over by ${formatMinorUnits(b.spentMinor - b.limitAmountMinor, {
                            currency: b.currency,
                          })}`
                        : `${formatMinorUnits(b.remainingMinor, { currency: b.currency })} remaining`}
                    </span>
                    <span>Threshold: {b.warningThreshold}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Budget Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Monthly Budget"
        description="Set a target spending limit for a category or your overall expenses."
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Budget Name</label>
            <Input
              placeholder="e.g. Dining Out, Groceries, Monthly Overall"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Expense Category (Optional)
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Overall Budget (All Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Monthly Limit (₹)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Warning Threshold (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Budget
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Budget"
        description="Update limit or alert thresholds."
      >
        <form onSubmit={handleUpdateBudget} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Budget Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Expense Category
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Overall Budget (All Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Monthly Limit (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Warning Threshold (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
