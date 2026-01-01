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
 * Get today's date for a user in their timezone, as a UTC Date
 */
export function getTodayForUser(timezone: string): Date {
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
 * Get the deadline datetime for a user's check-in today
 */
export function getDeadlineForUser(
  timezone: string,
  reminderTime: string
): Date {
  const today = getTodayForUser(timezone);
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const deadline = new Date(today);
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
