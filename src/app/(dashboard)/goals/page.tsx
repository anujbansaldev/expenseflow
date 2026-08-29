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
  Target,
  Plus,
  Coins,
  CheckCircle2,
  Calendar,
  Pencil,
  Trash2,
  Archive,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { GoalDto } from "@/services/goal.service";
import { AccountDto } from "@/services/account.service";

export default function GoalsPage() {
  const [goals, setGoals] = React.useState<GoalDto[]>([]);
  const [accounts, setAccounts] = React.useState<AccountDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showArchived, setShowArchived] = React.useState(false);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isContributeOpen, setIsContributeOpen] = React.useState(false);
  const [selectedGoal, setSelectedGoal] = React.useState<GoalDto | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [initialAmount, setInitialAmount] = React.useState("0.00");
  const [targetDate, setTargetDate] = React.useState("");
  const [colorToken, setColorToken] = React.useState("#6366f1");
  const [contributionAmount, setContributionAmount] = React.useState("");
  const [contributionAccountId, setContributionAccountId] = React.useState("");
  const [contributionNotes, setContributionNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchGoals = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/goals?includeArchived=${showArchived}`);
      const json = await res.json();
      if (json.data) {
        setGoals(json.data);
      }
    } catch {
      toast.error("Failed to load savings goals.");
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  React.useEffect(() => {
    fetchGoals();
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setAccounts(j.data);
      });
  }, [fetchGoals]);

  const handleOpenAdd = () => {
    setName("");
    setTargetAmount("");
    setInitialAmount("0.00");
    setTargetDate("");
    setColorToken("#6366f1");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (g: GoalDto) => {
    setSelectedGoal(g);
    setName(g.name);
    setTargetAmount((g.targetAmountMinor / 100).toFixed(2));
    setTargetDate(g.targetDate ? new Date(g.targetDate).toISOString().split("T")[0] : "");
    setColorToken(g.colorToken || "#6366f1");
    setIsEditOpen(true);
  };

  const handleOpenContribute = (g: GoalDto) => {
    setSelectedGoal(g);
    setContributionAmount("");
    setContributionNotes("");
    if (accounts.length > 0) setContributionAccountId(accounts[0].id);
    setIsContributeOpen(true);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || Number(targetAmount) <= 0) {
      toast.error("Valid name and target amount are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetAmount,
          initialAmount,
          targetDate: targetDate || undefined,
          colorToken,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create goal");
        return;
      }

      toast.success("Savings goal created!");
      setIsAddOpen(false);
      fetchGoals();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetAmount,
          targetDate: targetDate ? targetDate : null,
          colorToken,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update goal");
        return;
      }

      toast.success("Goal updated!");
      setIsEditOpen(false);
      fetchGoals();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !contributionAmount || Number(contributionAmount) <= 0) {
      toast.error("Valid contribution amount is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/goals/${selectedGoal.id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: contributionAmount,
          accountId: contributionAccountId || undefined,
          notes: contributionNotes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to add contribution");
        return;
      }

      toast.success("Contribution recorded!");
      setIsContributeOpen(false);
      fetchGoals();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (g: GoalDto) => {
    const newArchived = !g.isArchived;
    try {
      const res = await fetch(`/api/goals/${g.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: newArchived }),
      });

      if (!res.ok) {
        toast.error("Failed to update goal status");
        return;
      }

      toast.success(newArchived ? "Goal archived." : "Goal restored.");
      fetchGoals();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const totalSavedMinor = goals.reduce((sum, g) => sum + g.currentAmountMinor, 0);
  const totalTargetMinor = goals.reduce((sum, g) => sum + g.targetAmountMinor, 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Savings &amp; Financial Goals</h2>
          <p className="text-sm text-muted-foreground">
            Target capital milestones, track contributions, and celebrate financial victories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showArchived ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 font-semibold">
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Aggregate Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Saved Towards Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {formatMinorUnits(totalSavedMinor, { currency: "INR" })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Target Goal Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono">
              {formatMinorUnits(totalTargetMinor, { currency: "INR" })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {totalTargetMinor > 0 ? ((totalSavedMinor / totalTargetMinor) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No savings goals yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Create a goal for an emergency fund, dream vacation, vehicle downpayment, or house purchase.
          </p>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            return (
              <Card
                key={goal.id}
                className={`shadow-sm hover:shadow-md transition-all ${
                  goal.isArchived ? "opacity-60 bg-muted/20" : "bg-card"
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: goal.colorToken || "#6366f1" }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {goal.name}
                        {goal.isCompleted && (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Target: {formatMinorUnits(goal.targetAmountMinor, { currency: goal.currency })}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleOpenEdit(goal)}
                      aria-label="Edit goal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleToggleArchive(goal)}
                      title={goal.isArchived ? "Restore" : "Archive"}
                      aria-label={goal.isArchived ? "Restore goal" : "Archive goal"}
                    >
                      {goal.isArchived ? (
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-mono font-bold text-lg text-foreground">
                      {formatMinorUnits(goal.currentAmountMinor, { currency: goal.currency })}
                    </span>
                    <span className="font-bold text-xs">{goal.progressPercent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, goal.progressPercent)}%`,
                        backgroundColor: goal.colorToken || "#6366f1",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      {goal.targetDate && (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{goal.daysRemaining} days left</span>
                        </>
                      )}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 font-semibold"
                      onClick={() => handleOpenContribute(goal)}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      Contribute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Goal Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Savings Goal"
        description="Set a target financial milestone to start accumulating funds."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Goal Name</label>
            <Input
              placeholder="e.g. Emergency Fund, New Car, Tokyo Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Target Amount (₹)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="100000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Initial Deposit (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Target Date (Optional)</label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Color Theme</label>
            <div className="flex items-center gap-2">
              {["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899"].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColorToken(hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    colorToken === hex ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Goal
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        title={`Contribute to ${selectedGoal?.name}`}
        description="Add funds to bring your goal closer to completion."
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Contribution Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="5000.00"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Source Account (Optional)</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
              value={contributionAccountId}
              onChange={(e) => setContributionAccountId(e.target.value)}
            >
              <option value="">None</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Notes (Optional)</label>
            <Input
              placeholder="e.g. Monthly salary savings"
              value={contributionNotes}
              onChange={(e) => setContributionNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsContributeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Contribution
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Savings Goal"
        description="Update target amount or target milestone date."
      >
        <form onSubmit={handleUpdateGoal} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Goal Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Target Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Target Date</label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
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
