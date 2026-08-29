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
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Search,
  Filter,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { TransactionDto } from "@/services/transaction.service";
import { AccountDto } from "@/services/account.service";
import { CategoryDto } from "@/services/category.service";

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<TransactionDto[]>([]);
  const [accounts, setAccounts] = React.useState<AccountDto[]>([]);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Summary state
  const [summary, setSummary] = React.useState({
    incomeMinor: 0,
    expenseMinor: 0,
    netFlowMinor: 0,
  });

  // Filter state
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [typeFilter, setTypeFilter] = React.useState<string>("");
  const [accountFilter, setAccountFilter] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Dialog state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingTx, setEditingTx] = React.useState<TransactionDto | null>(null);

  // Form state
  const [type, setType] = React.useState<"expense" | "income" | "transfer">("expense");
  const [amount, setAmount] = React.useState("");
  const [accountId, setAccountId] = React.useState("");
  const [destinationAccountId, setDestinationAccountId] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [occurredAt, setOccurredAt] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [merchant, setMerchant] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch accounts & categories for form dropdowns
  React.useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setAccounts(j.data);
          if (j.data.length > 0 && !accountId) {
            setAccountId(j.data[0].id);
          }
        }
      });

    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setCategories(j.data);
        }
      });
  }, []);

  const fetchTransactions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });

      if (typeFilter) params.set("type", typeFilter);
      if (accountFilter) params.set("accountId", accountFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const [txRes, summaryRes] = await Promise.all([
        fetch(`/api/transactions?${params.toString()}`),
        fetch("/api/transactions/summary"),
      ]);

      const txJson = await txRes.json();
      const summaryJson = await summaryRes.json();

      if (txJson.data) {
        setTransactions(txJson.data);
        setTotalPages(txJson.meta?.totalPages || 1);
        setTotalCount(txJson.meta?.total || 0);
      }

      if (summaryJson.data) {
        setSummary(summaryJson.data);
      }
    } catch {
      toast.error("Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, accountFilter, categoryFilter, searchQuery]);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleOpenAdd = () => {
    setType("expense");
    setAmount("");
    setOccurredAt(new Date().toISOString().split("T")[0]);
    setMerchant("");
    setDescription("");
    setNotes("");
    if (accounts.length > 0) setAccountId(accounts[0].id);
    const firstExpCat = categories.find((c) => c.type === "expense");
    if (firstExpCat) setCategoryId(firstExpCat.id);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (tx: TransactionDto) => {
    setEditingTx(tx);
    setType(tx.type);
    setAmount((tx.amountMinor / 100).toFixed(2));
    setAccountId(tx.accountId);
    setDestinationAccountId(tx.destinationAccountId || "");
    setCategoryId(tx.categoryId || "");
    setOccurredAt(new Date(tx.occurredAt).toISOString().split("T")[0]);
    setMerchant(tx.merchant || "");
    setDescription(tx.description || "");
    setNotes(tx.notes || "");
    setIsEditOpen(true);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    if (!accountId) {
      toast.error("Please select a source account");
      return;
    }
    if (type === "transfer" && (!destinationAccountId || destinationAccountId === accountId)) {
      toast.error("Please select a different destination account for transfer");
      return;
    }
    if (type !== "transfer" && !categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount,
          accountId,
          destinationAccountId: type === "transfer" ? destinationAccountId : undefined,
          categoryId: type !== "transfer" ? categoryId : undefined,
          occurredAt,
          merchant: merchant || undefined,
          description: description || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to record transaction");
        return;
      }

      toast.success("Transaction recorded!");
      setIsAddOpen(false);
      fetchTransactions();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount,
          accountId,
          destinationAccountId: type === "transfer" ? destinationAccountId : null,
          categoryId: type !== "transfer" ? categoryId : null,
          occurredAt,
          merchant: merchant || undefined,
          description: description || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update transaction");
        return;
      }

      toast.success("Transaction updated!");
      setIsEditOpen(false);
      fetchTransactions();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This will reverse its effect on account balances.")) {
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete transaction");
        return;
      }

      toast.success("Transaction deleted.");
      fetchTransactions();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const filteredCategoriesForForm = categories.filter((c) => c.type === type && !c.isArchived);

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction Ledger</h2>
          <p className="text-sm text-muted-foreground">
            Complete record of your income, expenses, and atomic account transfers.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 font-semibold shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" />
          New Transaction
        </Button>
      </div>

      {/* Cash Flow Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Income
            </CardTitle>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatMinorUnits(summary.incomeMinor, { currency: "INR", showSign: true })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Expenses
            </CardTitle>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatMinorUnits(-summary.expenseMinor, { currency: "INR" })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Savings Flow
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-extrabold ${
                summary.netFlowMinor >= 0
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatMinorUnits(summary.netFlowMinor, { currency: "INR", showSign: true })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-card/60">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search merchant, notes..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Type selector */}
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="transfer">Transfers</option>
            </select>

            {/* Account selector */}
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring max-w-[150px]"
              value={accountFilter}
              onChange={(e) => {
                setAccountFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>

            {/* Category selector */}
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring max-w-[150px]"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type})
                </option>
              ))}
            </select>

            {(typeFilter || accountFilter || categoryFilter || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setTypeFilter("");
                  setAccountFilter("");
                  setCategoryFilter("");
                  setSearchQuery("");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Ledger Table & List View */}
      {isLoading ? (
        <Card className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No transactions found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            No ledger entries matched your active filters. Add a new income, expense or transfer.
          </p>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Transaction
          </Button>
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type / Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isExpense = tx.type === "expense";
                  const isTransfer = tx.type === "transfer";

                  return (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.occurredAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isExpense
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : isExpense ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <Repeat className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-tight">
                              {tx.merchant || tx.description || (isTransfer ? "Transfer" : "Transaction")}
                            </p>
                            {tx.notes && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {tx.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isTransfer ? (
                          <Badge variant="secondary" className="text-[11px]">
                            Internal Transfer
                          </Badge>
                        ) : tx.categoryName ? (
                          <Badge variant="outline" className="text-[11px] gap-1 font-medium">
                            {tx.categoryName}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">
                        {isTransfer ? (
                          <span className="text-muted-foreground">
                            {tx.accountName} $\to$ {tx.destinationAccountName}
                          </span>
                        ) : (
                          <span className="text-foreground">{tx.accountName}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isExpense
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }
                        >
                          {isExpense
                            ? `−${formatMinorUnits(tx.amountMinor, { currency: tx.currency })}`
                            : isIncome
                            ? `+${formatMinorUnits(tx.amountMinor, { currency: tx.currency })}`
                            : formatMinorUnits(tx.amountMinor, { currency: tx.currency })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleOpenEdit(tx)}
                            aria-label="Edit transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            aria-label="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border bg-card">
              <span className="text-xs text-muted-foreground">
                Showing {transactions.length} of {totalCount} transactions
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>
                <span className="text-xs font-medium px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-8 gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add Transaction Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Transaction"
        description="Add a new income, expense or account transfer to your ledger."
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          {/* Type Segmented Control */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border">
            <button
              type="button"
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === "expense"
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setType("expense");
                const expCat = categories.find((c) => c.type === "expense");
                if (expCat) setCategoryId(expCat.id);
              }}
            >
              Expense
            </button>
            <button
              type="button"
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setType("income");
                const incCat = categories.find((c) => c.type === "income");
                if (incCat) setCategoryId(incCat.id);
              }}
            >
              Income
            </button>
            <button
              type="button"
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === "transfer"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setType("transfer");
                const otherAcc = accounts.find((a) => a.id !== accountId);
                if (otherAcc) setDestinationAccountId(otherAcc.id);
              }}
            >
              Transfer
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="text-lg font-bold font-mono h-12"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Source Account & Category / Destination Account */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {type === "transfer" ? "Source Account" : "Account"}
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                {accounts.filter((a) => !a.isArchived).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {type === "transfer" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Destination Account</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  required
                >
                  <option value="">Select Destination</option>
                  {accounts
                    .filter((a) => !a.isArchived && a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {filteredCategoriesForForm.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Date</label>
              <Input
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {type === "income" ? "Payer / Source" : "Merchant / Store"}
              </label>
              <Input
                placeholder="e.g. Swiggy, Amazon, Employer"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Notes (Optional)</label>
            <Input
              placeholder="Add optional context or reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Transaction
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Transaction"
        description="Update transaction details in ledger."
      >
        <form onSubmit={handleUpdateTransaction} className="space-y-4">
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

            {type === "transfer" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Destination Account</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  required
                >
                  <option value="">Select Destination</option>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
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
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Date</label>
              <Input
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Merchant / Entity</label>
              <Input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
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
