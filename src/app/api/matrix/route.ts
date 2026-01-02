/**
 * Matrix/Heatmap API
 * GET /api/matrix - Get heatmap data
 * Based on API-SPEC Section 5.2
 */

import { NextRequest } from "next/server";
import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { getTodayForUser } from "@/lib/date-utils";
import { UserNotOnboardedError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    const { searchParams } = new URL(req.url);

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: {
        timezone: true,
        startDate: true,
        pledgeDays: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.startDate || !user.pledgeDays) {
      throw new UserNotOnboardedError();
    }

    // Parse date range from query params or use defaults
    const today = getTodayForUser(user.timezone);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam
      ? new Date(startDateParam)
      : user.startDate;
    const endDate = endDateParam ? new Date(endDateParam) : today;

    // Get all daily logs in range
    const dailyLogs = await db.dailyLog.findMany({
      where: {
        userId: authUser.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        problems: {
          select: {
            topic: true,
            difficulty: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Build days array with milestone detection
    const days = dailyLogs.map((log, index) => {
      // Check for milestones (7, 30 day streaks)
      // This is a simplified check - real logic would need streak continuity
      const dayNumber = index + 1;
      const isMilestone = [7, 30].includes(dayNumber) && log.completed;

      return {
        date: log.date.toISOString().split("T")[0],
        completed: log.completed,
        isMilestone,
        milestoneType: isMilestone ? `${dayNumber}_DAY_STREAK` : undefined,
        problems: log.problems.map((p) => ({
          topic: p.topic,
          difficulty: p.difficulty,
        })),
      };
    });

    // Count topics
    const topicCounts: Record<string, number> = {};
    for (const log of dailyLogs) {
      for (const problem of log.problems) {
        if (problem.topic) {
          topicCounts[problem.topic] = (topicCounts[problem.topic] || 0) + 1;
        }
      }
    }

    return successResponse({
      days,
      topics: topicCounts,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
