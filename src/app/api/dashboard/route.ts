/**
 * Dashboard API
 * GET /api/dashboard - Get aggregated dashboard data
 * Based on API-SPEC Section 5.1
 */

import { NextRequest } from "next/server";
import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import {
  getTodayForUser,
  getDeadlineForUser,
  getDaysRemaining,
  getPledgeEndDate,
} from "@/lib/date-utils";
import { UserNotOnboardedError } from "@/lib/errors";

export async function GET(_req: NextRequest) {
  try {
    const authUser = await getAuthUser();

    const user = await db.user.findUnique({
      where: { id: authUser.id },
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
      where: { userId_date: { userId: authUser.id, date: today } },
      include: { problems: true },
    });

    // Get all daily logs for heatmap
    const allLogs = await db.dailyLog.findMany({
      where: { userId: authUser.id },
      orderBy: { date: "asc" },
    });

    // Milestones at 7, 30, 50, 100, etc.
    const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
    let streakCount = 0;
    const heatmapDays = allLogs.map((log) => {
      if (log.completed) streakCount++;
      else streakCount = 0;

      return {
        date: log.date.toISOString().split("T")[0],
        completed: log.completed,
        isMilestone: log.completed && milestones.includes(streakCount),
      };
    });

    return successResponse({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
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
        completed: todayLog?.completed ?? false,
        deadlineAt: deadline.toISOString(),
        problemsLogged: todayLog?.problems.length ?? 0,
        problems: (todayLog?.problems ?? []).map((p) => ({
          id: p.id,
          topic: p.topic,
          name: p.name,
          difficulty: p.difficulty,
          externalUrl: p.externalUrl,
        })),
      },
      heatmapDays,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
