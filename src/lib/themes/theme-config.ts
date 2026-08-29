export type ThemeKey =
  | "heritage"
  | "rust-ledger"
  | "midnight-ledger"
  | "olive-wealth"
  | "terracotta"
  | "classic-paper";

export interface ThemeConfig {
  id: ThemeKey;
  name: string;
  tagline: string;
  description: string;
  paletteDescription: string;
  isDark: boolean;
  preview: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
    text: string;
    border: string;
    chart: [string, string, string, string, string];
  };
  typography: {
    headingStyle: string;
    fontMood: string;
  };
  details: {
    inspiration: string;
    cardStyle: string;
    buttonStyle: string;
  };
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  heritage: {
    id: "heritage",
    name: "Heritage",
    tagline: "Private Banking & Wealth Management",
    description:
      "Inspired by traditional accounting, financial journals, and luxury private banks. Warm ivory background with deep burgundy actions and antique gold accents.",
    paletteDescription: "Burgundy • Antique Gold • Warm Ivory",
    isDark: false,
    preview: {
      bg: "#F8F5EF",
      surface: "#FFFFFF",
      primary: "#651F24",
      accent: "#C49A45",
      text: "#292522",
      border: "#DED5C9",
      chart: ["#651F24", "#C49A45", "#2D5A3C", "#6B4636", "#7A292E"],
    },
    typography: {
      headingStyle: "font-serif",
      fontMood: "Serif display headings + Crisp sans body",
    },
    details: {
      inspiration: "Private banking, wealth journals, luxury stationery",
      cardStyle: "Warm white card with subtle 1px sand border",
      buttonStyle: "Deep burgundy solid action with crisp contrast",
    },
  },

  "rust-ledger": {
    id: "rust-ledger",
    name: "Rust & Ledger",
    tagline: "Modern Accounting & Editorial Finance",
    description:
      "Inspired by physical paper ledgers and editorial financial statements. Paper-like warm tones with rust primary accents, dark brown typography, and gold indicators.",
    paletteDescription: "Rust • Burnt Orange • Paper",
    isDark: false,
    preview: {
      bg: "#FAF7F1",
      surface: "#FFFFFF",
      primary: "#A64B2A",
      accent: "#C89B52",
      text: "#24211F",
      border: "#E2D8CA",
      chart: ["#A64B2A", "#B86632", "#C89B52", "#3A2923", "#756559"],
    },
    typography: {
      headingStyle: "font-serif",
      fontMood: "Editorial serif headlines + Tabular ledger figures",
    },
    details: {
      inspiration: "Accounting ledgers, financial press, crisp column dividers",
      cardStyle: "Paper surface with defined horizontal dividers",
      buttonStyle: "Warm rust action with subtle earthen glow",
    },
  },

  "midnight-ledger": {
    id: "midnight-ledger",
    name: "Midnight Ledger",
    tagline: "High-Density Financial Terminal",
    description:
      "Inspired by Bloomberg terminals and institutional wealth management platforms. Deep brown-black background with burgundy actions and soft gold highlights.",
    paletteDescription: "Deep Charcoal • Burgundy • Soft Gold",
    isDark: true,
    preview: {
      bg: "#171513",
      surface: "#211E1B",
      primary: "#8B3035",
      accent: "#C6A15B",
      text: "#F3EEE5",
      border: "#3B342E",
      chart: ["#8B3035", "#C6A15B", "#3C734E", "#A85532", "#8E7D70"],
    },
    typography: {
      headingStyle: "font-sans",
      fontMood: "Modern dense sans-serif + High-contrast monospace figures",
    },
    details: {
      inspiration: "Professional trading terminals, institutional portals",
      cardStyle: "Deep charcoal surface with muted warm borders",
      buttonStyle: "Burgundy solid button with gold focal accents",
    },
  },

  "olive-wealth": {
    id: "olive-wealth",
    name: "Olive Wealth",
    tagline: "Calm, Mature & Sustainable Wealth",
    description:
      "Inspired by sustainable finance, family offices, and organic materials. Soft cream background with deep olive primary buttons and warm brown accents.",
    paletteDescription: "Deep Olive • Warm Brown • Cream",
    isDark: false,
    preview: {
      bg: "#F6F3EA",
      surface: "#FFFFFF",
      primary: "#46513A",
      accent: "#B89A58",
      text: "#292A25",
      border: "#D8D4C7",
      chart: ["#46513A", "#667052", "#B89A58", "#705342", "#8B8D7F"],
    },
    typography: {
      headingStyle: "font-serif",
      fontMood: "Refined serif titles + Calm modern interface",
    },
    details: {
      inspiration: "Family wealth offices, natural textiles, grounded finance",
      cardStyle: "Cream-tinted card with soft stone border",
      buttonStyle: "Forest olive solid button with warm gold accents",
    },
  },

  terracotta: {
    id: "terracotta",
    name: "Terracotta",
    tagline: "Warm, Contemporary & Approachable",
    description:
      "Inspired by Mediterranean terracotta architecture and modern lifestyle fintech. Warm sand background with terracotta primary actions and gold highlights.",
    paletteDescription: "Terracotta • Sand • Burnt Rust",
    isDark: false,
    preview: {
      bg: "#FBF5ED",
      surface: "#FFFFFF",
      primary: "#A94F3C",
      accent: "#C19A5A",
      text: "#302724",
      border: "#E5D7C7",
      chart: ["#A94F3C", "#B9653E", "#C19A5A", "#432C27", "#8D736A"],
    },
    typography: {
      headingStyle: "font-sans",
      fontMood: "Contemporary sans-serif + Warm friendly geometry",
    },
    details: {
      inspiration: "Sun-baked earthen clays, modern boutique fintech",
      cardStyle: "Warm cream card with gentle rounded corners",
      buttonStyle: "Terracotta action button with warm clay undertone",
    },
  },

  "classic-paper": {
    id: "classic-paper",
    name: "Classic Paper",
    tagline: "Minimal, Timeless & Editorial",
    description:
      "Inspired by financial broadsheets, printed accounting journals, and luxury stationery. Near-white paper background, dark ink typography, and thin borders.",
    paletteDescription: "Fine Paper • Dark Ink • Burgundy",
    isDark: false,
    preview: {
      bg: "#FCFAF5",
      surface: "#FFFFFF",
      primary: "#722F35",
      accent: "#B99550",
      text: "#201E1B",
      border: "#D9D1C7",
      chart: ["#722F35", "#B99550", "#2E593E", "#55483F", "#8B837B"],
    },
    typography: {
      headingStyle: "font-serif",
      fontMood: "Editorial serif headlines + Clean publication layout",
    },
    details: {
      inspiration: "Financial broadsheets, printed ledgers, minimal bookbinding",
      cardStyle: "Pure paper surface with razor-thin hairline borders",
      buttonStyle: "Dark burgundy solid action with high contrast",
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME: ThemeKey = "heritage";
