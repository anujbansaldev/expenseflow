import { describe, it, expect } from "vitest";
import { THEMES, THEME_LIST, DEFAULT_THEME, ThemeKey } from "@/lib/themes/theme-config";

describe("Multi-Theme Design System", () => {
  it("defines the exact required 6 theme identities", () => {
    const expectedThemes: ThemeKey[] = [
      "heritage",
      "rust-ledger",
      "midnight-ledger",
      "olive-wealth",
      "terracotta",
      "classic-paper",
    ];

    expect(THEME_LIST.length).toBe(6);
    expectedThemes.forEach((key) => {
      expect(THEMES[key]).toBeDefined();
      expect(THEMES[key].id).toBe(key);
    });
  });

  it("sets Heritage as the default theme", () => {
    expect(DEFAULT_THEME).toBe("heritage");
    expect(THEMES[DEFAULT_THEME].isDark).toBe(false);
  });

  it("configures Midnight Ledger as a dark financial terminal", () => {
    const darkTheme = THEMES["midnight-ledger"];
    expect(darkTheme.isDark).toBe(true);
    expect(darkTheme.preview.bg).toBe("#171513");
    expect(darkTheme.preview.surface).toBe("#211E1B");
  });

  it("ensures each theme has a 5-color chart palette", () => {
    THEME_LIST.forEach((theme) => {
      expect(theme.preview.chart.length).toBe(5);
      theme.preview.chart.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  it("ensures valid hex color codes across all previews", () => {
    THEME_LIST.forEach((theme) => {
      expect(theme.preview.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.preview.surface).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.preview.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.preview.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.preview.text).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.preview.border).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
