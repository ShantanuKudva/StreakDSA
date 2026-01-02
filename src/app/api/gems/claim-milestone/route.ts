import { db } from "@/lib/db";
import { getAuthUser, successResponse, handleApiError } from "@/lib/api-utils";
import { GEMS_CONFIG } from "@/lib/gems";
import { revalidateDashboard } from "@/lib/cache";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return new Response("Unauthorized", { status: 401 });

    const { streak } = await req.json();

    let reward = 0;
    if (streak === 1) {
      reward = GEMS_CONFIG.TEST_REWARD;
    } else if (streak % 10 === 0) {
      reward = GEMS_CONFIG.MILESTONE_GIFT;
    } else {
      return new Response("Invalid milestone", { status: 400 });
    }

    // Optional: Check if already claimed for this streak milestone
    // For simplicity, we award it. In a real app, we'd have a MilestoneClaim model.

    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: {
        gems: { increment: reward },
      },
    });

    // Revalidate cache
    revalidateDashboard(authUser.id);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");

    return successResponse({ gems: updatedUser.gems });
  } catch (error) {
    return handleApiError(error);
  }
}
