import { connectToDatabase } from "@/lib/db/mongodb";
import { Transaction } from "@/models/Transaction";
import { generateCsv } from "@/lib/export/csv";
import { formatMinorUnits, toMajorUnits } from "@/lib/money/money";
import { formatDate } from "@/lib/dates/dates";
import { ReportFilterInput, ExportCsvInput } from "@/schemas/report.schema";
import mongoose from "mongoose";

export class ReportService {
  async getReportData(userId: string | mongoose.Types.ObjectId, filters: ReportFilterInput) {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());
    const query: Record<string, unknown> = { userId: uId };

    if (filters.type) query.type = filters.type;
    if (filters.accountId) query.accountId = new mongoose.Types.ObjectId(filters.accountId);
    if (filters.categoryId) query.categoryId = new mongoose.Types.ObjectId(filters.categoryId);

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
      if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
      query.occurredAt = dateFilter;
    }

    const transactions = await Transaction.find(query)
      .populate("accountId", "name type currency")
      .populate("destinationAccountId", "name type currency")
      .populate("categoryId", "name type icon colorToken")
      .sort({ occurredAt: -1 })
      .exec();

    let totalIncomeMinor = 0;
    let totalExpenseMinor = 0;
    const categoryMap: { [catName: string]: { amountMinor: number; count: number; color?: string } } = {};
    const accountMap: { [accName: string]: { incomeMinor: number; expenseMinor: number; count: number } } = {};

    for (const tx of transactions) {
      const accObj = tx.accountId as unknown as { name?: string };
      const catObj = tx.categoryId as unknown as { name?: string; colorToken?: string };
      const accName = accObj?.name || "Unknown Account";
      const catName = catObj?.name || (tx.type === "transfer" ? "Transfer" : "Uncategorized");

      if (!accountMap[accName]) {
        accountMap[accName] = { incomeMinor: 0, expenseMinor: 0, count: 0 };
      }
      accountMap[accName].count++;

      if (tx.type === "income") {
        totalIncomeMinor += tx.amountMinor;
        accountMap[accName].incomeMinor += tx.amountMinor;
      } else if (tx.type === "expense") {
        totalExpenseMinor += tx.amountMinor;
        accountMap[accName].expenseMinor += tx.amountMinor;

        if (!categoryMap[catName]) {
          categoryMap[catName] = { amountMinor: 0, count: 0, color: catObj?.colorToken };
        }
        categoryMap[catName].amountMinor += tx.amountMinor;
        categoryMap[catName].count++;
      }
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([name, stat]) => ({
      name,
      amountMinor: stat.amountMinor,
      count: stat.count,
      color: stat.color,
      percentage: totalExpenseMinor > 0 ? Number(((stat.amountMinor / totalExpenseMinor) * 100).toFixed(1)) : 0,
    }));

    const accountBreakdown = Object.entries(accountMap).map(([name, stat]) => ({
      name,
      incomeMinor: stat.incomeMinor,
      expenseMinor: stat.expenseMinor,
      netMinor: stat.incomeMinor - stat.expenseMinor,
      count: stat.count,
    }));

    return {
      summary: {
        totalIncomeMinor,
        totalExpenseMinor,
        netFlowMinor: totalIncomeMinor - totalExpenseMinor,
        transactionCount: transactions.length,
      },
      categoryBreakdown,
      accountBreakdown,
      transactions: transactions.slice(0, 100).map((tx) => {
        const acc = tx.accountId as unknown as { name?: string };
        const dest = tx.destinationAccountId as unknown as { name?: string };
        const cat = tx.categoryId as unknown as { name?: string };
        return {
          id: tx._id.toString(),
          type: tx.type,
          amountMinor: tx.amountMinor,
          currency: tx.currency,
          accountName: acc?.name,
          destinationAccountName: dest?.name,
          categoryName: cat?.name,
          occurredAt: tx.occurredAt,
          merchant: tx.merchant,
          description: tx.description,
        };
      }),
    };
  }

  async exportCsv(userId: string | mongoose.Types.ObjectId, filters: ExportCsvInput): Promise<string> {
    await connectToDatabase();
    const uId = new mongoose.Types.ObjectId(userId.toString());
    const query: Record<string, unknown> = { userId: uId };

    if (filters.type) query.type = filters.type;
    if (filters.accountId) query.accountId = new mongoose.Types.ObjectId(filters.accountId);
    if (filters.categoryId) query.categoryId = new mongoose.Types.ObjectId(filters.categoryId);

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
      if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
      query.occurredAt = dateFilter;
    }

    const transactions = await Transaction.find(query)
      .populate("accountId", "name")
      .populate("destinationAccountId", "name")
      .populate("categoryId", "name")
      .sort({ occurredAt: -1 })
      .exec();

    const headers = [
      "Date",
      "Type",
      "Amount",
      "Currency",
      "Account",
      "Destination Account",
      "Category",
      "Merchant / Entity",
      "Description",
      "Notes",
      "Tags",
    ];

    const rows = transactions.map((tx) => {
      const acc = tx.accountId as unknown as { name?: string };
      const dest = tx.destinationAccountId as unknown as { name?: string };
      const cat = tx.categoryId as unknown as { name?: string };

      return [
        formatDate(tx.occurredAt, "yyyy-MM-dd"),
        tx.type.toUpperCase(),
        toMajorUnits(tx.amountMinor).toFixed(2),
        tx.currency,
        acc?.name || "",
        dest?.name || "",
        cat?.name || "",
        tx.merchant || "",
        tx.description || "",
        tx.notes || "",
        (tx.tags || []).join("; "),
      ];
    });

    return generateCsv(headers, rows);
  }
}

export const reportService = new ReportService();
