import { db } from "@/lib/db";
import { addDays, differenceInCalendarDays, subDays } from "date-fns";

/**
 * Updates user streak after a log is created.
 * Recalculates current streak based on history.
 */
export async function updateStreakOnProblemLog(userId: string, logDate: Date) {
  // Mark daily log as completed if not already
  await db.dailyLog.update({
    where: { userId_date: { userId, date: logDate } },
    data: { completed: true, markedAt: new Date() },
  });

  // Recalculate streak
  await recalculateUserStreak(userId);
}

/**
 * Updates streak when a problem is deleted.
 * If 0 problems remain for the day, unmark completion and recalc streak.
 */
export async function updateStreakOnProblemDelete(
  userId: string,
  logDate: Date,
  remainingCount: number
) {
  if (remainingCount === 0) {
    // Unmark the day
    await db.dailyLog.update({
      where: { userId_date: { userId, date: logDate } },
      data: { completed: false, markedAt: null },
    });

    // Recalculate streak
    await recalculateUserStreak(userId);
  }
}

/**
 * Full streak recalculation logic.
 * Fetches all completed daily logs and counts consecutive days backwards from today/yesterday.
 */
// Full streak recalculation logic
export async function recalculateUserStreak(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // Fetch all completed logs sorted descending by date
  const logs = await db.dailyLog.findMany({
    where: { userId, completed: true },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (logs.length === 0) {
    await db.user.update({
      where: { id: userId },
      data: { currentStreak: 0, daysCompleted: 0, maxStreak: 0 },
    });
    return;
  }

  // Calculate current streak (consecutive days from most recent)
  let currentStreak = 1;
  for (let i = 0; i < logs.length - 1; i++) {
    const diff = differenceInCalendarDays(logs[i].date, logs[i + 1].date);
    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate Best Streak (Max Streak) scan through history
  // Since logs are sorted DESC, we check gaps.
  let maxStreak = 0;
  let tempStreak = 1;

  if (logs.length > 0) {
    maxStreak = 1; // At least one log exists
    for (let i = 0; i < logs.length - 1; i++) {
      const diff = differenceInCalendarDays(logs[i].date, logs[i + 1].date);
      if (diff === 1) {
        tempStreak++;
      } else {
        // Gap found, reset tempStreak
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }
  }

  // Check validity of current streak (must be alive today or yesterday)
  // using UTC comparison for simplicity as per existing logic, or ideally timezone aware.
  // For safety, let's keep the existing "daysSinceLastLog" check for current status.
  const daysSinceLastLog = differenceInCalendarDays(new Date(), logs[0].date);

  // validation: if last log was 2+ days ago, current streak is 0
  const finalCurrentStreak = daysSinceLastLog > 1 ? 0 : currentStreak;

  await db.user.update({
    where: { id: userId },
    data: {
      currentStreak: finalCurrentStreak,
      daysCompleted: logs.length,
      maxStreak: maxStreak,
    },
  });
}

/**
 * Manually marks today as complete (e.g. via check-in button, if allowed).
 */
export async function markDayComplete(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // UTC midnight approximation for consistency

  // Upsert daily log
  await db.dailyLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { completed: true, markedAt: new Date() },
    create: {
      userId,
      date: today,
      completed: true,
      markedAt: new Date(),
      problemsLogged: 0,
    },
  });

  await recalculateUserStreak(userId);
  return { success: true };
}

/**
 * Gets the status for today (completed, problems logged, etc).
 */
export async function getTodayStatus(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await db.dailyLog.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  return {
    date: today,
    completed: log?.completed || false,
    problemsLogged: log?.problemsLogged || 0,
  };
}
