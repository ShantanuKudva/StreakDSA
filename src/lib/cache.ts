import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

/**
 * Wrapper for unstable_cache to enforce type safety and consistent tagging.
 * @param fetcher The data fetching function
 * @param keys Key parts for the cache key
 * @param tags Tags for revalidation
 * @param revalidate Revalidation time in seconds (default: infinite/until revalidated)
 */
export async function getCachedData<T>(
  fetcher: () => Promise<T>,
  keys: string[],
  tags: string[],
  revalidate?: number
): Promise<T> {
  const cachedFetcher = unstable_cache(fetcher, keys, {
    tags,
    revalidate,
  });
  return cachedFetcher();
}

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
