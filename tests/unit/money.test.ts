import { describe, it, expect } from "vitest";
import {
  parseToMinorUnits,
  formatMinorUnits,
  toMajorUnits,
  addMinor,
  subtractMinor,
  percentageMinor,
} from "@/lib/money/money";

describe("Money Utility - parseToMinorUnits", () => {
  it("parses whole integer strings correctly", () => {
    expect(parseToMinorUnits("100")).toBe(10000);
    expect(parseToMinorUnits("0")).toBe(0);
    expect(parseToMinorUnits("50")).toBe(5000);
  });

  it("parses decimal strings with 1 or 2 decimal places", () => {
    expect(parseToMinorUnits("10.5")).toBe(1050);
    expect(parseToMinorUnits("10.50")).toBe(1050);
    expect(parseToMinorUnits("10.05")).toBe(1005);
    expect(parseToMinorUnits("0.99")).toBe(99);
  });

  it("parses number inputs safely", () => {
    expect(parseToMinorUnits(150.75)).toBe(15075);
    expect(parseToMinorUnits(0)).toBe(0);
    expect(parseToMinorUnits(1000)).toBe(100000);
  });

  it("handles currency symbols and commas", () => {
    expect(parseToMinorUnits("₹1,250.50")).toBe(125050);
    expect(parseToMinorUnits("$ 5,000.00")).toBe(500000);
    expect(parseToMinorUnits("10,00,000.00")).toBe(100000000);
  });

  it("handles negative amounts", () => {
    expect(parseToMinorUnits("-150.25")).toBe(-15025);
    expect(parseToMinorUnits("-₹500")).toBe(-50000);
  });

  it("throws error for malformed monetary input", () => {
    expect(() => parseToMinorUnits("")).toThrow("Empty money string");
    expect(() => parseToMinorUnits("abc")).toThrow("Invalid monetary format");
    expect(() => parseToMinorUnits("12.345")).toThrow("Invalid monetary format");
  });
});

describe("Money Utility - formatMinorUnits", () => {
  it("formats INR minor units correctly", () => {
    const formatted = formatMinorUnits(150000, { currency: "INR" });
    // In en-IN locale, 1500.00 is formatted as ₹1,500.00
    expect(formatted).toContain("1,500.00");
  });

  it("formats negative minor units with minus sign", () => {
    const formatted = formatMinorUnits(-5000, { currency: "INR" });
    expect(formatted).toContain("50.00");
    expect(formatted.startsWith("−") || formatted.startsWith("-")).toBe(true);
  });

  it("formats positive amounts with plus sign when requested", () => {
    const formatted = formatMinorUnits(5000, { currency: "INR", showSign: true });
    expect(formatted.startsWith("+")).toBe(true);
  });

  it("throws error if amountMinor is not integer", () => {
    expect(() => formatMinorUnits(123.45)).toThrow("amountMinor must be an integer");
  });
});

describe("Money Utility - Arithmetic", () => {
  it("converts to major units", () => {
    expect(toMajorUnits(12550)).toBe(125.5);
    expect(toMajorUnits(0)).toBe(0);
    expect(toMajorUnits(-4500)).toBe(-45);
  });

  it("adds minor units without precision loss", () => {
    expect(addMinor(10050, 20075)).toBe(30125);
  });

  it("subtracts minor units safely", () => {
    expect(subtractMinor(50000, 12550)).toBe(37450);
  });

  it("calculates percentage in integer minor units", () => {
    expect(percentageMinor(10000, 80)).toBe(8000); // 80% of 100.00 is 80.00
    expect(percentageMinor(3333, 10)).toBe(333); // 10% of 33.33 is 3.33 (rounded)
  });
});
