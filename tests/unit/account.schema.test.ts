import { describe, it, expect } from "vitest";
import { createAccountSchema, updateAccountSchema } from "@/schemas/account.schema";

describe("Account Zod Schemas", () => {
  it("validates valid account creation input", () => {
    const res = createAccountSchema.safeParse({
      name: "HDFC Salary Checking",
      type: "bank",
      currency: "inr",
      openingBalance: "1500.50",
      institution: "HDFC Bank",
      last4: "4321",
      notes: "Main salary account",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.currency).toBe("INR");
      expect(res.data.type).toBe("bank");
    }
  });

  it("rejects empty account name", () => {
    const res = createAccountSchema.safeParse({
      name: "   ",
      type: "bank",
    });
    expect(res.success).toBe(false);
  });

  it("rejects invalid last4", () => {
    const res = createAccountSchema.safeParse({
      name: "Bank",
      last4: "12345", // > 4 chars
    });
    expect(res.success).toBe(false);
  });

  it("validates update account schema", () => {
    const res = updateAccountSchema.safeParse({
      name: "Renamed Account",
      isArchived: true,
    });
    expect(res.success).toBe(true);
  });
});
