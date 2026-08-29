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
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Spending &amp; Cash Velocity Analytics</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
            Structural breakdown of your cash velocity, category burdens, and net savings retention.
          </p>
        </div>

        <div className="flex items-center bg-card p-1 rounded border border-border text-xs font-medium self-start">
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
      </div>

      {/* Summary Row */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-32" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Inflow
              </CardTitle>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-700 dark:text-emerald-400">
                {formatMinorUnits(data.summary.incomeMinor, { currency: "INR", showSign: true })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Outflow
              </CardTitle>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-rose-800 dark:text-rose-400">
                {formatMinorUnits(-data.summary.expenseMinor, { currency: "INR" })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4 sm:p-5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Net Savings Delta
              </CardTitle>
              <TrendingUp className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div
                className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                  data.summary.netFlowMinor >= 0
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-rose-800 dark:text-rose-400"
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
        <Card className="lg:col-span-2 shadow-none">
          <CardHeader className="pb-2 p-4 sm:p-5">
            <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Cash Velocity Curve
            </CardTitle>
            <CardDescription className="text-xs">
              Time-series trajectory plotting income vs expenditure velocity across the selected timeframe.
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
            <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              Share of Wallet
            </CardTitle>
            <CardDescription className="text-xs">Distribution of expenditures by category</CardDescription>
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

      {/* Detailed Category Breakdown Table */}
      <Card className="shadow-none">
        <CardHeader className="pb-3 p-4 sm:p-5">
          <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Category Spending Rankings
          </CardTitle>
          <CardDescription className="text-xs">Detailed metrics per category for the active period</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          {isLoading || !data ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : data.categorySpending.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No category expense data found for this period.
            </p>
          ) : (
            <div className="space-y-3">
              {data.categorySpending.map((cat) => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.colorToken || "#651F24" }}
                      />
                      <span className="font-semibold text-foreground">{cat.categoryName}</span>
                      <span className="text-[10px] text-muted-foreground">({cat.count} entries)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold font-mono text-xs text-foreground">
                        {formatMinorUnits(cat.amountMinor, { currency: "INR" })}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                        {cat.percentage}%
                      </Badge>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-300"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.colorToken || "#651F24",
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
