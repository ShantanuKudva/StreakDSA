/**
 * Problems API
 * POST /api/problems - Log a problem
 * GET /api/problems - Get today's problems
 * Based on API-SPEC Section 4
 */

import { NextRequest } from "next/server";
import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import type { ProblemLog, Topic } from "@prisma/client";

import { ProblemLimitError, ValidationError } from "@/lib/errors";
import { ProblemRequestSchema, TopicSchema } from "@/lib/validators";
// Note: We avoid importing Topic from @prisma/client directly to prevent build/generation race conditions
// since the dev server might lock the client files.

import {
  updateStreakOnProblemLog,
  updateStreakOnProblemDelete,
} from "@/lib/streak";
import { getUserTodayString, getTodayForUser } from "@/lib/date-utils";
import { revalidateDashboard } from "@/lib/cache";

// Valid topics matching schema.prisma
const VALID_TOPICS = new Set(TopicSchema.options);

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();

    // Parse and validate body
    const body = await req.json();
    const parsed = ProblemRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Invalid request body",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Get user for timezone and limit
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { timezone: true, dailyProblemLimit: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Use dsa-utils for reliable user-local date
    const timezone = user?.timezone || "UTC";
    const today = getTodayForUser(timezone);

    // Get or create today's log
    const dailyLog = await db.dailyLog.upsert({
      where: { userId_date: { userId: authUser.id, date: today } },
      update: {},
      create: { userId: authUser.id, date: today },
      select: { id: true, isFrozen: true },
    });

    // Check limit (configurable per user)
    const count = await db.problemLog.count({
      where: { dailyLogId: dailyLog.id },
    });

    // Default to 2 if not set (though schema default handles this)
    const limit = user.dailyProblemLimit ?? 2;

    if (count >= limit) {
      throw new ProblemLimitError();
    }

    // Handle tags and topic mapping
    const tags = (body.tags || []) as string[];
    let topicToSave = "OTHER"; // Default to OTHER

    // Try to map the provided topic (first tag) to the Enum
    if (parsed.data.topic) {
      const uppercaseTopic = parsed.data.topic
        .toUpperCase()
        .replace(/\s+/g, "_");
      if (VALID_TOPICS.has(uppercaseTopic as Topic)) {
        topicToSave = uppercaseTopic as Topic;
      }

      // Ensure topic is also in tags
      if (!tags.includes(parsed.data.topic)) {
        tags.push(parsed.data.topic);
      }
    }

    const problem = await db.problemLog.create({
      data: {
        dailyLogId: dailyLog.id,
        topic: topicToSave as Topic,
        tags: tags,
        name: parsed.data.name,
        difficulty: parsed.data.difficulty,
        externalUrl: parsed.data.externalUrl,
        notes: body.notes,
      },
    });

    // Update streak/completion status
    // Recalculate streak
    await updateStreakOnProblemLog(authUser.id, today);

    // Award Gems based on difficulty
    const { getGemsForDifficulty, calculateGemsForStreak } = await import(
      "@/lib/gems"
    );
    const gemAward = getGemsForDifficulty(parsed.data.difficulty);

    // Also check for streak bonus gems (like 7-day, 30-day etc)
    // We need to know if they just completed the day.
    // If problemLog count was 0 before this, they just completed the day.
    const isFirstProblemToday = count === 0;
    const wasFrozen = dailyLog.isFrozen;

    console.log(`[API] Problem log debug - dailyLog:`, dailyLog);
    console.log(
      `[API] isFirstProblemToday: ${isFirstProblemToday}, wasFrozen: ${wasFrozen}`
    );

    let bonusGems = 0;
    let refundGems = 0;
    let milestone: string | null = null;

    if (isFirstProblemToday && wasFrozen) {
      const { GEMS_CONFIG } = await import("@/lib/gems");
      refundGems = GEMS_CONFIG.FREEZE_COST;
      console.log(`[API] Refunding ${refundGems} gems due to existing freeze`);
    }

    // We update the user streak in DB inside updateStreakOnProblemLog,
    // but let's fetch the latest to be sure for gems.
    const userAfterStreak = await db.user.findUnique({
      where: { id: authUser.id },
      select: { currentStreak: true, pledgeDays: true, daysCompleted: true },
    });

    if (isFirstProblemToday && userAfterStreak) {
      const isPledgeComplete =
        userAfterStreak.daysCompleted >= userAfterStreak.pledgeDays;
      const streakResult = calculateGemsForStreak(
        userAfterStreak.currentStreak,
        isPledgeComplete
      );
      bonusGems = streakResult.total;
      milestone = streakResult.milestone;
    }

    const totalAward = gemAward + bonusGems + refundGems;

    console.log(
      `[API] Awarding ${totalAward} gems (Award: ${gemAward}, Bonus: ${bonusGems}, Refund: ${refundGems})`
    );

    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: { gems: { increment: totalAward } },
      select: { gems: true, currentStreak: true },
    });

    console.log(`[API] New gem count: ${updatedUser.gems}`);

    // Invalidate dashboard cache
    revalidateDashboard(authUser.id);
    const { revalidateUserProfile } = await import("@/lib/cache");
    revalidateUserProfile(authUser.id);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/logs");

    const response = successResponse(
      {
        problem,
        streak: updatedUser.currentStreak,
        gems: updatedUser.gems,
        milestone: milestone,
        melted: wasFrozen && isFirstProblemToday,
      },
      201
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const authUser = await getAuthUser();

    // Get user for timezone
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { timezone: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const today = getTodayForUser(user.timezone);
    const todayStr = getUserTodayString(user.timezone);

    const dailyLog = await db.dailyLog.findUnique({
      where: { userId_date: { userId: authUser.id, date: today } },
      include: { problems: true },
    });

    const problems = dailyLog?.problems || [];

    return successResponse({
      date: todayStr, // Return string for clarity
      problems: problems.map((p: ProblemLog) => ({
        id: p.id,
        name: p.name,
        topic: p.topic,
        tags: p.tags, // Return tags
        difficulty: p.difficulty,
        externalUrl: p.externalUrl,
        notes: p.notes,
      })),
      count: problems.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ... POST handler ...

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser();

    // Parse and validate body
    const body = await req.json();
    // For edit (PATCH), we now require full validation to match "Add" logic as requested.
    // This prevents users from clearing required fields like tags or difficulty.
    const parsed = ProblemRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Invalid request body",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    if (!body.id) {
      return new Response(JSON.stringify({ error: "Problem ID required" }), {
        status: 400,
      });
    }

    // Verify ownership
    const existing = await db.problemLog.findUnique({
      where: { id: body.id },
      include: { dailyLog: true },
    });

    if (!existing || existing.dailyLog.userId !== authUser.id) {
      return new Response(JSON.stringify({ error: "Problem not found" }), {
        status: 404,
      });
    }

    // Handle tags and topic mapping
    const tags = (body.tags || []) as string[];
    let topicToSave = existing.topic;

    // Try to map the provided topic (first tag) to the Enum
    if (parsed.data.topic) {
      const uppercaseTopic = parsed.data.topic
        .toUpperCase()
        .replace(/\s+/g, "_");
      if (VALID_TOPICS.has(uppercaseTopic as Topic)) {
        topicToSave = uppercaseTopic as Topic;
      }

      // Ensure topic is also in tags
      if (!tags.includes(parsed.data.topic)) {
        tags.push(parsed.data.topic);
      }
    }

    const problem = await db.problemLog.update({
      where: { id: body.id },
      data: {
        topic: topicToSave as Topic,
        tags: tags,
        name: parsed.data.name,
        difficulty: parsed.data.difficulty,
        externalUrl: parsed.data.externalUrl,
        notes: body.notes,
      },
    });

    return successResponse({ problem });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser();

    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("id");

    if (!problemId) {
      throw new ValidationError("Problem ID is required");
    }

    // Verify the problem belongs to the user
    const problem = await db.problemLog.findUnique({
      where: { id: problemId },
      include: { dailyLog: true },
    });

    if (!problem || problem.dailyLog.userId !== authUser.id) {
      throw new Error("Problem not found");
    }

    const dailyLogId = problem.dailyLogId;
    const difficulty = problem.difficulty;

    // Calculate gems to deduct based on difficulty
    const { getGemsForDifficulty } = await import("@/lib/gems");
    const gemsToDeduct = getGemsForDifficulty(difficulty);

    await db.problemLog.delete({
      where: { id: problemId },
    });

    // Check if remaining problems for this day
    const remainingCount = await db.problemLog.count({
      where: { dailyLogId: dailyLogId },
    });

    // Trigger streak update logic
    await updateStreakOnProblemDelete(
      authUser.id,
      problem.dailyLog.date,
      remainingCount
    );

    // Deduct gems from user
    await db.user.update({
      where: { id: authUser.id },
      data: { gems: { decrement: gemsToDeduct } },
    });

    console.log(
      `[API] Deducted ${gemsToDeduct} gems for deleted ${difficulty} problem`
    );

    // Revalidate caches
    revalidateDashboard(authUser.id);
    const { revalidateUserProfile } = await import("@/lib/cache");
    revalidateUserProfile(authUser.id);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/profile");

    return successResponse({
      deleted: true,
      remaining: remainingCount,
      gemsDeducted: gemsToDeduct,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
