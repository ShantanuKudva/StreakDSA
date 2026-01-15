/**
 * User Settings API
 * PATCH /api/user/settings - Update user settings
 */

import { NextRequest } from "next/server";
import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { z } from "zod";
import { ValidationError } from "@/lib/errors";

const SettingsSchema = z.object({
  timezone: z.string().optional(),
  dailyProblemLimit: z.number().int().min(1).max(10).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser();

    const body = await req.json();
    const parsed = SettingsSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Invalid settings",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updateData: Record<string, string | number | boolean> = {};
    if (parsed.data.timezone) {
      updateData.timezone = parsed.data.timezone;
    }
    if (parsed.data.dailyProblemLimit !== undefined) {
      updateData.dailyProblemLimit = parsed.data.dailyProblemLimit;
    }
    if (parsed.data.emailNotifications !== undefined) {
      updateData.emailNotifications = parsed.data.emailNotifications;
    }
    if (parsed.data.pushNotifications !== undefined) {
      updateData.pushNotifications = parsed.data.pushNotifications;
    }
    if (parsed.data.emailNotifications !== undefined) {
      updateData.emailNotifications = parsed.data.emailNotifications;
    }
    if (parsed.data.pushNotifications !== undefined) {
      updateData.pushNotifications = parsed.data.pushNotifications;
    }

    await db.user.update({
      where: { id: authUser.id },
      data: updateData,
    });

    // Invalidate caches
    const { revalidateDashboard, revalidateUserProfile } = await import(
      "@/lib/cache"
    );
    revalidateDashboard(authUser.id);
    revalidateUserProfile(authUser.id);

    // Also revalidate profile page explicitly
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/profile");

    return successResponse({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
