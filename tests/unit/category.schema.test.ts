import { describe, it, expect } from "vitest";
import { createCategorySchema, updateCategorySchema } from "@/schemas/category.schema";

describe("Category Zod Schemas", () => {
  it("validates valid category creation input", () => {
    const res = createCategorySchema.safeParse({
      name: "Groceries & Supplies",
      type: "expense",
      icon: "ShoppingCart",
      colorToken: "#10b981",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.name).toBe("Groceries & Supplies");
      expect(res.data.type).toBe("expense");
    }
  });

  it("rejects category without type", () => {
    const res = createCategorySchema.safeParse({
      name: "Groceries",
    });
    expect(res.success).toBe(false);
  });

  it("validates category update schema", () => {
    const res = updateCategorySchema.safeParse({
      name: "Updated Name",
      colorToken: "#f43f5e",
      isArchived: true,
    });
    expect(res.success).toBe(true);
  });
});
