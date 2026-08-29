/**
 * Money Utility Module for ExpenseFlow
 * 
 * Strict minor-unit (integer) financial calculations.
 * Avoids IEEE-754 floating point precision corruption.
 */

export interface FormatMoneyOptions {
  currency?: string;
  locale?: string;
  showSign?: boolean;
  compact?: boolean;
}

/**
 * Parses user input (string or number like "120.50", "₹1,500.25", 500) into integer minor units (e.g. paise/cents).
 * Multiplies by 100 safely using exact string component manipulation to eliminate float precision loss.
 */
export function parseToMinorUnits(input: string | number): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new Error("Invalid number provided for money parsing");
    }
    // Convert to 2-decimal string representation first
    input = input.toFixed(2);
  }

  const raw = input.trim();
  if (!raw) {
    throw new Error("Empty money string provided");
  }

  // Remove common currency symbols, spaces, and thousand-separators (commas)
  const sanitized = raw.replace(/[₹$€£¥,\s]/g, "");

  // Check for leading negative sign
  const isNegative = sanitized.startsWith("-");
  const unsigned = isNegative ? sanitized.slice(1) : sanitized;

  // Validate format (digits with optional . and up to 2 decimal places)
  if (!/^\d+(\.\d{1,2})?$/.test(unsigned)) {
    throw new Error(`Invalid monetary format: "${input}"`);
  }

  const parts = unsigned.split(".");
  const whole = parts[0] || "0";
  const decimal = (parts[1] || "").padEnd(2, "0").slice(0, 2);

  const minor = parseInt(whole, 10) * 100 + parseInt(decimal, 10);
  return isNegative ? -minor : minor;
}

/**
 * Converts integer minor units (e.g. 15050 paise) into major decimal units (e.g. 150.50).
 * Safe for display calculation boundaries only.
 */
export function toMajorUnits(amountMinor: number): number {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`amountMinor must be an integer, received: ${amountMinor}`);
  }
  return amountMinor / 100;
}

/**
 * Formats minor units into an accessible, localized currency string.
 * Default currency is INR ("INR"), locale "en-IN".
 */
export function formatMinorUnits(
  amountMinor: number,
  options: FormatMoneyOptions = {}
): string {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`amountMinor must be an integer, received: ${amountMinor}`);
  }

  const {
    currency = "INR",
    locale = currency === "INR" ? "en-IN" : "en-US",
    showSign = false,
    compact = false,
  } = options;

  const isNegative = amountMinor < 0;
  const absMinor = Math.abs(amountMinor);
  const major = absMinor / 100;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: compact ? "compact" : "standard",
  });

  const formattedAbs = formatter.format(major);

  if (isNegative) {
    return `−${formattedAbs}`;
  }

  if (showSign && amountMinor > 0) {
    return `+${formattedAbs}`;
  }

  return formattedAbs;
}

/**
 * Adds two minor unit values safely.
 */
export function addMinor(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("Both operands must be integers");
  }
  return a + b;
}

/**
 * Subtracts minor unit value b from a safely.
 */
export function subtractMinor(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("Both operands must be integers");
  }
  return a - b;
}

/**
 * Calculates a percentage (0-100) of an amount in minor units, returning integer minor units rounded.
 */
export function percentageMinor(amountMinor: number, percent: number): number {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("amountMinor must be an integer");
  }
  return Math.round((amountMinor * percent) / 100);
}
