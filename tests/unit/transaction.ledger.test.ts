import { describe, it, expect, vi } from "vitest";
import { TransactionService } from "@/services/transaction.service";
import { NotFoundError, ValidationError } from "@/lib/errors/errors";

describe("Transaction Ledger Financial Fixture & Math", () => {
  const userId = "64b0f89e2c1e4b001a111111";
  const accountAId = "64b0f89e2c1e4b001aaaaaaa";
  const accountBId = "64b0f89e2c1e4b001abbbbbb";
  const salaryCatId = "64b0f89e2c1e4b001acccccc";
  const groceryCatId = "64b0f89e2c1e4b001adddddd";

  it("calculates accurate derived account balances and excludes transfers from cash flow", async () => {
    // Simulated ledger state
    const accounts = new Map([
      [
        accountAId,
        {
          _id: accountAId,
          userId,
          name: "Account A",
          type: "bank",
          currency: "INR",
          openingBalanceMinor: 50000, // ₹500.00
          isArchived: false,
        },
      ],
      [
        accountBId,
        {
          _id: accountBId,
          userId,
          name: "Account B",
          type: "cash",
          currency: "INR",
          openingBalanceMinor: 10000, // ₹100.00
          isArchived: false,
        },
      ],
    ]);

    const categories = new Map([
      [salaryCatId, { _id: salaryCatId, userId, name: "Salary", type: "income" }],
      [groceryCatId, { _id: groceryCatId, userId, name: "Groceries", type: "expense" }],
    ]);

    const transactions: any[] = [];

    const mockTxRepo: any = {
      create: vi.fn().mockImplementation((data: any) => {
        const doc = { ...data, _id: `tx-${transactions.length + 1}`, createdAt: new Date(), updatedAt: new Date() };
        transactions.push(doc);
        return Promise.resolve(doc);
      }),
      findByIdAndUserId: vi.fn().mockImplementation((id: string) => {
        const found = transactions.find((t) => t._id === id);
        return Promise.resolve(found || null);
      }),
      getAccountLedgerDelta: vi.fn().mockImplementation((accId: string) => {
        let delta = 0;
        const normalizedAccId = accId.toString().toLowerCase();
        for (const t of transactions) {
          const tSource = t.accountId.toString().toLowerCase();
          const tDest = t.destinationAccountId?.toString().toLowerCase();

          if (t.type === "income" && tSource === normalizedAccId) {
            delta += t.amountMinor;
          } else if (t.type === "expense" && tSource === normalizedAccId) {
            delta -= t.amountMinor;
          } else if (t.type === "transfer") {
            if (tSource === normalizedAccId) {
              delta -= t.amountMinor;
            }
            if (tDest === normalizedAccId) {
              delta += t.amountMinor;
            }
          }
        }
        return Promise.resolve(delta);
      }),
      getCashFlowSummary: vi.fn().mockImplementation(() => {
        let income = 0;
        let expense = 0;
        for (const t of transactions) {
          if (t.type === "income") income += t.amountMinor;
          if (t.type === "expense") expense += t.amountMinor;
        }
        return Promise.resolve({
          incomeMinor: income,
          expenseMinor: expense,
          netFlowMinor: income - expense,
        });
      }),
    };

    const mockAccRepo: any = {
      findByIdAndUserId: vi.fn().mockImplementation((id: string) => {
        return Promise.resolve(accounts.get(id.toString().toLowerCase()) || null);
      }),
    };

    const mockCatRepo: any = {
      findByIdAndUserId: vi.fn().mockImplementation((id: string) => {
        return Promise.resolve(categories.get(id.toString().toLowerCase()) || null);
      }),
    };

    const service = new TransactionService(mockTxRepo, mockAccRepo, mockCatRepo);

    // 1. Initial Balances
    const balA0 = await service.calculateAccountBalance(accountAId, userId);
    const balB0 = await service.calculateAccountBalance(accountBId, userId);
    expect(balA0).toBe(50000);
    expect(balB0).toBe(10000);

    // 2. Add Income ₹800.00 (80000 minor units) into Account A
    await service.createTransaction(userId, {
      type: "income",
      amount: "800.00",
      accountId: accountAId,
      categoryId: salaryCatId,
    } as any);

    // Account A balance should now be 50000 + 80000 = 130000
    const balA1 = await service.calculateAccountBalance(accountAId, userId);
    expect(balA1).toBe(130000);

    // 3. Add Expense ₹200.00 (20000 minor units) from Account A
    await service.createTransaction(userId, {
      type: "expense",
      amount: "200.00",
      accountId: accountAId,
      categoryId: groceryCatId,
    } as any);

    // Account A balance should now be 130000 - 20000 = 110000
    const balA2 = await service.calculateAccountBalance(accountAId, userId);
    expect(balA2).toBe(110000);

    // 4. Transfer ₹300.00 (30000 minor units) from Account A to Account B
    await service.createTransaction(userId, {
      type: "transfer",
      amount: "300.00",
      accountId: accountAId,
      destinationAccountId: accountBId,
    } as any);

    // Account A balance: 110000 - 30000 = 80000
    // Account B balance: 10000 + 30000 = 40000
    const balA3 = await service.calculateAccountBalance(accountAId, userId);
    const balB3 = await service.calculateAccountBalance(accountBId, userId);
    expect(balA3).toBe(80000);
    expect(balB3).toBe(40000);

    // 5. Verify Cash Flow Summary strictly excludes transfer
    const cashFlow = await service.getCashFlowSummary(userId);
    expect(cashFlow.incomeMinor).toBe(80000); // Only Salary
    expect(cashFlow.expenseMinor).toBe(20000); // Only Groceries
    expect(cashFlow.netFlowMinor).toBe(60000); // 80000 - 20000
  });
});

