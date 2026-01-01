import { toZonedTime, format } from "date-fns-tz";
import { startOfDay } from "date-fns";

/**
 * Get the current date in the user's timezone as a Date object (start of day).
 * @param timezone User's timezone string (e.g., "Asia/Kolkata")
 * @returns Date object representing midnight in the user's timezone, BUT stored as UTC Date.
 * Wait, simple string is better for database `db.Date` comparison.
 */
export function getUserTodayString(timezone: string = "UTC"): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  return format(zonedDate, "yyyy-MM-dd", { timeZone: timezone });
}

/**
 * Calculate if a date string is "yesterday" relative to "today" in user's timezone.
 */
export function isYesterday(
  dateStr: string,
  timezone: string = "UTC"
): boolean {
  const todayStr = getUserTodayString(timezone);
  const today = new Date(todayStr); // Local midnight
  const target = new Date(dateStr);

  const diffTime = Math.abs(today.getTime() - target.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Better: Parse and compare properly
  // Actually, string comparison is safer if formatted YYYY-MM-DD
  // But checking "yesterday" logic needs subtraction

  const zonedNow = toZonedTime(new Date(), timezone);
  const zonedYesterday = new Date(zonedNow);
  zonedYesterday.setDate(zonedYesterday.getDate() - 1);
  const yesterdayStr = format(zonedYesterday, "yyyy-MM-dd", {
    timeZone: timezone,
  });

  return dateStr === yesterdayStr;
}
