"use client";

import * as React from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { ThemeKey } from "@/lib/themes/theme-config";
import { Palette, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemePickerHeader() {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium px-2.5"
        title="Change Financial Theme"
        aria-label="Change Financial Theme"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:inline-block font-sans text-xs">
          {availableThemes.find((t) => t.id === theme)?.name || "Theme"}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 border-b border-border/70 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent" />
              Theme Workspace
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">6 Styles</span>
          </div>

          <div className="space-y-1">
            {availableThemes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors text-xs ${
                    isSelected
                      ? "bg-muted font-semibold text-foreground"
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch palette circle */}
                    <div className="flex items-center -space-x-1 shrink-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.preview.bg }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.preview.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.preview.accent }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground leading-none">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                        {t.paletteDescription.split("•")[0]}
                      </p>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
