import { jsonSuccess } from "@/lib/errors/errors";

export async function GET() {
  return jsonSuccess({
    status: "ok",
    app: "ExpenseFlow",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
