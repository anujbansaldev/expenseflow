"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus, Bell, User, LogOut } from "lucide-react";
import { navigationItems } from "./sidebar";
import Link from "next/link";
import { toast } from "sonner";

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = React.useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.user?.name) {
          setUserName(json.data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const currentNav = navigationItems.find(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );
  const pageTitle = currentNav ? currentNav.name : "Overview";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Add Action */}
        <Link href="/transactions">
          <Button size="sm" className="gap-1.5 shadow-sm font-semibold">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </Link>

        {/* Notifications placeholder */}
        <Button variant="ghost" size="icon" className="text-muted-foreground relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-medium text-xs">
              <User className="w-4 h-4" />
            </div>
            {userName && (
              <span className="hidden lg:inline text-xs font-semibold text-foreground max-w-[120px] truncate">
                {userName}
              </span>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
