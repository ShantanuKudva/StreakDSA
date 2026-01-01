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
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id },
      include: { dailyLog: true },
    });

    if (!problem || problem.dailyLog.userId !== authUser.id) {
      throw new Error("Problem not found or unauthorized");
    }

    const updatedProblem = await db.problemLog.update({
      where: { id: params.id },
      data: parsed.data as any, // Cast to any to handle optional fields easily, or be more specific
    });

    return successResponse(updatedProblem);
  } catch (error) {
    return handleApiError(error);
  }
}
