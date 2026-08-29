import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  jsonSuccess,
  jsonError,
} from "@/lib/errors/errors";
import { z } from "zod";

describe("Error Utilities & JSON Envelopes", () => {
  it("creates custom AppError instances with correct status codes", () => {
    const err = new NotFoundError("Account not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Account not found");
  });

  it("creates ValidationError with field error map", () => {
    const err = new ValidationError("Validation failed", {
      amountMinor: ["Must be greater than 0"],
    });
    expect(err.statusCode).toBe(400);
    expect(err.fieldErrors?.amountMinor).toEqual(["Must be greater than 0"]);
  });

  it("produces standard success JSON response envelope", async () => {
    const res = jsonSuccess({ id: "123", name: "Savings" }, { total: 1 }, 201);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({
      data: { id: "123", name: "Savings" },
      meta: { total: 1 },
    });
  });

  it("produces standard error JSON response from AppError", async () => {
    const res = jsonError(new UnauthorizedError("Please log in"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Please log in",
      },
    });
  });

  it("maps ZodError to field error response", async () => {
    const schema = z.object({
      email: z.string().email("Invalid email"),
    });

    const parsed = schema.safeParse({ email: "invalid-email" });
    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      const res = jsonError(parsed.error);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.error.fieldErrors?.email).toContain("Invalid email");
    }
  });
});
