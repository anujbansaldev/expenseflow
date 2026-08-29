"use client";

import * as React from "react";
import { ThemeKey, ThemeConfig, THEMES, THEME_LIST, DEFAULT_THEME } from "@/lib/themes/theme-config";

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  themeConfig: ThemeConfig;
  availableThemes: ThemeConfig[];
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "expenseflow-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeKey>(DEFAULT_THEME);
  const [mounted, setMounted] = React.useState(false);

  // Initialize theme from localStorage on client mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeKey;
      if (stored && THEMES[stored]) {
        setThemeState(stored);
        applyThemeToDOM(stored);
      } else {
        applyThemeToDOM(DEFAULT_THEME);
      }
    } catch {
      applyThemeToDOM(DEFAULT_THEME);
    }
    setMounted(true);
  }, []);

  const applyThemeToDOM = (newTheme: ThemeKey) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    
    // Manage dark class for tailwind dark mode compatibility
    if (THEMES[newTheme]?.isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Enable temporary smooth transition
    root.classList.add("theme-transition");
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 250);

    return () => clearTimeout(timeout);
  };

  const setTheme = React.useCallback((newTheme: ThemeKey) => {
    if (!THEMES[newTheme]) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {}
    applyThemeToDOM(newTheme);

    // Synchronize to backend user settings if available
    try {
      fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      }).catch(() => {});
    } catch {}
  }, []);

  const themeConfig = THEMES[theme] || THEMES[DEFAULT_THEME];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig,
        availableThemes: THEME_LIST,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Inline script to prevent Flash of Unstyled Content (FOUC)
 * by applying the stored theme before first paint.
 */
export const ThemeScript = () => {
  const scriptContent = `
    (function() {
      try {
        var stored = localStorage.getItem("${STORAGE_KEY}");
        var theme = (stored && ["heritage", "rust-ledger", "midnight-ledger", "olive-wealth", "terracotta", "classic-paper"].indexOf(stored) !== -1) ? stored : "heritage";
        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "midnight-ledger") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "heritage");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
};
