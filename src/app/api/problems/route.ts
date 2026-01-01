/**
 * Problems API
 * POST /api/problems - Log a problem
 * GET /api/problems - Get today's problems
 * Based on API-SPEC Section 4
 */

import { NextRequest } from "next/server";
import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { getTodayForUser } from "@/lib/date-utils";
import { ProblemLimitError, ValidationError } from "@/lib/errors";
import { ProblemRequestSchema } from "@/lib/validators";
// Note: We avoid importing Topic from @prisma/client directly to prevent build/generation race conditions
// since the dev server might lock the client files.

import {
  updateStreakOnProblemLog,
  updateStreakOnProblemDelete,
} from "@/lib/streak";
import { getUserTodayString } from "@/lib/dsa-utils";

// Valid topics matching schema.prisma
const VALID_TOPICS = new Set([
  "BASICS",
  "SORTING",
  "ARRAYS",
  "BINARY_SEARCH",
  "STRINGS",
  "LINKED_LISTS",
  "RECURSION",
  "BIT_MANIPULATION",
  "STACKS_QUEUES",
  "SLIDING_WINDOW",
  "HEAPS",
  "GREEDY",
  "BINARY_TREES",
  "BST",
  "GRAPHS",
  "DYNAMIC_PROGRAMMING",
  "TRIES",
  "OTHER",
]);

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

    // Get user for timezone
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { timezone: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Use dsa-utils for reliable user-local date (as YYYY-MM-DD string -> Date)
    // Actually we store date as Date object (midnight), and Prisma/Postgres stores it.
    // Ideally we store YYYY-MM-DD string to avoid any TZ issues, but schema says DateTime @db.Date.
    // This usually means it defaults to UTC midnight. dsa-utils helper handles this string conversion.
    // Let's stick to the string conversion logic: "2026-01-01" in user TZ => Date("2026-01-01T00:00:00Z")
    // The previous getTodayForUser might have been flaky if not using date-fns-tz.
    const timezone = user?.timezone || "UTC";
    // Fix: dsa-utils.getUserTodayString gives "YYYY-MM-DD" matching user's wall clock.
    // Creating "YYYY-MM-DD" + "T00:00:00Z" ensures it is stored as that Calendar Day in Postgres DATE column.
    // If we passed the localized midnight timestamp (e.g. 18:30 prev day), Postgres truncates it to prev day.
    const todayStr = getUserTodayString(timezone);
    const today = new Date(`${todayStr}T00:00:00Z`);

    // Get or create today's log
    const dailyLog = await db.dailyLog.upsert({
      where: { userId_date: { userId: authUser.id, date: today } },
      update: {},
      create: { userId: authUser.id, date: today },
    });

    // Check limit (max 2 per day)
    const count = await db.problemLog.count({
      where: { dailyLogId: dailyLog.id },
    });

    if (count >= 2) {
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
      if (VALID_TOPICS.has(uppercaseTopic)) {
        topicToSave = uppercaseTopic;
      }

      // Ensure topic is also in tags
      if (!tags.includes(parsed.data.topic)) {
        tags.push(parsed.data.topic);
      }
    }

    const problem = await db.problemLog.create({
      data: {
        dailyLogId: dailyLog.id,
        topic: topicToSave as any, // Cast to any to avoid strict enum TS check if client is outdated
        tags: tags,
        name: parsed.data.name,
        difficulty: parsed.data.difficulty,
        externalUrl: parsed.data.externalUrl,
        notes: body.notes,
      },
    });

    // Update streak/completion status
    await updateStreakOnProblemLog(authUser.id, today);

    // Award Gems (e.g. 10 gems per problem)
    console.log(`[API] Awarding 10 gems to user ${authUser.id}`);
    const updatedUser = await db.user.update({
      where: { id: authUser.id },
      data: { gems: { increment: 10 } },
      select: { gems: true },
    });
    console.log(`[API] New gem count: ${updatedUser.gems}`);

    const response = successResponse(
      {
        id: problem.id,
        topic: problem.topic,
        tags: problem.tags, // Return tags
        name: problem.name,
        difficulty: problem.difficulty,
        createdAt: problem.createdAt.toISOString(),
      },
      201
    );

    // Revalidate paths
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/logs");

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(_req: NextRequest) {
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

    const todayStr = getUserTodayString(user.timezone);
    const today = new Date(todayStr);

    const dailyLog = await db.dailyLog.findUnique({
      where: { userId_date: { userId: authUser.id, date: today } },
      include: { problems: true },
    });

    const problems = dailyLog?.problems || [];

    return successResponse({
      date: todayStr, // Return string for clarity
      problems: problems.map((p: any) => ({
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
      if (VALID_TOPICS.has(uppercaseTopic)) {
        topicToSave = uppercaseTopic as any;
      }

      // Ensure topic is also in tags
      if (!tags.includes(parsed.data.topic)) {
        tags.push(parsed.data.topic);
      }
    }

    const problem = await db.problemLog.update({
      where: { id: body.id },
      data: {
        topic: topicToSave as any,
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

    return successResponse({ deleted: true, remaining: remainingCount });
  } catch (error) {
    return handleApiError(error);
  }
}
