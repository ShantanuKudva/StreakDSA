import { NextRequest } from "next/server";
import { getAuthUser, handleApiError, successResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { z } from "zod";
import { ValidationError } from "@/lib/errors";

const UpdateProblemSchema = z.object({
  notes: z.string().optional(),
  name: z.string().optional(),
  topic: z
    .enum([
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
    ])
    .optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  externalUrl: z.string().url().nullish(), // Allow null
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();
    const body = await req.json();
    const parsed = UpdateProblemSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Invalid data",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Verify ownership
    const problem = await db.problemLog.findUnique({
      where: { id: id },
      include: { dailyLog: true },
    });

    if (!problem || problem.dailyLog.userId !== authUser.id) {
      throw new Error("Problem not found or unauthorized");
    }

    const updatedProblem = await db.problemLog.update({
      where: { id: id },
      data: parsed.data as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    return successResponse(updatedProblem);
  } catch (error) {
    return handleApiError(error);
  }
}
