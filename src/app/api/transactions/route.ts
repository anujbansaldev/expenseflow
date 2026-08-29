import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { createTransactionSchema, transactionFilterSchema } from "@/schemas/transaction.schema";
import { transactionService } from "@/services/transaction.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);

    const filterInput = {
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      type: searchParams.get("type") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "occurredAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const validatedFilters = transactionFilterSchema.parse(filterInput);
    const result = await transactionService.listTransactions(session.userId, validatedFilters);

    return jsonSuccess(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = createTransactionSchema.parse(body);

    const transaction = await transactionService.createTransaction(session.userId, validated);
    return jsonSuccess(transaction, { message: "Transaction recorded." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
