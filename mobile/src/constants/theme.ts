export type MobileThemeKey =
  | "heritage"
  | "rust-ledger"
  | "midnight-ledger"
  | "olive-wealth"
  | "terracotta"
  | "classic-paper";

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  accent: string;
  accentSoft: string;
  border: string;
  borderStrong: string;
  divider: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  destructive: string;
  destructiveSoft: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  chart: [string, string, string, string, string];
  isDark: boolean;
}

export interface MobileThemeConfig {
  id: MobileThemeKey;
  name: string;
  tagline: string;
  paletteDescription: string;
  colors: ThemeColors;
}

export const MOBILE_THEMES: Record<MobileThemeKey, MobileThemeConfig> = {
  heritage: {
    id: "heritage",
    name: "Heritage",
    tagline: "Private Banking & Wealth Management",
    paletteDescription: "Burgundy • Antique Gold • Warm Ivory",
    colors: {
      background: "#F8F5EF",
      backgroundSecondary: "#F1E9DC",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      surfaceMuted: "#F2ECE1",
      foreground: "#292522",
      foregroundSecondary: "#524A45",
      foregroundMuted: "#756B63",
      primary: "#651F24",
      primaryHover: "#53181C",
      primaryForeground: "#FFFCF7",
      accent: "#C49A45",
      accentSoft: "#F7F2E6",
      border: "#DED5C9",
      borderStrong: "#C2B5A5",
      divider: "#E8E1D5",
      success: "#2D5A3C",
      successSoft: "#EAF3ED",
      warning: "#C49A45",
      warningSoft: "#F9F4E8",
      destructive: "#A64B2A",
      destructiveSoft: "#F9ECE8",
      tabBarBackground: "#FFFFFF",
      tabBarActive: "#651F24",
      tabBarInactive: "#8F847B",
      chart: ["#651F24", "#C49A45", "#2D5A3C", "#6B4636", "#7A292E"],
      isDark: false,
    },
  },

  "rust-ledger": {
    id: "rust-ledger",
    name: "Rust & Ledger",
    tagline: "Accounting & Editorial Finance",
    paletteDescription: "Rust • Burnt Orange • Paper",
    colors: {
      background: "#FAF7F1",
      backgroundSecondary: "#E9DED0",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      surfaceMuted: "#F1EAE0",
      foreground: "#24211F",
      foregroundSecondary: "#4D433F",
      foregroundMuted: "#7A6E67",
      primary: "#A64B2A",
      primaryHover: "#8E3D20",
      primaryForeground: "#FAF7F1",
      accent: "#C89B52",
      accentSoft: "#F8F2E7",
      border: "#E2D8CA",
      borderStrong: "#CBBDAA",
      divider: "#ECE3D6",
      success: "#2D5A3C",
      successSoft: "#EAF3ED",
      warning: "#B86632",
      warningSoft: "#FAEEE6",
      destructive: "#A64B2A",
      destructiveSoft: "#F9ECE8",
      tabBarBackground: "#FFFFFF",
      tabBarActive: "#A64B2A",
      tabBarInactive: "#8A7E77",
      chart: ["#A64B2A", "#B86632", "#C89B52", "#3A2923", "#756559"],
      isDark: false,
    },
  },

  "midnight-ledger": {
    id: "midnight-ledger",
    name: "Midnight Ledger",
    tagline: "High-Density Dark Terminal",
    paletteDescription: "Deep Charcoal • Burgundy • Soft Gold",
    colors: {
      background: "#171513",
      backgroundSecondary: "#211E1B",
      surface: "#211E1B",
      surfaceElevated: "#292521",
      surfaceMuted: "#1B1917",
      foreground: "#F3EEE5",
      foregroundSecondary: "#C9C0B5",
      foregroundMuted: "#AAA097",
      primary: "#8B3035",
      primaryHover: "#A13B41",
      primaryForeground: "#F3EEE5",
      accent: "#C6A15B",
      accentSoft: "#2F271B",
      border: "#3B342E",
      borderStrong: "#544B43",
      divider: "#2B2622",
      success: "#3C734E",
      successSoft: "#182C1F",
      warning: "#C6A15B",
      warningSoft: "#2F271B",
      destructive: "#A85532",
      destructiveSoft: "#2C1B14",
      tabBarBackground: "#1B1917",
      tabBarActive: "#C6A15B",
      tabBarInactive: "#736A62",
      chart: ["#8B3035", "#C6A15B", "#3C734E", "#A85532", "#8E7D70"],
      isDark: true,
    },
  },

  "olive-wealth": {
    id: "olive-wealth",
    name: "Olive Wealth",
    tagline: "Calm & Sustainable Wealth Management",
    paletteDescription: "Deep Olive • Warm Brown • Cream",
    colors: {
      background: "#F6F3EA",
      backgroundSecondary: "#E9E4D6",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      surfaceMuted: "#EDE8DB",
      foreground: "#292A25",
      foregroundSecondary: "#4C4E45",
      foregroundMuted: "#74766B",
      primary: "#46513A",
      primaryHover: "#37402D",
      primaryForeground: "#F6F3EA",
      accent: "#B89A58",
      accentSoft: "#F6F1E5",
      border: "#D8D4C7",
      borderStrong: "#BBB5A5",
      divider: "#E4E0D4",
      success: "#3C6344",
      successSoft: "#EAF2EB",
      warning: "#B89A58",
      warningSoft: "#F6F1E5",
      destructive: "#9E4738",
      destructiveSoft: "#F8ECE9",
      tabBarBackground: "#FFFFFF",
      tabBarActive: "#46513A",
      tabBarInactive: "#85877C",
      chart: ["#46513A", "#667052", "#B89A58", "#705342", "#8B8D7F"],
      isDark: false,
    },
  },

  terracotta: {
    id: "terracotta",
    name: "Terracotta",
    tagline: "Warm Lifestyle Finance",
    paletteDescription: "Terracotta • Sand • Burnt Rust",
    colors: {
      background: "#FBF5ED",
      backgroundSecondary: "#E9D9C7",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      surfaceMuted: "#F3E7D8",
      foreground: "#302724",
      foregroundSecondary: "#574843",
      foregroundMuted: "#85736D",
      primary: "#A94F3C",
      primaryHover: "#924231",
      primaryForeground: "#FBF5ED",
      accent: "#C19A5A",
      accentSoft: "#F8F1E4",
      border: "#E5D7C7",
      borderStrong: "#CCAFA5",
      divider: "#EFE2D4",
      success: "#396547",
      successSoft: "#ECF4EE",
      warning: "#B9653E",
      warningSoft: "#FAEDE7",
      destructive: "#A94F3C",
      destructiveSoft: "#FAEDE7",
      tabBarBackground: "#FFFFFF",
      tabBarActive: "#A94F3C",
      tabBarInactive: "#8E7D77",
      chart: ["#A94F3C", "#B9653E", "#C19A5A", "#432C27", "#8D736A"],
      isDark: false,
    },
  },

  "classic-paper": {
    id: "classic-paper",
    name: "Classic Paper",
    tagline: "Minimal & Timeless Broadsheet",
    paletteDescription: "Fine Paper • Dark Ink • Burgundy",
    colors: {
      background: "#FCFAF5",
      backgroundSecondary: "#ECE6DB",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFFFF",
      surfaceMuted: "#F3EEE3",
      foreground: "#201E1B",
      foregroundSecondary: "#45403B",
      foregroundMuted: "#8B837B",
      primary: "#722F35",
      primaryHover: "#5E252A",
      primaryForeground: "#FCFAF5",
      accent: "#B99550",
      accentSoft: "#F7F2E7",
      border: "#D9D1C7",
      borderStrong: "#BCB1A3",
      divider: "#E5DEC",
      success: "#2E593E",
      successSoft: "#E9F2EC",
      warning: "#B99550",
      warningSoft: "#F7F2E7",
      destructive: "#722F35",
      destructiveSoft: "#F7ECEE",
      tabBarBackground: "#FFFFFF",
      tabBarActive: "#722F35",
      tabBarInactive: "#8E8780",
      chart: ["#722F35", "#B99550", "#2E593E", "#55483F", "#8B837B"],
      isDark: false,
    },
  },
};

export const DEFAULT_MOBILE_THEME: MobileThemeKey = "heritage";
