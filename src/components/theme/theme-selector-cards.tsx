"use client";

import * as React from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { ThemeKey, ThemeConfig, THEME_LIST } from "@/lib/themes/theme-config";
import { Check, Sparkles, TrendingUp, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ThemeSelectorCards() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm sm:text-base font-serif font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Financial Workspace Identities
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Select an environment crafted specifically for accounting ledgers, investment journals, and wealth management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableThemes.map((t) => {
          const isSelected = t.id === theme;

          return (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`group relative rounded-lg border text-left p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-card shadow-sm"
                  : "border-border hover:border-border-strong hover:bg-card/70 bg-card"
              }`}
            >
              {/* Top Banner: Name + Tagline + Selection Check */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/80">
                <div>
                  <h4 className="text-sm font-serif font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {t.name}
                    {t.isDark && (
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider py-0 px-1 font-mono">
                        Dark Terminal
                      </Badge>
                    )}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t.paletteDescription}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-transparent group-hover:border-primary/50"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>

              {/* Realistic Visual Mockup Container */}
              <div
                className="mt-3.5 p-3 rounded border border-border/80 transition-all space-y-2.5 overflow-hidden"
                style={{ backgroundColor: t.preview.bg }}
              >
                {/* Mini Metric Card inside the Theme Canvas */}
                <div
                  className="p-2.5 rounded shadow-xs border"
                  style={{
                    backgroundColor: t.preview.surface,
                    borderColor: t.preview.border,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[9px] uppercase font-semibold tracking-wider font-sans"
                      style={{ color: t.preview.text, opacity: 0.6 }}
                    >
                      Liquid Balance
                    </span>
                    <span
                      className="text-[9px] font-mono font-bold"
                      style={{ color: t.preview.chart[2] || "#2D5A3C" }}
                    >
                      +14.8%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span
                      className={`text-sm font-mono font-bold ${t.typography.headingStyle}`}
                      style={{ color: t.preview.text }}
                    >
                      ₹24,85,000
                    </span>

                    {/* Mini Primary Button Preview */}
                    <span
                      className="text-[9px] px-2 py-0.5 rounded font-sans font-semibold inline-block shrink-0 shadow-xs"
                      style={{
                        backgroundColor: t.preview.primary,
                        color: t.id === "midnight-ledger" ? "#F3EEE5" : "#FFFFFF",
                      }}
                    >
                      Action
                    </span>
                  </div>
                </div>

                {/* Mini Chart / Progress Visual Bar */}
                <div
                  className="p-2 rounded border flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: t.preview.surface,
                    borderColor: t.preview.border,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-end gap-0.5 h-4">
                      {t.preview.chart.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-1.5 rounded-t-xs"
                          style={{
                            height: `${(idx + 1) * 3 + 4}px`,
                            backgroundColor: c,
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-[9px] font-medium font-sans truncate"
                      style={{ color: t.preview.text, opacity: 0.8 }}
                    >
                      Ledger Trajectory
                    </span>
                  </div>

                  {/* Swatch Pill */}
                  <div className="flex items-center -space-x-1">
                    {t.preview.chart.slice(0, 4).map((c, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography Mood Description */}
              <div className="mt-3 pt-2.5 border-t border-border/80 text-[11px] text-muted-foreground flex items-center justify-between">
                <span className="font-mono text-[10px] truncate max-w-[200px]">
                  {t.typography.fontMood.split("+")[0]}
                </span>
                <span className="text-[10px] font-semibold text-primary">
                  {isSelected ? "Active" : "Apply"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
