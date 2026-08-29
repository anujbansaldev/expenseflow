import { NextRequest } from "next/server";
import { seedDemoData } from "@/lib/seeds/demo-seeder";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(_req: NextRequest) {
  try {
    const result = await seedDemoData();
    return jsonSuccess(result, {
      message: `Demo financial ecosystem successfully seeded for ${result.email}!`,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(_req: NextRequest) {
  try {
    const result = await seedDemoData();
    return jsonSuccess(result, {
      message: `Demo financial ecosystem successfully seeded for ${result.email}!`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
