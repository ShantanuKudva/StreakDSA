import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recalculateUserStreak } from './streak';
import { db } from './db';
import { User, DailyLog } from '@prisma/client';

// Mock the db module
vi.mock('./db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    dailyLog: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('streak', () => {
  const userId = 'user-123';
  const today = new Date('2024-01-05T00:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(today);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('recalculateUserStreak', () => {
    it('calculates streak correctly for consecutive days', async () => {
      // Mock user exists
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: userId } as unknown as User);

      // Mock logs: Today, Yesterday, Day Before
      vi.mocked(db.dailyLog.findMany).mockResolvedValue([
        { date: new Date('2024-01-05T00:00:00Z'), completed: true },
        { date: new Date('2024-01-04T00:00:00Z'), completed: true },
        { date: new Date('2024-01-03T00:00:00Z'), completed: true },
      ] as unknown as DailyLog[]);

      await recalculateUserStreak(userId);

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          currentStreak: 3,
          daysCompleted: 3,
          maxStreak: 3,
        },
      });
    });

    it('resets streak if gap > 1 day', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: userId } as unknown as User);

      // Mock logs: Today, Gap, 3 Days Ago
      vi.mocked(db.dailyLog.findMany).mockResolvedValue([
        { date: new Date('2024-01-05T00:00:00Z'), completed: true },
        // Missing Jan 4
        { date: new Date('2024-01-03T00:00:00Z'), completed: true },
      ] as unknown as DailyLog[]);

      await recalculateUserStreak(userId);

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          currentStreak: 1, // Only today counts for current streak
          daysCompleted: 2,
          maxStreak: 1,
        },
      });
    });
  });

  describe('updateStreakOnProblemDelete', () => {
    it('unmarks day if no problems remain', async () => {
      const { updateStreakOnProblemDelete } = await import('./streak');
      
      vi.mocked(db.dailyLog.update).mockResolvedValue({} as unknown as DailyLog);
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: userId } as unknown as User);
      vi.mocked(db.dailyLog.findMany).mockResolvedValue([] as unknown as DailyLog[]); // No completed logs

      await updateStreakOnProblemDelete(userId, today, 0);

      expect(db.dailyLog.update).toHaveBeenCalledWith({
        where: { userId_date: { userId, date: today } },
        data: { completed: false, markedAt: null },
      });
      expect(db.user.update).toHaveBeenCalled(); // Recalc called
    });

    it('does nothing if problems remain', async () => {
      const { updateStreakOnProblemDelete } = await import('./streak');
      await updateStreakOnProblemDelete(userId, today, 1);
      expect(db.dailyLog.update).not.toHaveBeenCalled();
    });
  });
});
