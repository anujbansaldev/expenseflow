import React, { createContext, useContext, useState, useEffect } from "react";
import {
  MobileThemeKey,
  MobileThemeConfig,
  MOBILE_THEMES,
  DEFAULT_MOBILE_THEME,
  ThemeColors,
} from "../constants/theme";
import { Storage } from "../utils/storage";

interface ThemeContextType {
  theme: MobileThemeKey;
  setTheme: (theme: MobileThemeKey) => void;
  themeConfig: MobileThemeConfig;
  colors: ThemeColors;
  availableThemes: MobileThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MobileThemeKey>(DEFAULT_MOBILE_THEME);

  useEffect(() => {
    Storage.getTheme().then((stored) => {
      if (stored && MOBILE_THEMES[stored as MobileThemeKey]) {
        setThemeState(stored as MobileThemeKey);
      }
    });
  }, []);

  const setTheme = (newTheme: MobileThemeKey) => {
    if (!MOBILE_THEMES[newTheme]) return;
    setThemeState(newTheme);
    Storage.setTheme(newTheme);
  };

  const themeConfig = MOBILE_THEMES[theme] || MOBILE_THEMES[DEFAULT_MOBILE_THEME];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig,
        colors: themeConfig.colors,
        availableThemes: Object.values(MOBILE_THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
