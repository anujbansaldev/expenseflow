import { jsonSuccess, jsonError } from "@/lib/errors/errors";
import { connectToDatabase } from "@/lib/db/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    let dbStatus = "disconnected";
    try {
      await connectToDatabase();
      dbStatus = mongoose.connection.readyState === 1 ? "connected" : "connecting";
    } catch {
      dbStatus = "error";
    }

    return jsonSuccess({
      status: "ok",
      app: "ExpenseFlow",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonError(error);
  }
}
