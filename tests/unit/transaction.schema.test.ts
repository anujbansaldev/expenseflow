import { describe, it, expect } from "vitest";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
} from "@/schemas/transaction.schema";

describe("Transaction Zod Schemas", () => {
  it("validates valid expense transaction", () => {
    const res = createTransactionSchema.safeParse({
      type: "expense",
      amount: "450.75",
      accountId: "64b0f89e2c1e4b001a111111",
      categoryId: "64b0f89e2c1e4b001a222222",
      merchant: "Starbucks",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.type).toBe("expense");
    }
  });

  it("requires destinationAccountId for transfer", () => {
    const res = createTransactionSchema.safeParse({
      type: "transfer",
      amount: "1000",
      accountId: "64b0f89e2c1e4b001a111111",
    });

    expect(res.success).toBe(false);
  });

  it("rejects transfer with identical source and destination accounts", () => {
    const res = createTransactionSchema.safeParse({
      type: "transfer",
      amount: "1000",
      accountId: "64b0f89e2c1e4b001a111111",
      destinationAccountId: "64b0f89e2c1e4b001a111111",
    });

    expect(res.success).toBe(false);
  });

  it("requires categoryId for income and expense", () => {
    const res = createTransactionSchema.safeParse({
      type: "income",
      amount: "50000",
      accountId: "64b0f89e2c1e4b001a111111",
    });

    expect(res.success).toBe(false);
  });

  it("sanitizes search filter regex characters", () => {
    const res = transactionFilterSchema.safeParse({
      search: "Amazon.com (Order #123)",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.search).toBe("Amazon\\.com \\(Order #123\\)");
    }
  });
});
