"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMinorUnits, toMajorUnits } from "@/lib/money/money";
import { formatDate } from "@/lib/dates/dates";
import { CashFlowTrendPoint } from "@/repositories/analytics.repository";
import { useTheme } from "@/components/theme/theme-provider";

interface CashFlowChartProps {
  data: CashFlowTrendPoint[];
  currency?: string;
}

export function CashFlowChart({ data, currency = "INR" }: CashFlowChartProps) {
  const { themeConfig } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
        <p className="text-xs font-semibold text-muted-foreground">No cash flow activity in this period</p>
        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
          Recorded income and expense entries will plot your cash velocity curves here.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    rawDate: d.date,
    date: formatDate(d.date, "dd MMM"),
    income: toMajorUnits(d.incomeMinor),
    expense: toMajorUnits(d.expenseMinor),
    incomeMinor: d.incomeMinor,
    expenseMinor: d.expenseMinor,
  }));

  const inflowColor = themeConfig.preview.chart[2] || "#2D5A3C";
  const outflowColor = themeConfig.preview.chart[0] || "#651F24";

  return (
    <div className="w-full h-[280px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={inflowColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={inflowColor} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={outflowColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={outflowColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" vertical={false} className="stroke-border/40" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const income = payload.find((p) => p.dataKey === "income")?.payload.incomeMinor || 0;
                const expense = payload.find((p) => p.dataKey === "expense")?.payload.expenseMinor || 0;
                return (
                  <div className="rounded border border-border bg-card p-2.5 shadow-sm text-xs space-y-1 min-w-[140px]">
                    <p className="font-semibold text-foreground border-b border-border/60 pb-1 text-[11px]">{label}</p>
                    <div
                      className="flex items-center justify-between text-[11px] font-medium"
                      style={{ color: inflowColor }}
                    >
                      <span>Inflow:</span>
                      <span className="font-bold font-mono">{formatMinorUnits(income, { currency })}</span>
                    </div>
                    <div
                      className="flex items-center justify-between text-[11px] font-medium"
                      style={{ color: outflowColor }}
                    >
                      <span>Outflow:</span>
                      <span className="font-bold font-mono">{formatMinorUnits(expense, { currency })}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke={inflowColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#incomeGradient)"
            name="Income"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke={outflowColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#expenseGradient)"
            name="Expense"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
