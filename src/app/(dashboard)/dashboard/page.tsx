"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { formatMinorUnits } from "@/lib/money/money";
import { formatDate } from "@/lib/dates/dates";
import { toast } from "sonner";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowRight,
  Sparkles,
  Repeat,
} from "lucide-react";
import { AccountDto } from "@/services/account.service";
import { TransactionDto } from "@/services/transaction.service";
import { CashFlowTrendPoint, CategorySpendingPoint } from "@/repositories/analytics.repository";

interface DashboardData {
  period: {
    preset: string;
    startDate: string;
    endDate: string;
  };
  kpis: {
    totalBalanceMinor: number;
    incomeMinor: number;
    expenseMinor: number;
    netFlowMinor: number;
    activeAccountsCount: number;
  };
  accounts: AccountDto[];
  cashFlowTrend: CashFlowTrendPoint[];
  categorySpending: CategorySpendingPoint[];
  recentTransactions: TransactionDto[];
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [preset, setPreset] = React.useState<string>("this_month");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDashboard = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/analytics/dashboard?preset=${preset}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch {
      toast.error("Failed to load dashboard overview.");
    } finally {
      setIsLoading(false);
    }
  }, [preset]);

  React.useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Date Preset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Command Center</h2>
          <p className="text-sm text-muted-foreground">
            Real-time ledger overview, net cash flow, and spending distributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-medium">
            {[
              { id: "this_month", label: "This Month" },
              { id: "last_30_days", label: "30 Days" },
              { id: "last_90_days", label: "90 Days" },
              { id: "this_year", label: "This Year" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPreset(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  preset === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link href="/transactions">
            <Button size="sm" className="gap-1.5 font-semibold shadow-sm">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-36" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Liquid Net Worth */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Balance
              </CardTitle>
              <Wallet className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold tracking-tight">
                {formatMinorUnits(data.kpis.totalBalanceMinor, { currency: "INR" })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {data.kpis.activeAccountsCount} tracked accounts
              </p>
            </CardContent>
          </Card>

          {/* Period Income */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Period Income
              </CardTitle>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatMinorUnits(data.kpis.incomeMinor, { currency: "INR", showSign: true })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Earned in selected period</p>
            </CardContent>
          </Card>

          {/* Period Expense */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Period Expenses
              </CardTitle>
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                {formatMinorUnits(-data.kpis.expenseMinor, { currency: "INR" })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Spent in selected period</p>
            </CardContent>
          </Card>

          {/* Net Flow */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Net Cash Flow
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-extrabold tracking-tight ${
                  data.kpis.netFlowMinor >= 0
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatMinorUnits(data.kpis.netFlowMinor, { currency: "INR", showSign: true })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.kpis.netFlowMinor >= 0 ? "Positive savings delta" : "Deficit cash flow"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Trend Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cash Flow Trajectory</CardTitle>
            <CardDescription>
              Day-by-day comparison of incoming revenue and outgoing expenditures.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading || !data ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <CashFlowChart data={data.cashFlowTrend} currency="INR" />
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Donut */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Spending by Category</CardTitle>
            <CardDescription>Top category distribution for the selected timeframe.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading || !data ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <CategoryPieChart data={data.categorySpending} currency="INR" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Transactions & Account Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Ledger Activity</CardTitle>
              <CardDescription>Latest financial transactions recorded on your accounts</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold">
                View Ledger
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data.recentTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-primary opacity-60" />
                <p className="text-sm font-semibold text-foreground">No recent transactions</p>
                <p className="text-xs">Add your first transaction to view live ledger flow.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.recentTransactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isExpense = tx.type === "expense";

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
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
                          <p className="text-sm font-semibold leading-tight">
                            {tx.merchant || tx.description || (tx.type === "transfer" ? "Internal Transfer" : "Transaction")}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {tx.categoryName && (
                              <Badge variant="secondary" className="text-[10px] py-0">
                                {tx.categoryName}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {tx.accountName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-sm font-bold font-mono ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isExpense
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {isExpense
                            ? `−${formatMinorUnits(tx.amountMinor, { currency: tx.currency })}`
                            : isIncome
                            ? `+${formatMinorUnits(tx.amountMinor, { currency: tx.currency })}`
                            : formatMinorUnits(tx.amountMinor, { currency: tx.currency })}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(tx.occurredAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts Snapshot Side Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Accounts &amp; Balances</CardTitle>
              <Link href="/accounts" className="text-xs text-primary font-semibold hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading || !data ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : data.accounts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No accounts added</p>
              ) : (
                data.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold">{acc.name}</p>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {acc.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono">
                      {formatMinorUnits(acc.currentBalanceMinor, { currency: acc.currency })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
