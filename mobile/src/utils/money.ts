/**
 * Formats minor units (integers) to display currency string.
 * Example: 145000 minor units with INR -> "₹1,450.00"
 */
export function formatMinorUnits(
  minorUnits: number | undefined | null,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  const amount = (minorUnits || 0) / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if locale or currency code is non-standard
    const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Converts major units float/string to integer minor units.
 * Example: "1450.50" -> 145050
 */
export function toMinorUnits(amount: number | string): number {
  const parsed = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Converts minor units to major units float.
 * Example: 145050 -> 1450.5
 */
export function toMajorUnits(minorUnits: number): number {
  return minorUnits / 100;
}
