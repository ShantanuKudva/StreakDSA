/**
 * Dashboard API
 * GET /api/dashboard - Get aggregated dashboard data
 * Based on API-SPEC Section 5.1
 */

import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { getDashboardData } from "@/lib/data";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    const data = await getDashboardData(authUser.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
