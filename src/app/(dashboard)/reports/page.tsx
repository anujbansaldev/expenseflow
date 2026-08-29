"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinorUnits } from "@/lib/money/money";
import { formatDate } from "@/lib/dates/dates";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Receipt,
  Layers,
  Landmark,
} from "lucide-react";
import { AccountDto } from "@/services/account.service";
import { CategoryDto } from "@/services/category.service";

interface ReportData {
  summary: {
    totalIncomeMinor: number;
    totalExpenseMinor: number;
    netFlowMinor: number;
    transactionCount: number;
  };
  categoryBreakdown: {
    name: string;
    amountMinor: number;
    count: number;
    color?: string;
    percentage: number;
  }[];
  accountBreakdown: {
    name: string;
    incomeMinor: number;
    expenseMinor: number;
    netMinor: number;
    count: number;
  }[];
  transactions: {
    id: string;
    type: string;
    amountMinor: number;
    currency: string;
    accountName?: string;
    categoryName?: string;
    occurredAt: string;
    merchant?: string;
    description?: string;
  }[];
}

export default function ReportsPage() {
  const [data, setData] = React.useState<ReportData | null>(null);
  const [accounts, setAccounts] = React.useState<AccountDto[]>([]);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters
  const [startDate, setStartDate] = React.useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [typeFilter, setTypeFilter] = React.useState("");
  const [accountFilter, setAccountFilter] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");

  React.useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setAccounts(j.data);
      });
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setCategories(j.data);
      });
  }, []);

  const fetchReport = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (typeFilter) params.set("type", typeFilter);
      if (accountFilter) params.set("accountId", accountFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch {
      toast.error("Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, typeFilter, accountFilter, categoryFilter]);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (typeFilter) params.set("type", typeFilter);
    if (accountFilter) params.set("accountId", accountFilter);
    if (categoryFilter) params.set("categoryId", categoryFilter);

    window.open(`/api/reports/export?${params.toString()}`, "_blank");
    toast.success("Downloading CSV export...");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Financial Reports &amp; Ledger Audit</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Custom date range summaries, category burden breakdowns, account reconciliation, and CSV export.
          </p>
        </div>

        <Button
          onClick={handleExportCsv}
          size="sm"
          className="h-8 gap-1.5 text-xs font-semibold self-start"
        >
          <Download className="w-3.5 h-3.5" />
          Export Ledger CSV
        </Button>
      </div>

      {/* Filter Controls */}
      <Card className="p-3.5 sm:p-4 bg-card shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">From Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">To Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Type</label>
            <select
              className="flex h-8 w-full rounded border border-input bg-background px-2.5 py-1 text-xs focus-visible:ring-1 focus-visible:ring-ring"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Account</label>
            <select
              className="flex h-8 w-full rounded border border-input bg-background px-2.5 py-1 text-xs focus-visible:ring-1 focus-visible:ring-ring"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
            <select
              className="flex h-8 w-full rounded border border-input bg-background px-2.5 py-1 text-xs focus-visible:ring-1 focus-visible:ring-ring"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Period Inflow
              </CardTitle>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {formatMinorUnits(data.summary.totalIncomeMinor, { currency: "INR", showSign: true })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Period Outflow
              </CardTitle>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-rose-800 dark:text-rose-400">
                {formatMinorUnits(-data.summary.totalExpenseMinor, { currency: "INR" })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Net Delta
              </CardTitle>
              <TrendingUp className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  data.summary.netFlowMinor >= 0
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-rose-800 dark:text-rose-400"
                }`}
              >
                {formatMinorUnits(data.summary.netFlowMinor, { currency: "INR", showSign: true })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Entries Audited
              </CardTitle>
              <Receipt className="w-3.5 h-3.5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                {data.summary.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-3 border-b border-border/80">
            <CardTitle className="text-sm font-serif font-bold flex items-center gap-2 text-foreground">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Category Expenses Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            {isLoading || !data ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No expenses found for filter criteria.</p>
            ) : (
              <div className="space-y-2.5">
                {data.categoryBreakdown.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color || "#651F24" }}
                      />
                      <span className="font-semibold text-foreground">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">({c.count} txs)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-foreground">
                        {formatMinorUnits(c.amountMinor, { currency: "INR" })}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                        {c.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Flow Breakdown Table */}
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-3 border-b border-border/80">
            <CardTitle className="text-sm font-serif font-bold flex items-center gap-2 text-foreground">
              <Landmark className="w-3.5 h-3.5 text-primary" />
              Account Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            {isLoading || !data ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data.accountBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No account activity found for filter criteria.</p>
            ) : (
              <div className="space-y-2.5">
                {data.accountBreakdown.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{a.name}</span>
                    <div className="flex items-center gap-2.5 font-mono">
                      <span className="text-emerald-700 dark:text-emerald-400">
                        +{formatMinorUnits(a.incomeMinor, { currency: "INR" })}
                      </span>
                      <span className="text-rose-800 dark:text-rose-400">
                        −{formatMinorUnits(a.expenseMinor, { currency: "INR" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
