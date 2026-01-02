/**
 * User Onboarding API
 * POST /api/user/onboard - Set up user's pledge
 * Based on API-SPEC Section 2.1
 */

import { NextRequest } from "next/server";
import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { OnboardRequestSchema } from "@/lib/validators";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();

    // Parse and validate body
    const body = await req.json();
    const parsed = OnboardRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Invalid request body",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { name, email, pledgeDays, reminderTime, timezone, phone } = parsed.data;

    // Update user with pledge settings
    const user = await db.user.update({
      where: { id: authUser.id },
      data: {
        name,
        email: email || undefined, // Only update email if provided
        pledgeDays,
        reminderTime,
        timezone,
        phone: phone || null,
        startDate: new Date(), // Start pledge today
        currentStreak: 0,
        maxStreak: 0,
        daysCompleted: 0,
        gems: 0,
      },
    });

    return successResponse(
      {
        id: user.id,
        email: user.email,
        pledgeDays: user.pledgeDays,
        startDate: user.startDate?.toISOString().split("T")[0],
        reminderTime: user.reminderTime,
        timezone: user.timezone,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
        gems: user.gems,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
