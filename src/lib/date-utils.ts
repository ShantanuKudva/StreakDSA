/**
 * Date utilities for timezone-aware operations
 * Based on LLD Section 4.3
 */

import {
  format,
  startOfDay,
  addDays,
  differenceInDays,
  subDays,
} from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Get today's date for a user in their timezone, as a UTC Date representing UTC Midnight.
 * e.g. If it's Jan 2nd in IST, returns 2026-01-02T00:00:00Z
 */
export function getTodayForUser(timezone: string): Date {
  const now = new Date();
  const dateStr = formatInTimeZone(now, timezone, "yyyy-MM-dd");
  return new Date(`${dateStr}T00:00:00Z`);
}

/**
 * Get the actual UTC timestamp of the start of the user's day.
 * e.g. If it's Jan 2nd in IST, returns 2026-01-01T18:30:00Z
 */
export function getRealStartOfDay(timezone: string): Date {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const startOfZonedDay = startOfDay(zonedNow);
  return fromZonedTime(startOfZonedDay, timezone);
}

/**
 * Check if the check-in deadline has passed for a user
 */
export function isDeadlinePassed(
  timezone: string,
  reminderTime: string
): boolean {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const [hours, minutes] = reminderTime.split(":").map(Number);

  const currentHours = zonedNow.getHours();
  const currentMinutes = zonedNow.getMinutes();

  return (
    currentHours > hours ||
    (currentHours === hours && currentMinutes >= minutes)
  );
}

/**
 * Get the deadline datetime for a user's check-in today.
 * Calculated as Real Start of Day + reminderTime.
 */
export function getDeadlineForUser(
  timezone: string,
  reminderTime: string
): Date {
  const realStart = getRealStartOfDay(timezone);
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const deadline = new Date(realStart);
  deadline.setUTCHours(deadline.getUTCHours() + hours);
  deadline.setUTCMinutes(deadline.getUTCMinutes() + minutes);
  return deadline;
}

/**
 * Get yesterday's date for a user in their timezone
 */
export function getYesterdayForUser(timezone: string): Date {
  const today = getTodayForUser(timezone);
  return subDays(today, 1);
}

/**
 * Calculate days remaining in a pledge
 */
export function getDaysRemaining(
  startDate: Date,
  pledgeDays: number,
  timezone: string
): number {
  const today = getTodayForUser(timezone);
  const endDate = addDays(startDate, pledgeDays);
  const remaining = differenceInDays(endDate, today);
  return Math.max(0, remaining);
}

/**
 * Calculate pledge end date
 */
export function getPledgeEndDate(startDate: Date, pledgeDays: number): Date {
  return addDays(startDate, pledgeDays);
}

/**
 * Format time remaining until deadline
 */
export function formatTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) return "Deadline passed";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date,
  formatStr: string = "yyyy-MM-dd"
): string {
  return format(date, formatStr);
}

/**
 * Format date in user's timezone
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  formatStr: string = "yyyy-MM-dd"
): string {
  return formatInTimeZone(date, timezone, formatStr);
}

/**
 * Get the current date in the user's timezone as a string (YYYY-MM-DD).
 * Replaces getUserTodayString from dsa-utils.ts
 */
export function getUserTodayString(timezone: string = "UTC"): string {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

/**
 * Check if a date string is yesterday relative to user's current time.
 * Replaces isYesterday from dsa-utils.ts
 */
export function isYesterday(
  dateStr: string,
  timezone: string = "UTC"
): boolean {
  const yesterday = getYesterdayForUser(timezone);
  // Format yesterday as YYYY-MM-DD in the user's timezone to compare with dateStr
  // Since getYesterdayForUser returns a UTC date representing 00:00 in user's timezone,
  // we need to be careful.
  // Actually, getYesterdayForUser returns the UTC timestamp of the start of yesterday.
  // So if we format it in the user's timezone, we should get the correct string.
  return formatDateInTimezone(yesterday, timezone, "yyyy-MM-dd") === dateStr;
}
