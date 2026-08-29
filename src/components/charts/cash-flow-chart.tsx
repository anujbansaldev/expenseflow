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

interface CashFlowChartProps {
  data: CashFlowTrendPoint[];
  currency?: string;
}

export function CashFlowChart({ data, currency = "INR" }: CashFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
        <p className="text-sm font-semibold text-muted-foreground">No cash flow activity in this period</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Transactions recorded in this date range will plot your income vs expense curves.
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

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const income = payload.find((p) => p.dataKey === "income")?.payload.incomeMinor || 0;
                const expense = payload.find((p) => p.dataKey === "expense")?.payload.expenseMinor || 0;
                return (
                  <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1.5 min-w-[150px]">
                    <p className="font-bold text-foreground border-b border-border pb-1">{label}</p>
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Income:</span>
                      <span className="font-bold font-mono">{formatMinorUnits(income, { currency })}</span>
                    </div>
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                      <span>Expense:</span>
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
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#incomeGradient)"
            name="Income"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#f43f5e"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#expenseGradient)"
            name="Expense"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
