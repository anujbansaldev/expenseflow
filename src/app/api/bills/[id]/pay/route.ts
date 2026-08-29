import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { payBillSchema } from "@/schemas/bill.schema";
import { billService } from "@/services/bill.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const body = await req.json();
    const validated = payBillSchema.parse(body);

    const paidBill = await billService.markPaid(id, session.userId, validated);
    return jsonSuccess(paidBill, { message: "Bill marked as paid and ledger updated." });
  } catch (error) {
    return jsonError(error);
  }
}
