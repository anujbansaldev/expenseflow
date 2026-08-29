import { NextRequest } from "next/server";
import { requireAuthUser } from "@/lib/auth/session";
import { updateCategorySchema } from "@/schemas/category.schema";
import { categoryService } from "@/services/category.service";
import { jsonSuccess, jsonError } from "@/lib/errors/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthUser();
    const { id } = await params;
    const category = await categoryService.getCategory(id, session.userId);
    return jsonSuccess(category);
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
    const validated = updateCategorySchema.parse(body);

    const updated = await categoryService.updateCategory(id, session.userId, validated);
    return jsonSuccess(updated, { message: "Category updated successfully." });
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
    const archived = await categoryService.archiveCategory(id, session.userId, true);
    return jsonSuccess(archived, { message: "Category archived successfully." });
  } catch (error) {
    return jsonError(error);
  }
}
