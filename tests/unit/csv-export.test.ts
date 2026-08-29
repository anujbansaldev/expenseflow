import { describe, it, expect } from "vitest";
import { sanitizeCsvCell, generateCsv } from "@/lib/export/csv";

describe("CSV Export & Spreadsheet Formula Injection Protection", () => {
  it("neutralizes formula trigger characters (=, +, -, @, tab, return) at cell start", () => {
    // Formula payloads
    expect(sanitizeCsvCell("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitizeCsvCell("+123456")).toBe("'+123456");
    expect(sanitizeCsvCell("-5+5")).toBe("'-5+5");
    expect(sanitizeCsvCell("@SUM(123)")).toBe("'@SUM(123)");
    expect(sanitizeCsvCell("\tMaliciousTab")).toBe("'\tMaliciousTab");

    // With comma: should neutralize formula AND quote for CSV
    expect(sanitizeCsvCell("@SUM(1,2)")).toBe('"\'@SUM(1,2)"');

    // Regular strings
    expect(sanitizeCsvCell("Groceries & Food")).toBe("Groceries & Food");
    expect(sanitizeCsvCell("Starbucks Coffee")).toBe("Starbucks Coffee");
  });

  it("escapes double quotes and encloses comma-separated strings properly", () => {
    const cellWithCommas = sanitizeCsvCell("HDFC, ICICI, SBI");
    expect(cellWithCommas).toBe('"HDFC, ICICI, SBI"');

    const cellWithQuotes = sanitizeCsvCell('Item "Special" Discount');
    expect(cellWithQuotes).toBe('"Item ""Special"" Discount"');
  });

  it("generates structured CSV with headers and rows", () => {
    const headers = ["Date", "Type", "Amount", "Merchant"];
    const rows = [
      ["2026-08-01", "EXPENSE", "150.00", "=MaliciousPayload"],
      ["2026-08-02", "INCOME", "5000.00", "Acme Corp, Inc."],
    ];

    const csv = generateCsv(headers, rows);
    const lines = csv.split("\r\n");

    expect(lines[0]).toBe("Date,Type,Amount,Merchant");
    expect(lines[1]).toBe("2026-08-01,EXPENSE,150.00,'=MaliciousPayload");
    expect(lines[2]).toBe('2026-08-02,INCOME,5000.00,"Acme Corp, Inc."');
  });
});
