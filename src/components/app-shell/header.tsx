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
  const pageTitle = currentNav ? currentNav.name : "Dashboard";

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/90 backdrop-blur-xs sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-8">
      {/* Editorial Page Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-base sm:text-lg font-serif font-bold tracking-tight text-foreground">{pageTitle}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Action */}
        <Link href="/transactions">
          <Button size="sm" className="h-8 gap-1 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Entry</span>
          </Button>
        </Link>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-border">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
              {userName ? userName.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            {userName && (
              <span className="hidden md:inline text-xs font-medium text-foreground max-w-[100px] truncate">
                {userName}
              </span>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
