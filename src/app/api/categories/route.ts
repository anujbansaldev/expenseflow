import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { createCategorySchema } from "@/schemas/category.schema";
import { categoryService } from "@/services/category.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");
    const includeArchived = searchParams.get("includeArchived") === "true";

    const type = typeParam === "income" || typeParam === "expense" ? typeParam : undefined;
    const categories = await categoryService.listCategories(session.userId, type, includeArchived);
    return jsonSuccess(categories);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    const category = await categoryService.createCategory(session.userId, validated);
    return jsonSuccess(category, { message: "Category created successfully." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
