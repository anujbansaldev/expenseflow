import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateBillSchema } from "@/schemas/bill.schema";
import { billService } from "@/services/bill.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const bill = await billService.getBill(id, session.userId);
    return jsonSuccess(bill);
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
    const validated = updateBillSchema.parse(body);

    const updated = await billService.updateBill(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Bill updated successfully." });
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
    const deleted = await billService.deleteBill(id, session.userId);
    return jsonSuccess(deleted, { message: "Bill deleted successfully." });
  } catch (error) {
    return jsonError(error);
  }
}
