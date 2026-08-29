"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { formatMinorUnits } from "@/lib/money/money";
import { formatDate } from "@/lib/dates/dates";
import { toast } from "sonner";
import {
  Repeat,
  Plus,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { RecurringRuleDto } from "@/services/recurring.service";
import { AccountDto } from "@/services/account.service";
import { CategoryDto } from "@/services/category.service";

export default function RecurringPage() {
  const [rules, setRules] = React.useState<RecurringRuleDto[]>([]);
  const [accounts, setAccounts] = React.useState<AccountDto[]>([]);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Dialog state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<RecurringRuleDto | null>(null);

  // Form state
  const [type, setType] = React.useState<"income" | "expense">("expense");
  const [amount, setAmount] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [frequency, setFrequency] = React.useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = React.useState("");
  const [merchant, setMerchant] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchRules = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/recurring");
      const json = await res.json();
      if (json.data) {
        setRules(json.data);
      }
    } catch {
      toast.error("Failed to load recurring rules.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRules();
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setAccounts(j.data);
          if (j.data.length > 0) setAccountId(j.data[0].id);
        }
      });
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setCategories(j.data);
          const firstExp = j.data.find((c: CategoryDto) => c.type === "expense");
          if (firstExp) setCategoryId(firstExp.id);
        }
      });
  }, [fetchRules]);

  const handleOpenAdd = () => {
    setType("expense");
    setAmount("");
    setFrequency("monthly");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setMerchant("");
    setNotes("");
    if (accounts.length > 0) setAccountId(accounts[0].id);
    const expCat = categories.find((c) => c.type === "expense");
    if (expCat) setCategoryId(expCat.id);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (rule: RecurringRuleDto) => {
    setEditingRule(rule);
    setAmount((rule.amountMinor / 100).toFixed(2));
    setAccountId(rule.accountId);
    setCategoryId(rule.categoryId);
    setFrequency(rule.frequency as any);
    setEndDate(rule.endDate ? new Date(rule.endDate).toISOString().split("T")[0] : "");
    setMerchant(rule.merchant || "");
    setNotes(rule.notes || "");
    setIsEditOpen(true);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }
    if (!accountId || !categoryId) {
      toast.error("Account and category are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount,
          accountId,
          categoryId,
          frequency,
          startDate,
          endDate: endDate || undefined,
          merchant: merchant || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create rule");
        return;
      }

      toast.success("Recurring rule scheduled!");
      setIsAddOpen(false);
      fetchRules();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/recurring/${editingRule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          accountId,
          categoryId,
          frequency,
          endDate: endDate ? endDate : null,
          merchant: merchant || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update rule");
        return;
      }

      toast.success("Recurring rule updated!");
      setIsEditOpen(false);
      fetchRules();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePause = async (rule: RecurringRuleDto) => {
    const newActive = !rule.isActive;
    try {
      const res = await fetch(`/api/recurring/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (!res.ok) {
        toast.error("Failed to toggle rule state");
        return;
      }

      toast.success(newActive ? "Rule resumed." : "Rule paused.");
      fetchRules();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring schedule?")) return;
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete rule");
        return;
      }
      toast.success("Recurring schedule deleted.");
      fetchRules();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleProcessDue = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/recurring/process", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.meta?.message || "Processed due recurring transactions.");
        fetchRules();
      } else {
        toast.error(json.error?.message || "Failed to process recurring transactions.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredCategoriesForForm = categories.filter((c) => c.type === type && !c.isArchived);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recurring Schedules</h2>
          <p className="text-sm text-muted-foreground">
            Automate routine salary deposits, subscriptions, utility bills, and loan repayments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcessDue}
            disabled={isProcessing}
            className="gap-1.5 font-semibold text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            Run Due Schedules
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 font-semibold">
            <Plus className="w-4 h-4" />
            New Recurring Rule
          </Button>
        </div>
      </div>

      {/* Rules Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No recurring schedules</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Set up automatic recurrence for your salary, rent, Netflix, or insurance premiums.
          </p>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Recurring Schedule
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rules.map((rule) => {
            const isIncome = rule.type === "income";

            return (
              <Card
                key={rule.id}
                className={`shadow-sm hover:shadow-md transition-all ${
                  !rule.isActive ? "opacity-60 bg-muted/20" : "bg-card"
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-1.5">
                        {rule.merchant || rule.categoryName}
                        {!rule.isActive && (
                          <Badge variant="outline" className="text-[10px]">
                            Paused
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs capitalize">
                        {rule.frequency} • {rule.categoryName}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleTogglePause(rule)}
                      title={rule.isActive ? "Pause" : "Resume"}
                      aria-label={rule.isActive ? "Pause recurring rule" : "Resume recurring rule"}
                    >
                      {rule.isActive ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleOpenEdit(rule)}
                      aria-label="Edit recurring rule"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteRule(rule.id)}
                      aria-label="Delete recurring rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 space-y-2.5">
                  <div
                    className={`text-xl font-bold font-mono ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatMinorUnits(rule.amountMinor, { currency: rule.currency })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-2">
                    <span>Target: {rule.accountName}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-primary" />
                      Next: {formatDate(rule.nextRunAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Recurring Rule Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Recurring Transaction"
        description="Set up automatic routine deposits or recurring bill deductions."
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setType("expense");
                const expCat = categories.find((c) => c.type === "expense");
                if (expCat) setCategoryId(expCat.id);
              }}
            >
              Recurring Expense
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "success" : "outline"}
              size="sm"
              onClick={() => {
                setType("income");
                const incCat = categories.find((c) => c.type === "income");
                if (incCat) setCategoryId(incCat.id);
              }}
            >
              Recurring Income
            </Button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Account</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {filteredCategoriesForForm.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Frequency</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Merchant / Entity</label>
              <Input
                placeholder="e.g. Netflix, Landlord, Employer"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">End Date (Optional)</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Schedule
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Recurring Rule Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Recurring Schedule"
        description="Update amount or frequency for this schedule."
      >
        <form onSubmit={handleUpdateRule} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Account</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Frequency</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Merchant</label>
              <Input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
