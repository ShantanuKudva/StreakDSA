import { db } from "@/lib/db";
import { differenceInCalendarDays } from "date-fns";

/**
 * Updates user streak after a log is created.
 * Recalculates current streak based on history.
 */
export async function updateStreakOnProblemLog(
  userId: string,
  logDate: Date,
  timezone?: string
) {
  // Mark daily log as completed if not already
  await db.dailyLog.update({
    where: { userId_date: { userId, date: logDate } },
    data: { completed: true, markedAt: new Date(), isFrozen: false },
  });

  // Recalculate streak
  await recalculateUserStreak(userId, timezone);
}

/**
 * Updates streak when a problem is deleted.
 * If 0 problems remain for the day, unmark completion and recalc streak.
 */
export async function updateStreakOnProblemDelete(
  userId: string,
  logDate: Date,
  remainingCount: number,
  timezone?: string
) {
  if (remainingCount === 0) {
    // Unmark the day
    await db.dailyLog.update({
      where: { userId_date: { userId, date: logDate } },
      data: { completed: false, markedAt: null },
    });

    // Recalculate streak
    await recalculateUserStreak(userId, timezone);
  }
}

/**
 * Full streak recalculation logic.
 * Fetches all completed daily logs and counts consecutive days backwards from today/yesterday.
 */
// Full streak recalculation logic
export async function recalculateUserStreak(userId: string, timezone?: string) {
  let userTimezone = timezone;

  if (!userTimezone) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    if (!user) return; // Should likely throw or handle better, but keeping existing return behavior
    userTimezone = user.timezone;
  }

  // Fetch all completed logs sorted descending by date
  const logs = await db.dailyLog.findMany({
    where: {
      userId,
      OR: [{ completed: true }, { isFrozen: true }],
    },
    orderBy: { date: "desc" },
    select: { date: true, completed: true, isFrozen: true },
  });

  if (logs.length === 0) {
    await db.user.update({
      where: { id: userId },
      data: { currentStreak: 0, daysCompleted: 0, maxStreak: 0 },
    });
    return;
  }

  // Calculate current streak (consecutive days from most recent)
  let currentStreak = 0;

  // Check if the most recent log is today or yesterday (alive streak)
  const { getTodayForUser } = await import("./date-utils");
  const today = getTodayForUser(userTimezone || "UTC");
  const daysSinceLastLog = differenceInCalendarDays(today, logs[0].date);

  // If the last log is older than yesterday (diff > 1), streak is broken (0).
  // Unless we want to allow freezing to recover? For now, standard logic:
  // You must have logged something today or yesterday to keep it alive.
  if (daysSinceLastLog > 1) {
    currentStreak = 0;
  } else {
    // Streak is alive, calculate length
    // We iterate through logs. If consecutive, we add to streak.
    // If isFrozen is true, we DON'T increment, but we continue (bridge).
    // Actually, user wants "freeze" to NOT reset.
    // Standard freeze logic: It fills the gap.
    // If I froze yesterday, my streak is safe.
    // So, we just count consecutive days where (completed OR isFrozen).
    // BUT, usually freeze doesn't ADD to the number.
    // Let's implement: Frozen days maintain the chain but don't add to `currentStreak` count.

    // Wait, if I have 10 days, then freeze, then 1 day. Streak should be 11?
    // Or 10? Usually 10. "Freeze" just pauses it.
    // So we count only `completed: true` in the consecutive chain.

    // Let's walk the chain.
    let activeDays = 0; // Days that actually count (completed: true)

    // First, check if the chain starts from today/yesterday.
    // We already checked daysSinceLastLog <= 1.

    // We need to ensure the chain is continuous from log[0] backwards.
    for (let i = 0; i < logs.length; i++) {
      // Check continuity with previous log (if not first)
      if (i > 0) {
        const diff = differenceInCalendarDays(logs[i - 1].date, logs[i].date);
        if (diff > 1) {
          break; // Gap found, stop counting
        }
      }

      // Add to active count if completed
      if (logs[i].completed) {
        activeDays++;
      }
      // If frozen, we just continue loop (bridge)
    }
    currentStreak = activeDays;
  }

  // Calculate Best Streak (Max Streak) scan through history
  let maxActiveDays = 0;
  let currentChainActive = 0;

  if (logs.length > 0) {
    for (let i = 0; i < logs.length; i++) {
      // Check gap with previous log (if not first)
      if (i > 0) {
        const diff = differenceInCalendarDays(logs[i - 1].date, logs[i].date);
        if (diff > 1) {
          // Gap found, reset chain count
          currentChainActive = 0;
        }
      }

      if (logs[i].completed) {
        currentChainActive++;
      }

      if (currentChainActive > maxActiveDays) {
        maxActiveDays = currentChainActive;
      }
    }
  }

  const finalMaxStreak = maxActiveDays;

  // validation: if last log was 2+ days ago, current streak is 0
  // Logic moved above to handle frozen days correctly
  const finalCurrentStreak = currentStreak;

  await db.user.update({
    where: { id: userId },
    data: {
      currentStreak: finalCurrentStreak,
      daysCompleted: logs.length,
      maxStreak: finalMaxStreak,
    },
  });
}

/**
 * Manually marks today as complete (e.g. via check-in button, if allowed).
 */
export async function markDayComplete(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const timezone = user?.timezone || "UTC";

  const { getTodayForUser } = await import("./date-utils");
  const today = getTodayForUser(timezone);

  // Upsert daily log
  await db.dailyLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { completed: true, markedAt: new Date() },
    create: {
      userId,
      date: today,
      completed: true,
      markedAt: new Date(),
    },
  });

  await recalculateUserStreak(userId);
  return { success: true };
}

/**
 * Gets the status for today (completed, problems logged, etc).
 */
export interface CheckInResult {
  date: Date;
  completed: boolean;
  problemsLogged: number;
}

export async function getTodayStatus(userId: string): Promise<CheckInResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const timezone = user?.timezone || "UTC";

  const { getTodayForUser } = await import("./date-utils");
  const today = getTodayForUser(timezone);

  const log = await db.dailyLog.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { _count: { select: { problems: true } } },
  });

  return {
    date: today,
    completed: log?.completed || false,
    problemsLogged: log?._count.problems || 0,
  };
}
