"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  BarChart3,
  Settings,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const mobileNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Ledger", href: "/transactions", icon: Receipt },
    { name: "Add", href: "/transactions?action=new", icon: Plus, isAction: true },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xs border-t border-border px-3 py-1.5">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-center -mt-5 w-10 h-10 rounded bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform border border-amber-500/30"
                aria-label="Add transaction"
              >
                <Plus className="w-5 h-5" />
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded text-[11px] font-medium transition-colors",
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
