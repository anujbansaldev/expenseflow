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
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner / Welcome & Date Preset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
            Financial Command Center
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Real-time ledger overview, net cash velocity, and envelope distributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Selector */}
          <div className="flex items-center bg-card p-1 rounded border border-border text-xs font-medium">
            {[
              { id: "this_month", label: "This Month" },
              { id: "last_30_days", label: "30 Days" },
              { id: "last_90_days", label: "90 Days" },
              { id: "this_year", label: "This Year" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPreset(tab.id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  preset === tab.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link href="/transactions">
            <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" />
              Add Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-32" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Net Worth */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Balance
              </CardTitle>
              <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
                {formatMinorUnits(data.kpis.totalBalanceMinor, { currency: "INR" })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across {data.kpis.activeAccountsCount} active accounts
              </p>
            </CardContent>
          </Card>

          {/* Period Inflow */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Period Inflow
              </CardTitle>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-700 dark:text-emerald-400">
                {formatMinorUnits(data.kpis.incomeMinor, { currency: "INR", showSign: true })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Total revenue earned</p>
            </CardContent>
          </Card>

          {/* Period Outflow */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Period Outflow
              </CardTitle>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-rose-800 dark:text-rose-400">
                {formatMinorUnits(-data.kpis.expenseMinor, { currency: "INR" })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Total expenditures spent</p>
            </CardContent>
          </Card>

          {/* Net Cash Flow */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Net Delta
              </CardTitle>
              <TrendingUp className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div
                className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                  data.kpis.netFlowMinor >= 0
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-rose-800 dark:text-rose-400"
                }`}
              >
                {formatMinorUnits(data.kpis.netFlowMinor, { currency: "INR", showSign: true })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {data.kpis.netFlowMinor >= 0 ? "Positive retained savings" : "Deficit cash velocity"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Trajectory */}
        <Card className="lg:col-span-2 shadow-none">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground">Cash Velocity Trajectory</CardTitle>
            <CardDescription className="text-xs">
              Daily curve comparing incoming revenue and outgoing expenditures across the selected timeframe.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 p-4 sm:p-5">
            {isLoading || !data ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <CashFlowChart data={data.cashFlowTrend} currency="INR" />
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Donut */}
        <Card className="shadow-none">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground">Spending Allocation</CardTitle>
            <CardDescription className="text-xs">Category distribution breakdown for active period.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 p-4 sm:p-5">
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
        <Card className="lg:col-span-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-5">
            <div>
              <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground">Recent Ledger Entries</CardTitle>
              <CardDescription className="text-xs">Latest transactions committed to your ledger accounts</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold h-8">
                View All
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {isLoading || !data ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-1">
                <p className="text-xs font-semibold text-foreground">No recent transactions</p>
                <p className="text-[11px]">Record your first transaction to view live ledger flow.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {data.recentTransactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isExpense = tx.type === "expense";

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2.5 px-1 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded border border-border/80 bg-background flex items-center justify-center font-mono text-[10px] text-muted-foreground shrink-0">
                          {formatDate(tx.occurredAt, "dd")}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">
                            {tx.merchant || tx.description || (tx.type === "transfer" ? "Internal Transfer" : "Transaction")}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {tx.categoryName && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1 font-normal">
                                {tx.categoryName}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {tx.accountName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs font-bold font-mono ${
                            isIncome
                              ? "text-emerald-700 dark:text-emerald-400"
                              : isExpense
                              ? "text-rose-800 dark:text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {isExpense
                            ? `−${formatMinorUnits(tx.amountMinor, { currency: tx.currency })}`
                            : isIncome
                            ? `+${formatMinorUnits(tx.amountMinor, { currency: tx.currency })}`
                            : formatMinorUnits(tx.amountMinor, { currency: tx.currency })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(tx.occurredAt, "MMM yyyy")}
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
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-5">
              <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground">Tracked Accounts</CardTitle>
              <Link href="/accounts" className="text-xs text-primary font-semibold hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-5 pt-0">
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
                    className="flex items-center justify-between p-2.5 rounded border border-border/60 bg-background/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{acc.name}</p>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {acc.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-foreground">
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