describe("Transaction Cross-User Ownership Isolation", () => {
  const userA = "64b0f89e2c1e4b001a111111";
  const userB = "64b0f89e2c1e4b001a222222";
  const userBAccount = "64b0f89e2c1e4b001abbbbbb";
  const userBCategory = "64b0f89e2c1e4b001acccccc";

  it("prevents User A from creating transactions on User B's account", async () => {
    const mockTxRepo: any = {};
    const mockAccRepo: any = {
      findByIdAndUserId: vi.fn().mockImplementation((id: string, uId: string) => {
        if (id === userBAccount && uId === userB) return Promise.resolve({ _id: userBAccount, userId: userB });
        return Promise.resolve(null);
      }),
    };
    const mockCatRepo: any = {
      findByIdAndUserId: vi.fn().mockResolvedValue(null),
    };

    const service = new TransactionService(mockTxRepo, mockAccRepo, mockCatRepo);

    await expect(
      service.createTransaction(userA, {
        type: "expense",
        amount: "50",
        accountId: userBAccount,
        categoryId: "64b0f89e2c1e4b001adddddd",
      } as any)
    ).rejects.toThrow(NotFoundError);
  });

  it("prevents User A from transferring into User B's account", async () => {
    const userAAccount = "64b0f89e2c1e4b001aaaaaaa";
    const mockTxRepo: any = {};
    const mockAccRepo: any = {
      findByIdAndUserId: vi.fn().mockImplementation((id: string, uId: string) => {
        if (id === userAAccount && uId === userA) return Promise.resolve({ _id: userAAccount, userId: userA });
        return Promise.resolve(null);
      }),
    };
    const mockCatRepo: any = {};

    const service = new TransactionService(mockTxRepo, mockAccRepo, mockCatRepo);

    await expect(
      service.createTransaction(userA, {
        type: "transfer",
        amount: "100",
        accountId: userAAccount,
        destinationAccountId: userBAccount,
      } as any)
    ).rejects.toThrow(NotFoundError);
  });
});
