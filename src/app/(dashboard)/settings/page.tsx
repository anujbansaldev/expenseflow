"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/dates/dates";
import { toast } from "sonner";
import {
  User,
  Shield,
  History,
  Lock,
  Globe,
  Palette,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AuditLogDto } from "@/services/audit.service";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "security" | "audit">("profile");
  const [isLoading, setIsLoading] = React.useState(true);

  // Profile Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [currency, setCurrency] = React.useState("INR");
  const [timezone, setTimezone] = React.useState("UTC");
  const [dateFormat, setDateFormat] = React.useState("yyyy-MM-dd");
  const [theme, setTheme] = React.useState("system");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Audit Logs State
  const [logs, setLogs] = React.useState<AuditLogDto[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = React.useState(false);

  const fetchSettings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.data) {
        setName(json.data.user.name || "");
        setEmail(json.data.user.email || "");
        setCurrency(json.data.settings.currency || "INR");
        setTimezone(json.data.settings.timezone || "UTC");
        setDateFormat(json.data.settings.dateFormat || "yyyy-MM-dd");
        setTheme(json.data.settings.theme || "system");
      }
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAuditLogs = React.useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch("/api/settings/audit");
      const json = await res.json();
      if (json.data) {
        setLogs(json.data);
      }
    } catch {
      toast.error("Failed to load audit logs.");
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  React.useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          currency,
          timezone,
          dateFormat,
          theme,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to update preferences");
        return;
      }

      toast.success("Preferences updated successfully!");
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Settings &amp; Security Protocol</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
          Manage your account credentials, base display preferences, and security audit log.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeTab === "profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Profile &amp; Display
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeTab === "security"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Security &amp; Password
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
            activeTab === "audit"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Audit Trail
        </button>
      </div>

      {/* Tab 1: Profile & Preferences */}
      {activeTab === "profile" && (
        <Card className="max-w-2xl shadow-none">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm sm:text-base font-serif font-bold text-foreground">Personal &amp; Financial Preferences</CardTitle>
            <CardDescription className="text-xs">
              Customize how dates, money, and timezones appear across all dashboards and reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-8 text-xs" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Email Address</label>
                  <Input value={email} disabled className="h-8 text-xs bg-muted/40 text-muted-foreground font-mono" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Base Currency</label>
                    <select
                      className="flex h-8 w-full rounded border border-input bg-background px-2.5 py-1 text-xs focus-visible:ring-1 focus-visible:ring-ring"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Timezone</label>
                    <select
                      className="flex h-8 w-full rounded border border-input bg-background px-2.5 py-1 text-xs focus-visible:ring-1 focus-visible:ring-ring"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Date Format</label>
                    <select
                      className="flex h-8 w-full rounded border border-input bg-background px-2.5 py-1 text-xs focus-visible:ring-1 focus-visible:ring-ring"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                    >
                      <option value="yyyy-MM-dd">YYYY-MM-DD (2026-08-29)</option>
                      <option value="dd MMM yyyy">DD MMM YYYY (29 Aug 2026)</option>
                      <option value="MM/dd/yyyy">MM/DD/YYYY (08/29/2026)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">App Theme</label>
                    <select
                      className="flex h-8 w-full rounded border border-input bg-background px-2.5 py-1 text-xs focus-visible:ring-1 focus-visible:ring-ring"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="system">System Default</option>
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/80 flex justify-end">
                  <Button type="submit" size="sm" className="h-8 text-xs font-semibold" isLoading={isSavingProfile}>
                    Save Preferences
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <Card className="max-w-2xl shadow-none">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm sm:text-base font-serif font-bold flex items-center gap-2 text-foreground">
              <Lock className="w-3.5 h-3.5 text-primary" />
              Change Account Password
            </CardTitle>
            <CardDescription className="text-xs">
              Ensure your account uses an adaptive, high-entropy password to protect your financial ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  New Password (min. 8 chars)
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border/80 flex justify-end">
                <Button type="submit" size="sm" className="h-8 text-xs font-semibold" isLoading={isChangingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Security Audit Trail */}
      {activeTab === "audit" && (
        <Card className="max-w-3xl shadow-none">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm sm:text-base font-serif font-bold flex items-center gap-2 text-foreground">
              <History className="w-3.5 h-3.5 text-primary" />
              Security &amp; Mutation History
            </CardTitle>
            <CardDescription className="text-xs">
              Audit log of authentication events, preferences updates, and financial exports.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {isLoadingLogs ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No recent security activity logged.
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded border border-border/80 bg-muted/20 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold flex items-center gap-1.5 text-foreground">
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {log.action}
                        </Badge>
                      </p>
                      {log.ipAddress && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </div>
                    <span className="text-muted-foreground text-[10px] font-mono">
                      {formatDate(log.createdAt, "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
