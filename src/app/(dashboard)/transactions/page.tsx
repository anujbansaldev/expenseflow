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
  FolderPlus,
  Landmark,
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

  // Quick Creator Modals
  const [isQuickAccountOpen, setIsQuickAccountOpen] = React.useState(false);
  const [quickAccountName, setQuickAccountName] = React.useState("");
  const [quickAccountType, setQuickAccountType] = React.useState<string>("bank");
  const [quickAccountBalance, setQuickAccountBalance] = React.useState("0.00");
  const [isCreatingAccount, setIsCreatingAccount] = React.useState(false);

  const [isQuickCategoryOpen, setIsQuickCategoryOpen] = React.useState(false);
  const [quickCategoryName, setQuickCategoryName] = React.useState("");
  const [quickCategoryColor, setQuickCategoryColor] = React.useState("#6366f1");
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);

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

  // Helper to refresh accounts and categories
  const reloadAccountsAndCategories = React.useCallback(async () => {
    const [accRes, catRes] = await Promise.all([
      fetch("/api/accounts"),
      fetch("/api/categories"),
    ]);
    const accJson = await accRes.json();
    const catJson = await catRes.json();
    if (accJson.data) setAccounts(accJson.data);
    if (catJson.data) setCategories(catJson.data);
    return { accounts: accJson.data || [], categories: catJson.data || [] };
  }, []);

  React.useEffect(() => {
    reloadAccountsAndCategories().then(({ accounts: accList, categories: catList }) => {
      if (accList.length > 0 && !accountId) {
        setAccountId(accList[0].id);
      }
      if (catList.length > 0 && !categoryId) {
        const firstExp = catList.find((c: any) => c.type === "expense");
        if (firstExp) setCategoryId(firstExp.id);
      }
    });
  }, [reloadAccountsAndCategories]);

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
      toast.error("Please select a source account or click + New Account");
      return;
    }
    if (type === "transfer" && (!destinationAccountId || destinationAccountId === accountId)) {
      toast.error("Please select a different destination account for transfer");
      return;
    }
    if (type !== "transfer" && !categoryId) {
      toast.error("Please select a category or click + New Category");
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

  // Quick Account Submission
  const handleQuickCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAccountName.trim()) {
      toast.error("Account name is required");
      return;
    }

    try {
      setIsCreatingAccount(true);
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickAccountName.trim(),
          type: quickAccountType,
          openingBalance: quickAccountBalance || "0.00",
          currency: "INR",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create account");
        return;
      }

      toast.success(`Account "${quickAccountName}" created!`);
      const { accounts: updatedAccounts } = await reloadAccountsAndCategories();
      setAccountId(json.data.id);
      setIsQuickAccountOpen(false);
      setQuickAccountName("");
      setQuickAccountBalance("0.00");
    } catch {
      toast.error("Failed to create account.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Quick Category Submission
  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickCategoryName.trim(),
          type: type === "transfer" ? "expense" : type,
          colorToken: quickCategoryColor,
          icon: "Tag",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create category");
        return;
      }

      toast.success(`Category "${quickCategoryName}" created!`);
      await reloadAccountsAndCategories();
      setCategoryId(json.data.id);
      setIsQuickCategoryOpen(false);
      setQuickCategoryName("");
    } catch {
      toast.error("Failed to create category.");
    } finally {
      setIsCreatingCategory(false);
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
              Net Cash Flow
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

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-card/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search merchant, description..."
              className="pl-9 text-xs h-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Account Filter */}
          <select
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring"
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

          {/* Category Filter */}
          <select
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Transactions Data Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-24 h-6" />
            </Card>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold">No transactions found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || typeFilter || accountFilter || categoryFilter
              ? "No records match your active search filters. Try clearing some filters."
              : "Start recording your daily income and expense entries to track your cash flow."}
          </p>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Record Transaction
          </Button>
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Entity / Merchant</th>
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
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.occurredAt, "dd MMM yyyy")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">
                          {tx.merchant || (isTransfer ? "Account Transfer" : "Transaction")}
                        </div>
                        {tx.description && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isTransfer ? (
                          <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
                            <Repeat className="w-3 h-3 text-primary" />
                            Transfer
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="font-medium text-[10px]">
                            {tx.categoryName || "Uncategorized"}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium">{tx.accountName || "Account"}</span>
                        {isTransfer && tx.destinationAccountName && (
                          <span className="text-muted-foreground ml-1">
                            → {tx.destinationAccountName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isExpense
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {formatMinorUnits(
                            isExpense ? -tx.amountMinor : tx.amountMinor,
                            { currency: tx.currency, showSign: isIncome }
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  {type === "transfer" ? "Source Account" : "Account"}
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickAccountOpen(true)}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add Account
                </button>
              </div>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={accountId}
                onChange={(e) => {
                  if (e.target.value === "__NEW_ACCOUNT__") {
                    setIsQuickAccountOpen(true);
                  } else {
                    setAccountId(e.target.value);
                  }
                }}
                required
              >
                {accounts.filter((a) => !a.isArchived).length === 0 && (
                  <option value="">No accounts found — click + Add</option>
                )}
                {accounts.filter((a) => !a.isArchived).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
                <option value="__NEW_ACCOUNT__">+ Create New Account...</option>
              </select>
            </div>

            {type === "transfer" ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">Destination Account</label>
                  <button
                    type="button"
                    onClick={() => setIsQuickAccountOpen(true)}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Account
                  </button>
                </div>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                  value={destinationAccountId}
                  onChange={(e) => {
                    if (e.target.value === "__NEW_ACCOUNT__") {
                      setIsQuickAccountOpen(true);
                    } else {
                      setDestinationAccountId(e.target.value);
                    }
                  }}
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
                  <option value="__NEW_ACCOUNT__">+ Create New Account...</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsQuickCategoryOpen(true)}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                  value={categoryId}
                  onChange={(e) => {
                    if (e.target.value === "__NEW_CATEGORY__") {
                      setIsQuickCategoryOpen(true);
                    } else {
                      setCategoryId(e.target.value);
                    }
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {filteredCategoriesForForm.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__NEW_CATEGORY__">+ Create New Category...</option>
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
                {type === "income" ? "Payer / Source" : "Merchant / Entity"}
              </label>
              <Input
                placeholder="e.g. Swiggy, Amazon, Employer"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description (Optional)</label>
            <Input
              placeholder="e.g. Monthly grocery stock up"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
        description="Update transaction details in your ledger."
      >
        <form onSubmit={handleUpdateTransaction} className="space-y-4">
          {/* Amount Input */}
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

          {/* Source Account & Category / Destination Account */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  {type === "transfer" ? "Source Account" : "Account"}
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickAccountOpen(true)}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  + Add
                </button>
              </div>
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsQuickCategoryOpen(true)}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    + Add
                  </button>
                </div>
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
                {type === "income" ? "Payer / Source" : "Merchant / Entity"}
              </label>
              <Input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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

      {/* Quick Add Account Sub-Dialog */}
      <Dialog
        isOpen={isQuickAccountOpen}
        onClose={() => setIsQuickAccountOpen(false)}
        title="Quick Add Account"
        description="Create a new bank, wallet or cash account without leaving this form."
      >
        <form onSubmit={handleQuickCreateAccount} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Account Name</label>
            <Input
              placeholder="e.g. HDFC Salary Bank, Cash Pocket"
              value={quickAccountName}
              onChange={(e) => setQuickAccountName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Type</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={quickAccountType}
                onChange={(e) => setQuickAccountType(e.target.value)}
              >
                <option value="bank">Bank Checking</option>
                <option value="savings">Savings Account</option>
                <option value="cash">Cash Wallet</option>
                <option value="credit_card">Credit Card</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Opening Balance (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={quickAccountBalance}
                onChange={(e) => setQuickAccountBalance(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsQuickAccountOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingAccount}>
              Add &amp; Select Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Quick Add Category Sub-Dialog */}
      <Dialog
        isOpen={isQuickCategoryOpen}
        onClose={() => setIsQuickCategoryOpen(false)}
        title={`Quick Add ${type === "income" ? "Income" : "Expense"} Category`}
        description="Create a new category tag and select it immediately."
      >
        <form onSubmit={handleQuickCreateCategory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category Name</label>
            <Input
              placeholder="e.g. Groceries, Freelance, Subscriptions"
              value={quickCategoryName}
              onChange={(e) => setQuickCategoryName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Color Theme</label>
            <div className="flex items-center gap-2">
              {["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899"].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setQuickCategoryColor(hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    quickCategoryColor === hex ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsQuickCategoryOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingCategory}>
              Add &amp; Select Category
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
