import { describe, it, expect, vi } from "vitest";
import { AnalyticsService } from "@/services/analytics.service";

describe("Analytics Service Deterministic Aggregations", () => {
  const userId = "64b0f89e2c1e4b001a111111";

  it("calculates dashboard KPIs and category percentages deterministically", async () => {
    const mockAnalyticsRepo: any = {
      getCashFlowTrend: vi.fn().mockResolvedValue([
        { date: "2026-08-01", incomeMinor: 5000000, expenseMinor: 1200000, netMinor: 3800000 },
        { date: "2026-08-05", incomeMinor: 0, expenseMinor: 800000, netMinor: -800000 },
      ]),
      getCategorySpending: vi.fn().mockResolvedValue([
        {
          categoryId: "cat-1",
          categoryName: "Housing & Rent",
          amountMinor: 1200000,
          count: 1,
          percentage: 60.0,
        },
        {
          categoryId: "cat-2",
          categoryName: "Groceries",
          amountMinor: 800000,
          count: 4,
          percentage: 40.0,
        },
      ]),
    };

    const mockTxService: any = {
      getCashFlowSummary: vi.fn().mockResolvedValue({
        incomeMinor: 5000000,
        expenseMinor: 2000000,
        netFlowMinor: 3000000,
      }),
      listTransactions: vi.fn().mockResolvedValue({
        items: [
          {
            id: "tx-1",
            type: "income",
            amountMinor: 5000000,
            accountName: "Salary Checking",
          },
        ],
      }),
    };

    const mockAccService: any = {
      listAccounts: vi.fn().mockResolvedValue([
        {
          id: "acc-1",
          name: "Salary Checking",
          currentBalanceMinor: 4500000,
        },
        {
          id: "acc-2",
          name: "Savings",
          currentBalanceMinor: 10000000,
        },
      ]),
    };

    const service = new AnalyticsService(mockAnalyticsRepo, mockTxService, mockAccService);

    const overview = await service.getDashboardOverview(userId, "this_month");

    // Check KPIs
    expect(overview.kpis.totalBalanceMinor).toBe(14500000); // 4500000 + 10000000
    expect(overview.kpis.incomeMinor).toBe(5000000);
    expect(overview.kpis.expenseMinor).toBe(2000000);
    expect(overview.kpis.netFlowMinor).toBe(3000000);
    expect(overview.kpis.activeAccountsCount).toBe(2);

    // Check Trend Series
    expect(overview.cashFlowTrend.length).toBe(2);
    expect(overview.cashFlowTrend[0].netMinor).toBe(3800000);

    // Check Category Spending
    expect(overview.categorySpending.length).toBe(2);
    expect(overview.categorySpending[0].categoryName).toBe("Housing & Rent");
    expect(overview.categorySpending[0].percentage).toBe(60.0);
    expect(overview.categorySpending[1].percentage).toBe(40.0);
  });
});
