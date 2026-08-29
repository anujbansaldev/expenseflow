import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateTransactionSchema } from "@/schemas/transaction.schema";
import { transactionService } from "@/services/transaction.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const transaction = await transactionService.getTransaction(id, session.userId);
    return jsonSuccess(transaction);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const body = await req.json();
    const validated = updateTransactionSchema.parse(body);

    const updated = await transactionService.updateTransaction(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Transaction updated successfully." });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const deleted = await transactionService.deleteTransaction(id, session.userId);
    return jsonSuccess(deleted, { message: "Transaction deleted successfully." });
  } catch (error) {
    return jsonError(error);
  }
}
