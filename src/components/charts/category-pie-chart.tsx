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

export function CategoryPieChart({ data, currency = "INR" }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
        <p className="text-sm font-semibold text-muted-foreground">No expenses in this period</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Record expense transactions to see your category allocation breakdown.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoryName,
    value: d.amountMinor,
    color: d.colorToken || "#6366f1",
    percentage: d.percentage,
    count: d.count,
  }));

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
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
                    <div className="rounded-xl border border-border bg-card p-2.5 shadow-xl text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold">{item.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-muted-foreground">
                        <span className="font-mono font-bold text-foreground">
                          {formatMinorUnits(item.value, { currency })}
                        </span>
                        <span className="font-semibold text-primary">{item.percentage}%</span>
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
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-border/60">
        {chartData.slice(0, 4).map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="truncate text-muted-foreground">{cat.name}</span>
            </div>
            <span className="font-bold text-[11px] font-mono ml-1">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
