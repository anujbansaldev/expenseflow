"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMinorUnits } from "@/lib/money/money";
import { CategorySpendingPoint } from "@/repositories/analytics.repository";

interface CategoryPieChartProps {
  data: CategorySpendingPoint[];
  currency?: string;
}

const FINTECH_PALETTE = [
  "#651F24", // Deep Maroon
  "#C49A45", // Antique Gold
  "#A64B2A", // Rust
  "#6B4636", // Warm Brown
  "#7A292E", // Burgundy
  "#B86632", // Burnt Orange
  "#D6B66A", // Soft Gold
  "#3A2923", // Dark Brown
];

export function CategoryPieChart({ data, currency = "INR" }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex flex-col items-center justify-center text-center p-4">
        <p className="text-xs font-semibold text-muted-foreground">No expenses recorded in this period</p>
        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
          Expense entries will generate your structured category allocation breakdown here.
        </p>
      </div>
    );
  }

  const chartData = data.map((d, index) => ({
    name: d.categoryName,
    value: d.amountMinor,
    color: d.colorToken || FINTECH_PALETTE[index % FINTECH_PALETTE.length],
    percentage: d.percentage,
    count: d.count,
  }));

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-[200px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded border border-border bg-card p-2 shadow-sm text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-foreground text-[11px]">{item.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
                        <span className="font-mono font-bold text-foreground">
                          {formatMinorUnits(item.value, { currency })}
                        </span>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">{item.percentage}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Legend List */}
      <div className="w-full grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-border/60">
        {chartData.slice(0, 4).map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="truncate text-muted-foreground text-[11px]">{cat.name}</span>
            </div>
            <span className="font-bold text-[10px] font-mono ml-1">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
