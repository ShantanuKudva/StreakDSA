/**
 * Check-in API
 * POST /api/checkin - Mark today complete
 * GET /api/checkin - Get today's status
 * Based on API-SPEC Section 3
 */


import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { markDayComplete, getTodayStatus } from "@/lib/streak";
import { db } from "@/lib/db";
import { getDeadlineForUser, formatTimeRemaining } from "@/lib/date-utils";

export async function POST() {
  try {
    const user = await getAuthUser();
    const result = await markDayComplete(user.id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const authUser = await getAuthUser();

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { timezone: true, reminderTime: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const status = await getTodayStatus(authUser.id);
    const deadline = getDeadlineForUser(user.timezone, user.reminderTime);

    return successResponse({
      date: status.date.toISOString().split("T")[0],
      completed: status.completed,
      deadlineAt: deadline.toISOString(),
      timeRemaining: formatTimeRemaining(deadline),
      problemsLogged: status.problemsLogged,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
