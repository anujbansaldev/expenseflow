import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { createBillSchema } from "@/schemas/bill.schema";
import { billService } from "@/services/bill.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const bills = await billService.listBills(session.userId, status);
    return jsonSuccess(bills);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = createBillSchema.parse(body);

    const bill = await billService.createBill(session.userId, validated);
    return jsonSuccess(bill, { message: "Bill created successfully." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
