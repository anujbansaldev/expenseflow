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
  CalendarDays,
  Plus,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import { BillDto } from "@/services/bill.service";
import { AccountDto } from "@/services/account.service";
import { CategoryDto } from "@/services/category.service";

export default function BillsPage() {
  const [bills, setBills] = React.useState<BillDto[]>([]);
  const [accounts, setAccounts] = React.useState<AccountDto[]>([]);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [activeTab, setActiveTab] = React.useState<"pending" | "paid">("pending");
  const [isLoading, setIsLoading] = React.useState(true);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isPayOpen, setIsPayOpen] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<BillDto | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [recurringFrequency, setRecurringFrequency] = React.useState("monthly");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchBills = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/bills");
      const json = await res.json();
      if (json.data) {
        setBills(json.data);
      }
    } catch {
      toast.error("Failed to load bills.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBills();
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setAccounts(j.data);
          if (j.data.length > 0) setAccountId(j.data[0].id);
        }
      });
    fetch("/api/categories?type=expense")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setCategories(j.data);
          if (j.data.length > 0) setCategoryId(j.data[0].id);
        }
      });
  }, [fetchBills]);

  const handleOpenAdd = () => {
    setName("");
    setAmount("");
    setDueDate(new Date().toISOString().split("T")[0]);
    setIsRecurring(false);
    setRecurringFrequency("monthly");
    setNotes("");
    if (accounts.length > 0) setAccountId(accounts[0].id);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (b: BillDto) => {
    setSelectedBill(b);
    setName(b.name);
    setAmount((b.amountMinor / 100).toFixed(2));
    setDueDate(new Date(b.dueDate).toISOString().split("T")[0]);
    setAccountId(b.accountId || (accounts.length > 0 ? accounts[0].id : ""));
    setCategoryId(b.categoryId || (categories.length > 0 ? categories[0].id : ""));
    setIsRecurring(b.isRecurring);
    setRecurringFrequency(b.recurringFrequency || "monthly");
    setNotes(b.notes || "");
    setIsEditOpen(true);
  };

  const handleOpenPay = (b: BillDto) => {
    setSelectedBill(b);
    setAccountId(b.accountId || (accounts.length > 0 ? accounts[0].id : ""));
    setCategoryId(b.categoryId || (categories.length > 0 ? categories[0].id : ""));
    setIsPayOpen(true);
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || Number(amount) <= 0) {
      toast.error("Name and valid amount are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount,
          dueDate,
          accountId: accountId || undefined,
          categoryId: categoryId || undefined,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to create bill");
        return;
      }

      toast.success("Bill scheduled successfully!");
      setIsAddOpen(false);
      fetchBills();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/bills/${selectedBill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount,
          dueDate,
          accountId: accountId || null,
          categoryId: categoryId || null,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update bill");
        return;
      }

      toast.success("Bill updated!");
      setIsEditOpen(false);
      fetchBills();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/bills/${selectedBill.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountId || undefined,
          categoryId: categoryId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to record bill payment");
        return;
      }

      toast.success("Bill marked as paid and recorded in ledger!");
      setIsPayOpen(false);
      fetchBills();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      const res = await fetch(`/api/bills/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete bill");
        return;
      }
      toast.success("Bill deleted.");
      fetchBills();
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const pendingBills = bills.filter((b) => b.status === "upcoming" || b.status === "overdue");
  const paidBills = bills.filter((b) => b.status === "paid" || b.status === "skipped");
  const displayedBills = activeTab === "pending" ? pendingBills : paidBills;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Upcoming Bills &amp; Fixed Dues</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Track utility schedules, credit invoices, subscriptions, and execute 1-click ledger payments.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 gap-1.5 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" />
          Add Bill
        </Button>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeTab === "pending"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending &amp; Overdue ({pendingBills.length})
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeTab === "paid"
              ? "bg-emerald-700 text-white dark:bg-emerald-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Paid History ({paidBills.length})
        </button>
      </div>

      {/* Bills Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : displayedBills.length === 0 ? (
        <Card className="p-8 text-center shadow-none">
          <h3 className="text-sm font-serif font-bold text-foreground">
            No {activeTab === "pending" ? "pending" : "paid"} bills
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            {activeTab === "pending"
              ? "You're all caught up on your scheduled payments!"
              : "Mark bills as paid to build your payment history."}
          </p>
          {activeTab === "pending" && (
            <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Bill
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedBills.map((bill) => {
            const isOverdue = bill.status === "overdue";
            const isPaid = bill.status === "paid";

            return (
              <Card
                key={bill.id}
                className={`shadow-none ${
                  isOverdue
                    ? "border-destructive/40 bg-destructive/5"
                    : isPaid
                    ? "opacity-60 bg-muted/20"
                    : "bg-card"
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-1.5 p-4 sm:p-5">
                  <div>
                    <CardTitle className="text-sm sm:text-base font-serif font-bold flex items-center gap-1.5 text-foreground">
                      {bill.name}
                      {isOverdue ? (
                        <Badge variant="destructive" className="text-[9px]">
                          Overdue
                        </Badge>
                      ) : isPaid ? (
                        <Badge variant="success" className="text-[9px]">
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px]">
                          Due Soon
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-[11px] mt-0.5">
                      {bill.categoryName || "General Expense"}
                      {bill.isRecurring ? ` • ${bill.recurringFrequency}` : ""}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => handleOpenEdit(bill)}
                      aria-label="Edit bill"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteBill(bill.id)}
                      aria-label="Delete bill"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 p-4 sm:p-5 pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                        Amount Due
                      </span>
                      <span className="text-lg sm:text-xl font-bold font-mono text-foreground">
                        {formatMinorUnits(bill.amountMinor, { currency: bill.currency })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                        Due Date
                      </span>
                      <span
                        className={`text-xs font-mono font-medium ${
                          isOverdue ? "text-rose-800 dark:text-rose-400 font-bold" : "text-foreground"
                        }`}
                      >
                        {formatDate(bill.dueDate)}
                      </span>
                    </div>
                  </div>

                  {!isPaid && (
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs font-semibold gap-1.5"
                      onClick={() => handleOpenPay(bill)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Paid &amp; Record
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Bill Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Bill Payment"
        description="Add upcoming utilities, subscriptions, or credit card dues."
      >
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Bill Name</label>
            <Input
              placeholder="e.g. Electricity Bill, WiFi, Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Payment Account (Optional)
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">None (Select when paying)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Category (Optional)
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Notes</label>
            <Input
              placeholder="e.g. Reference No. 987654"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Schedule Bill
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Bill Details"
        description="Update amount or due date."
      >
        <form onSubmit={handleUpdateBill} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Bill Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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

      {/* Mark Bill Paid Dialog */}
      <Dialog
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        title="Mark Bill as Paid"
        description="Record this bill as paid and create an atomic expense transaction in your ledger."
      >
        <form onSubmit={handleConfirmPay} className="space-y-4">
          <div className="p-3 rounded-xl bg-muted/60 text-xs space-y-1">
            <p className="font-semibold text-foreground">{selectedBill?.name}</p>
            <p className="font-bold font-mono text-sm text-rose-600 dark:text-rose-400">
              {selectedBill && formatMinorUnits(selectedBill.amountMinor, { currency: selectedBill.currency })}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Payment Account</label>
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
            <label className="text-xs font-semibold text-muted-foreground">Expense Category</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsPayOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Confirm Payment
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
