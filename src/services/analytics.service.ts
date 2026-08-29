import { analyticsRepository, AnalyticsRepository } from "@/repositories/analytics.repository";
import { transactionService, TransactionService } from "@/services/transaction.service";
import { accountService, AccountService } from "@/services/account.service";
import { getDateRangeFromPreset, DateRangePreset } from "@/lib/dates/dates";

export class AnalyticsService {
  constructor(
    private analyticsRepo: AnalyticsRepository = analyticsRepository,
    private txService: TransactionService = transactionService,
    private accService: AccountService = accountService
  ) {}

  async getDashboardOverview(
    userId: string,
    preset: DateRangePreset = "this_month",
    customStart?: string,
    customEnd?: string
  ) {
    let startDate: Date;
    let endDate: Date;

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      const range = getDateRangeFromPreset(preset);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [
      cashFlow,
      accounts,
      cashFlowTrend,
      categorySpending,
      recentTxResult,
    ] = await Promise.all([
      this.txService.getCashFlowSummary(
        userId,
        startDate.toISOString(),
        endDate.toISOString()
      ),
      this.accService.listAccounts(userId, false),
      this.analyticsRepo.getCashFlowTrend(userId, startDate, endDate),
      this.analyticsRepo.getCategorySpending(userId, startDate, endDate),
      this.txService.listTransactions(userId, { page: 1, limit: 5 } as any),
    ]);

    const totalBalanceMinor = accounts.reduce(
      (sum, acc) => sum + (acc.currentBalanceMinor || 0),
      0
    );

    return {
      period: {
        preset,
        startDate,
        endDate,
      },
      kpis: {
        totalBalanceMinor,
        incomeMinor: cashFlow.incomeMinor,
        expenseMinor: cashFlow.expenseMinor,
        netFlowMinor: cashFlow.netFlowMinor,
        activeAccountsCount: accounts.length,
      },
      accounts,
      cashFlowTrend,
      categorySpending: categorySpending.slice(0, 6), // Top 6 categories
      recentTransactions: recentTxResult.items,
    };
  }

  async getAnalyticsData(
    userId: string,
    preset: DateRangePreset = "this_month",
    customStart?: string,
    customEnd?: string
  ) {
    let startDate: Date;
    let endDate: Date;

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      const range = getDateRangeFromPreset(preset);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [cashFlow, cashFlowTrend, categorySpending, accounts] =
      await Promise.all([
        this.txService.getCashFlowSummary(
          userId,
          startDate.toISOString(),
          endDate.toISOString()
        ),
        this.analyticsRepo.getCashFlowTrend(userId, startDate, endDate),
        this.analyticsRepo.getCategorySpending(userId, startDate, endDate),
        this.accService.listAccounts(userId, false),
      ]);

    return {
      period: {
        preset,
        startDate,
        endDate,
      },
      summary: cashFlow,
      cashFlowTrend,
      categorySpending,
      accounts,
    };
  }
}

export const analyticsService = new AnalyticsService();
