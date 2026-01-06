import { revalidateTag } from "next/cache";

/**
 * Revalidate dashboard cache for a specific user.
 */
export function revalidateDashboard(userId: string) {
  revalidateTag(`dashboard-v2-${userId}`);
}

/**
 * Revalidate user profile cache.
 */
export function revalidateUserProfile(userId: string) {
  revalidateTag(`user-profile-${userId}`);
}
