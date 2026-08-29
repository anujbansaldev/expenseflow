import { describe, it, expect } from "vitest";
import {
  ensureDate,
  formatDate,
  formatDateTime,
  getDateRangeFromPreset,
} from "@/lib/dates/dates";

describe("Date Utilities", () => {
  it("parses valid date strings and Date instances", () => {
    const d1 = ensureDate("2026-08-29T10:00:00Z");
    expect(d1).toBeInstanceOf(Date);

    const d2 = ensureDate(new Date(2026, 7, 29));
    expect(d2).toBeInstanceOf(Date);
  });

  it("throws for invalid date input", () => {
    expect(() => ensureDate("invalid-date-string")).toThrow("Invalid date provided");
  });

  it("formats date according to default and custom patterns", () => {
    const d = new Date(2026, 7, 29, 14, 30);
    const formatted = formatDate(d, "yyyy-MM-dd");
    expect(formatted).toBe("2026-08-29");

    const dateTimeFormatted = formatDateTime(d, "yyyy-MM-dd HH:mm");
    expect(dateTimeFormatted).toBe("2026-08-29 14:30");
  });

  it("calculates date range for today preset", () => {
    const ref = new Date(2026, 7, 29, 12, 0);
    const range = getDateRangeFromPreset("today", ref);
    expect(range.startDate.getDate()).toBe(29);
    expect(range.endDate.getDate()).toBe(29);
    expect(range.startDate.getHours()).toBe(0);
    expect(range.endDate.getHours()).toBe(23);
  });

  it("calculates date range for this_month preset", () => {
    const ref = new Date(2026, 7, 15); // August 2026
    const range = getDateRangeFromPreset("this_month", ref);
    expect(range.startDate.getDate()).toBe(1);
    expect(range.endDate.getDate()).toBe(31);
  });
});
