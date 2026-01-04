import type { Topic, Difficulty, DailyLog, ProblemLog } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getTodayForUser,
  getDeadlineForUser,
  getDaysRemaining,
  getPledgeEndDate,
} from "@/lib/date-utils";
import { subDays, differenceInCalendarDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getCachedData } from "@/lib/cache";
import { UserNotOnboardedError } from "@/lib/errors";

export interface DashboardData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    dailyLimit: number;
  };
  pledge: {
    totalDays: number;
    daysCompleted: number;
    daysRemaining: number;
    startDate: string;
    endDate: string;
  };
  streak: {
    current: number;
    max: number;
  };
  gems: number;
  today: {
    completed: boolean;
    deadlineAt: string;
    problemsLogged: number;
    problems: {
      id: string;
      topic: Topic;
      name: string;
      difficulty: Difficulty;
      externalUrl: string | null;
      tags: string[];
      notes: string;
    }[];
  };
  heatmapDays: {
    date: string;
    completed: boolean;
    isFrozen: boolean;
    isMilestone: boolean;
    problemCount?: number; // For varying heatmap intensity
    problems?: {
      id: string;
      topic: string;
      name: string;
      difficulty: string;
      externalUrl: string | null;
      tags: string[];
      hour: number;
    }[];
    completedAtHour?: number | null;
  }[];
  activityData: {
    date: string;
    problems: number;
    checkInTime: string | null;
  }[];
  timeDistribution: {
    hour: number;
    dayOfWeek: number;
    count: number;
  }[];
  freezeCount: number;
}

async function fetchDashboardDataInternal(
  userId: string
): Promise<DashboardData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      pledgeDays: true,
      startDate: true,
      reminderTime: true,
      timezone: true,
      currentStreak: true,
      maxStreak: true,
      daysCompleted: true,
      gems: true,
      dailyProblemLimit: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is onboarded
  if (!user.pledgeDays || user.pledgeDays === 0) {
    throw new UserNotOnboardedError();
  }

  const today = getTodayForUser(user.timezone);
  const deadline = getDeadlineForUser(user.timezone, user.reminderTime);
  const daysRemaining = getDaysRemaining(
    user.startDate!,
    user.pledgeDays,
    user.timezone
  );
  const endDate = getPledgeEndDate(user.startDate!, user.pledgeDays);

  // Get today's log
  const todayLog = await db.dailyLog.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { problems: true },
  });

  // Get all daily logs for heatmap and activity charts
  const allLogs = await db.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    include: { problems: true },
  });

  // Milestones at 7, 30, 50, 100, etc.
  const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
  let streakCount = 0;
  let previousDate: Date | null = null;

  const heatmapDays = allLogs.map(
    (log: DailyLog & { problems: ProblemLog[] }) => {
      // Check for gap if we have a previous date
      if (previousDate) {
        const diff = differenceInCalendarDays(log.date, previousDate);
        if (diff > 1) {
          streakCount = 0;
        }
      }

      if (log.completed) {
        streakCount++;
      } else if (!log.isFrozen) {
        streakCount = 0;
      }

      previousDate = log.date;

      return {
        date: log.date.toISOString().split("T")[0],
        completed: log.completed,
        isFrozen: log.isFrozen,
        isMilestone: log.completed && milestones.includes(streakCount),
        problemCount: log.problems?.length ?? 0, // Add problem count for heatmap intensity
        problems: (log.problems || []).map((p: ProblemLog) => ({
          id: p.id,
          topic: p.topic || "OTHER",
          name: p.name,
          difficulty: p.difficulty,
          externalUrl: p.externalUrl,
          tags: p.tags,
          hour: toZonedTime(p.createdAt, user.timezone).getHours(),
        })),
        completedAtHour: log.markedAt
          ? toZonedTime(log.markedAt, user.timezone).getHours()
          : null,
      };
    }
  );

  const activityData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(today, 13 - i);
    const dateStr = date.toISOString().split("T")[0];
    const log = allLogs.find(
      (l: DailyLog & { problems: ProblemLog[] }) =>
        l.date.toISOString().split("T")[0] === dateStr
    );
    return {
      date: dateStr,
      problems: log?.problems?.length ?? 0,
      checkInTime: log?.createdAt
        ? new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: user.timezone,
          }).format(log.createdAt)
        : null,
    };
  });

  const timeDistribution = (() => {
    const dist: Record<string, number> = {};
    allLogs.forEach((log: DailyLog & { problems: ProblemLog[] }) => {
      // Use markedAt or createdAt for time
      const time = log.markedAt || log.createdAt;
      if (time) {
        const zonedDate = toZonedTime(time, user.timezone);
        const hour = zonedDate.getHours();
        const dayOfWeek = zonedDate.getDay(); // 0 (Sun) to 6 (Sat)
        const key = `${hour}-${dayOfWeek}`;
        dist[key] = (dist[key] || 0) + 1;
      }
      // Also count individual problems
      (log.problems || []).forEach((p: ProblemLog) => {
        const zonedPTime = toZonedTime(p.createdAt, user.timezone);
        const hour = zonedPTime.getHours();
        const dayOfWeek = zonedPTime.getDay();
        const key = `${hour}-${dayOfWeek}`;
        dist[key] = (dist[key] || 0) + 1;
      });
    });
    return Object.entries(dist).map(([key, count]) => {
      const [hour, dayOfWeek] = key.split("-").map(Number);
      return { hour, dayOfWeek, count };
    });
  })();

  return {
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      image: user.image,
      dailyLimit: user.dailyProblemLimit,
    },
    pledge: {
      totalDays: user.pledgeDays,
      daysCompleted: user.daysCompleted,
      daysRemaining,
      startDate: user.startDate!.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
    streak: {
      current: user.currentStreak,
      max: user.maxStreak,
    },
    gems: user.gems,
    today: {
      completed: todayLog?.completed || false,
      deadlineAt: deadline.toISOString(),
      problemsLogged: todayLog?.problems.length || 0,
      problems: (todayLog?.problems ?? []).map((p: ProblemLog) => ({
        id: p.id,
        topic: p.topic ?? "OTHER",
        name: p.name,
        difficulty: p.difficulty,
        externalUrl: p.externalUrl,
        tags: p.tags || [],
        notes: p.notes || "",
      })),
    },
    freezeCount: allLogs.filter((l: DailyLog) => l.isFrozen).length,
    heatmapDays,
    activityData,
    timeDistribution,
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  return getCachedData(
    () => fetchDashboardDataInternal(userId),
    [`dashboard-v2-${userId}`], // Cache key
    [`dashboard-v2-${userId}`], // Revalidation tag
    3600 // Revalidate every hour at least, or on demand
  );
}
