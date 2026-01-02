import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getTodayForUser,
  getRealStartOfDay,
  getDeadlineForUser,
  formatTimeRemaining,
  getUserTodayString,
} from './date-utils';

describe('date-utils', () => {
  const MOCK_TIMEZONE = 'Asia/Kolkata'; // UTC+5:30

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getTodayForUser returns UTC midnight of local day', () => {
    // 2024-01-01 22:00 UTC is 2024-01-02 03:30 IST
    vi.setSystemTime(new Date('2024-01-01T22:00:00Z'));
    
    const todayIST = getTodayForUser('Asia/Kolkata');
    expect(todayIST.toISOString()).toBe('2024-01-02T00:00:00.000Z');

    const todayUTC = getTodayForUser('UTC');
    expect(todayUTC.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('getRealStartOfDay returns actual UTC start of day', () => {
    // 2024-01-01 22:00 UTC is 2024-01-02 03:30 IST
    vi.setSystemTime(new Date('2024-01-01T22:00:00.000Z'));
    
    const startIST = getRealStartOfDay('Asia/Kolkata');
    // IST is UTC+5:30, so start of Jan 2nd IST is Jan 1st 18:30 UTC
    expect(startIST.toISOString()).toBe('2024-01-01T18:30:00.000Z');
  });

  it('getDeadlineForUser calculates correctly relative to real start', () => {
    vi.setSystemTime(new Date('2024-01-01T22:00:00.000Z'));
    
    // 22:00 reminder in IST (UTC+5:30)
    // Real start is 18:30 UTC. 18:30 + 22h = 16:30 UTC next day.
    const deadline = getDeadlineForUser('Asia/Kolkata', '22:00');
    expect(deadline.toISOString()).toBe('2024-01-02T16:30:00.000Z');
  });

  it('getUserTodayString returns YYYY-MM-DD', () => {
    const str = getUserTodayString(MOCK_TIMEZONE);
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formatTimeRemaining handles positive duration', () => {
    const future = new Date(Date.now() + 1000 * 60 * 65); // 1h 5m
    const formatted = formatTimeRemaining(future);
    expect(formatted).toBe('1h 5m');
  });

  it('formatTimeRemaining handles passed deadline', () => {
    const past = new Date(Date.now() - 1000);
    const formatted = formatTimeRemaining(past);
    expect(formatted).toBe('Deadline passed');
  });
});
