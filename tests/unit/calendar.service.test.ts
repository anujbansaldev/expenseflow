import { describe, it, expect, vi } from "vitest";
import { CalendarService } from "@/services/calendar.service";
import * as dbModule from "@/lib/db/mongodb";
import { Transaction } from "@/models/Transaction";
import { Bill } from "@/models/Bill";
import { RecurringRule } from "@/models/RecurringRule";

describe("Calendar Service Multi-Event Aggregation", () => {
  const userId = "64b0f89e2c1e4b001a111111";

  it("maps transactions, bills, and recurring rules to exact day calendar keys", async () => {
    vi.spyOn(dbModule, "connectToDatabase").mockResolvedValue({} as any);

    vi.spyOn(Transaction, "find").mockImplementation((() => ({
      populate: () => ({
        populate: () => ({
          sort: () => ({
            exec: () =>
              Promise.resolve([
                {
                  _id: "tx-1",
                  type: "income",
                  amountMinor: 500000,
                  currency: "INR",
                  occurredAt: new Date("2026-08-05T10:00:00.000Z"),
                  merchant: "Salary",
                  accountId: { name: "Bank" },
                  categoryId: { name: "Salary" },
                },
              ]),
          }),
        }),
      }),
    })) as any);

    vi.spyOn(Bill, "find").mockImplementation((() => ({
      populate: () => ({
        sort: () => ({
          exec: () =>
            Promise.resolve([
              {
                _id: "bill-1",
                name: "Electricity",
                amountMinor: 150000,
                currency: "INR",
                dueDate: new Date("2026-08-05T15:00:00.000Z"),
                status: "upcoming",
                categoryId: { name: "Utilities" },
              },
            ]),
        }),
      }),
    })) as any);

    vi.spyOn(RecurringRule, "find").mockImplementation((() => ({
      populate: () => ({
        sort: () => ({
          exec: () =>
            Promise.resolve([
              {
                _id: "rec-1",
                type: "expense",
                amountMinor: 50000,
                currency: "INR",
                nextRunAt: new Date("2026-08-15T00:00:00.000Z"),
                merchant: "Netflix",
                categoryId: { name: "Entertainment" },
              },
            ]),
        }),
      }),
    })) as any);

    const service = new CalendarService();
    const dayMap = await service.getMonthEvents(userId, 2026, 8);

    expect(dayMap["2026-08-05"]).toBeDefined();
    expect(dayMap["2026-08-05"].events.length).toBe(2); // tx-1 + bill-1
    expect(dayMap["2026-08-05"].incomeMinor).toBe(500000);

    expect(dayMap["2026-08-15"]).toBeDefined();
    expect(dayMap["2026-08-15"].events.length).toBe(1); // rec-1
  });
});
