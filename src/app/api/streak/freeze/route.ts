import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayForUser } from "@/lib/date-utils";
import { recalculateUserStreak } from "@/lib/streak";
import { revalidateDashboard } from "@/lib/cache";
import { errorResponse, successResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const userId = session.user.id;

    // Get user to check gems and timezone
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { gems: true, timezone: true },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Check gem balance
    const FREEZE_COST = 50;
    if (user.gems < FREEZE_COST) {
      return errorResponse("Insufficient gems", 400);
    }

    // Get today's date for user
    const today = getTodayForUser(user.timezone);

    // Check if already logged or frozen
    const existingLog = await db.dailyLog.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existingLog?.completed) {
      return errorResponse("You have already completed a problem today!", 400);
    }

    // @ts-expect-error: isFrozen is missing from generated types
    if (existingLog?.isFrozen) {
      return errorResponse("Streak is already frozen for today!", 400);
    }

    // Deduct gems and create/update log
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { gems: { decrement: FREEZE_COST } },
      }),
      // @ts-expect-error: isFrozen is missing from generated types
      db.dailyLog.upsert({
        where: { userId_date: { userId, date: today } },
        create: {
          userId,
          date: today,
          isFrozen: true,
          completed: false,
        },
        update: {
          isFrozen: true,
        },
      }),
    ]);

    // Recalculate streak (to ensure everything is consistent)
    await recalculateUserStreak(userId);

    // Revalidate cache
    revalidateDashboard(userId);

    return successResponse({ success: true, gems: user.gems - FREEZE_COST }, 200);
  } catch (error) {
    console.error("[API] Freeze Streak Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
