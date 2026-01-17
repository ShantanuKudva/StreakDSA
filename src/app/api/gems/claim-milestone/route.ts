import { db } from "@/lib/db";
import { getAuthUser, successResponse, handleApiError } from "@/lib/api-utils";
import { GEMS_CONFIG } from "@/lib/gems";
import { revalidateDashboard } from "@/lib/cache";

// Milestones that award gems
const MILESTONES: number[] = [1, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return new Response("Unauthorized", { status: 401 });

    const { streak } = await req.json();
    const streakNum = Number(streak);

    console.log(`[claim-milestone] Received streak: ${streak}, parsed: ${streakNum}`);

    // Check if this is a valid milestone
    if (!MILESTONES.includes(streakNum)) {
      console.log(`[claim-milestone] Invalid milestone ${streakNum}`);
      return new Response("Invalid milestone", { status: 400 });
    }

    // Get user to check if already claimed
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { claimedMilestones: true },
    });

    const claimedMilestones = (user?.claimedMilestones as number[]) || [];

    // Check if already claimed
    if (claimedMilestones.includes(streakNum)) {
      console.log(`[claim-milestone] Already claimed milestone ${streakNum}`);
      return new Response("Milestone already claimed", { status: 400 });
    }

    // Determine reward based on streak
    let reward: number = GEMS_CONFIG.TEST_REWARD; // Base reward for day 1
    if (streakNum >= 100) {
      reward = GEMS_CONFIG.STREAK_30_DAYS * 2; // 400 gems for 100+
    } else if (streakNum >= 30) {
      reward = GEMS_CONFIG.STREAK_30_DAYS; // 200 gems for 30+
    } else if (streakNum >= 7) {
      reward = GEMS_CONFIG.STREAK_7_DAYS; // 50 gems for 7+
    }

    // Update gems AND add to claimed milestones
    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: {
        gems: { increment: reward },
        claimedMilestones: [...claimedMilestones, streakNum],
      },
    });

    console.log(`[claim-milestone] Claimed milestone ${streakNum}, awarded ${reward} gems`);

    // Revalidate cache
    revalidateDashboard(authUser.id);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");

    return successResponse({ gems: updatedUser.gems, reward });
  } catch (error) {
    return handleApiError(error);
  }
}
