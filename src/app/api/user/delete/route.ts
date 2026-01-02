/**
 * Delete User API
 * DELETE /api/user/delete - Delete user account and all data
 */


import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";

export async function DELETE() {
  try {
    const authUser = await getAuthUser();

    // Delete all user data in order (respecting foreign key constraints)
    // 1. Delete problem logs via daily logs
    await db.problemLog.deleteMany({
      where: {
        dailyLog: { userId: authUser.id },
      },
    });

    // 2. Delete daily logs
    await db.dailyLog.deleteMany({
      where: { userId: authUser.id },
    });

    // 3. Delete sessions
    await db.session.deleteMany({
      where: { userId: authUser.id },
    });

    // 4. Delete accounts (OAuth)
    await db.account.deleteMany({
      where: { userId: authUser.id },
    });

    // 5. Delete user
    await db.user.delete({
      where: { id: authUser.id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
