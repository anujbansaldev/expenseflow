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
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  Plus,
  MoreVertical,
  Archive,
  RotateCcw,
  Pencil,
  Sparkles,
} from "lucide-react";
import { AccountDto } from "@/services/account.service";

const ACCOUNT_TYPE_ICONS: Record<string, typeof Landmark> = {
  bank: Landmark,
  credit_card: CreditCard,
  cash: Wallet,
  wallet: Wallet,
  savings: PiggyBank,
  other: Wallet,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = React.useState<AccountDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showArchived, setShowArchived] = React.useState(false);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<AccountDto | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("bank");
  const [currency, setCurrency] = React.useState("INR");
  const [openingBalance, setOpeningBalance] = React.useState("0.00");
  const [institution, setInstitution] = React.useState("");
  const [last4, setLast4] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchAccounts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/accounts?includeArchived=${showArchived}`);
      const json = await res.json();
      if (json.data) {
        setAccounts(json.data);
      }
    } catch {
      toast.error("Failed to load accounts.");
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenAdd = () => {
    setName("");
    setType("bank");
    setCurrency("INR");
    setOpeningBalance("0.00");
    setInstitution("");
    setLast4("");
    setNotes("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (acc: AccountDto) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInstitution(acc.institution || "");
    setLast4(acc.last4 || "");
    setNotes(acc.notes || "");
    setIsEditOpen(true);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          currency,
          openingBalance,
          institution: institution || undefined,
          last4: last4 || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");
      setIsAddOpen(false);
      fetchAccounts();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          institution: institution || undefined,
          last4: last4 || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update account");
        return;
      }

      toast.success("Account updated successfully!");
      setIsEditOpen(false);
      fetchAccounts();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (acc: AccountDto) => {
    const newArchived = !acc.isArchived;
    try {
      const res = await fetch(`/api/accounts/${acc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: newArchived }),
      });

      if (!res.ok) {
        toast.error("Failed to update archive status");
        return;
      }

      toast.success(newArchived ? "Account archived." : "Account restored.");
      fetchAccounts();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const totalBalanceMinor = accounts
    .filter((a) => !a.isArchived)
    .reduce((sum, a) => sum + (a.currentBalanceMinor || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts &amp; Wallets</h2>
          <p className="text-sm text-muted-foreground">
            Manage your bank accounts, credit cards, cash wallets, and view combined balances.
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
            Add Account
          </Button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <Card className="glass-panel">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Liquid Net Worth
            </span>
            <div className="text-3xl font-extrabold tracking-tight mt-1">
              {formatMinorUnits(totalBalanceMinor, { currency: "INR" })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              {accounts.filter((a) => !a.isArchived).length} Active Accounts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No accounts found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Create your first bank account or wallet to start tracking financial balances.
          </p>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const Icon = ACCOUNT_TYPE_ICONS[acc.type] || Wallet;
            return (
              <Card
                key={acc.id}
                className={`shadow-sm hover:shadow-md transition-all ${
                  acc.isArchived ? "opacity-60 bg-muted/30" : "bg-card"
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {acc.name}
                        {acc.isArchived && <Badge variant="outline">Archived</Badge>}
                      </CardTitle>
                      <CardDescription className="text-xs capitalize">
                        {acc.type.replace("_", " ")}
                        {acc.institution ? ` • ${acc.institution}` : ""}
                        {acc.last4 ? ` (•••• ${acc.last4})` : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleOpenEdit(acc)}
                      aria-label="Edit account"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleToggleArchive(acc)}
                      title={acc.isArchived ? "Restore" : "Archive"}
                      aria-label={acc.isArchived ? "Restore account" : "Archive account"}
                    >
                      {acc.isArchived ? (
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold font-mono">
                    {formatMinorUnits(acc.currentBalanceMinor, { currency: acc.currency })}
                  </div>
                  {acc.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                      {acc.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Account Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Financial Account"
        description="Connect a new bank account, credit card, cash reserve or wallet."
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Account Name</label>
            <Input
              placeholder="e.g. HDFC Salary, ICICI Coral"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Type</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="bank">Bank Checking</option>
                <option value="savings">Savings Deposit</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="wallet">Digital Wallet</option>
                <option value="other">Other Asset</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Currency</label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="INR"
                disabled
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Opening Balance (₹)</label>
            <Input
              type="text"
              placeholder="0.00"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Bank/Institution (optional)</label>
              <Input
                placeholder="e.g. HDFC Bank"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Last 4 Digits (optional)</label>
              <Input
                placeholder="1234"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Notes (optional)</label>
            <Input
              placeholder="Primary salary credit account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Account Details"
        description="Update naming, institution, or notes for this account."
      >
        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Account Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Type</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="bank">Bank Checking</option>
              <option value="savings">Savings Deposit</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="wallet">Digital Wallet</option>
              <option value="other">Other Asset</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Institution</label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Last 4</label>
              <Input
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
