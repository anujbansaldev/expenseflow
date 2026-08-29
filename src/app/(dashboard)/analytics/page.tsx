"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { formatMinorUnits } from "@/lib/money/money";
import { toast } from "sonner";
import {
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { CashFlowTrendPoint, CategorySpendingPoint } from "@/repositories/analytics.repository";
import { AccountDto } from "@/services/account.service";

interface AnalyticsData {
  period: {
    preset: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    incomeMinor: number;
    expenseMinor: number;
    netFlowMinor: number;
  };
  cashFlowTrend: CashFlowTrendPoint[];
  categorySpending: CategorySpendingPoint[];
  accounts: AccountDto[];
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [preset, setPreset] = React.useState<string>("this_month");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/analytics/cash-flow?preset=${preset}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch {
      toast.error("Failed to load analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [preset]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-8">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Spending &amp; Cash Flow Analytics</h2>
          <p className="text-sm text-muted-foreground">
            In-depth structural breakdown of your cash velocity, category burdens, and net savings.
          </p>
        </div>

        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-medium self-start">
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
      </div>

      {/* Summary Row */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-36" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Inflow
              </CardTitle>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatMinorUnits(data.summary.incomeMinor, { currency: "INR", showSign: true })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Outflow
              </CardTitle>
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {formatMinorUnits(-data.summary.expenseMinor, { currency: "INR" })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Net Delta
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-extrabold ${
                  data.summary.netFlowMinor >= 0
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatMinorUnits(data.summary.netFlowMinor, { currency: "INR", showSign: true })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Cash Flow Trajectory */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Cash Flow Velocity
            </CardTitle>
            <CardDescription>
              Time-series curve plotting income vs expense velocity across the selected timeframe.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading || !data ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <CashFlowChart data={data.cashFlowTrend} currency="INR" />
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Donut */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              Expense Distribution
            </CardTitle>
            <CardDescription>Share of wallet by category</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading || !data ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <CategoryPieChart data={data.categorySpending} currency="INR" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Breakdown Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Category Spending Rankings
          </CardTitle>
          <CardDescription>Detailed metrics per category for the active period</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data.categorySpending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No category expense data found for this period.
            </p>
          ) : (
            <div className="space-y-4">
              {data.categorySpending.map((cat) => (
                <div key={cat.categoryId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.colorToken || "#6366f1" }}
                      />
                      <span>{cat.categoryName}</span>
                      <span className="text-muted-foreground">({cat.count} txs)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono">
                        {formatMinorUnits(cat.amountMinor, { currency: "INR" })}
                      </span>
                      <Badge variant="secondary" className="text-[10px] w-12 justify-center">
                        {cat.percentage}%
                      </Badge>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.colorToken || "#6366f1",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
