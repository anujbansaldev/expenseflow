import { describe, it, expect, vi } from "vitest";
import { BillService } from "@/services/bill.service";
import { Transaction } from "@/models/Transaction";
import { ConflictError, NotFoundError } from "@/lib/errors/errors";

describe("Bill Tracking & Ledger Payment Linking", () => {
  const userId = "64b0f89e2c1e4b001a111111";
  const billId = "64b0f89e2c1e4b001abbbbbb";
  const accountId = "64b0f89e2c1e4b001aaaaaaa";
  const categoryId = "64b0f89e2c1e4b001acccccc";

  it("marks bill as paid and generates an atomic ledger expense transaction", async () => {
    const mockBill = {
      _id: billId,
      userId,
      name: "Electricity Bill",
      amountMinor: 250000, // ₹2,500.00
      currency: "INR",
      dueDate: new Date("2026-08-15"),
      status: "upcoming",
      accountId,
      categoryId,
      isRecurring: false,
    };

    const mockBillRepo: any = {
      findByIdAndUserId: vi.fn().mockResolvedValue(mockBill),
      update: vi.fn().mockImplementation((_id, _uId, updates) => {
        return Promise.resolve({ ...mockBill, ...updates });
      }),
    };

    const mockAccRepo: any = {};
    const mockCatRepo: any = {};

    let createdTx: any = null;
    vi.spyOn(Transaction, "create").mockImplementation(((data: any) => {
      createdTx = { ...data, _id: "tx-bill-1" };
      return Promise.resolve(createdTx);
    }) as any);

    const service = new BillService(mockBillRepo, mockAccRepo, mockCatRepo);

    const paid = await service.markPaid(billId, userId, {
      accountId,
      categoryId,
      paidAt: new Date("2026-08-10"),
    });

    expect(paid.status).toBe("paid");
    expect(createdTx).toBeDefined();
    expect(createdTx.type).toBe("expense");
    expect(createdTx.amountMinor).toBe(250000);
    expect(createdTx.merchant).toBe("Electricity Bill");
  });

  it("prevents double payment of an already paid bill", async () => {
    const mockPaidBill = {
      _id: billId,
      userId,
      name: "WiFi Bill",
      amountMinor: 100000,
      currency: "INR",
      dueDate: new Date(),
      status: "paid",
    };

    const mockBillRepo: any = {
      findByIdAndUserId: vi.fn().mockResolvedValue(mockPaidBill),
    };

    const service = new BillService(mockBillRepo, {} as any, {} as any);

    await expect(service.markPaid(billId, userId, {})).rejects.toThrow(ConflictError);
  });
});
