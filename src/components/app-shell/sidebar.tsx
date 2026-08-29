"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  PieChart,
  Repeat,
  CalendarCheck,
  Target,
  BarChart3,
  FileSpreadsheet,
  CalendarDays,
  Settings,
} from "lucide-react";

export const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Budgets", href: "/budgets", icon: PieChart },
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Bills", href: "/bills", icon: CalendarCheck },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileSpreadsheet },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card h-screen sticky top-0 shrink-0 select-none">
      {/* Editorial Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-border/80">
        <div className="w-8 h-8 rounded bg-primary text-primary-foreground font-serif font-bold text-sm flex items-center justify-center border border-amber-500/30 shrink-0">
          EF
        </div>
        <div>
          <span className="font-serif font-bold text-base tracking-tight text-foreground block leading-tight">
            ExpenseFlow
          </span>
          <span className="block text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            Financial Ledger
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
        <div className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Navigation
        </div>
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors group",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5 shrink-0 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-border/80">
        <div className="rounded bg-muted/40 p-2 text-[11px] text-muted-foreground flex items-center justify-between border border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span className="font-medium text-foreground">Ledger Active</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
