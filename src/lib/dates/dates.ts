import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  format,
  parseISO,
  isValid,
} from "date-fns";

export const DEFAULT_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_DATE_FORMAT = "dd MMM yyyy";

/**
 * Validates and converts input into a valid UTC Date object.
 */
export function ensureDate(dateInput: Date | string | number): Date {
  const date =
    typeof dateInput === "string"
      ? parseISO(dateInput)
      : new Date(dateInput);

  if (!isValid(date)) {
    throw new Error(`Invalid date provided: ${dateInput}`);
  }
  return date;
}

/**
 * Formats a date using date-fns formatting pattern.
 */
export function formatDate(
  dateInput: Date | string | number,
  formatStr: string = DEFAULT_DATE_FORMAT
): string {
  const date = ensureDate(dateInput);
  return format(date, formatStr);
}

/**
 * Formats a date and time for display.
 */
export function formatDateTime(
  dateInput: Date | string | number,
  formatStr: string = "dd MMM yyyy, hh:mm a"
): string {
  const date = ensureDate(dateInput);
  return format(date, formatStr);
}

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_month"
  | "last_30_days"
  | "last_90_days"
  | "this_year";

/**
 * Computes boundary UTC dates for standard dashboard/report presets.
 */
export function getDateRangeFromPreset(
  preset: DateRangePreset,
  referenceDate: Date = new Date(),
  weekStartsOn: 0 | 1 = 1 // 1 = Monday
): { startDate: Date; endDate: Date } {
  switch (preset) {
    case "today":
      return {
        startDate: startOfDay(referenceDate),
        endDate: endOfDay(referenceDate),
      };
    case "yesterday": {
      const yesterday = subDays(referenceDate, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };
    }
    case "this_week":
      return {
        startDate: startOfWeek(referenceDate, { weekStartsOn }),
        endDate: endOfWeek(referenceDate, { weekStartsOn }),
      };
    case "this_month":
      return {
        startDate: startOfMonth(referenceDate),
        endDate: endOfMonth(referenceDate),
      };
    case "last_month": {
      const prevMonth = subMonths(referenceDate, 1);
      return {
        startDate: startOfMonth(prevMonth),
        endDate: endOfMonth(prevMonth),
      };
    }
    case "last_30_days":
      return {
        startDate: startOfDay(subDays(referenceDate, 29)),
        endDate: endOfDay(referenceDate),
      };
    case "last_90_days":
      return {
        startDate: startOfDay(subDays(referenceDate, 89)),
        endDate: endOfDay(referenceDate),
      };
    case "this_year":
      return {
        startDate: startOfYear(referenceDate),
        endDate: endOfYear(referenceDate),
      };
    default:
      return {
        startDate: startOfMonth(referenceDate),
        endDate: endOfMonth(referenceDate),
      };
  }
}
