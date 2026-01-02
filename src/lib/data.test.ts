/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardData } from './data';
import { db } from './db';

vi.mock('./db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    dailyLog: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((cb) => cb),
  revalidateTag: vi.fn(),
}));

describe('data', () => {
  const userId = 'user-123';
  const mockUser = {
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    pledgeDays: 30,
    startDate: new Date('2024-01-01'),
    reminderTime: '09:00',
    timezone: 'UTC',
    currentStreak: 5,
    maxStreak: 10,
    daysCompleted: 5,
    gems: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns dashboard data correctly', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(db.dailyLog.findFirst).mockResolvedValue({
      completed: true,
      problems: [],
    } as any);
    vi.mocked(db.dailyLog.findMany).mockResolvedValue([
      { date: new Date('2024-01-01'), completed: true },
    ] as any);

    const data = await getDashboardData(userId);

    expect(data.user.name).toBe(mockUser.name);
    expect(data.streak.current).toBe(mockUser.currentStreak);
    expect(data.heatmapDays).toHaveLength(1);
  });

  it('throws error if user not found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    await expect(getDashboardData(userId)).rejects.toThrow('User not found');
  });
});
