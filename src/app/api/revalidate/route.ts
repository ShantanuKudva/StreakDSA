import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  revalidateTag(`dashboard-v2-${session.user.id}`);
  return successResponse({ message: "Cache revalidated" });
}
