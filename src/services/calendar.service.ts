import { connectToDatabase } from "@/lib/db/mongodb";
import { Transaction } from "@/models/Transaction";
import { Bill } from "@/models/Bill";
import { RecurringRule } from "@/models/RecurringRule";
import { startOfMonth, endOfMonth, formatDate } from "date-fns";
import mongoose from "mongoose";

export interface CalendarEvent {
  id: string;
  type: "transaction_income" | "transaction_expense" | "transaction_transfer" | "bill" | "recurring";
  title: string;
  amountMinor: number;
  currency: string;
  date: string; // yyyy-MM-dd
  status?: string;
  categoryName?: string;
  accountName?: string;
}

export interface DayCalendarSummary {
  date: string;
  incomeMinor: number;
  expenseMinor: number;
  events: CalendarEvent[];
}

export class CalendarService {
  async getMonthEvents(
    userId: string | mongoose.Types.ObjectId,
    year: number,
    month: number // 1-indexed (1 to 12)
  ): Promise<{ [dateKey: string]: DayCalendarSummary }> {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());

    // Strict bounded month dates
    const targetDate = new Date(year, month - 1, 1);
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    const [transactions, bills, recurringRules] = await Promise.all([
      Transaction.find({
        userId: uId,
        occurredAt: { $gte: startDate, $lte: endDate },
      })
        .populate("accountId", "name")
        .populate("categoryId", "name")
        .sort({ occurredAt: 1 })
        .exec(),

      Bill.find({
        userId: uId,
        dueDate: { $gte: startDate, $lte: endDate },
      })
        .populate("categoryId", "name")
        .sort({ dueDate: 1 })
        .exec(),

      RecurringRule.find({
        userId: uId,
        isActive: true,
        nextRunAt: { $gte: startDate, $lte: endDate },
      })
        .populate("categoryId", "name")
        .sort({ nextRunAt: 1 })
        .exec(),
    ]);

    const dayMap: { [dateKey: string]: DayCalendarSummary } = {};

    // Helper to get or init day
    const getDay = (dateStr: string): DayCalendarSummary => {
      if (!dayMap[dateStr]) {
        dayMap[dateStr] = {
          date: dateStr,
          incomeMinor: 0,
          expenseMinor: 0,
          events: [],
        };
      }
      return dayMap[dateStr];
    };

    // Map transactions
    for (const tx of transactions) {
      const dateKey = formatDate(tx.occurredAt, "yyyy-MM-dd");
      const day = getDay(dateKey);
      const accObj = tx.accountId as unknown as { name?: string };
      const catObj = tx.categoryId as unknown as { name?: string };

      let eventType: CalendarEvent["type"] = "transaction_expense";
      if (tx.type === "income") {
        eventType = "transaction_income";
        day.incomeMinor += tx.amountMinor;
      } else if (tx.type === "expense") {
        eventType = "transaction_expense";
        day.expenseMinor += tx.amountMinor;
      } else {
        eventType = "transaction_transfer";
      }

      day.events.push({
        id: tx._id.toString(),
        type: eventType,
        title: tx.merchant || tx.description || (tx.type === "transfer" ? "Transfer" : "Transaction"),
        amountMinor: tx.amountMinor,
        currency: tx.currency,
        date: dateKey,
        accountName: accObj?.name,
        categoryName: catObj?.name,
      });
    }

    // Map bills
    for (const bill of bills) {
      const dateKey = formatDate(bill.dueDate, "yyyy-MM-dd");
      const day = getDay(dateKey);
      const catObj = bill.categoryId as unknown as { name?: string };

      day.events.push({
        id: bill._id.toString(),
        type: "bill",
        title: `Bill: ${bill.name}`,
        amountMinor: bill.amountMinor,
        currency: bill.currency,
        date: dateKey,
        status: bill.status,
        categoryName: catObj?.name,
      });
    }

    // Map recurring rules
    for (const rule of recurringRules) {
      const dateKey = formatDate(rule.nextRunAt, "yyyy-MM-dd");
      const day = getDay(dateKey);
      const catObj = rule.categoryId as unknown as { name?: string };

      day.events.push({
        id: rule._id.toString(),
        type: "recurring",
        title: `Scheduled ${rule.type}: ${rule.merchant || catObj?.name || "Recurring"}`,
        amountMinor: rule.amountMinor,
        currency: rule.currency,
        date: dateKey,
        categoryName: catObj?.name,
      });
    }

    return dayMap;
  }
}

export const calendarService = new CalendarService();
